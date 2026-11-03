import React, { useState, useRef, useEffect } from 'react';
import { Send, Code, Smile, Sparkles } from 'lucide-react';
import { playMessageSentSound } from '../firebase/sound';
import confetti from 'canvas-confetti';

interface MessageInputProps {
  placeholder: string;
  onSendMessage: (text: string, type?: 'text' | 'code', codeLanguage?: string) => Promise<void>;
  onOpenCodeModal: () => void;
  disabled?: boolean;
}

const QUICK_EMOJIS = ['🔥', '🚀', '👍', '❤️', '🎉', '💯', '👏', '⚡', '💻', '✨'];

export const MessageInput: React.FC<MessageInputProps> = ({
  placeholder,
  onSendMessage,
  onOpenCodeModal,
  disabled
}) => {
  const [text, setText] = useState('');
  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending || disabled) return;

    try {
      setSending(true);
      await onSendMessage(trimmed, 'text');
      playMessageSentSound();
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInsertEmoji = (emoji: string) => {
    if (emoji === '🔥') {
      confetti({
        particleCount: 15,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#FFCA28', '#FFA000', '#FF6F00']
      });
    }
    setText((prev) => prev + emoji);
    setShowEmojiBar(false);
    textareaRef.current?.focus();
  };

  // Adjust textarea height automatically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  return (
    <div className="p-3 bg-[#1A1D20] border-t border-[#2D3135] shrink-0">
      {/* Quick emoji popover bar */}
      {showEmojiBar && (
        <div className="mb-2 p-1.5 bg-[#22262B] border border-[#353A40] rounded-xl flex items-center gap-1 overflow-x-auto shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="text-[11px] font-semibold text-gray-400 px-2 uppercase tracking-wider font-mono">
            Hızlı Emojiler:
          </span>
          {QUICK_EMOJIS.map((em) => (
            <button
              key={em}
              onClick={() => handleInsertEmoji(em)}
              className="p-1.5 hover:bg-[#2C3138] rounded-lg text-base transition-transform hover:scale-125"
            >
              {em}
            </button>
          ))}
        </div>
      )}

      {/* Input container */}
      <div className="relative rounded-2xl bg-[#141618] border border-[#2E3339] focus-within:border-[#FFA000] focus-within:ring-1 focus-within:ring-[#FFA000] transition-all shadow-inner">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || sending}
          className="w-full pl-3 pr-28 py-3 bg-transparent text-sm text-gray-100 placeholder-gray-500 focus:outline-none resize-none leading-relaxed max-h-32"
        />

        {/* Action icons right aligned */}
        <div className="absolute right-2.5 bottom-2 flex items-center gap-1.5">
          {/* Quick flame button */}
          <button
            type="button"
            onClick={() => handleInsertEmoji('🔥')}
            title="Firebase Ateşi Ekle"
            className="p-1.5 rounded-lg text-amber-400 hover:bg-[#24282D] transition-colors"
          >
            🔥
          </button>

          {/* Emoji button */}
          <button
            type="button"
            onClick={() => setShowEmojiBar(!showEmojiBar)}
            title="Emoji Seç"
            className={`p-1.5 rounded-lg transition-colors ${
              showEmojiBar
                ? 'text-amber-400 bg-[#24282D]'
                : 'text-gray-400 hover:text-white hover:bg-[#24282D]'
            }`}
          >
            <Smile size={18} />
          </button>

          {/* Code snippet modal button */}
          <button
            type="button"
            onClick={onOpenCodeModal}
            title="Kod Parçası Paylaş"
            className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-[#24282D] transition-colors"
          >
            <Code size={18} />
          </button>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() || sending || disabled}
            title="Gönder (Enter)"
            className={`p-2 rounded-xl flex items-center justify-center transition-all ${
              text.trim() && !sending && !disabled
                ? 'bg-gradient-to-r from-[#FFA000] to-[#FF6F00] text-gray-900 shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95'
                : 'bg-[#24282D] text-gray-600 cursor-not-allowed'
            }`}
          >
            <Send size={16} className={text.trim() ? 'fill-current' : ''} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mt-1 px-1 text-[11px] text-gray-500">
        <span>Enter ile gönder, Shift + Enter ile yeni satır</span>
        <span className="flex items-center gap-1 font-mono text-[10px] text-amber-500/80">
          <Sparkles size={11} /> Firestore Realtime Sync
        </span>
      </div>
    </div>
  );
};
