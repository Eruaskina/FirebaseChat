import React, { useState } from 'react';
import { ChatMessage } from '../types/chat';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import { Trash2, Smile, Copy, Check, Terminal } from 'lucide-react';

interface MessageItemProps {
  message: ChatMessage;
  onReact: (emoji: string) => void;
  onDelete?: () => void;
}

const COMMON_EMOJIS = ['🔥', '👍', '❤️', '🚀', '😂', '🎉'];

export const MessageItem: React.FC<MessageItemProps> = ({ message, onReact, onDelete }) => {
  const { profile } = useAuth();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const isMe = message.senderId === profile?.uid;

  const handleFireReaction = (emoji: string) => {
    if (emoji === '🔥') {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FFCA28', '#FFA000', '#FF6F00', '#EA4335']
      });
    }
    onReact(emoji);
    setShowEmojiPicker(false);
  };

  const handleCopyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Render clickable links and line breaks
  const renderFormattedText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:underline break-all"
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div
      className={`group relative flex gap-3 px-3 py-2 rounded-xl transition-colors ${
        isMe ? 'hover:bg-[#25292E]/60' : 'hover:bg-[#202327]/60'
      }`}
    >
      {/* Avatar */}
      <div className="shrink-0 pt-0.5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md uppercase select-none border border-white/10"
          style={{ backgroundColor: message.senderColor || '#FFA000' }}
        >
          {message.senderName ? message.senderName[0] : 'U'}
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Header: Sender Name & Time */}
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-semibold ${isMe ? 'text-amber-400' : 'text-gray-200'}`}>
            {message.senderName}
          </span>
          {isMe && (
            <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-300 font-mono">
              Sen
            </span>
          )}
          <span className="text-[10px] text-gray-500 font-mono">{formatTime(message.createdAt)}</span>
        </div>

        {/* Message Body: Code vs Text */}
        {message.type === 'code' ? (
          <div className="rounded-lg bg-[#141618] border border-[#2E3339] overflow-hidden my-1 max-w-2xl shadow-inner">
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#1B1E22] border-b border-[#2E3339] text-xs text-gray-400">
              <span className="font-mono text-[11px] flex items-center gap-1.5 text-amber-400">
                <Terminal size={12} /> {message.codeLanguage || 'code'}
              </span>
              <button
                onClick={() => handleCopyCode(message.text)}
                className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition-colors py-0.5 px-1.5 rounded hover:bg-[#282C31]"
              >
                {copiedCode ? (
                  <>
                    <Check size={12} className="text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Kopyala</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 text-xs font-mono text-gray-200 overflow-x-auto whitespace-pre leading-relaxed select-text">
              <code>{message.text}</code>
            </pre>
          </div>
        ) : (
          <div className="text-xs sm:text-sm text-gray-200 leading-relaxed whitespace-pre-wrap break-words select-text">
            {renderFormattedText(message.text)}
          </div>
        )}

        {/* Reactions List */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {Object.entries(message.reactions).map(([emoji, userIds]) => {
              const hasReacted = userIds.includes(profile?.uid || '');
              return (
                <button
                  key={emoji}
                  onClick={() => handleFireReaction(emoji)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors border ${
                    hasReacted
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold'
                      : 'bg-[#181B1E] border-[#2D3135] text-gray-400 hover:border-gray-500 hover:text-gray-200'
                  }`}
                  title={`${userIds.length} kişi tepki verdi`}
                >
                  <span>{emoji}</span>
                  <span className="text-[11px] font-mono">{userIds.length}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Menu on Hover */}
      <div className="absolute right-3 top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1E2124] border border-[#33383E] rounded-lg shadow-lg flex items-center p-0.5 gap-0.5 z-10">
        <button
          onClick={() => handleFireReaction('🔥')}
          title="Firebase Ateşi Ver! (🔥)"
          className="p-1 rounded text-amber-400 hover:bg-[#282C31] transition-colors"
        >
          🔥
        </button>
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title="Tepki Ekle"
          className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#282C31] transition-colors"
        >
          <Smile size={14} />
        </button>
        {isMe && onDelete && (
          <button
            onClick={onDelete}
            title="Mesajı Sil"
            className="p-1.5 rounded text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="absolute right-3 top-10 bg-[#1A1D20] border border-[#33383E] rounded-lg p-1.5 shadow-xl flex items-center gap-1 z-20">
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleFireReaction(emoji)}
              className="p-1.5 hover:bg-[#282C31] rounded text-base transition-transform hover:scale-125"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
