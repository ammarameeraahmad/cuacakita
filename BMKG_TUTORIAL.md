# 📡 Tutorial Integrasi BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)

## 🎯 Tujuan
Aplikasi ClimSight dapat menampilkan data cuaca **real-time dari BMKG** berdasarkan lokasi pengguna.
Data ini digunakan di halaman Beranda, Data, dan untuk menjawab pertanyaan AI tentang cuaca.

---

## 🔧 Cara Setup

### 1. Dapatkan Kode Wilayah (ADM4 Code)

BMKG menggunakan kode administratif tingkat 4 (ADM4) untuk merujuk ke desa/kelurahan tertentu.
Format kode: `XX.XX.XX.XXXX` (Provinsi.Kabupaten.Kecamatan.Desa)

**Cara mendapatkannya:**

**Opsi A - Cari manual (rekomendasi):**
1. Buka: https://api.bmkg.go.id/publik/prakiraan-cuaca
2. Cari lokasi yang diinginkan di parameter `adm4`
3. Catat kode ADM4 yang muncul

**Opsi B - Cari via browser:**
1. Buka: `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=31.71.01.1001`
2. Ganti `31.71.01.1001` dengan kode wilayah Anda
3. Lihat response JSON untuk melihat data cuaca

**Contoh kode ADM4 beberapa wilayah:**
| Wilayah | Kode ADM4 |
|---------|-----------|
| DKI Jakarta - Gambir | `31.71.01.1001` |
| Sleman, Yogyakarta | `34.04.01.1001` |
| Bandung, Jawa Barat | `32.73.01.1001` |
| Surabaya, Jawa Timur | `35.78.01.1001` |

### 2. Buat File `.env` di Folder Backend

Buat file `backend/.env` dengan isi:

```env
# ── BMKG Weather API ───────────────────────────
# Kode wilayah administratif desa/kelurahan (ADM4)
BMKG_ADM4_CODE=31.71.01.1001

# URL API BMKG (opsional, gunakan default jika tidak diisi)
# BMKG_API_URL=https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${BMKG_ADM4_CODE}

# ── Server ─────────────────────────────────────
PORT=3001

# ── Groq Cloud AI (untuk fitur Tanya AI) ───────
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Jalankan Backend

```bash
cd backend

# Install dependencies (pertama kali saja)
npm install

# Jalankan development server
npm run dev
```

Backend akan berjalan di `http://localhost:3001`

### 4. Jalankan Frontend

```bash
cd frontend

# Install dependencies (pertama kali saja)
npm install

# Jalankan development server
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

---

## 🧪 Testing Integrasi BMKG

### Test Langsung via Browser
Buka URL berikut untuk melihat data cuaca langsung dari BMKG:
```
http://localhost:3001/api/weather?location=Desa%20Sukamaju
```

### Expected Response
```json
{
  "source": "bmkg",
  "locationLabel": "Gambir, DKI Jakarta",
  "subLabel": "Data resmi BMKG",
  "current": {
    "temperature": 28,
    "description": "Berawan",
    "humidity": 78,
    "windSpeed": 12,
    "visibility": 8,
    "icon": "⛅"
  },
  "forecast": [...],
  "temperatureSeries": [...],
  "rainfallSeries": [...],
  "summary": "Gambir diperkirakan berawan dengan suhu 28°C."
}
```

Jika gagal, backend otomatis akan fallback ke **data demo**.

---

## 🌐 Cara Kerja Sistem

```
User klik tombol "📍 Lokasi Saya"
       │
       ▼
Browser minta izin geolocation
       │
       ▼
Dapatkan koordinat (lat, lng)
       │
       ▼
Reverse Geocode via Nominatim (gratis) → nama desa/kecamatan
       │
       ▼
Kirim nama lokasi ke backend → GET /api/weather?location=...
       │
       ▼
Backend panggil API BMKG dengan ADM4 code
       │
       ▼
Tampilkan data cuaca di aplikasi
```

---

## 🆓 API yang Digunakan (GRATIS semuanya!)

| API | Keperluan | Biaya |
|-----|-----------|-------|
| **BMKG** (api.bmkg.go.id) | Data cuaca resmi Indonesia | **GRATIS** (publik) |
| **OpenStreetMap Nominatim** | Reverse geolocation (lat/lng → alamat) | **GRATIS** |
| **Browser Geolocation API** | Mendapatkan koordinat pengguna | **GRATIS** |
| **Groq Cloud** (opsional) | AI chat untuk tanya cuaca | **GRATIS** (dengan limit) |

---

## ⚠️ Troubleshooting

### "Data BMKG belum tersedia"
- Cek kode ADM4 di `backend/.env` sudah benar
- Cek koneksi internet
- Backend akan otomatis pakai demo data jika BMKG tidak bisa diakses

### "Izin lokasi ditolak"
- Browser akan menampilkan popup izin lokasi
- Jika terblokir, buka pengaturan browser → izinkan akses lokasi
- Atau ketik manual nama lokasi di laporan

### CORS Error
- Pastikan backend jalan di port 3001
- CORS sudah dihandle oleh Express middleware

---

## 📁 File Penting

| File | Fungsi |
|------|--------|
| `backend/src/lib/bmkg.ts` | Panggil API BMKG & parse response |
| `backend/.env` | Konfigurasi ADM4 code |
| `frontend/src/lib/geolocation.js` | Geolokasi browser + reverse geocode |
| `frontend/src/lib/api.js` | HTTP client ke backend |