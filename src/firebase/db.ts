import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './config';
import { Channel, ChatMessage, UserProfile } from '../types/chat';

// Helper to remove any undefined fields before sending to Firestore
export function sanitizePayload<T extends Record<string, any>>(obj: T): T {
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        clean[key] = sanitizePayload(val);
      } else {
        clean[key] = val;
      }
    }
  }
  return clean as T;
}

// Default initial channels
const DEFAULT_CHANNELS: Channel[] = [
  {
    id: 'genel',
    name: 'genel',
    description: 'Firebase Topluluğu genel sohbet ve tanışma kanalı 🔥',
    type: 'public',
    creatorId: 'system',
    createdAt: new Date().toISOString(),
    lastMessage: 'Firebase Pulse Chat\'e hoş geldiniz! İlk mesajı sen yaz.',
    lastMessageAt: new Date().toISOString()
  },
  {
    id: 'firebase-tech',
    name: 'firebase-tech',
    description: 'Firestore, Cloud Functions, Auth ve Realtime veri tabanı tartışmaları',
    type: 'public',
    creatorId: 'system',
    createdAt: new Date().toISOString(),
    lastMessage: 'Firestore koleksiyonları ve anlık onSnapshot dinleyicileri devrede.',
    lastMessageAt: new Date().toISOString()
  },
  {
    id: 'kod-paylasimi',
    name: 'kod-paylasimi',
    description: 'Kod snippet\'leri, sorgular ve ipuçları',
    type: 'public',
    creatorId: 'system',
    createdAt: new Date().toISOString(),
    lastMessage: 'Kod parçalarını Kod Ekle butonuyla paylaşabilirsiniz.',
    lastMessageAt: new Date().toISOString()
  },
  {
    id: 'duyurular',
    name: 'duyurular',
    description: 'Önemli güncellemeler ve sistem haberleri',
    type: 'public',
    creatorId: 'system',
    createdAt: new Date().toISOString(),
    lastMessage: 'Sistem v1.0 yayında. Anlık Firestore senkronizasyonu aktif!',
    lastMessageAt: new Date().toISOString()
  }
];

export async function initializeDefaultChannels(): Promise<void> {
  // Only initialize if an authenticated session exists
  if (!auth.currentUser) {
    return;
  }
  const path = 'channels';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      for (const ch of DEFAULT_CHANNELS) {
        await setDoc(doc(db, path, ch.id), ch);
        // Add welcome message to genel
        if (ch.id === 'genel') {
          const welcomeMsg: ChatMessage = {
            id: 'welcome-1',
            channelId: 'genel',
            senderId: auth.currentUser?.uid || 'system',
            senderName: 'Firebase Bot 🔥',
            senderAvatar: '',
            senderColor: '#FFA000',
            text: '🔥 Firebase Pulse Chat odasına hoş geldiniz! Kullanıcı adınızla oturum açıp arkadaşlarınızla anlık olarak mesajlaşabilir, kod snippetleri paylaşabilir ve emojilerle tepki verebilirsiniz.',
            type: 'text',
            createdAt: new Date().toISOString(),
            reactions: {
              '🔥': [auth.currentUser?.uid || 'system'],
              '🚀': [auth.currentUser?.uid || 'system']
            }
          };
          await setDoc(doc(db, 'channels', ch.id, 'messages', welcomeMsg.id), welcomeMsg);
        }
      }
    }
  } catch (error) {
    console.warn('Initial channels check notice:', error);
  }
}

