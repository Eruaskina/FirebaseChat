import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { saveUserProfile, initializeDefaultChannels } from '../firebase/db';
import { UserProfile } from '../types/chat';

interface AuthContextType {
  currentUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithUsername: (usernameOrEmail: string, pass: string) => Promise<void>;
  registerWithUsername: (username: string, displayName: string, pass: string, avatarColor?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithDemoAccount: (preset: 'alper' | 'zeynep' | 'can') => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Avatar color palette (Firebase inspired)
const AVATAR_COLORS = [
  '#FFA000', // Amber
  '#FF6F00', // Dark Amber / Flame
  '#F57C00', // Orange
  '#E65100', // Deep Orange
  '#039BE5', // Firebase Light Blue
  '#1A73E8', // Google Blue
  '#00897B', // Teal
  '#7C4DFF', // Deep Purple
];

export function getRandomColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

function normalizeToEmail(usernameOrEmail: string): string {
  const trimmed = usernameOrEmail.trim().toLowerCase();
  if (trimmed.includes('@')) {
    return trimmed;
  }
  // Remove special characters for clean email prefix
  const cleanUsername = trimmed.replace(/[^a-z0-9_-]/g, '');
  return `${cleanUsername || 'user'}@chat.firebase.local`;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Initialize default channels if needed now that we are authenticated
          await initializeDefaultChannels();

          // Fetch user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            setProfile(data);
            // Update last seen and online status
            await saveUserProfile({
              ...data,
              status: 'online',
              lastSeen: new Date().toISOString()
            });
          } else {
            // Create initial profile
            const rawUsername = user.email ? user.email.split('@')[0] : 'user_' + user.uid.slice(0, 5);
            const newProfile: UserProfile = {
              uid: user.uid,
              username: rawUsername,
              displayName: user.displayName || rawUsername,
              avatarColor: getRandomColor(),
              status: 'online',
              bio: 'Firebase Pulse Chat kullanıcısı',
              createdAt: new Date().toISOString(),
              lastSeen: new Date().toISOString()
            };
            if (user.email) newProfile.email = user.email;
            if (user.photoURL) newProfile.photoURL = user.photoURL;

            await saveUserProfile(newProfile);
            setProfile(newProfile);
          }
        } catch (err) {
          console.warn('Profile fetch error, using fallback:', err);
          const fallbackProfile: UserProfile = {
            uid: user.uid,
            username: user.email?.split('@')[0] || 'kullanici',
            displayName: user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
            avatarColor: '#FFA000',
            status: 'online',
            createdAt: new Date().toISOString(),
            lastSeen: new Date().toISOString()
          };
          if (user.email) fallbackProfile.email = user.email;
          setProfile(fallbackProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login with username and password
  const loginWithUsername = async (usernameOrEmail: string, pass: string) => {
    const email = normalizeToEmail(usernameOrEmail);
    await signInWithEmailAndPassword(auth, email, pass);
  };

  // Register with username and password
  const registerWithUsername = async (
    username: string,
    displayName: string,
    pass: string,
    avatarColor?: string
  ) => {
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const email = normalizeToEmail(cleanUsername);
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    await updateProfile(user, { displayName: displayName.trim() || cleanUsername });

    const newProfile: UserProfile = {
      uid: user.uid,
      username: cleanUsername,
      displayName: displayName.trim() || cleanUsername,
      email,
      avatarColor: avatarColor || getRandomColor(),
      status: 'online',
      bio: 'Merhaba! Firebase Pulse Chat kullanıyorum 🔥',
      createdAt: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    };

    await saveUserProfile(newProfile);
    setProfile(newProfile);
  };

  // Google Sign In
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  // Quick Demo Account (useful for testing multi-user live messaging)
  const loginWithDemoAccount = async (preset: 'alper' | 'zeynep' | 'can') => {
    const accounts = {
      alper: { username: 'alper_dev', name: 'Alper Demir', pass: 'demo123456', color: '#FFA000' },
      zeynep: { username: 'zeynep_cloud', name: 'Zeynep Yılmaz', pass: 'demo123456', color: '#039BE5' },
      can: { username: 'can_frontend', name: 'Can Korkmaz', pass: 'demo123456', color: '#FF6F00' }
    };
    const target = accounts[preset];
    try {
      await loginWithUsername(target.username, target.pass);
    } catch {
      // If doesn't exist yet, register it
      await registerWithUsername(target.username, target.name, target.pass, target.color);
    }
  };

  // Logout
  const logout = async () => {
    if (profile) {
      try {
        await saveUserProfile({
          ...profile,
          status: 'offline',
          lastSeen: new Date().toISOString()
        });
      } catch {
        // ignore on logout
      }
    }
    await signOut(auth);
  };

  // Update profile
  const updateProfileData = async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    setProfile(updated);
    await saveUserProfile(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        loading,
        loginWithUsername,
        registerWithUsername,
        loginWithGoogle,
        loginWithDemoAccount,
        logout,
        updateProfileData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
