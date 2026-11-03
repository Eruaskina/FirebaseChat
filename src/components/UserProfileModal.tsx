import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, X, Check, Sparkles, Palette } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_COLOR_OPTIONS = [
  '#FFA000',
  '#FF6F00',
  '#F57C00',
  '#E65100',
  '#039BE5',
  '#1A73E8',
  '#00897B',
  '#7C4DFF'
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfileData } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [selectedColor, setSelectedColor] = useState(profile?.avatarColor || '#FFA000');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !profile) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || saving) return;

    try {
      setSaving(true);
      await updateProfileData({
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatarColor: selectedColor
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md bg-[#1E2124] border border-[#353A40] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="h-1.5 bg-gradient-to-r from-[#FFCA28] to-[#FF6F00]" />

        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#272B2F] border border-[#3A3F45] text-amber-400">
                <User size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Profilini Düzenle</h3>
                <p className="text-xs text-gray-400">Kullanıcı bilgilerinizi güncelleyin</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#282C31] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Avatar Preview */}
            <div className="flex items-center gap-4 p-3 bg-[#141618] rounded-xl border border-[#2E3339]">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold uppercase shadow-md border-2 border-white/20 shrink-0"
                style={{ backgroundColor: selectedColor }}
              >
                {displayName ? displayName[0] : 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">{displayName || 'İsimsiz'}</div>
                <div className="text-xs text-amber-400 font-mono">@{profile.username}</div>
                <div className="text-[11px] text-gray-500 truncate mt-0.5">{profile.email || 'Email yok'}</div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Görünecek İsim
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 bg-[#141618] border border-[#2E3339] rounded-xl text-sm text-white focus:outline-none focus:border-[#FFA000] focus:ring-1 focus:ring-[#FFA000]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Hakkında / Durum Mesajı
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Örn: Firebase Cloud ve Frontend aşığı 🔥"
                className="w-full px-3 py-2 bg-[#141618] border border-[#2E3339] rounded-xl text-sm text-white focus:outline-none focus:border-[#FFA000] focus:ring-1 focus:ring-[#FFA000]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2 flex items-center gap-1.5">
                <Palette size={14} className="text-amber-400" /> Profil Rozet Rengi
              </label>
              <div className="flex items-center gap-2">
                {AVATAR_COLOR_OPTIONS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setSelectedColor(hex)}
                    style={{ backgroundColor: hex }}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      selectedColor === hex
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1E2124] scale-110'
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-300 hover:bg-[#272B2F] transition-colors"
              >
                Kapat
              </button>
              <button
                type="submit"
                disabled={saving || !displayName.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#FFA000] to-[#FF6F00] text-gray-950 shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {savedSuccess ? (
                  <>
                    <Check size={14} /> Kaydedildi!
                  </>
                ) : (
                  'Güncelle'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