// Subscribe to all channels
export function subscribeToChannels(callback: (channels: Channel[]) => void): () => void {
  if (!auth.currentUser) {
    callback([]);
    return () => {};
  }
  const path = 'channels';
  try {
    const unsub = onSnapshot(
      collection(db, path),
      (snapshot) => {
        const channels: Channel[] = [];
        snapshot.forEach((d) => {
          channels.push(d.data() as Channel);
        });
        // Sort: default channels first, then by name
        channels.sort((a, b) => {
          if (a.type === 'public' && b.type !== 'public') return -1;
          if (a.type !== 'public' && b.type === 'public') return 1;
          return a.name.localeCompare(b.name);
        });
        callback(channels);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return unsub;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// Create new channel
export async function createChannel(channel: Channel): Promise<void> {
  const path = `channels/${channel.id}`;
  try {
    const cleanData = sanitizePayload(channel);
    await setDoc(doc(db, 'channels', channel.id), cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Subscribe to messages in a channel
export function subscribeToMessages(channelId: string, callback: (messages: ChatMessage[]) => void): () => void {
  if (!auth.currentUser) {
    callback([]);
    return () => {};
  }
  const path = `channels/${channelId}/messages`;
  try {
    const unsub = onSnapshot(
      collection(db, 'channels', channelId, 'messages'),
      (snapshot) => {
        const messages: ChatMessage[] = [];
        snapshot.forEach((d) => {
          messages.push(d.data() as ChatMessage);
        });
        // Sort in memory by createdAt ascending to avoid index requirements
        messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        callback(messages);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return unsub;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// Send a message
export async function sendMessage(channelId: string, msg: ChatMessage): Promise<void> {
  const path = `channels/${channelId}/messages/${msg.id}`;
  try {
    const cleanMsg = sanitizePayload(msg);
    await setDoc(doc(db, 'channels', channelId, 'messages', msg.id), cleanMsg);
    // Also update channel lastMessage
    const preview = msg.type === 'code' ? `[Kod] ${msg.codeLanguage || 'snippet'}` : msg.text;
    await updateDoc(doc(db, 'channels', channelId), {
      lastMessage: preview.slice(0, 100),
      lastMessageAt: msg.createdAt
    }).catch(() => {
      // Ignore if channel doc update fails
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// Toggle reaction
export async function toggleMessageReaction(
  channelId: string,
  messageId: string,
  emoji: string,
  userId: string,
  currentReactions?: Record<string, string[]>
): Promise<void> {
  const path = `channels/${channelId}/messages/${messageId}`;
  try {
    const reactions = { ...(currentReactions || {}) };
    const userList = reactions[emoji] ? [...reactions[emoji]] : [];
    const index = userList.indexOf(userId);

    if (index > -1) {
      userList.splice(index, 1);
    } else {
      userList.push(userId);
    }

    if (userList.length === 0) {
      delete reactions[emoji];
    } else {
      reactions[emoji] = userList;
    }

    await updateDoc(doc(db, 'channels', channelId, 'messages', messageId), {
      reactions
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Delete message
export async function deleteMessage(channelId: string, messageId: string): Promise<void> {
  const path = `channels/${channelId}/messages/${messageId}`;
  try {
    await deleteDoc(doc(db, 'channels', channelId, 'messages', messageId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Subscribe to users list
export function subscribeToUsers(callback: (users: UserProfile[]) => void): () => void {
  if (!auth.currentUser) {
    callback([]);
    return () => {};
  }
  const path = 'users';
  try {
    const unsub = onSnapshot(
      collection(db, path),
      (snapshot) => {
        const users: UserProfile[] = [];
        snapshot.forEach((d) => {
          users.push(d.data() as UserProfile);
        });
        callback(users);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return unsub;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// Save or update user profile
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    const cleanProfile = sanitizePayload(profile);
    await setDoc(doc(db, 'users', profile.uid), cleanProfile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Helper to get or create direct message channel between two users
export async function getOrCreateDirectChannel(currentUser: UserProfile, targetUser: UserProfile): Promise<Channel> {
  // Deterministic DM channel ID
  const sortedIds = [currentUser.uid, targetUser.uid].sort();
  const channelId = `dm_${sortedIds[0]}_${sortedIds[1]}`;

  const channel: Channel = {
    id: channelId,
    name: `@${targetUser.username}`,
    description: `${currentUser.displayName} ve ${targetUser.displayName} arasındaki özel mesajlaşma`,
    type: 'direct',
    creatorId: currentUser.uid,
    memberIds: [currentUser.uid, targetUser.uid],
    createdAt: new Date().toISOString(),
    lastMessage: 'Özel sohbet başlatıldı',
    lastMessageAt: new Date().toISOString()
  };

  const path = `channels/${channelId}`;
  try {
    const cleanChannel = sanitizePayload(channel);
    await setDoc(doc(db, 'channels', channelId), cleanChannel, { merge: true });
    return channel;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
