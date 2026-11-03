import React, { useState } from 'react';
import { Channel } from '../types/chat';
import { useAuth } from '../context/AuthContext';
import { createChannel } from '../firebase/db';
import { Hash, X, Plus } from 'lucide-react';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChannelCreated: (channel: Channel) => void;
}

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  isOpen,
  onClose,
  onChannelCreated
}) => {
  const { profile } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '');
    if (!cleanName || cleanName.length < 2) {
      setError('Kanal adı en az 2 karakter olmalıdır.');
      return;
    }

    try {
      setLoading(true);
      const newChannel: Channel = {
        id: `channel_${cleanName}`,
        name: cleanName,
        description: description.trim() || undefined,
        type: 'public',
        creatorId: profile?.uid,
        createdAt: new Date().toISOString(),
        lastMessage: 'Kanal oluşturuldu',
        lastMessageAt: new Date().toISOString()
      };

      await createChannel(newChannel);
      onChannelCreated(newChannel);
      setName('');
      setDescription('');
      onClose();
    } catch (err: unknown) {
      console.error('Create channel error:', err);
      setError('Kanal oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
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
                <Hash size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Yeni Kanal Oluştur</h3>
                <p className="text-xs text-gray-400">Firebase Firestore üzerinde yeni bir sohbet odası açın</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#282C31] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Kanal Adı
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm">#</span>
                <input
                  type="text"
                  required
                  placeholder="ornek: mobil-gelistiriciler"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-[#141618] border border-[#2E3339] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFA000] focus:ring-1 focus:ring-[#FFA000]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Kanal Açıklaması (İsteğe bağlı)
              </label>
              <input
                type="text"
                placeholder="Bu kanalda neler konuşulacak?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-[#141618] border border-[#2E3339] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFA000] focus:ring-1 focus:ring-[#FFA000]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-300 hover:bg-[#272B2F] transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#FFA000] to-[#FF6F00] text-gray-950 shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <Plus size={15} /> Oluştur
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
