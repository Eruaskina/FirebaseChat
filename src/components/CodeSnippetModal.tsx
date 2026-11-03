import React, { useState } from 'react';
import { Terminal, X, Send } from 'lucide-react';

interface CodeSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendCode: (code: string, language: string) => Promise<void>;
}

const LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'json',
  'sql',
  'html',
  'css',
  'bash',
  'rust',
  'go'
];

export const CodeSnippetModal: React.FC<CodeSnippetModalProps> = ({
  isOpen,
  onClose,
  onSendCode
}) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || loading) return;

    try {
      setLoading(true);
      await onSendCode(code.trim(), language);
      setCode('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-xl bg-[#1E2124] border border-[#353A40] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="h-1.5 bg-gradient-to-r from-[#FFCA28] to-[#FF6F00]" />

        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#272B2F] border border-[#3A3F45] text-amber-400">
                <Terminal size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Kod Parçası Paylaş</h3>
                <p className="text-xs text-gray-400">Sözdizimi vurgulu kod bloğu gönderin</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#282C31] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Programlama Dili</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-[#141618] border border-[#2E3339] rounded-xl text-xs text-white focus:outline-none focus:border-[#FFA000] capitalize"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang} className="bg-[#1E2124]">
                    {lang.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Kod Metni</label>
              <textarea
                rows={8}
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Kodunuzu buraya yapıştırın..."
                className="w-full p-3 bg-[#141618] border border-[#2E3339] rounded-xl font-mono text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#FFA000] focus:ring-1 focus:ring-[#FFA000] resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-300 hover:bg-[#272B2F] transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#FFA000] to-[#FF6F00] text-gray-950 shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send size={14} /> Gönder
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
