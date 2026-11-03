import React, { useState } from 'react';
import { Channel, UserProfile } from '../types/chat';
import { useAuth } from '../context/AuthContext';
import {
  Hash,
  Plus,
  MessageSquare,
  Users,
  Search,
  Sparkles,
  Zap,
  Circle
} from 'lucide-react';
import { getDirectChatPartner } from '../utils/chatHelpers';

interface SidebarProps {
  channels: Channel[];
  activeChannelId: string;
  onSelectChannel: (channel: Channel) => void;
  onOpenCreateChannel: () => void;
  onlineUsers: UserProfile[];
  onStartDirectMessage: (user: UserProfile) => void;
  onCloseMobileSidebar?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  channels,
  activeChannelId,
  onSelectChannel,
  onOpenCreateChannel,
  onlineUsers,
  onStartDirectMessage,
  onCloseMobileSidebar
}) => {
  const { profile, loginWithDemoAccount } = useAuth();
  const [activeTab, setActiveTab] = useState<'channels' | 'users'>('channels');
  const [searchQuery, setSearchQuery] = useState('');

  const publicChannels = channels.filter(
    (c) => c.type === 'public' && c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const directChannels = channels.filter((c) => {
    if (c.type !== 'direct' || !c.memberIds?.includes(profile?.uid || '')) {
      return false;
    }
    if (!searchQuery) return true;
    const partner = getDirectChatPartner(c, profile?.uid, onlineUsers);
    const q = searchQuery.toLowerCase();
    return (
      partner?.displayName.toLowerCase().includes(q) ||
      partner?.username.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q)
    );
  });

  const filteredUsers = onlineUsers.filter(
    (u) =>
      u.uid !== profile?.uid &&
      (u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <aside className="w-72 bg-[#1E2124] border-r border-[#2D3135] flex flex-col h-full text-gray-300 select-none">
      {/* Top Search bar */}
      <div className="p-3 border-b border-[#2D3135]">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={activeTab === 'channels' ? 'Kanal veya sohbet ara...' : 'Kullanıcı ara...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#141618] border border-[#2F3338] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFA000] focus:ring-1 focus:ring-[#FFA000] transition-colors"
          />
        </div>
      </div>

      {/* Tabs: Kanallar vs Kullanıcılar */}
      <div className="flex border-b border-[#2D3135] bg-[#181B1E] text-xs font-medium">
        <button
          onClick={() => setActiveTab('channels')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
            activeTab === 'channels'
              ? 'text-[#FFA000] border-[#FFA000] bg-[#1E2124]'
              : 'text-gray-400 border-transparent hover:text-gray-200'
          }`}
        >
          <Hash size={14} /> Kanallar ({channels.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
            activeTab === 'users'
              ? 'text-[#FFA000] border-[#FFA000] bg-[#1E2124]'
              : 'text-gray-400 border-transparent hover:text-gray-200'
          }`}
        >
          <Users size={14} /> Kullanıcılar ({onlineUsers.length})
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {activeTab === 'channels' ? (
          <>
            {/* Public Channels Section */}
            <div>
              <div className="flex items-center justify-between px-2 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  Herkese Açık Odalar
                </span>
                <button
                  onClick={onOpenCreateChannel}
                  title="Yeni Kanal Oluştur"
                  className="p-1 rounded text-gray-400 hover:text-amber-400 hover:bg-[#2A2E33] transition-colors"
                >
                  <Plus size={15} />
                </button>
              </div>

              <div className="space-y-0.5">
                {publicChannels.length === 0 ? (
                  <p className="text-xs text-gray-500 italic px-2 py-1">Kanal bulunamadı</p>
                ) : (
                  publicChannels.map((ch) => {
                    const isActive = ch.id === activeChannelId;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => {
                          onSelectChannel(ch);
                          onCloseMobileSidebar?.();
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between text-xs transition-colors group ${
                          isActive
                            ? 'bg-[#FFA000]/15 text-[#FFCA28] font-semibold border border-[#FFA000]/30 shadow-xs'
                            : 'text-gray-300 hover:bg-[#272B2F] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Hash
                            size={16}
                            className={isActive ? 'text-[#FFA000]' : 'text-gray-500 group-hover:text-gray-300'}
                          />
                          <span className="truncate">{ch.name}</span>
                        </div>
                        {ch.id === 'genel' && (
                          <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300">
                            Ana
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Direct Messages Section */}
            <div>
              <div className="flex items-center justify-between px-2 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <MessageSquare size={12} /> Özel Mesajlar (DM)
                </span>
              </div>

              <div className="space-y-0.5">
                {directChannels.length === 0 ? (
                  <p className="text-xs text-gray-500 italic px-2 py-1">
                    Henüz özel sohbet yok. "Kullanıcılar" sekmesinden birine tıkla!
                  </p>
                ) : (
                  directChannels.map((ch) => {
                    const isActive = ch.id === activeChannelId;
                    const partner = getDirectChatPartner(ch, profile?.uid, onlineUsers);
                    const displayName = partner?.displayName || ch.name;
                    const username = partner ? `@${partner.username}` : '';
                    const avatarColor = partner?.avatarColor || '#FFA000';
                    const isOnline = partner?.status === 'online';
                    const hasUnread = Boolean(
                      ch.lastSenderId &&
                      ch.lastSenderId !== profile?.uid &&
                      ch.id !== activeChannelId
                    );

                    return (
                      <button
                        key={ch.id}
                        onClick={() => {
                          onSelectChannel(ch);
                          onCloseMobileSidebar?.();
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                          isActive
                            ? 'bg-[#FFA000]/15 text-[#FFCA28] font-semibold border border-[#FFA000]/30'
                            : 'text-gray-300 hover:bg-[#272B2F] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="relative shrink-0">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-xs uppercase"
                              style={{ backgroundColor: avatarColor }}
                            >
                              {displayName ? displayName[0] : 'U'}
                            </div>
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#1E2124] ${
                                isOnline ? 'bg-emerald-400' : 'bg-gray-500'
                              }`}
                            />
                          </div>
                          <div className="truncate min-w-0">
                            <div className="truncate font-medium text-gray-200">{displayName}</div>
                            {username && (
                              <div className="text-[10px] text-gray-400 font-mono truncate">{username}</div>
                            )}
                          </div>
                        </div>

                        {hasUnread && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 animate-pulse" title="Yeni mesaj" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </>
        ) : (
          /* Users list */
          <div>
            <div className="px-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Kayıtlı Kullanıcılar (Sohbet Başlat)
              </span>
            </div>

            <div className="space-y-1">
              {filteredUsers.length === 0 ? (
                <div className="px-2 py-4 text-center">
                  <p className="text-xs text-gray-500">Başka kullanıcı bulunamadı.</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Aşağıdaki "Hızlı Test Kullanıcıları" ile yeni hesap açıp iki pencerede anlık mesajlaşmayı test edebilirsiniz!
                  </p>
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <button
                    key={u.uid}
                    onClick={() => {
                      onStartDirectMessage(u);
                      onCloseMobileSidebar?.();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between hover:bg-[#272B2F] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs uppercase"
                          style={{ backgroundColor: u.avatarColor || '#FFA000' }}
                        >
                          {u.displayName ? u.displayName[0] : 'U'}
                        </div>
                        <Circle
                          size={8}
                          className={`absolute -bottom-0.5 -right-0.5 fill-current ${
                            u.status === 'online' ? 'text-emerald-400' : 'text-gray-500'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-200 group-hover:text-white">
                          {u.displayName}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">@{u.username}</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#33383E] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      Mesaj Yaz
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom: Fast Demo Account Switcher */}
      <div className="p-3 border-t border-[#2D3135] bg-[#16181B]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
            <Zap size={12} /> Test Kullanıcı Değiştir
          </span>
          <span className="text-[10px] text-gray-500 font-mono">Anlık Test</span>
        </div>
        <p className="text-[11px] text-gray-400 mb-2 leading-tight">
          Farklı bir kullanıcı olarak oturum açıp anlık mesajlaşmayı test edin:
        </p>
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => loginWithDemoAccount('alper')}
            className="py-1 px-1.5 rounded bg-[#24282C] hover:bg-[#2F343A] border border-[#3A3F45] text-[10px] text-amber-300 font-medium truncate transition-colors text-center"
            title="Alper (Dev)"
          >
            🔥 Alper
          </button>
          <button
            onClick={() => loginWithDemoAccount('zeynep')}
            className="py-1 px-1.5 rounded bg-[#24282C] hover:bg-[#2F343A] border border-[#3A3F45] text-[10px] text-sky-300 font-medium truncate transition-colors text-center"
            title="Zeynep (Cloud)"
          >
            ⚡ Zeynep
          </button>
          <button
            onClick={() => loginWithDemoAccount('can')}
            className="py-1 px-1.5 rounded bg-[#24282C] hover:bg-[#2F343A] border border-[#3A3F45] text-[10px] text-orange-300 font-medium truncate transition-colors text-center"
            title="Can (Frontend)"
          >
            🚀 Can
          </button>
        </div>
      </div>
    </aside>
  );
};
