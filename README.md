# 🎂 Birthday Gift Website (React + Vite)

Website interaktif ucapan ulang tahun spesial yang modern, romantis, dan kaya fitur. Dibangun menggunakan **React**, **Vite**, dan animasi halus dari **Framer Motion** serta efek selebrasi **Canvas Confetti**.

---

## ✨ Fitur Utama

- 🔒 **Lock Screen dengan PIN**: Layar proteksi dengan kode PIN rahasia dan petunjuk (*hint*).
- 🎁 **Opening Transition**: Animasi pembuka yang manis sebelum masuk ke konten utama.
- 🕯️ **Interactive Birthday Cake**: Kue ulang tahun interaktif untuk tiup lilin dan membuat harapan.
- 🎬 **Hero Slide (Netflix Style)**: Tampilan ala poster film romantis tentang perjalanan berdua.
- ⏳ **Countdown Timer**: Menghitung mundur menuju hari ulang tahun spesial.
- 📖 **Our Story (Timeline)**: Kilas balik perjalanan cinta dari awal kenal hingga sekarang.
- 💖 **Reasons Why I Love You**: Kartu-kartu alasan manis dan apresiasi.
- 📸 **Memories & Feed**:
  - Tampilan galeri foto ala Instagram dengan navigasi bawah.
  - Baris bertema ala Netflix (*Our Songs, Watch It Again, Because You Loved*).
- 🎥 **Video Message**: Pemutar video pesan khusus.
- 📷 **Photo Booth**: Fitur foto booth virtual yang seru dan estetik.
- 🎟️ **Love Rewards / Coupons**: Kupon hadiah spesial (dinner, nonton, spa, peluk) yang bisa ditukar.
- 💌 **Love Letter**: Surat cinta manis dan menyentuh hati.
- 🎮 **Couple Quiz Game**: Kuis interaktif seputar momen kebersamaan dengan skor akhir.
- 🎉 **Surprise & Confetti**: Efek selebrasi confetti warna-warni.
- 🎵 **Background Music Player**: Pemutar musik latar otomatis dengan kontrol play/pause.
- 📱 **Mobile Gesture & Keyboard Support**: Mendukung navigasi tombol, swipe layar di HP, dan panah keyboard (Arrow Left / Right).

---

## 📁 Struktur Folder & File

Berikut adalah struktur lengkap file dan folder dalam proyek ini:

```text
ultah-website/
├── public/                     # Aset statis publik
│   ├── images/                 # Kumpulan foto kenangan (image1.jpeg - image15.jpeg, song, dll.)
│   ├── music/                  # File audio musik latar (lagu.mp3)
│   └── video/                  # File video ucapan (vidio.mp4)
├── src/                        # Kode sumber aplikasi
│   ├── assets/                 # Aset internal pendukung
│   ├── components/             # Komponen antarmuka per bagian/slide
│   │   ├── BirthdayCake.jsx    # Komponen kue ulang tahun & lilin
│   │   ├── Countdown.jsx       # Komponen hitung mundur hari H
│   │   ├── Footer.jsx          # Bagian akhir / penutup ucapan
│   │   ├── Hearts.jsx          # Efek animasi hati berterbangan
│   │   ├── Hero.jsx            # Tampilan utama bergaya poster film
│   │   ├── LoadingScreen.jsx   # Layar transisi loading awal
│   │   ├── LockScreen.jsx      # Layar kunci PIN interaktif
│   │   ├── LoveLetter.jsx      # Komponen surat cinta interaktif
│   │   ├── Memories.jsx        # Galeri foto memori (Netflix & IG vibe)
│   │   ├── MusicPlayer.jsx     # Pemutar audio musik latar melayang
│   │   ├── Opening.jsx         # Layar pembuka sebelum masuk slide
│   │   ├── OurStory.jsx        # Garis waktu (timeline) cerita cinta
│   │   ├── PhotoBooth.jsx      # Fitur photobooth interaktif
│   │   ├── QuizGame.jsx        # Permainan kuis tebak momen berdua
│   │   ├── Reasons.jsx         # Alasan-alasan mencintai pasangan
│   │   ├── Reveal.jsx          # Efek transisi reveal konten
│   │   ├── Rewards.jsx         # Kupon / voucher hadiah romantis
│   │   ├── Surprise.jsx        # Pesta kejutan & ledakan confetti
│   │   └── VideoMessage.jsx    # Pemutar video kenangan
│   ├── App.jsx                 # Kontroller utama alur slide & navigasi
│   ├── config.js               # Pusat konfigurasi semua teks, foto, & data
│   ├── index.css               # Seluruh styling tema, tata letak, & animasi
│   └── main.jsx                # Titik masuk utama React DOM
├── index.html                  # Dokumen HTML utama
├── package.json                # Daftar dependensi & script proyek
├── package-lock.json           # Lockfile dependensi npm
├── vite.config.js              # Konfigurasi bundler Vite
└── README.md                   # Dokumentasi proyek
```

