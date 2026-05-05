# 📋 Dokumentasi Sistem ClimSight - Arsitektur, Kode & Sistem Lokasi

**Tanggal**: May 5, 2026  
**Project**: ClimSight - Weather Dashboard dengan BMKG API & Firebase  
**Status**: Dalam Perbaikan (Location System)

---

## 1. Overview Sistem

ClimSight adalah dashboard cuaca interaktif yang mengintegrasikan:
- **BMKG API** untuk data cuaca real-time (ADM4 level)
- **Browser Geolocation** untuk deteksi lokasi otomatis
- **Firebase Realtime Database** untuk sinkronisasi data & profil pengguna
- **Groq AI** untuk chatbot cuaca
- **React + Vite** frontend
- **Node.js + TypeScript** backend

---

## 2. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND (React + Vite)                 │
├─────────────────────────────────────────────────────────┤
│ • App.jsx: Main orchestrator                             │
│ • ChatInterface: Chat with AI                            │
│ • WeatherReport: Display current weather                 │
│ • WeatherForecast: 5-day forecast                        │
│ • WeatherTrends: Charts (temperature & rainfall)         │
│ • DashboardStats: Community stats & leaderboard          │
│ • UserProfile: Profile editing                           │
└─────────────────────────────────────────────────────────┘
                          ↕ (API calls)
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Node.js + TypeScript)              │
├─────────────────────────────────────────────────────────┤
│ API Routes:                                              │
│ • /api/weather - Get weather data                        │
│ • /api/chat - Chat with AI                               │
│ • /api/stats - Dashboard statistics                      │
│ • /api/contribute - Submit weather reports               │
│                                                          │
│ Core Libraries:                                          │
│ • bmkg.ts - BMKG API integration                         │
│ • location-lookup.ts - Lokasi → ADM4 mapping             │
│ • geolocation.js - Browser geolocation + reverse geocode │
│ • dashboard-state.ts - Firebase realtime DB              │
│ • groq.ts - AI chatbot                                   │
│ • knowledge-base.ts - Vector store search                │
│ • climsight.ts - Response builder                        │
└─────────────────────────────────────────────────────────┘
                          ↕ (HTTP/WebSocket)
┌─────────────────────────────────────────────────────────┐
│            EXTERNAL DATA SOURCES                         │
├─────────────────────────────────────────────────────────┤
│ • BMKG API: https://api.bmkg.go.id/publik/prakiraan-cuaca│
│ • OpenStreetMap Nominatim: Reverse geocoding            │
│ • Firebase Realtime DB: Real-time sync                  │
│ • Groq API: LLM for chatbot                             │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Sistem Lokasi (Location System)

### 3.1 Flow Deteksi Lokasi

```
User Opens App
    ↓
[geolocation.js] Browser asks permission
    ↓ (if granted)
getCurrentPosition() → {lat, lng}
    ↓
reverseGeocode() via OpenStreetMap Nominatim
    ↓
Returns: {village, district, city, regency, province}
    ↓
Frontend builds locationHints array
    ↓
POST /api/weather?location=X&adm4Hint=Y&village=Z...
    ↓
[location-lookup.ts] Maps hints → ADM4 code
    ↓
[bmkg.ts] Fetches from BMKG API using ADM4
    ↓
Returns weather data
```

### 3.2 ADM4 Code Format

BMKG API hanya menerima kode ADM4 dengan 4 level (desa/village level):

**Format**: `XX.XX.XX.XXXX`
- Level 1 (2 digit): Provinsi (Province)
- Level 2 (2 digit): Kabupaten/Kota (Regency/City)
- Level 3 (2 digit): Kecamatan (District)
- Level 4 (4 digit): Desa (Village) - **WAJIB untuk BMKG API**

**Contoh**:
- `31.71.01.1001` = Gambir, Jakarta Pusat, DKI Jakarta
- `34.04.13.2001` = Caturharjo, Sleman, Daerah Istimewa Yogyakarta
- `34.71.11.1001` = Purwokinanti, Pakualaman, Kota Yogyakarta

### 3.3 Location Lookup Algorithm

**File**: `backend/src/lib/location-lookup.ts`

