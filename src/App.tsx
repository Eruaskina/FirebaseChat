import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { AuthModal } from './components/AuthModal';
import { CreateChannelModal } from './components/CreateChannelModal';
import { CodeSnippetModal } from './components/CodeSnippetModal';
import { UserProfileModal } from './components/UserProfileModal';
import { Channel, UserProfile } from './types/chat';
import {
  subscribeToChannels,
  subscribeToUsers,
  getOrCreateDirectChannel,
  sendMessage
} from './firebase/db';
import { testConnection } from './firebase/config';
import { FirebaseLogo } from './components/FirebaseLogo';

const DEFAULT_ACTIVE_CHANNEL: Channel = {
  id: 'genel',
  name: 'genel',
  description: 'Firebase Topluluğu genel sohbet ve tanışma kanalı 🔥',
  type: 'public',
  createdAt: new Date().toISOString()
};

function MainChatApp() {
  const { currentUser, profile, loading } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel>(DEFAULT_ACTIVE_CHANNEL);
  const [onlineUsers, setOnlineUsers] = useState<UserProfile[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Connectivity state
  useEffect(() => {
    testConnection();
  }, []);

  // Subscribe to channels & users when logged in
  useEffect(() => {
    if (!currentUser) return;

    const unsubChannels = subscribeToChannels((chs) => {
      setChannels(chs);
      // Keep active channel object updated if it exists in list
      setActiveChannel((prev) => {
        const found = chs.find((c) => c.id === prev.id);
        return found || prev;
      });
    });

    const unsubUsers = subscribeToUsers((us) => {
      setOnlineUsers(us);
    });

    return () => {
      unsubChannels();
      unsubUsers();
    };
  }, [currentUser]);

  // Handle direct message start
  const handleStartDirectMessage = async (targetUser: UserProfile) => {
    if (!profile) return;
    try {
      const dmChannel = await getOrCreateDirectChannel(profile, targetUser);
      setActiveChannel(dmChannel);
      setIsSidebarOpen(false);
    } catch (err) {
      console.error('Failed to create direct chat:', err);
    }
  };

  // Handle send code snippet
  const handleSendCode = async (code: string, language: string) => {
    if (!profile || !activeChannel) return;
    await sendMessage(activeChannel.id, {
      id: `code_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      channelId: activeChannel.id,
      senderId: profile.uid,
      senderName: profile.displayName || profile.username,
      senderColor: profile.avatarColor || '#FFA000',
      text: code,
      type: 'code',
      codeLanguage: language,
      reactions: {},
      createdAt: new Date().toISOString()
    });
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#181B1E] flex flex-col items-center justify-center text-white">
        <div className="p-4 rounded-3xl bg-[#202428] border border-[#353A40] shadow-2xl mb-4 animate-pulse">
          <FirebaseLogo size={56} />
        </div>
        <div className="text-base font-bold bg-gradient-to-r from-[#FFCA28] to-[#FF6F00] bg-clip-text text-transparent mb-1">
          Firebase Pulse Chat
        </div>
        <p className="text-xs text-gray-400">Firestore bağlantısı kuruluyor...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#141618] text-gray-100 overflow-hidden font-sans">
      {!currentUser ? (
        // When not logged in, render the Auth Experience
        <AuthModal />
      ) : (
        <>
          {/* Top Navigation Header */}
          <Header
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
            onOpenProfile={() => setIsProfileModalOpen(true)}
          />

          {/* Main Workspace: Sidebar + Chat Area */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Mobile Backdrop */}
            {isSidebarOpen && (
              <div
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs transition-opacity"
              />
            )}

            {/* Sidebar (drawer on mobile, fixed on desktop) */}
            <div
              className={`fixed inset-y-16 left-0 z-40 md:static md:inset-auto md:z-auto transition-transform duration-200 ease-in-out ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
              }`}
            >
              <Sidebar
                channels={channels}
                activeChannelId={activeChannel.id}
                onSelectChannel={(ch) => setActiveChannel(ch)}
                onOpenCreateChannel={() => setIsCreateChannelOpen(true)}
                onlineUsers={onlineUsers}
                onStartDirectMessage={handleStartDirectMessage}
                onCloseMobileSidebar={() => setIsSidebarOpen(false)}
              />
            </div>

            {/* Active Chat Conversation Area */}
            <ChatArea
              channel={activeChannel}
              onOpenCodeModal={() => setIsCodeModalOpen(true)}
            />
          </div>

          {/* Modals */}
          <CreateChannelModal
            isOpen={isCreateChannelOpen}
            onClose={() => setIsCreateChannelOpen(false)}
            onChannelCreated={(newCh) => {
              setActiveChannel(newCh);
              setIsSidebarOpen(false);
            }}
          />

          <CodeSnippetModal
            isOpen={isCodeModalOpen}
            onClose={() => setIsCodeModalOpen(false)}
            onSendCode={handleSendCode}
          />

          <UserProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
          />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainChatApp />
    </AuthProvider>
  );
}
