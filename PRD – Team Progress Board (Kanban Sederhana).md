# PRD – Team Progress Board

**Versi:** 0.1 (Draft)\
**Tanggal:** 20 Oktober 2026\
**Status:** Draft untuk didiskusikan dengan tim

## 1. Ringkasan

(note saran dari aku: nama app nya jadi PPKI Progress Web)Team Progress Board adalah web app sederhana untuk memantau progres pekerjaan tim kecil yang sedang mengerjakan sebuah proyek web. Tampilannya mirip papan Kanban di Notion/Trello: setiap anggota bisa membuat kartu tugas sendiri dan menggeser (drag & drop) kartu antar kolom status seperti *To Do*, *In Progress*, *Review*, dan *Done*.

Tujuan utamanya satu: **semua orang di tim tahu pekerjaan apa yang sedang berjalan, siapa yang mengerjakan, dan sudah sampai mana.**

## 2. Latar Belakang & Masalah

- Tim baru dibentuk dan belum punya cara terpusat untuk melacak progres.
- Koordinasi lewat chat membuat status tugas mudah tenggelam.
- Notion/Trello terlalu luas atau perlu setup tertentu; tim ingin alat yang ringan dan bisa dikembangkan sendiri sesuai kebutuhan.

## 3. Tujuan dan Non-Tujuan

### Tujuan (MVP)

1. Anggota tim bisa masuk (login) dan melihat papan bersama.
2. Anggota bisa menambah, mengedit, dan menghapus kartu tugas sendiri.
3. Kartu bisa digeser antar kolom dengan drag & drop.
4. Setiap kartu menunjukkan siapa penanggung jawabnya.
5. Perubahan tampil ke anggota lain tanpa harus refresh manual (atau dengan refresh ringan).

### Non-Tujuan (bukan untuk MVP)

- Fitur docs/wiki seperti Notion.
- Time tracking, laporan keuangan, atau invoicing.
- Integrasi pihak ketiga (GitHub, Slack, dll.).
- Aplikasi mobile native (cukup web yang responsif).
- Manajemen banyak organisasi/workspace.

## 4. Pengguna

| Peran | Deskripsi | Kebutuhan utama |
| --- | --- | --- |
| **Admin** | Pembuat tim (kamu) | Mengundang anggota, mengatur kolom, mengelola papan |
| **Anggota** | Teman satu tim | Menambah kartu, menggeser kartu, update progres sendiri |

Ukuran tim awal: sekitar 3–10 orang.

## 5. User Stories

- Sebagai anggota, saya ingin **membuat kartu tugas** agar pekerjaan saya tercatat.
- Sebagai anggota, saya ingin **menggeser kartu antar kolom** agar progres saya terlihat oleh tim.
- Sebagai anggota, saya ingin **menentukan penanggung jawab** agar jelas siapa mengerjakan apa.
- Sebagai anggota, saya ingin **memfilter kartu berdasarkan nama** agar bisa melihat tugas saya saja.
- Sebagai anggota, saya ingin **menambah deskripsi, deadline, dan label** agar detail tugas jelas.
- Sebagai admin, saya ingin **mengundang teman lewat link atau email** agar mereka bisa bergabung.
- Sebagai admin, saya ingin **mengubah nama dan urutan kolom** agar papan sesuai alur kerja tim.

## 6. Kebutuhan Fungsional

### 6.1 Autentikasi dan Tim

- **F1.** Registrasi dan login (email + password, opsional login Google).
- **F2.** Admin dapat membuat tim dan mengundang anggota lewat link undangan.
- **F3.** Hanya anggota tim yang dapat melihat dan mengubah papan.

### 6.2 Papan (Board)

- **F4.** Satu papan default dengan kolom: *To Do*, *In Progress*, *Review*, *Done*.
- **F5.** Admin dapat menambah, mengubah nama, mengurutkan, dan menghapus kolom.
- **F6.** Jumlah kartu per kolom ditampilkan di header kolom.

### 6.3 Kartu Tugas

- **F7.** Membuat kartu cepat (cukup judul) dari tombol "+ Tambah kartu" di tiap kolom.
- **F8.** Detail kartu (dibuka dalam modal/panel samping):
  - Judul (wajib)
  - Deskripsi (teks sederhana)
  - Penanggung jawab (satu atau lebih anggota)
  - Deadline (opsional)
  - Label/kategori, misalnya *Frontend*, *Backend*, *Desain* (opsional)
  - Checklist sub-tugas (opsional, prioritas rendah)
- **F9.** Mengedit dan menghapus kartu (anggota dapat mengubah kartu siapa saja; penghapusan meminta konfirmasi).
- **F10.** Drag & drop kartu antar kolom dan mengubah urutan dalam kolom; posisi tersimpan otomatis.

### 6.4 Kolaborasi

- **F11.** Perubahan anggota lain muncul otomatis (real-time) atau minimal lewat polling berkala.
- **F12.** Riwayat aktivitas sederhana pada kartu, misalnya "Andi memindahkan kartu dari In Progress ke Review".
- **F13.** Komentar pada kartu (prioritas sedang, bisa masuk fase 2).

### 6.5 Pencarian dan Filter

- **F14.** Filter berdasarkan penanggung jawab dan label.
- **F15.** Pencarian kartu berdasarkan judul.

## 7. Kebutuhan Non-Fungsional