```typescript
lookupAdm4Code(locationName: string): string | null {
  // Langkah 1: Normalize input (lowercase, remove special chars)
  const normalized = normalizeName(locationName);
  
  // Langkah 2: Split by comma
  const searchTerms = normalized.split(',').map(s => s.trim());
  
  // Langkah 3: Check if Yogyakarta query
  const isYogyakartaQuery = 
    normalized.includes('yogyakarta') || 
    normalized.includes('jogja');
  
  // Langkah 4: Search dalam order: desa → kecamatan → kabupaten
  const allLevels = [
    {type: 'desa', items: db.filter(e => e.type === 'desa')},
    {type: 'kecamatan', items: db.filter(e => e.type === 'kecamatan')},
    {type: 'kabupaten', items: db.filter(e => e.type === 'kabupaten')}
  ];
  
  for (const level of allLevels) {
    for (const term of searchTerms) {
      let matches = level.items.filter(k => 
        normalizeName(k.name) === normalizeName(term) ||
        normalizeName(k.name).includes(normalizeName(term))
      );
      
      // Prioritas Yogyakarta
      if (isYogyakartaQuery) {
        matches = matches.filter(k => k.adm4.startsWith('34.'));
      }
      
      if (matches.length > 0) {
        // Jika hasil kecamatan/kabupaten, convert ke desa
        return getFirstDesaCode(db, matches[0].adm4);
      }
    }
  }
  
  // Langkah 5: Fallback ke default
  return '34.04.13.2001'; // Sleman, Yogyakarta
}
```

### 3.4 Key Functions

#### `reverseGeocode(lat, lng)` - **geolocation.js**
Menggunakan OpenStreetMap Nominatim API untuk reverse geocoding:

```javascript
const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&accept-language=id`;

Response:
{
  address: {
    village: "Purwokinanti",
    city_district: "Pakualaman",
    city: "Kota Yogyakarta",
    district: "Depok",
    state: "Daerah Istimewa Yogyakarta",
    country: "Indonesia"
  }
}
```

#### `getFirstDesaCode(db, adm4)` - **location-lookup.ts**
Konversi kecamatan/kabupaten ke desa untuk BMKG API:

```typescript
function getFirstDesaCode(db: LocationEntry[], adm4: string): string {
  // Jika sudah desa (4 level), return as-is
  if (adm4.split('.').length === 4) return adm4;
  
  // Cari desa pertama dalam kecamatan/kabupaten
  const desa = db.find(e => 
    e.type === 'desa' && 
    e.adm4.startsWith(adm4 + '.')
  );
  
  return desa ? desa.adm4 : adm4;
}
```

#### `getWeatherSnapshot(locationLabel, locationHints)` - **bmkg.ts**
Fetch cuaca dari BMKG API:

```typescript
async getWeatherSnapshot(locationLabel?: string, locationHints: string[] = []): WeatherSnapshot {
  const adm4Code = resolveAdm4Code(locationLabel, locationHints);
  const apiUrl = `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${adm4Code}`;
  
  // Fetch & parse response
  const response = await fetch(apiUrl);
  const payload = await response.json();
  
  // Build weather object
  return {
    source: 'bmkg',
    locationLabel: parseLocationLabel(payload.lokasi),
    current: {...},
    forecast: [...],
    summary: "..."
  };
}
```

### 3.5 Lokasi Database

**File**: `lokasi bmkg/lokasi.md`

Format: `ADM4_CODE,NAMA_LOKASI`

```
34,Daerah Istimewa Yogyakarta
34.04,KAB. SLEMAN
34.04.13,Sleman
34.04.13.2001,Caturharjo
34.04.13.2002,Triharjo
34.04.13.2003,Tridadi
34.04.13.2004,Pandowoharjo
34.04.13.2005,Trimulyo
...
```

---

## 4. Frontend Flow

### 4.1 App.jsx Main Logic

```jsx
function App() {
  useEffect(() => {
    const loadData = async () => {
      // 1. Get browser geolocation
      const position = await getCurrentPosition({timeout: 5000});
      
      // 2. Reverse geocode
      const location = await reverseGeocode(position.lat, position.lng);
      
      // 3. Build hints
      const locationHints = [
        location.adm4Hint,
        location.village,
        location.district,
        location.city,
        location.regency,
        location.province
      ].filter(Boolean);
      
      // 4. Fetch weather
      const weather = await getWeather({
        location: location.locationLabel,
        ...locationHints
      });
      
      setWeather(weather);
      setLocationContext(location);
    };
    
    loadData();
  }, []);
}
```

### 4.2 API Call Format

**File**: `frontend/src/lib/api.js`

```javascript
export function getWeather(params) {
  const query = new URLSearchParams();
  query.set('location', params.location);
  
  // Add location hints
  ['adm4Hint', 'village', 'district', 'city', 'regency', 'province'].forEach(key => {
    if (params[key]) query.set(key, params[key]);
  });
  
  return request(`/weather?${query.toString()}`);
}

