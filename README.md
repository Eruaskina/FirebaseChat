# 🔥 Firebase Pulse Chat

Firebase temalı, gerçek zamanlı (real-time) Firestore entegrasyonlu ve modern arayüze sahip anlık sohbet uygulaması.

![Firebase Pulse Chat](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80)

## ✨ Özellikler

- **🔥 Firebase Teması & Tasarımı:** Firebase Console esintili koyu tema, alev animasyonları ve amber/turuncu renk paleti.
- **⚡ Anlık Gerçek Zamanlı Mesajlaşma:** Firestore `onSnapshot` dinleyicileriyle gecikmesiz canlı mesaj iletimi.
- **🔐 Kimlik Doğrulama:**
  - Kullanıcı adı veya e-posta ve şifre ile kayıt olma ve giriş yapma.
  - Google hesabı ile tek tıkla hızlı giriş.
  - Hızlı test hesapları (Alper, Zeynep, Can) ile çoklu kullanıcı senaryolarını anında test edebilme.
- **💬 Kanallar ve Özel Mesajlaşma (DM):**
  - Genel sohbet odaları (`#genel`, `#firebase-tech`, `#kod-paylasimi`, `#duyurular`).
  - Özel veya yeni genel kanallar açabilme.
  - Çevrim içi kullanıcılar listesinden doğrudan birebir özel sohbet (1-to-1 DM) başlatabilme.
- **💻 Kod Parçası (Code Snippet) Paylaşımı:** JavaScript, TypeScript, Python, SQL, JSON vb. diller için sözdizimi vurgulu kod paylaşımı ve tek tıkla kopyalama.
- **🎉 Emojiler ve Canlı Reaksiyonlar:** Mesajlara anlık emoji reaksiyonu verme (🔥 reaksiyonunda konfeti patlaması).
- **🔔 Web Audio Synthesizer Zil Sesi:** Harici dosya bağımlılığı olmadan Web Audio API ile üretilen yumuşak bildirim sesleri.
- **🐳 Docker & Docker Compose Desteği:** Multi-stage Nginx derlemesi ile tek komutta konteyner olarak ayağa kaldırma.

---

### Docker Compose ile Doğrudan GitHub'dan Derleyip Çalıştırma
Herhangi bir klonlama yapmadan, yalnızca `docker-compose.yml` dosyasını kullanarak doğrudan GitHub reposunu derleyebilirsiniz:

```bash
docker compose up -d --build
```
Docker arka planda `https://github.com/Eruaskina/FirebaseChat.git#main` reposunu klonlar, `Dockerfile` ile Nginx tabanlı üretim paketini derler ve 3030 portunda yayına alır.

---

### Yerel Olarak Klonlayıp Çalıştırma
```bash
git clone https://github.com/Eruaskina/FirebaseChat.git
cd FirebaseChat
npm install
npm run dev
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Çevre Değişkenlerini (Firebase Ayarları) Yapılandırın
Depo içerisindeki `firebase-applet-config.json` dosyasını kullanabilir veya `.env.example` dosyasını `.env` olarak kopyalayabilirsiniz:

```bash
cp .env.example .env
```

Kendi Firebase projenizi kullanmak isterseniz `.env` dosyasını düzenleyin:
```env
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="projeniz.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="projeniz"
VITE_FIREBASE_DATABASE_ID="(default)" # veya özel veritabanı ID'niz
VITE_FIREBASE_STORAGE_BUCKET="projeniz.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="1234567890"
VITE_FIREBASE_APP_ID="1:1234567890:web:abcdef"
```

### 4. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```
Uygulama varsayılan olarak [http://localhost:3000](http://localhost:3000) adresinde açılacaktır.

---

## 🐳 Docker ile Çalıştırma

Projeyi Docker üzerinde Nginx ile derleyip çalıştırmak için:

```bash
# Arka planda derleyip başlatma
docker compose up -d --build

# Konteyner durumunu kontrol etme
docker compose ps

# Logları izleme
docker compose logs -f

# Durdurma
docker compose down
```
Tarayıcınızdan [http://localhost:3000](http://localhost:3000) adresine giderek erişebilirsiniz.

---

## 🔒 Firebase Console Kurulum Notları

Kendi Firebase projenizi bağladığınızda:

1. **Authentication (Kimlik Doğrulama) Ayarları:**
   - [Firebase Console](https://console.firebase.google.com/) > **Authentication** > **Sign-in method** sekmesine gidin.
   - **Email/Password (E-posta/Şifre)** seçeneğini etkinleştirin.
   - **Google** seçeneğini etkinleştirin.

2. **Firestore Güvenlik Kuralları:**
   - Projedeki `firestore.rules` dosyasını Firebase CLI ile yayınlayabilirsiniz:
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## 🛠️ Kullanılan Teknolojiler

- **Frontend:** React 19, TypeScript, Vite
- **Stil & Tasarım:** Tailwind CSS, Lucide Icons, Canvas Confetti
- **Veritabanı & Auth:** Firebase Web SDK v13 (Firestore, Firebase Authentication)
- **Konteynerizasyon:** Docker, Docker Compose, Nginx Alpine

---

## 📜 Lisans

Apache-2.0 License.
