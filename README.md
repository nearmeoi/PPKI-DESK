# PPKI Progress Web

Web application papan progres tim internal PPKI yang dirancang mobile-first dengan kontainer terpusat pada tampilan desktop, memudahkan pemantauan pekerjaan tanpa perbedaan layout antara laptop dan ponsel pintar.

## Fitur Utama

- **Centered Mobile Viewport di Desktop:** Tampilan desktop dibuat terpusat di tengah layar (`max-w-xl`) dengan feel aplikasi mobile, konsisten saat digunakan di laptop maupun HP.
- **Drag & Drop + Mobile Quick Move:** Menggunakan library `@hello-pangea/dnd` untuk drag-and-drop kartu antar kolom, dilengkapi menu dropdown "Pindah ke..." pada setiap kartu untuk pengguna layar sentuh.
- **Role & Otorisasi:**
  - **Admin:** Memiliki akses penuh mengelola pengguna tim (menambah anggota baru, mengatur kata sandi awal, reset sandi, hapus akun) dan mengelola semua kartu serta kolom.
  - **Anggota:** Dapat membuat kartu, namun hanya dapat menyunting dan menghapus kartu yang dibuatnya sendiri. Setiap anggota dapat mengubah kata sandi dan profilnya.
- **Pencarian & Filter:** Filter tugas berdasarkan nama anggota penanggung jawab, kategori label (Frontend, Backend, Desain, Dokumen, Sistem), atau pencarian judul langsung.
- **Riwayat Aktivitas (Audit Trail):** Melacak perpindahan status kartu dan perubahan yang dilakukan anggota tim.
- **Simulasi & Integrasi Gmail SMTP:** Pratinjau sistem pengiriman email notifikasi penugasan baru dan pengingat deadline ke akun anggota tim.
- **Dukungan Supabase PostgreSQL:** Skrip SQL skema lengkap (`supabase_schema.sql`) tersedia, dengan fallback LocalStorage otomatis jika API key Supabase belum dimasukkan.

---

## Menjalankan Proyek

### 1. Menjalankan Server Pengembangan

```bash
npm run dev
```

Buka URL yang ditampilkan di terminal (default: `http://localhost:5173`) pada browser Anda.

### 2. Membangun untuk Produksi

```bash
npm run build
```

Hasil build yang siap di-deploy (misalnya ke Vercel atau Netlify) berada di folder `dist/`.

---

## Integrasi Database Supabase (Opsional)

Jika ingin menghubungkan langsung ke database Supabase (PostgreSQL gratis):

1. Buat proyek baru di [supabase.com](https://supabase.com).
2. Buka menu **SQL Editor**, salin dan jalankan seluruh isi file `supabase_schema.sql`.
3. Buat file `.env` di direktori proyek dan isi dengan kredensial API Supabase Anda:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Restart development server (`npm run dev`).
