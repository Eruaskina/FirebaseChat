import React, { useState } from 'react';
import { FirebaseLogo } from './FirebaseLogo';
import { useAuth } from '../context/AuthContext';
import { FIRESTORE_DATABASE_ID } from '../firebase/config';
import { isSoundEnabled, toggleSound } from '../firebase/sound';
import { Volume2, VolumeX, LogOut, User as UserIcon, Menu, X, Database, Radio, Bell, BellRing } from 'lucide-react';
import { getNotificationPermission, requestNotificationPermission } from '../firebase/notifications';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onOpenProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  isSidebarOpen,
  onOpenProfile
}) => {
  const { profile, logout } = useAuth();
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [showDbInfo, setShowDbInfo] = useState(false);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission>(getNotificationPermission());

  const handleSoundToggle = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  const handleToggleNotification = async () => {
    const res = await requestNotificationPermission();
    setNotifPerm(res);
  };

  return (
    <header className="h-16 bg-[#1A1D20] border-b border-[#2D3135] text-white flex items-center justify-between px-4 sm:px-6 select-none shrink-0 shadow-md z-30">
      {/* Left: Mobile hamburger & Logo */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#2D3135] transition-colors"
            aria-label="Menüyü Aç/Kapat"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#24282C] border border-[#3A3F45] shadow-inner flex items-center justify-center">
            <FirebaseLogo size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-base sm:text-lg bg-gradient-to-r from-[#FFCA28] via-[#FFA000] to-[#FF6F00] bg-clip-text text-transparent">
                Firebase Pulse
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-[#FFA000]/15 text-[#FFCA28] border border-[#FFA000]/30 hidden sm:inline-block">
                Chat
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block">Gerçek Zamanlı Firestore Sohbet</p>
          </div>
        </div>
      </div>

      {/* Middle: Firestore Connection Status */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#131618] border border-[#2D3135] text-xs">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-gray-300 font-medium">Firestore:</span>
        <span className="text-emerald-400 font-semibold flex items-center gap-1">
          <Radio size={12} className="animate-pulse" /> Canlı Senkronize
        </span>
        <button
          onClick={() => setShowDbInfo(!showDbInfo)}
          title="Veritabanı detayları"
          className="ml-1 text-gray-400 hover:text-amber-400 transition-colors"
        >
          <Database size={13} />
        </button>

        {showDbInfo && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-[#202428] text-gray-200 border border-[#3A3F45] rounded-lg p-3 text-xs shadow-xl z-50 w-80">
            <div className="font-semibold text-amber-400 mb-1 flex items-center gap-1.5">
              <Database size={14} /> Firestore Veritabanı
            </div>
            <p className="text-gray-300 text-[11px] mb-2 break-all font-mono bg-[#14171A] p-1.5 rounded border border-[#2A2E33]">
              ID: {FIRESTORE_DATABASE_ID}
            </p>
            <p className="text-[11px] text-gray-400">
              onSnapshot ile anlık veri akışı sağlanmaktadır. Mesajlar doğrudan Firestore koleksiyonuna yazılır ve tüm kullanıcılara gecikmesiz iletilir.
            </p>
          </div>
        )}
      </div>

      {/* Right: Notification toggle, Sound toggle, Profile & Logout */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Desktop Notification Toggle */}
        <button
          onClick={handleToggleNotification}
          title={
            notifPerm === 'granted'
              ? 'Masaüstü Bildirimleri Aktif'
              : 'Masaüstü Bildirimlerini Etkinleştir'
          }
          className={`p-2 rounded-lg border transition-colors ${
            notifPerm === 'granted'
              ? 'bg-[#24282C] border-[#3A3F45] text-amber-400 hover:bg-[#2D3135]'
              : 'bg-[#181B1E] border-[#2A2D30] text-gray-500 hover:text-amber-400'
          }`}
        >
          {notifPerm === 'granted' ? <BellRing size={18} /> : <Bell size={18} />}
        </button>

        {/* Sound toggle */}
        <button
          onClick={handleSoundToggle}
          title={soundOn ? 'Bildirim Sesini Kapat' : 'Bildirim Sesini Aç'}
          className={`p-2 rounded-lg border transition-colors ${
            soundOn
              ? 'bg-[#24282C] border-[#3A3F45] text-amber-400 hover:bg-[#2D3135]'
              : 'bg-[#181B1E] border-[#2A2D30] text-gray-500 hover:text-gray-300'
          }`}
        >
          {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {/* Profile Card / Button */}
        {profile && (
          <div className="flex items-center gap-2 pl-1 sm:pl-2">
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-[#24282C] border border-transparent hover:border-[#3A3F45] transition-all text-left"
              title="Profil Ayarları"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm border border-white/20"
                style={{ backgroundColor: profile.avatarColor || '#FFA000' }}
              >
                {profile.displayName ? profile.displayName[0] : 'U'}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-gray-200 leading-tight">
                  {profile.displayName}
                </div>
                <div className="text-[10px] text-amber-400 font-mono">@{profile.username}</div>
              </div>
            </button>

            {/* Logout button */}
            <button
              onClick={logout}
              title="Çıkış Yap"
              className="p-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