- **Kemudahan pakai:** pengguna baru bisa membuat dan menggeser kartu tanpa tutorial.
- **Performa:** papan dengan 200 kartu tetap terasa lancar; drag & drop tanpa lag.
- **Responsif:** nyaman dibuka di laptop dan layak dipakai di HP (kolom bisa di-scroll horizontal).
- **Keamanan dasar:** password di-hash, akses dibatasi per tim, HTTPS.
- **Ketersediaan:** cukup uptime wajar untuk tim kecil; ada backup database berkala.
- **Biaya:** diupayakan berjalan di free tier hosting selama fase awal.

## 8. Alur Pengguna Utama

1. Admin mendaftar, membuat tim, lalu membagikan link undangan.
2. Anggota membuka link, mendaftar atau login, lalu masuk ke papan tim.
3. Anggota menekan "+ Tambah kartu" di kolom *To Do*, mengisi judul, lalu menyimpan.
4. Saat mulai bekerja, anggota menyeret kartu ke *In Progress*.
5. Setelah selesai, kartu digeser ke *Review* lalu *Done*.
6. Anggota lain melihat perubahan itu di papan masing-masing.

## 9. Usulan Tech Stack (bisa disesuaikan)

Pilih yang paling dikuasai tim. Contoh yang cukup ringan untuk MVP:

| Lapisan | Opsi |
| --- | --- |
| Frontend | React atau Next.js + Tailwind CSS |
| Drag & drop | dnd-kit atau SortableJS |
| Backend + Database + Auth | Supabase atau Firebase (paling cepat; sudah menyediakan auth dan real-time) |
| Alternatif backend sendiri | Node.js + PostgreSQL |
| Hosting | Vercel / Netlify (frontend), Supabase (backend) |

**Catatan:** memakai Supabase/Firebase memangkas banyak waktu karena auth, database, dan real-time sudah tersedia.

## 10. Model Data (Draft)

- **User**: id, nama, email, avatar
- **Team**: id, nama, dibuat\_oleh
- **TeamMember**: team\_id, user\_id, role (admin/anggota)
- **Column**: id, team\_id, nama, urutan
- **Card**: id, column\_id, judul, deskripsi, deadline, urutan, dibuat\_oleh, dibuat\_pada
- **CardAssignee**: card\_id, user\_id
- **Label**: id, team\_id, nama, warna
- **CardLabel**: card\_id, label\_id
- **Activity**: id, card\_id, user\_id, aksi, waktu
- **Comment** (fase 2): id, card\_id, user\_id, isi, waktu

## 11. Prioritas dan Roadmap

### Fase 1 – MVP (target 2–3 minggu)

- Login dan undangan anggota
- Papan dengan kolom default
- Buat/edit/hapus kartu
- Drag & drop antar kolom
- Penanggung jawab
- Tampilan responsif dasar

### Fase 2 – Penyempurnaan

- Deadline, label, filter, dan pencarian
- Real-time sync
- Riwayat aktivitas
- Kustomisasi kolom

### Fase 3 – Opsional

- Komentar, checklist, dan lampiran
- Notifikasi (email/WhatsApp)
- Banyak papan per tim
- Tampilan lain (tabel, kalender, timeline)
- Dark mode

## 12. Metrik Keberhasilan

- Minimal 80% anggota tim memakai papan setiap minggu.
- Semua tugas aktif tercatat di papan (tidak lagi dilacak lewat chat).
- Waktu rata-rata membuat kartu baru kurang dari 10 detik.
- Tidak ada keluhan utama soal data hilang atau papan tidak sinkron.

## 13. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Scope melebar menjadi "Notion tiruan" | Proyek tidak selesai | Pegang daftar Non-Tujuan; tambah fitur hanya setelah MVP dipakai |
| Drag & drop bermasalah di HP | Pengalaman buruk di mobile | Pakai library yang mendukung touch; sediakan opsi "pindah ke kolom" lewat menu |
| Konflik saat dua orang mengedit bersamaan | Data tertimpa | Pakai real-time atau last-write-wins yang jelas di MVP |
| Tim tidak konsisten memperbarui papan | Papan tidak berguna | Sepakati ritual singkat, misalnya update papan tiap hari atau saat standup |

## 14. Pertanyaan Terbuka

1. Berapa jumlah anggota tim, dan apakah semua akan memakai HP atau laptop? sekitar 5 orang, dan menggunakan kedua jadi harus responsive
2. Apakah satu papan sudah cukup, atau perlu papan terpisah per proyek? menurutmu gimana?
3. Perlu login Google, atau cukup email dan password? login email dan password - nanti aku yang atur untuk loginnya maksudnya nanti aku custom user saja, saya siapkan user password nanti mereka tinggal ganti saja
4. Siapa yang boleh menghapus kartu dan kolom: semua anggota atau admin saja? masing2 yang punya dlu saja
5. Apakah perlu notifikasi (misalnya ke WhatsApp atau email) di versi awal? perlu tapi lewat email saja, pake gmail aja
6. Tech stack mana yang paling dikuasai tim? kami bisa react atau laravel
7. Apakah tujuan proyek ini juga untuk belajar/portofolio, atau murni alat internal? (Mempengaruhi apakah lebih baik membangun sendiri atau memakai tool yang sudah ada.) ini alat internal dan semoga bsa digunakan sebaik baiknya 
