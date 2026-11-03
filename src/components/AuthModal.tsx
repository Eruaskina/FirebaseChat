import React, { useState } from 'react';
import { useAuth, getRandomColor } from '../context/AuthContext';
import { FirebaseLogo } from './FirebaseLogo';
import {
  Lock,
  User,
  LogIn,
  UserPlus,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Zap,
  Info
} from 'lucide-react';

const AVATAR_COLOR_OPTIONS = [
  { name: 'Amber Ateşi', hex: '#FFA000' },
  { name: 'Alev Turuncusu', hex: '#FF6F00' },
  { name: 'Mercan Kırmızısı', hex: '#F57C00' },
  { name: 'Firebase Mavisi', hex: '#039BE5' },
  { name: 'Google Mavisi', hex: '#1A73E8' },
  { name: 'Zümrüt Yeşili', hex: '#00897B' },
  { name: 'Mor Gece', hex: '#7C4DFF' }
];

export const AuthModal: React.FC = () => {
  const { loginWithUsername, registerWithUsername, loginWithDemoAccount, loginWithGoogle } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Form fields
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLOR_OPTIONS[0].hex);

  // States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const u = username.trim();
    if (!u) {
      setErrorMsg('Lütfen kullanıcı adınızı girin.');
      return;
    }
    if (!password) {
      setErrorMsg('Lütfen şifrenizi girin.');
      return;
    }

    try {
      setLoading(true);
      await loginWithUsername(u, password);
    } catch (err: unknown) {
      console.error('Login error:', err);
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('user-not-found') || message.includes('invalid-credential')) {
        setErrorMsg('Kullanıcı adı veya şifre hatalı. Hesabınız yoksa lütfen Kayıt Ol sekmesini kullanın.');
      } else if (message.includes('wrong-password')) {
        setErrorMsg('Girdiğiniz şifre hatalı.');
      } else if (message.includes('operation-not-allowed')) {
        setErrorMsg(
          'Firebase Console\'da Email/Password sağlayıcısı henüz aktif edilmemiş olabilir. Hızlıca aşağıdaki "Tek Tıkla Demo Giriş" veya Google ile giriş yapabilirsiniz.'
        );
      } else {
        setErrorMsg('Giriş yapılırken bir hata oluştu: ' + message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const u = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const d = displayName.trim() || u;

    if (u.length < 3) {
      setErrorMsg('Kullanıcı adı en az 3 karakterden oluşmalıdır.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    if (password !== passwordConfirm) {
      setErrorMsg('Girdiğiniz şifreler birbiriyle eşleşmiyor.');
      return;
    }

    try {
      setLoading(true);
      await registerWithUsername(u, d, password, selectedColor);
      setSuccessNotice('Kayıt başarılı! Sohbet odasına yönlendiriliyorsunuz...');
    } catch (err: unknown) {
      console.error('Register error:', err);
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('email-already-in-use')) {
        setErrorMsg('Bu kullanıcı adı veya e-posta zaten kullanılıyor. Giriş yapmayı deneyin.');
      } else if (message.includes('operation-not-allowed')) {
        setErrorMsg(
          'Firebase Console\'da Email/Password sağlayıcısı etkinleştirilmemiş. Firebase Console > Authentication > Sign-in method üzerinden Email/Password seçeneğini aktif edebilirsiniz.'
        );
      } else {
        setErrorMsg('Kayıt işlemi başarısız: ' + message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#1E2124] border border-[#353A40] rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Flame Glow Banner */}
        <div className="h-2 bg-gradient-to-r from-[#FFCA28] via-[#FFA000] to-[#FF6F00]" />

        <div className="p-6 sm:p-8">
          {/* Logo & Title */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-[#272B2F] border border-[#3C4148] shadow-inner mb-3">
              <FirebaseLogo size={36} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Firebase Pulse Chat
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Kullanıcı adınız ve şifrenizle giriş yapın, anlık sohbete katılın.
            </p>
          </div>

          {/* Google Sign In Option */}
          <div className="mb-5">
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                try {
                  setLoading(true);
                  setErrorMsg(null);
                  await loginWithGoogle();
                } catch (err: unknown) {
                  console.error('Google sign in error:', err);
                  const msg = err instanceof Error ? err.message : String(err);
                  setErrorMsg('Google ile giriş yapılırken bir sorun oluştu: ' + msg);
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full py-2.5 px-4 bg-[#24282D] hover:bg-[#2C3137] border border-[#3A4048] text-white font-medium text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2.5 hover:border-amber-400/50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google ile Hızlı Giriş Yap</span>
            </button>

            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-[#2D3135]"></div>
              <span className="px-3 text-[11px] text-gray-500 uppercase tracking-wider font-mono">
                veya Kullanıcı Adı & Şifre
              </span>
              <div className="flex-1 border-t border-[#2D3135]"></div>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 bg-[#141618] rounded-xl border border-[#2D3135] mb-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tab === 'login'
                  ? 'bg-gradient-to-r from-[#FFA000] to-[#FF6F00] text-gray-900 shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LogIn size={15} /> Giriş Yap
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tab === 'register'
                  ? 'bg-gradient-to-r from-[#FFA000] to-[#FF6F00] text-gray-900 shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserPlus size={15} /> Kayıt Ol
            </button>
          </div>

          {/* Error / Success Feedback */}
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-400" />
                <div className="space-y-1.5 leading-relaxed">
                  <p>{errorMsg}</p>
                  {errorMsg.includes('operation-not-allowed') || errorMsg.includes('Firebase Console') ? (
                    <div className="mt-2 pt-2 border-t border-amber-500/20 text-[11px] space-y-1">
                      <p className="font-semibold text-amber-300">Nasıl Etkinleştirilir?</p>
                      <ol className="list-decimal list-inside space-y-0.5 text-gray-300">
                        <li>
                          <a
                            href="https://console.firebase.google.com/project/gen-lang-client-0326401130/authentication/providers"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-400 underline font-semibold hover:text-amber-300"
                          >
                            Firebase Console Kimlik Doğrulama Paneline gidin ↗
                          </a>
                        </li>
                        <li><b>Email/Password</b> seçeneğini seçip <b>Etkinleştir</b> anahtarını açın ve <b>Kaydet</b>'e tıklayın.</li>
                      </ol>
                      <p className="text-gray-400 pt-1">
                        💡 Beklemeden denemek için yukarıdaki <b>"Google ile Hızlı Giriş Yap"</b> butonuna basarak doğrudan sohbete katılabilirsiniz.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {successNotice && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-400" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {/* Username field */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Kullanıcı Adı {tab === 'login' && 'veya E-posta'}
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  required
                  placeholder={tab === 'login' ? 'ornek: alper veya alper@gmail.com' : 'ornek: alper_demir'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#141618] border border-[#2E3339] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFA000] focus:ring-1 focus:ring-[#FFA000] transition-colors"
                />
              </div>
            </div>

            {/* Display Name (Only in Register) */}
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Görünecek İsim
                </label>
                <div className="relative">
                  <Sparkles size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    required
                    placeholder="ornek: Alper Demir"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#141618] border border-[#2E3339] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFA000] focus:ring-1 focus:ring-[#FFA000] transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Password field */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Şifre</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  required
                  placeholder="En az 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#141618] border border-[#2E3339] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFA000] focus:ring-1 focus:ring-[#FFA000] transition-colors"
                />
              </div>
            </div>

            {/* Password Confirm (Only in Register) */}
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Şifre Tekrarı
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="password"
                    required
                    placeholder="Şifrenizi doğrulayın"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#141618] border border-[#2E3339] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFA000] focus:ring-1 focus:ring-[#FFA000] transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Avatar Color Picker (Only in Register) */}
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">
                  Profil Rengi Seçin
                </label>
                <div className="flex items-center gap-2">
                  {AVATAR_COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setSelectedColor(c.hex)}
                      title={c.name}
                      style={{ backgroundColor: c.hex }}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        selectedColor === c.hex
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1E2124] scale-110'
                          : 'opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#FFA000] to-[#FF6F00] text-gray-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
              ) : tab === 'login' ? (
                <>
                  <LogIn size={16} /> Giriş Yap ve Başla
                </>
              ) : (
                <>
                  <UserPlus size={16} /> Hesabı Oluştur
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fast Login Buttons */}
          <div className="mt-6 pt-5 border-t border-[#2D3135]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <Zap size={14} className="text-amber-400" /> Hızlı Test Hesapları
              </span>
              <span className="text-[10px] text-gray-500">Tek tıkla giriş</span>
            </div>
            <p className="text-[11px] text-gray-400 mb-2.5">
              İki farklı pencere açıp anlık mesajlaşmayı hemen denemek için hazır kullanıcıları seçebilirsiniz:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => loginWithDemoAccount('alper')}
                className="py-1.5 px-2 bg-[#25292E] hover:bg-[#2F343A] border border-[#3C4249] rounded-lg text-xs text-amber-300 font-medium truncate transition-colors text-center"
              >
                🔥 Alper
              </button>
              <button
                type="button"
                onClick={() => loginWithDemoAccount('zeynep')}
                className="py-1.5 px-2 bg-[#25292E] hover:bg-[#2F343A] border border-[#3C4249] rounded-lg text-xs text-sky-300 font-medium truncate transition-colors text-center"
              >
                ⚡ Zeynep
              </button>
              <button
                type="button"
                onClick={() => loginWithDemoAccount('can')}
                className="py-1.5 px-2 bg-[#25292E] hover:bg-[#2F343A] border border-[#3C4249] rounded-lg text-xs text-orange-300 font-medium truncate transition-colors text-center"
              >
                🚀 Can
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
