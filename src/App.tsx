import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { AuthModal } from './components/AuthModal';
import { CreateChannelModal } from './components/CreateChannelModal';
import { CodeSnippetModal } from './components/CodeSnippetModal';
import { UserProfileModal } from './components/UserProfileModal';
import { NotificationToast } from './components/NotificationToast';
import { Channel, UserProfile } from './types/chat';
import {
  subscribeToChannels,
  subscribeToUsers,
  getOrCreateDirectChannel,
  sendMessage
} from './firebase/db';
import { testConnection } from './firebase/config';
import { FirebaseLogo } from './components/FirebaseLogo';
import { InAppNotification, triggerDesktopNotification } from './firebase/notifications';
import { getDirectChatPartner } from './utils/chatHelpers';

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

  // In-app toast notification state
  const [toastNotification, setToastNotification] = useState<InAppNotification | null>(null);

  // Track previous message timestamps per channel to detect new arrivals
  const lastKnownMessagesRef = useRef<Record<string, string>>({});
  const initialChannelsLoadedRef = useRef(false);

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
    if (!currentUser || !profile) return;

    const unsubChannels = subscribeToChannels((chs) => {
      // Check for incoming new messages across any channel
      if (initialChannelsLoadedRef.current) {
        for (const ch of chs) {
          const prevTime = lastKnownMessagesRef.current[ch.id];
          const newTime = ch.lastMessageAt;

          if (
            newTime &&
            newTime !== prevTime &&
            ch.lastSenderId &&
            ch.lastSenderId !== profile.uid
          ) {
            // New message arrived from someone else!
            const partner = getDirectChatPartner(ch, profile.uid, onlineUsers);
            const chDisplayName = partner ? `@${partner.displayName}` : `#${ch.name}`;
            const senderName = ch.lastSenderName || 'Bir kullanıcı';
            const msgPreview = ch.lastMessage || 'Yeni bir ileti gönderildi';

            // 1. Browser desktop notification + audio chime
            triggerDesktopNotification(
              `🔥 ${senderName} (${chDisplayName})`,
              msgPreview,
              () => setActiveChannel(ch)
            );

            // 2. In-app toast banner
            setToastNotification({
              id: `notif_${Date.now()}_${Math.random()}`,
              senderName,
              channelId: ch.id,
              channelName: chDisplayName,
              text: msgPreview,
              createdAt: newTime
            });
          }
        }
      }

      // Update timestamps cache
      chs.forEach((ch) => {
        if (ch.lastMessageAt) {
          lastKnownMessagesRef.current[ch.id] = ch.lastMessageAt;
        }
      });
      initialChannelsLoadedRef.current = true;

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
  }, [currentUser, profile?.uid, onlineUsers.length]);

  // Auto-dismiss in-app toast notification after 6 seconds
  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => {
        setToastNotification(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

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
              onlineUsers={onlineUsers}
            />
          </div>

          {/* In-App Message Toast Notification */}
          <NotificationToast
            notification={toastNotification}
            onClose={() => setToastNotification(null)}
            onNavigate={(chId) => {
              const target = channels.find((c) => c.id === chId);
              if (target) {
                setActiveChannel(target);
              }
            }}
          />

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
