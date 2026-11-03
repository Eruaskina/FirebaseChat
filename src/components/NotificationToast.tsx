import React from 'react';
import { InAppNotification } from '../firebase/notifications';
import { MessageSquare, Hash, X, ArrowRight } from 'lucide-react';

interface NotificationToastProps {
  notification: InAppNotification | null;
  onClose: () => void;
  onNavigate: (channelId: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  onNavigate
}) => {
  if (!notification) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-200">
      <div className="bg-[#1E2124] border border-[#FFA000]/40 rounded-2xl shadow-2xl p-3.5 text-white backdrop-blur-md flex items-start gap-3 relative overflow-hidden">
        {/* Glow indicator line */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#FFCA28] to-[#FF6F00]" />

        {/* Avatar */}
        <div className="shrink-0 pt-0.5">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md uppercase select-none border border-white/20"
            style={{ backgroundColor: notification.senderColor || '#FFA000' }}
          >
            {notification.senderName ? notification.senderName[0] : 'U'}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-bold text-gray-100 truncate">
              {notification.senderName}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FFA000]/20 text-[#FFCA28] font-mono shrink-0 flex items-center gap-1">
              {notification.channelName.startsWith('@') ? (
                <MessageSquare size={10} />
              ) : (
                <Hash size={10} />
              )}
              {notification.channelName}
            </span>
          </div>

          <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
            {notification.text}
          </p>

          <div className="mt-2.5 flex items-center justify-between">
            <button
              onClick={() => {
                onNavigate(notification.channelId);
                onClose();
              }}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>Sohbete Git</span>
              <ArrowRight size={12} />
            </button>
            <span className="text-[10px] text-gray-500 font-mono">Yeni Mesaj</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#282C31] transition-colors shrink-0"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};
