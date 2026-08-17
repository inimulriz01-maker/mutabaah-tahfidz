# Audit Checklist Mutabaah Tahfidz

Dokumen ini dipakai untuk membantu audit masalah data, terutama saat ada laporan seperti:
- data sudah diinput tapi tidak terlihat,
- data terlihat di satu perangkat tapi tidak muncul di perangkat lain,
- data masuk ke Supabase tapi kolom penting kosong,
- data tercampur antar halaqoh,
- aplikasi menampilkan sukses simpan tetapi hasilnya tidak sesuai.

## Tujuan Audit

Tujuan checklist ini adalah memastikan kita bisa cepat membedakan apakah masalah ada di:
- form input,
- validasi aplikasi,
- request ke Supabase,
- isi row di database,
- cache browser atau state lokal,
- filter tampilan berdasarkan role atau halaqoh.

## Urutan Audit

### 1. Cek Apakah User Benar-Benar Menekan Simpan

Periksa:
- apakah tombol simpan ditekan,
- apakah muncul pesan sukses atau gagal,
- apakah setelah simpan form ter-reset atau tetap diam.

Catatan:
Jika tidak ada perubahan sama sekali, kemungkinan masalah ada di validasi form atau event submit.

### 2. Cek Apakah Request Benar-Benar Berhasil ke Database Pusat

Periksa:
- apakah aplikasi memberi status sukses,
- apakah save flow memang menunggu respons Supabase,
- apakah data benar-benar masuk ke tabel pusat.

Patokan:
Kalau tidak ada row baru di Supabase, berarti masalah belum di tampilan. Masalah masih ada di jalur simpan.

### 3. Cek Isi Row di Supabase

Periksa kolom inti pada tabel `riwayat`:
- `nama_asli`
- `halaqoh`
- `tanggal`
- `hari`
- `pekan_label`
- `hadir`
- `jenis_setoran`
- `rincian_capaian`
- `predikat`
- `skor_adab`
- `skor_capaian`
- `total_skor_poin`
- `evaluasi_bacaan`

Patokan:
- kalau row ada tetapi kolom inti kosong atau `null`, masalah ada di payload atau mapping data,
- kalau row lengkap, masalah biasanya ada di filter UI atau cache browser.

### 4. Cek Apakah Murid Cocok dengan Halaqoh yang Dipilih

Periksa:
- nama murid berasal dari daftar murid halaqoh yang benar,
- data tidak tersimpan ke halaqoh lain,
- tidak ada mismatch antara `namaAnak` dan `namaHalaqoh`.

Patokan:
Kalau murid nyasar ke halaqoh lain, data sebenarnya masuk, tapi terlihat seperti hilang.

### 5. Cek Role yang Sedang Login

Periksa role pengguna:
- `guru`
- `admin`
- `kepsek`
- `kurikulum`
- `kesiswaan`
- `ortu`

Patokan saat ini:
- akun `guru` hanya melihat data halaqohnya sendiri,
- akun non-guru dapat melihat data lintas halaqoh sesuai kebutuhan aplikasi saat ini.

Kalau user merasa data hilang, pastikan dulu datanya memang termasuk cakupan role itu.

### 6. Cek Filter Riwayat yang Aktif

Periksa apakah ada filter:
- halaqoh tertentu,
- tanggal tertentu,
- bulan tertentu,
- view role tertentu.

Patokan:
Banyak kasus “data hilang” ternyata hanya karena filter masih aktif.

### 7. Cek Cache Browser dan Bundle Aplikasi

Periksa:
- apakah browser masih membuka tab lama,
- apakah perangkat sudah hard refresh,
- apakah build terbaru sudah ter-deploy.

Langkah cepat:
- logout,
- tutup tab,
- buka ulang aplikasi,
- lakukan hard refresh (`Ctrl+F5`).

Patokan:
Kalau satu perangkat berbeda sendiri dari perangkat lain, sering kali penyebabnya cache bundle lama.

### 8. Cek Apakah Data yang Terlihat Berasal dari Server atau State Lokal

Periksa:
- apakah data muncul setelah reload penuh,
- apakah data tetap ada setelah login ulang,
- apakah data hanya muncul di perangkat yang menginput.

Patokan:
Kalau hanya muncul di satu perangkat, kemungkinan state lokal masih berperan terlalu besar atau perangkat lain belum sync ke server.

### 9. Bedakan Data Lama dan Data Baru

Periksa:
- apakah masalah terjadi di semua row,
- atau hanya row lama,
- atau hanya row yang dibuat sebelum fix tertentu.

Patokan:
- data lama bisa jadi warisan bug sebelumnya,
- data baru rusak berarti bug masih aktif.

### 10. Cek Apakah Pesan Sukses Benar-Benar Valid

Patokan sistem saat ini:
- aplikasi seharusnya tidak menampilkan pesan sukses sebelum Supabase benar-benar mengonfirmasi simpan berhasil.

Kalau user melihat sukses tapi row tidak ada di Supabase, itu bug serius di alur save dan harus diaudit segera.

## Cara Pakai Checklist Saat Ada Laporan Masalah

Gunakan urutan ini:
1. cek apakah user klik simpan,
2. cek apakah row muncul di Supabase,
3. cek apakah row lengkap atau banyak `null`,
4. cek role dan filter akun yang melihat,
5. cek cache browser / bundle lama,
6. cek apakah murid dan halaqoh cocok,
7. bandingkan hasil antar perangkat.

## Gejala Umum dan Akar Masalah yang Sering Terjadi

### Gejala: Data hanya muncul di perangkat yang input
Kemungkinan:
- perangkat lain belum sync,
- browser lain masih cache lama,
- data hanya sempat hidup di state lokal.

### Gejala: Row ada di Supabase tapi banyak kolom kosong
Kemungkinan:
- payload yang dikirim tidak lengkap,
- mapping field tidak sesuai,
- ada field penting yang tidak lolos whitelist payload.

### Gejala: Data muncul di halaqoh yang salah
Kemungkinan:
- murid dan halaqoh tidak sinkron saat submit,
- user mengganti halaqoh tetapi nama murid tidak ikut sesuai.

### Gejala: Guru melihat data dari halaqoh lain
Kemungkinan:
- filter role guru terlalu longgar,
- tampilan memakai dataset global tanpa pembatasan halaqoh.

### Gejala: Admin merasa tidak melihat semua data
Kemungkinan:
- filter placeholder terlalu agresif,
- ada filter tanggal/bulan/halaqoh yang masih aktif,
- browser belum memuat build terbaru.

## Catatan Operasional

Jika ada laporan bug data baru, kumpulkan minimal informasi berikut:
- nama akun yang input,
- role akun,
- nama murid,
- halaqoh,
- tanggal input,
- jam kira-kira saat input,
- perangkat atau browser yang dipakai,
- apakah muncul pesan sukses.

Dengan data itu, audit bisa dilakukan jauh lebih cepat.

## Ringkasan Pendek

Kalau ada masalah data, jangan langsung tebak.
Selalu audit berurutan:
1. submit,
2. row database,
3. isi row,
4. role dan filter,
5. cache browser,
6. konsistensi murid-halaqoh.
