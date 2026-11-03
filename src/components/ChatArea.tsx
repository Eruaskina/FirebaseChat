import React, { useState, useEffect, useRef } from 'react';
import { Channel, ChatMessage, UserProfile } from '../types/chat';
import { useAuth } from '../context/AuthContext';
import { MessageItem } from './MessageItem';
import { MessageInput } from './MessageInput';
import {
  subscribeToMessages,
  sendMessage,
  toggleMessageReaction,
  deleteMessage
} from '../firebase/db';
import { playMessageReceivedSound } from '../firebase/sound';
import {
  Hash,
  MessageSquare,
  Search,
  Sparkles,
  ShieldAlert,
  Flame,
  Info
} from 'lucide-react';

import { getDirectChatPartner } from '../utils/chatHelpers';

interface ChatAreaProps {
  channel: Channel;
  onOpenCodeModal: () => void;
  onlineUsers?: UserProfile[];
}

export const ChatArea: React.FC<ChatAreaProps> = ({ channel, onOpenCodeModal, onlineUsers = [] }) => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousMessageCount = useRef<number>(0);

  // Subscribe to channel messages in real-time
  useEffect(() => {
    if (!profile) {
      setMessages([]);
      return;
    }
    previousMessageCount.current = 0;
    const unsubscribe = subscribeToMessages(channel.id, (incomingMessages) => {
      // Play chime if new message received from someone else
      if (
        previousMessageCount.current > 0 &&
        incomingMessages.length > previousMessageCount.current
      ) {
        const lastMsg = incomingMessages[incomingMessages.length - 1];
        if (lastMsg && lastMsg.senderId !== profile?.uid) {
          playMessageReceivedSound();
        }
      }
      previousMessageCount.current = incomingMessages.length;
      setMessages(incomingMessages);
    });

    return () => unsubscribe();
  }, [channel.id, profile?.uid]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async (text: string, type: 'text' | 'code' = 'text', codeLanguage?: string) => {
    if (!profile) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      channelId: channel.id,
      senderId: profile.uid,
      senderName: profile.displayName || profile.username,
      senderColor: profile.avatarColor || '#FFA000',
      text,
      type,
      reactions: {},
      createdAt: new Date().toISOString()
    };

    if (codeLanguage) {
      newMsg.codeLanguage = codeLanguage;
    }

    await sendMessage(channel.id, newMsg);
  };

  const handleReaction = async (messageId: string, emoji: string, currentReactions?: Record<string, string[]>) => {
    if (!profile) return;
    await toggleMessageReaction(channel.id, messageId, emoji, profile.uid, currentReactions);
  };

  const handleDelete = async (messageId: string) => {
    await deleteMessage(channel.id, messageId);
  };

  const filteredMessages = messages.filter((m) =>
    searchFilter ? m.text.toLowerCase().includes(searchFilter.toLowerCase()) : true
  );

  const isDirect = channel.type === 'direct';
  const partner = isDirect ? getDirectChatPartner(channel, profile?.uid, onlineUsers) : null;
  const headerTitle = partner ? partner.displayName : channel.name;
  const headerSubtitle = partner
    ? `@${partner.username} • ${partner.status === 'online' ? 'Çevrim İçi' : 'Çevrim Dışı'}`
    : channel.description;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#181B1E] overflow-hidden">
      {/* Channel Header */}
      <div className="h-14 bg-[#1E2124] border-b border-[#2D3135] px-4 flex items-center justify-between shrink-0 shadow-xs z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="p-1.5 rounded-lg border text-amber-400 shrink-0"
            style={{
              backgroundColor: isDirect && partner?.avatarColor ? `${partner.avatarColor}20` : '#272B2F',
              borderColor: isDirect && partner?.avatarColor ? `${partner.avatarColor}50` : '#3A3F45'
            }}
          >
            {isDirect ? <MessageSquare size={16} /> : <Hash size={16} />}
          </div>
          <div className="truncate">
            <h2 className="text-sm font-bold text-gray-100 truncate flex items-center gap-2">
              <span>{headerTitle}</span>
              {partner && (
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    partner.status === 'online' ? 'bg-emerald-400' : 'bg-gray-500'
                  }`}
                  title={partner.status === 'online' ? 'Çevrim İçi' : 'Çevrim Dışı'}
                />
              )}
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#FFA000]/15 text-[#FFCA28] border border-[#FFA000]/30 hidden sm:inline-block">
                {isDirect ? 'Özel Sohbet' : 'Canlı Firestore'}
              </span>
            </h2>
            {headerSubtitle && (
              <p className="text-[11px] text-gray-400 truncate">{headerSubtitle}</p>
            )}
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          {showSearch ? (
            <div className="relative animate-in fade-in duration-150">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Mesajlarda ara..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                autoFocus
                className="pl-8 pr-7 py-1 bg-[#141618] border border-[#3A3F45] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFA000] w-36 sm:w-48"
              />
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchFilter('');
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              title="Mesaj Ara"
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#272B2F] transition-colors"
            >
              <Search size={17} />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
            <div className="w-14 h-14 rounded-2xl bg-[#24282D] border border-[#353A40] flex items-center justify-center text-amber-400 mb-3 shadow-inner">
              <Flame size={28} />
            </div>
            <h3 className="text-base font-semibold text-gray-200">
              {searchFilter ? 'Aramaya uygun mesaj bulunamadı' : `${channel.name} Odası Hazır`}
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mt-1">
              {searchFilter
                ? 'Farklı bir kelime deneyin.'
                : 'Bu kanalda henüz mesaj yok. İlk mesajı siz yazarak sohbeti başlatın! 🔥'}
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              onReact={(emoji) => handleReaction(msg.id, emoji, msg.reactions)}
              onDelete={msg.senderId === profile?.uid ? () => handleDelete(msg.id) : undefined}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bottom Bar */}
      <MessageInput
        placeholder={`${channel.name} kanalına mesaj yaz...`}
        onSendMessage={handleSend}
        onOpenCodeModal={onOpenCodeModal}
        disabled={!profile}
      />
    </div>
  );
};
