# GREEN ENERGY CHALLENGE: DUEL TARIK TAMBANG 2 PEMAIN
## Platform Game Edukasi Interaktif PT Krakatau Chandra Energi (KCE) — A member of Chandra Asri Group

> **Brand Identity:** Chandra Asri Group Visual Guideline 2025  
> **Brand Hashtag:** `#YourGrowthPartner`  
> **Tipografi Resmi:** Red Hat Display Family (Google Fonts)  
> **Palet Warna Utama:** Deep Corporate Navy (`#2F407E`), Corporate Blue (`#4375BD`), Sky Tint (`#D2ECF3`), Slate Dark (`#294162`), Cool Steel Grays (`#96A7B5`, `#CBD1D4`), Light Surface (`#F6F2F2`)  
> **Gaya Avatar:** Roblox R6 Classic Blocky Characters (Surya, Citra, Alya, Satria)  
> **Target Penggunaan:** Pameran Industri (Exhibition Booth), Kiosk Layar Sentuh Interaktif, Kunjungan Sekolah/Kampus, dan Edukasi Publik.

---

## FITUR UTAMA

1. **Duel 2 Pemain (1 vs 1 Lokal)**: Dua pengunjung pameran bertanding langsung saling berhadapan satu tombol mulai.
2. **Pendaftaran Ringkas & Vertikal Center**: Cukup mengisi nama Pemain 1 (Tim Biru) dan Pemain 2 (Tim Hijau).
3. **4 Karakter Roblox R6 Blocky Beragam**:
   - **Surya** (Baju Kuning Solar `#FFC928`, Rambut Bacon Roblox, Pakar Tenaga Surya)
   - **Citra** (Baju Hijau Energi `#20A66A`, Rambut Kuncir Ekor Kuda Roblox, Pelestari Lingkungan)
   - **Alya** (Baju Biru Muda Cyan `#38BDF8`, Rambut Bob Lurus Roblox, Pionir Energi Baru)
   - **Satria** (Baju Biru Korporat `#0877B9`, Rambut Shaggy Roblox, Kesatria Transisi Energi)
   - *Desain kepala studs Roblox klasik, ekspresi wajah R6, tanpa aksesoris topi yang berantakan.*
4. **Arena Tarik Tambang Bersih (Clean Arena, No AI Slop)**:
   - Garis tengah jelas dengan penanda simpul tali dinamis.
   - Tanpa garis pembatas acak di arena permainan.
   - Papan skor dan ronde terpampang jelas di bagian atas.
5. **Timer 30 Detik Mandiri per Soal**:
   - Setiap pemain memiliki batas waktu 30 detik untuk menjawab setiap soal.
   - Disertai efek audio detik jam mekanikal dan peringatan alarm ketika sisa waktu < 5 detik.
6. **Audio Engine Berbasis Web Audio API (Synthesizer)**:
   - Musik latar turnamen arcade bersemangat (*Arcade Tournament Synth BGM*).
   - Efek suara klik, tarikan tali, jawaban benar/salah, detik waktu, dan fanfare kemenangan.
7. **Papan Peringkat (Leaderboard)**:
   - Menyimpan riwayat duel lokal secara otomatis.

---

## CARA MENJALANKAN LOKAL

Proyek ini menggunakan runtime Bun / Node.js + Vite:

```bash
bun install
bun run dev
```

- **Aplikasi Game 2-Player**: http://localhost:3000/
- **Dashboard Admin**: http://localhost:3000/Admin.html *(Kata sandi: `KCEgreen2026!`)*

**Opsi berkas mandiri (tanpa server):** Buka `index.html` atau `index-standalone.html` langsung di browser Chrome, Edge, atau Firefox.

---

## DEPLOYMENT KE GITHUB PAGES

Proyek ini telah dikonfigurasi dengan GitHub Actions (`.github/workflows/deploy.yml`) untuk penyebaran otomatis ke GitHub Pages.

---

**Copyright © 2026. PT Krakatau Chandra Energi** — A member of Chandra Asri Group.  
*#YourGrowthPartner*