// Query string example:
// /weather?location=Purwokinanti, Pakualaman&village=Purwokinanti&city=Kota Yogyakarta&province=Daerah Istimewa Yogyakarta
```

---

## 5. Backend API

### 5.1 Weather Endpoint

**Route**: `GET /api/weather`

**Query Parameters**:
```
location: string (display name)
adm4Hint: string (hint untuk ADM4)
village: string
district: string
city: string
regency: string
province: string
```

**Handler**: `backend/api/weather.ts`

```typescript
export default async function handler(req, res) {
  const location = req.query.location;
  const locationHints = [
    'adm4Hint', 'village', 'district', 'city', 'regency', 'province'
  ].map(key => req.query[key]).filter(Boolean);
  
  const weather = await createWeatherResponse({
    location,
    locationHints
  });
  
  return res.status(200).json(weather);
}
```

### 5.2 Response Format

```json
{
  "source": "bmkg",
  "locationLabel": "Caturharjo, Sleman, Daerah Istimewa Yogyakarta",
  "subLabel": "Zona waktu WIB · Update 2026-05-05T14:30:00",
  "current": {
    "temperature": 28,
    "description": "Hujan Ringan",
    "humidity": 78,
    "windSpeed": 12,
    "visibility": 8,
    "icon": "🌧️"
  },
  "forecast": [
    {
      "day": "Sen",
      "label": "Senin",
      "description": "Hujan Ringan",
      "icon": "🌧️",
      "high": 28,
      "low": 23,
      "rainChance": 70
    }
  ],
  "temperatureSeries": [28, 30, 32, 31, 29],
  "rainfallSeries": [45, 12, 8, 20, 2],
  "summary": "Caturharjo, Sleman diperkirakan hujan ringan dengan suhu 28°C."
}
```

---

## 6. Firebase Integration

### 6.1 Database Schema

```
{
  "stats": {
    "global": {
      "totalContributions": 0,
      "acceptedContributions": 0,
      "rejectedContributions": 0,
      "validationScoreSum": 0
    }
  },
  "profiles": {
    "default": {
      "displayName": "Pak Budi",
      "tagline": "Petani Cuaca Andal",
      "location": "Sleman, Yogyakarta",
      "avatarInitials": "PB",
      "rating": 4
    }
  },
  "community": {
    "achievements": [...],
    "leaderboard": [...]
  }
}
```

### 6.2 Frontend Firebase Integration

**File**: `frontend/src/lib/firebase.js`

```javascript
// Initialize
const db = firebase.database();

// Subscribe to stats
export function subscribeStats(callback) {
  return db.ref('stats/global').on('value', snapshot => {
    callback(snapshot.val());
  });
}

// Update profile
export async function updateProfile(userId, profile) {
  await db.ref(`profiles/${userId}`).set(profile);
}
```

### 6.3 Backend Firebase Admin

**File**: `backend/src/lib/dashboard-state.ts`

```typescript
import * as admin from 'firebase-admin';

const db = admin.database();

async function updateStats(mutator: (draft: DashboardState) => void) {
  const ref = db.ref('stats/global');
  const result = await ref.transaction((current: any) => {
    const next = coerceState(current);
    mutator(next);
    return next;
  });
}
```

---

## 7. Masalah & Solusi (Current Issues)

### Issue 1: Lokasi Default Masih Gambir

**Penyebab**: Default fallback ADM4 masih 31.71.01.1001 (Gambir, Jakarta)

**Solusi yang Diterapkan**:
- ✅ Ubah default ke `34.04.13.2001` (Caturharjo, Sleman, Yogyakarta)
- ✅ Update di 3 file:
  - `backend/src/lib/location-lookup.ts` line 189
  - `backend/src/lib/bmkg.ts` line 226

**Verify Command**:
```bash
cd backend
npx tsx -e "import { getAdm4FromLocation } from './src/lib/location-lookup.ts'; console.log(getAdm4FromLocation('unknown location'));"
```

Expected output: `34.04.13.2001`

### Issue 2: Pencarian Lokasi Terlalu Longgar

**Penyebab**: Algoritma match partial tanpa presisi

**Solusi yang Diterapkan**:
- ✅ Minimum 3 karakter untuk search term
- ✅ Exact match sebelum partial match
- ✅ Pencarian multi-level dengan prioritas: desa → kecamatan → kabupaten
- ✅ Konversi otomatis ke desa level untuk BMKG API

---

## 8. Testing

### Test 1: Location Lookup

```bash
cd backend

