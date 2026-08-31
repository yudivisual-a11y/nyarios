# 🚀 PETUNJUK PENGEMBANGAN & PANDUAN ANTIGRAVITY IDE

Selamat datang di proyek **NYARIOS 2026**! Seluruh arsitektur, fitur, dan perbaikan sudah disiapkan agar bisa langsung dikembangkan dan dideploy dari dalam **Antigravity IDE**.

---

## ⚡ CARA MENJALANKAN DARI ANTIGRAVITY IDE:

### 1. Jalankan Live Preview (Dev Server):
- Buka Terminal di Antigravity IDE (tekan ``Ctrl + ` `` atau menu **Terminal** 👉 **New Terminal**).
- Jalankan perintah:
  ```bash
  npm run dev
  ```
- Aplikasi akan langsung aktif di browser Anda pada: `http://localhost:5173/`

### 2. Deploy Otomatis ke Vercel:
- Cukup tekan shortcut **`⌘ + Shift + B`** di Mac (atau menu **Terminal** 👉 **Run Build Task...**).
- Pilih: **🚀 Deploy ke Vercel Production**.
- Atau ketik di terminal IDE:
  ```bash
  npm run build && npx vercel dist --prod --yes
  ```

---

## 📁 STRUKTUR FILE UTAMA:

- `src/components/views/ContactsView.tsx`: Halaman Buku Kontak dengan penemuan kontak otomatis real-time.
- `src/components/views/IncomingCallModal.tsx`: Tampilan penerima panggilan masuk (Terima/Tolak).
- `src/components/views/ActiveCallModal.tsx`: Tampilan panggilan suara & video aktif dengan durasi dan tombol kontrol.
- `src/components/auth/LoginView.tsx`: Tampilan Login Nomor HP, SMS OTP Firebase, dan Google Sign-In.
- `src/utils/cloudSync.ts`: Mesin sinkronisasi real-time pesan chat, panggilan, dan kontak lintas perangkat.
- `src/context/AppContext.tsx`: Penyimpanan state global aplikasi.

---

## 🤖 MENGGUNAKAN AI AGENT DI ANTIGRAVITY IDE:
- **Autocomplete**: Cukup ketik kode dan tekan <kbd>Tab</kbd>.
- **Inline AI Command**: Sorot (blok) kode mana saja dan tekan **`⌘ + I`** untuk meminta AI mengedit atau menambahkan fitur baru secara langsung!