---

## 🚀 Memulai (Instalasi & Menjalankan)

Pastikan kamu sudah menginstal [Node.js](https://nodejs.org/) (disarankan versi 18 ke atas) di komputermu.

### 1. Masuk ke direktori proyek
Buka terminal atau PowerShell, lalu arahkan ke folder proyek:
```bash
cd ultah-website
```

### 2. Pasang dependensi
Jalankan perintah berikut untuk mengunduh semua paket yang dibutuhkan:
```bash
npm install
```

### 3. Jalankan server lokal (Development)
```bash
npm run dev
```
Setelah dijalankan, buka tautan yang muncul di terminal (biasanya `http://localhost:5173`) di browser.

### 4. Build untuk Production
Jika ingin melakukan build untuk di-hosting (misal di Vercel, Netlify, atau GitHub Pages):
```bash
npm run build
```
Hasil build akan berada di dalam folder `dist/`.

Untuk melihat preview hasil build di lokal:
```bash
npm run preview
```

---

## ⚙️ Panduan Kustomisasi

Seluruh data personalisasi bisa kamu ubah dengan sangat mudah di dalam satu file: **`src/config.js`**.

### 1. Identitas & Ucapan
Buka `src/config.js` dan sesuaikan variabel berikut:
```javascript
nama: 'Maharani Oktapia',
umur: 21,
happyBirthday: 'Selamat Ulang Tahun, Sayang! 🎉',
cakeMessage: 'Tiup lilinnya, buat harapan...',
candleCount: 3,
```

### 2. PIN Lock Screen
Ubah kombinasi angka PIN dan pesan petunjuk:
```javascript
pin: '2310',             // 4 digit PIN pembuka
pinFrom: 'From: Aku',
pinFor: 'For: Maharani',
pinHint: 'a little secret...',
pinWrong: 'Coba lagi ya 💕',
```

### 3. Media (Foto, Musik, dan Video)
- **Foto:** Simpan foto-foto kenangan di folder `public/images/`. Lalu cantumkan path-nya di `src/config.js` (contoh: `fotoHero: '/images/image11.jpeg'`).
- **Musik:** Ganti file audio di `public/music/lagu.mp3` dengan lagu favorit kalian berdua.
- **Video:** Ganti file video di `public/video/vidio.mp4` dengan video ucapan atau momen spesial.

### 4. Konten Cerita, Kuis, & Kupon
Kamu dapat menambah, mengurangi, atau mengganti item pada array di `src/config.js`:
- `story`: Timeline perjalanan kalian berdua.
- `reasons`: Alasan kenapa kamu sayang sama dia.
- `photos`: Galeri foto kenangan beserta caption-nya.
- `songs`: Lagu-lagu kenangan untuk baris playlist ala Netflix.
- `letter`: Paragraf surat cinta yang akan tampil di slide surat.
- `quiz`: Pertanyaan kuis, opsi pilihan ganda, dan indeks jawaban benar (`answer: 0` berarti pilihan pertama).
- `rewards`: Kupon hadiah lucu yang bisa diklaim oleh pasangan.

---

## 🎮 Kontrol & Navigasi

| Perangkat / Metode | Aksi |
| :--- | :--- |
| **Keyboard** | Tekan panah kanan (`→`), `Space`, atau `Enter` untuk lanjut ke slide berikutnya. Tekan panah kiri (`←`) untuk kembali ke slide sebelumnya. |
| **Layar Sentuh (HP)** | Geser (*swipe*) ke kiri untuk maju, dan geser ke kanan untuk mundur. |
| **Tombol Navigasi** | Tombol **Lanjut →** dan **← Balik** di bagian bawah layar. |
| **Titik Indikator** | Klik/tap bulatan titik (*progress dots*) di bawah untuk melompat langsung ke slide tertentu. |

---

## 🛠️ Teknologi yang Digunakan

- [React 18](https://react.dev/) - Framework UI berbasis komponen
- [Vite](https://vitejs.dev/) - Frontend Tooling & Bundler super cepat
- [Framer Motion](https://www.framer.com/motion/) - Pustaka animasi interaktif
- [Canvas Confetti](https://github.com/catdad/canvas-confetti) - Efek selebrasi kembang api konfeti

---

Dibuat dengan ❤️ untuk merayakan hari paling spesial!