# Test Sleman
npx tsx -e "
import { getAdm4FromLocation } from './src/lib/location-lookup.ts';
console.log('Sleman:', getAdm4FromLocation('Sleman', ['Jogja']));
"
# Expected: 34.04.13.2001

# Test Yogyakarta
npx tsx -e "
import { getAdm4FromLocation } from './src/lib/location-lookup.ts';
console.log('Yogyakarta:', getAdm4FromLocation('Yogyakarta', []));
"
# Expected: 34.04.13.2001

# Test Unknown (should fallback to Sleman)
npx tsx -e "
import { getAdm4FromLocation } from './src/lib/location-lookup.ts';
console.log('Unknown:', getAdm4FromLocation('Xyz', []));
"
# Expected: 34.04.13.2001
```

### Test 2: BMKG API

```bash
# Test Sleman
curl "https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=34.04.13.2001"
# Should return valid weather data

# Check lokasi
curl "https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=34.04.13.2001" | grep -o '"kecamatan":"[^"]*"'
# Expected: "kecamatan":"Sleman"
```

---

## 9. File Structure

```
backend/
├── api/
│   ├── weather.ts          # Weather endpoint
│   ├── chat.ts             # Chat endpoint
│   ├── stats.ts            # Stats endpoint
│   └── contribute.ts       # Contribution endpoint
├── src/
│   ├── index.ts            # Server entry
│   └── lib/
│       ├── bmkg.ts         # BMKG API integration
│       ├── location-lookup.ts  # Lokasi → ADM4 mapping
│       ├── climsight.ts    # Response builder
│       ├── groq.ts         # Groq AI
│       ├── knowledge-base.ts   # Vector store
│       ├── dashboard-state.ts  # Firebase stats
│       └── reports.ts      # User contributions
└── rag/
    ├── agent-loop.ts       # AI agent
    ├── prompts.ts
    ├── types.ts
    ├── vector-store.ts
    └── README.md

frontend/
├── src/
│   ├── App.jsx             # Main component
│   ├── lib/
│   │   ├── api.js          # API client
│   │   ├── geolocation.js  # Browser geolocation
│   │   └── firebase.js     # Firebase client
│   └── components/
│       ├── ChatInterface.jsx
│       ├── WeatherReport.jsx
│       ├── WeatherForecast.jsx
│       ├── WeatherTrends.jsx
│       └── ...

lokasi bmkg/
└── lokasi.md               # ADM4 database (~91,000 entries)
```

---

## 10. Environment Variables

**File**: `backend/.env`

```env
# BMKG API (optional, uses default if not set)
BMKG_ADM4_CODE=34.04.13.2001

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Groq API (for chatbot)
GROQ_API_KEY=your_groq_key
```

---

## 11. Deployment Checklist

- [ ] Change BMKG_ADM4_CODE to `34.04.13.2001` in production `.env`
- [ ] Test location detection with real device GPS
- [ ] Verify BMKG API returns valid data for `34.04.13.2001`
- [ ] Clear browser cache (localStorage may have old defaults)
- [ ] Test with actual Yogyakarta coordinates: `-7.797068, 110.370529`
- [ ] Monitor server logs for location lookup failures

---

## 12. References

- BMKG API Documentation: https://api.bmkg.go.id/publik/prakiraan-cuaca
- OpenStreetMap Nominatim: https://nominatim.openstreetmap.org
- Firebase Realtime Database: https://firebase.google.com/docs/database
- Groq API: https://console.groq.com/docs

---

**Last Updated**: May 5, 2026  
**Status**: Location system fixed, default changed to Sleman Yogyakarta
