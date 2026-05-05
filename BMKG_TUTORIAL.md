# 📡 Tutorial Integrasi BMKG + Auto-Lokasi

## 🎯 Cara Kerja Sistem
Sekarang **tidak perlu lagi setting ADM4 manual!** Sistem akan:
1. **Otomatis** mendeteksi lokasi pengguna via browser (minta izin)
2. **Reverse geocode** lat/lng → nama desa/kecamatan (via OpenStreetMap Nominatim - GRATIS)
3. **Cocokkan** dengan database `lokasi.md` (berisi 80.000+ desa seluruh Indonesia)
4. **Dapatkan ADM4 code** yang tepat untuk API BMKG
5. **Tampilkan data cuaca real-time** dari BMKG

## 🆓 API yang Digunakan (GRATIS semuanya!)
| API | Keperluan | Biaya |
|-----|-----------|-------|
| **BMKG** (api.bmkg.go.id) | Data cuaca resmi Indonesia | **GRATIS** (publik) |
| **OpenStreetMap Nominatim** | Reverse geolocation (lat/lng → alamat) | **GRATIS** |
| **Browser Geolocation API** | Mendapatkan koordinat pengguna | **GRATIS** |
| **lokasi.md** (database offline) | Mencocokkan nama desa dengan ADM4 code | **GRATIS** |

## 🔧 Setup

### 1. File `.env` di Folder Backend
Buat file `backend/.env` (tidak wajib, cukup untuk fallback):

```env
# ── Server ─────────────────────────────────────
PORT=3001

# ── BMKG (FALLBACK, otomatis jika database tidak menemukan) ──
# BMKG_ADM4_CODE=31.71.01.1001
```

### 2. Database Lokasi
File `lokasi bmkg/lokasi.md` sudah berisi semua kode desa di Indonesia.
Sistem akan membaca file ini secara otomatis saat backend dijalankan.

### 3. Jalankan Backend
```bash
cd backend
npm install
npm run dev
```

### 4. Jalankan Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing

### Cek data BMKG langsung
```
http://localhost:3001/api/weather?location=Desa%20Sukamaju
```

Sistem akan mencari ADM4 code dari database lokasi secara otomatis.

## 📁 Struktur File Penting

| File | Fungsi |
|------|--------|
| `backend/src/lib/bmkg.ts` | Panggil API BMKG dengan ADM4 dinamis |
| `backend/src/lib/location-lookup.ts` | Pencocokan nama lokasi → ADM4 code |
| `lokasi bmkg/lokasi.md` | Database 80.000+ kode desa Indonesia |
| `frontend/src/lib/geolocation.js` | Geolokasi browser + reverse geocode |
| `frontend/src/App.jsx` | Auto-detect lokasi saat app dimuat |

## ⚠️ Troubleshooting

### "Data BMKG belum tersedia"
- Database lokasi tidak menemukan kecocokan
- Akan fallback ke data demo

### "Izin lokasi ditolak" di awal
- Browser akan minta izin saat pertama kali
- Jika ditolak, app tetap jalan pakai data default (Desa Sukamaju)
- Bisa klik tombol 📍 di TopBar untuk coba lagi