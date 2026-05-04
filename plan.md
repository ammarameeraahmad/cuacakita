# 🚀 FULL HACKATHON PLAN: ClimSight
### *Sistem Advisory Iklim Lokal dengan Crowd-Sourced Validation*

---

## 💡 BAGIAN 0: EVALUASI IDE "CTA + USER DATA COLLECTION"

### ✅ **JAWABAN: SANGAT COCOK! INI BRILLIANT!**

Ide kamu ini sebenarnya mengimplementasikan konsep **"Human-in-the-Loop Machine Learning"** + **"Citizen Science"** yang sangat relevan untuk sistem iklim. Berikut analisisnya:

---

### 🎯 Mengapa Ide Ini Powerful?

```
┌──────────────────────────────────────────────────────────────────┐
│  MASALAH KLASIK RAG SYSTEMS:                                     │
│  ❌ Data cepat usang (stale data)                                │
│  ❌ Tidak ada feedback loop                                      │
│  ❌ Gap antara data resmi vs kondisi riil di lapangan            │
│  ❌ No mechanism untuk continuous improvement                    │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  SOLUSI KAMU:                                                     │
│  ✅ Self-updating knowledge base                                 │
│  ✅ Real-time ground truth dari warga                            │
│  ✅ Demokratisasi kontribusi data                                │
│  ✅ Gamifikasi yang bikin user engaged                           │
└──────────────────────────────────────────────────────────────────┘
```

---

### 🔬 Preseden Ilmiah yang Mendukung Ide Ini:

| Platform | Konsep Serupa | Hasil |
|---|---|---|
| **Weather Underground** | User submit data dari stasiun cuaca pribadi | 250,000+ stasiun di 60 negara |
| **iNaturalist** | User upload foto biodiversitas | 190 juta observasi terverifikasi |
| **Waze** | Crowd-sourced traffic data dengan validasi | Data lebih akurat dari sensor resmi |
| **Zooniverse** | Citizen science untuk klasifikasi data | 2+ juta volunteer, 400+ paper ilmiah |

**Kesimpulan:** Model crowd-sourced dengan validasi otomatis **terbukti efektif** dan **reliable** jika dirancang dengan baik!

---

### ⚠️ Potensi Masalah & Solusinya:

| Risiko | Mitigasi dalam Desain Kamu |
|---|---|
| **Spam/trolling data** | ✅ Validasi dengan korelasi BMKG |
| **User tidak paham meteorologi** | ✅ Gunakan pilihan visual (hujan ringan/deras), bukan angka |
| **Bias geografis** | ✅ Incentive untuk daerah yang kurang terwakili |
| **Data tidak akurat** | ✅ Disclaimer jelas + threshold korelasi |
| **Privacy concern** | ✅ Anonymous submission + GPS opsional |

---

### 🌟 Nilai Tambah untuk Hackathon:

```
NOVELTY POINTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Interactive RAG (bukan passive retrieval)
✨ Self-correcting system via crowd validation
✨ Gamification of climate data collection
✨ Bridging official data & lived experience
✨ Real implementation of Human-in-the-Loop AI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INI BISA JADI UNIQUE SELLING POINT (USP) UTAMA! 🏆
```

---

## 📋 BAGIAN 1: HACKATHON OVERVIEW

### 🎯 Tema Hackathon
**"ClimSight: AI-Powered Localized Climate Advisory with Community-Driven Validation"**

### ⏱️ Durasi
**36-48 jam** (format weekend hackathon standar)

### 👥 Target Peserta
- **Tim size:** 3-5 orang
- **Komposisi ideal:**
  - 2 Backend/AI Engineer
  - 1 Frontend Developer
  - 1 Data Engineer/Analyst
  - 1 UI/UX Designer (opsional tapi recommended)

### 🏆 Deliverables Akhir
```
MINIMUM VIABLE PRODUCT (MVP):
┌──────────────────────────────────────────────────────┐
│ ✅ Working chatbot berbasis RAG                      │
│ ✅ Integrasi minimal 2 API data iklim                │
│ ✅ Fitur CTA untuk user data contribution            │
│ ✅ Sistem validasi otomatis (correlation check)      │
│ ✅ Dashboard sederhana untuk visualisasi             │
│ ✅ Demo di 1 lokasi geografis (proof of concept)    │
└──────────────────────────────────────────────────────┘
```

---

## 🗓️ BAGIAN 2: TIMELINE HACKATHON (48 JAM)

### **HARI 0 — PERSIAPAN (Sebelum Hackathon)**

```
CHECKLIST PRE-HACKATHON:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Registrasi akun API:
  └─ BMKG API (open, no key needed)
  └─ NASA POWER (gratis, no key)
  └─ OpenAI/Anthropic API key (untuk LLM)
  └─ Twilio/WhatsApp Business API (opsional)

□ Setup development environment:
  └─ Python 3.10+ 
  └─ Node.js (untuk frontend)
  └─ Vector database (ChromaDB/Qdrant)
  └─ Git repository

□ Download starter data:
  └─ Sample BMKG historical data
  └─ Sample climate reports (IPCC, BMKG)
  └─ Coordinate data untuk region fokus

□ Prepare boilerplate code:
  └─ FastAPI template
  └─ Basic RAG pipeline
  └─ UI component library
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### **HARI 1 — SABTU**

#### **08:00 - 09:00 | Opening & Team Formation**
- Briefing konsep ClimSight
- Pembagian dataset & API access
- Final team composition

#### **09:00 - 12:00 | SPRINT 1: Data Pipeline**

**Backend Team:**
```python
# TASK 1.1: Setup BMKG API Integration
# File: data_ingestion/bmkg_connector.py

import requests
from datetime import datetime

class BMKGConnector:
    BASE_URL = "https://api.bmkg.go.id/publik"
    
    def get_weather_forecast(self, lat, lon):
        """Ambil prakiraan cuaca untuk koordinat tertentu"""
        # Implementasi: convert lat/lon ke kode wilayah BMKG
        # Fetch data 3 harian
        pass
    
    def get_warning(self, region_code):
        """Ambil peringatan dini cuaca"""
        pass

# TASK 1.2: Setup NASA POWER API Integration
class NASAPowerConnector:
    BASE_URL = "https://power.larc.nasa.gov/api"
    
    def get_historical_climate(self, lat, lon, start_date, end_date):
        """Ambil data historis untuk analisis tren"""
        params = {
            'parameters': 'T2M,PRECTOTCORR,RH2M',
            'community': 'AG',
            'longitude': lon,
            'latitude': lat,
            'start': start_date,
            'end': end_date,
            'format': 'JSON'
        }
        # Return time-series data
        pass
```

**Data Team:**
```python
# TASK 1.3: Data Cleaning & Normalization
# File: data_processing/cleaner.py

def normalize_coordinates(lat, lon):
    """Standardisasi format koordinat"""
    pass

def validate_weather_data(data):
    """Cek kelengkapan & validitas data"""
    # Cek missing values
    # Cek range nilai (suhu -50 to 50°C, dll)
    pass

def merge_data_sources(bmkg_data, nasa_data):
    """Gabungkan data dari berbagai sumber"""
    # Align timestamps
    # Handle conflicts
    pass
```

**Target Output Sprint 1:**
```
✅ Function untuk fetch data dari 2+ API
✅ Data cleaning pipeline
✅ Sample dataset minimal 1000 records
✅ Saved ke local database (SQLite/PostgreSQL)
```

---

#### **12:00 - 13:00 | LUNCH BREAK 🍕**

---

#### **13:00 - 18:00 | SPRINT 2: RAG Core System**

**AI Team:**
```python
# TASK 2.1: Setup Vector Database
# File: rag_system/vector_store.py

from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter

class ClimateVectorStore:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings()
        self.vectorstore = Chroma(
            embedding_function=self.embeddings,
            persist_directory="./chroma_db"
        )
    
    def add_documents(self, documents):
        """Tambah dokumen iklim ke vector store"""
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        splits = text_splitter.split_documents(documents)
        self.vectorstore.add_documents(splits)
    
    def add_user_contribution(self, text, metadata):
        """Tambah data user yang sudah tervalidasi"""
        # Tag dengan source: "user_contributed"
        # Include validation_score
        pass

# TASK 2.2: RAG Query Engine
# File: rag_system/query_engine.py

from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI

class ClimSightRAG:
    def __init__(self, vector_store):
        self.vector_store = vector_store
        self.llm = ChatOpenAI(model="gpt-4", temperature=0.3)
        
        # Setup retriever dengan hybrid search
        self.retriever = vector_store.as_retriever(
            search_type="mmr",  # Maximum Marginal Relevance
            search_kwargs={"k": 5, "fetch_k": 20}
        )
        
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            retriever=self.retriever,
            return_source_documents=True
        )
    
    def query(self, question, user_location=None):
        """Process user query dengan context awareness"""
        # Tambahkan location context jika ada
        enhanced_query = self._add_location_context(
            question, user_location
        )
        
        result = self.qa_chain({"query": enhanced_query})
        
        # Generate CTA untuk user contribution
        cta = self._generate_contribution_cta(
            question, user_location
        )
        
        return {
            "answer": result["result"],
            "sources": result["source_documents"],
            "cta": cta
        }
    
    def _generate_contribution_cta(self, query, location):
        """Generate CTA yang relevan dengan query"""
        # Contoh: Jika query tentang hujan, CTA tanya kondisi hujan saat ini
        pass
```

**Target Output Sprint 2:**
```
✅ Vector database terisi dengan data iklim
✅ RAG pipeline yang bisa jawab pertanyaan dasar
✅ Function untuk generate CTA otomatis
✅ Test dengan 10-20 sample queries
```

---

#### **18:00 - 19:00 | DINNER BREAK 🍜**

---

#### **19:00 - 24:00 | SPRINT 3: User Contribution System**

**Backend Team:**
```python
# TASK 3.1: User Data Validation Engine
# File: validation/user_data_validator.py

import numpy as np
from scipy.stats import pearsonr
from datetime import datetime, timedelta

class UserDataValidator:
    def __init__(self, bmkg_connector):
        self.bmkg = bmkg_connector
        self.validation_threshold = 0.7  # Korelasi minimum
    
    def validate_weather_report(self, user_data):
        """
        Validasi laporan cuaca user dengan data BMKG
        
        user_data = {
            "location": {"lat": -7.8, "lon": 110.3},
            "timestamp": "2024-03-30 14:00",
            "conditions": {
                "temperature": 28,  # °C
                "rainfall": "heavy",  # categorical
                "wind_speed": "moderate"
            },
            "description": "Hujan deras sejak pagi..."
        }
        """
        # Step 1: Ambil data BMKG untuk lokasi & waktu yang sama
        bmkg_data = self._get_bmkg_reference(
            user_data["location"],
            user_data["timestamp"]
        )
        
        # Step 2: Hitung correlation score
        score = self._calculate_correlation(user_data, bmkg_data)
        
        # Step 3: Tentukan keputusan
        validation_result = {
            "is_valid": score >= self.validation_threshold,
            "confidence_score": score,
            "bmkg_reference": bmkg_data,
            "discrepancies": self._find_discrepancies(
                user_data, bmkg_data
            ),
            "decision": "ACCEPT" if score >= self.validation_threshold 
                        else "REJECT"
        }
        
        return validation_result
    
    def _calculate_correlation(self, user_data, bmkg_data):
        """
        Hitung similarity score antara user report dan BMKG
        """
        score = 0.0
        weights = {
            "temperature": 0.3,
            "rainfall": 0.4,
            "wind": 0.2,
            "time_proximity": 0.1
        }
        
        # Temperature similarity
        if "temperature" in user_data["conditions"]:
            temp_diff = abs(
                user_data["conditions"]["temperature"] - 
                bmkg_data["temperature"]
            )
            # Toleransi ±3°C
            temp_score = max(0, 1 - (temp_diff / 10))
            score += temp_score * weights["temperature"]
        
        # Rainfall category matching
        rainfall_map = {
            "heavy": 3, "moderate": 2, "light": 1, "none": 0
        }
        if "rainfall" in user_data["conditions"]:
            user_rain = rainfall_map.get(
                user_data["conditions"]["rainfall"], 0
            )
            bmkg_rain = self._categorize_bmkg_rainfall(
                bmkg_data["precipitation"]
            )
            rain_score = 1 - (abs(user_rain - bmkg_rain) / 3)
            score += rain_score * weights["rainfall"]
        
        # Time proximity (semakin dekat waktu laporan, semakin tinggi)
        time_diff = self._calculate_time_diff(
            user_data["timestamp"], 
            bmkg_data["timestamp"]
        )
        time_score = max(0, 1 - (time_diff / 6))  # 6 jam window
        score += time_score * weights["time_proximity"]
        
        return round(score, 2)
    
    def _find_discrepancies(self, user_data, bmkg_data):
        """Identifikasi perbedaan spesifik"""
        issues = []
        
        # Cek major discrepancy
        temp_diff = abs(
            user_data["conditions"].get("temperature", 0) - 
            bmkg_data.get("temperature", 0)
        )
        if temp_diff > 5:
            issues.append(
                f"Temperature difference: {temp_diff}°C "
                f"(User: {user_data['conditions']['temperature']}°C, "
                f"BMKG: {bmkg_data['temperature']}°C)"
            )
        
        return issues

# TASK 3.2: User Contribution Manager
# File: contribution/manager.py

class ContributionManager:
    def __init__(self, validator, vector_store):
        self.validator = validator
        self.vector_store = vector_store
        self.contribution_db = []  # Simplified, use real DB
    
    def submit_contribution(self, user_id, data):
        """Process user contribution"""
        
        # Validate
        validation = self.validator.validate_weather_report(data)
        
        contribution_record = {
            "id": self._generate_id(),
            "user_id": user_id,
            "data": data,
            "validation": validation,
            "timestamp": datetime.now(),
            "status": "PENDING"
        }
        
        # Auto-accept jika validation score tinggi
        if validation["is_valid"]:
            self._accept_contribution(contribution_record)
            return {
                "status": "ACCEPTED",
                "message": "Terima kasih! Data kamu cocok dengan "
                           "data BMKG dan sudah kami tambahkan 🎉",
                "confidence": validation["confidence_score"]
            }
        else:
            # Reject atau flagging untuk manual review
            return {
                "status": "REJECTED",
                "message": "Maaf, data yang kamu berikan berbeda "
                           "dengan data BMKG. Silakan cek kembali 🙏",
                "discrepancies": validation["discrepancies"]
            }
    
    def _accept_contribution(self, record):
        """Add validated contribution to knowledge base"""
        # Format sebagai dokumen untuk vector store
        doc_text = (
            f"Laporan cuaca dari warga di "
            f"{record['data']['location']} pada "
            f"{record['data']['timestamp']}: "
            f"{record['data']['description']}"
        )
        
        metadata = {
            "source": "user_contributed",
            "validation_score": record["validation"]["confidence_score"],
            "location": record["data"]["location"],
            "timestamp": str(record["timestamp"]),
            "data_type": "weather_observation"
        }
        
        self.vector_store.add_user_contribution(doc_text, metadata)
        record["status"] = "ACCEPTED"
```

**Frontend Team:**
```javascript
// TASK 3.3: CTA Component
// File: frontend/src/components/ContributionCTA.jsx

import React, { useState } from 'react';

const ContributionCTA = ({ queryContext, userLocation }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  
  // Generate CTA dinamis berdasarkan query
  const generatePrompt = () => {
    if (queryContext.topic === 'rainfall') {
      return "🌧️ Apakah di tempat kamu saat ini sedang hujan?";
    } else if (queryContext.topic === 'temperature') {
      return "🌡️ Bagaimana cuaca di tempat kamu sekarang?";
    }
    return "📍 Bantu kami dengan melaporkan kondisi cuaca di tempatmu!";
  };
  
  const handleSubmit = async () => {
    const response = await fetch('/api/contribute', {
      method: 'POST',
      body: JSON.stringify({
        location: userLocation,
        timestamp: new Date().toISOString(),
        conditions: formData
      })
    });
    
    const result = await response.json();
    
    if (result.status === 'ACCEPTED') {
      showSuccessNotification(result.message);
    } else {
      showErrorNotification(result.message);
    }
  };
  
  return (
    <div className="cta-container">
      <div className="cta-prompt">
        {generatePrompt()}
      </div>
      
      {showForm ? (
        <WeatherReportForm 
          onSubmit={handleSubmit}
          onChange={setFormData}
        />
      ) : (
        <button onClick={() => setShowForm(true)}>
          Laporkan Kondisi Cuaca 🚀
        </button>
      )}
      
      <div className="disclaimer">
        <small>
          ⚠️ Laporan akan diverifikasi dengan data BMKG sebelum digunakan
        </small>
      </div>
    </div>
  );
};

// TASK 3.4: Simple Report Form
const WeatherReportForm = ({ onSubmit, onChange }) => {
  return (
    <div className="report-form">
      <div className="form-group">
        <label>Kondisi Cuaca Saat Ini:</label>
        <select onChange={(e) => onChange({
          ...formData,
          condition: e.target.value
        })}>
          <option value="">Pilih...</option>
          <option value="sunny">☀️ Cerah</option>
          <option value="cloudy">⛅ Berawan</option>
          <option value="rainy">🌧️ Hujan</option>
          <option value="stormy">⛈️ Badai</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>Intensitas Hujan (jika ada):</label>
        <div className="button-group">
          <button>Ringan</button>
          <button>Sedang</button>
          <button>Deras</button>
        </div>
      </div>
      
      <div className="form-group">
        <label>Suhu Perkiraan (°C):</label>
        <input type="number" min="15" max="40" />
      </div>
      
      <div className="form-group">
        <label>Catatan Tambahan (opsional):</label>
        <textarea 
          placeholder="Misal: Hujan deras sejak pagi, ada banjir kecil di jalan..."
          maxLength="200"
        />
      </div>
      
      <button onClick={onSubmit} className="submit-btn">
        Kirim Laporan 📤
      </button>
    </div>
  );
};
```

**Target Output Sprint 3:**
```
✅ Validation engine yang bisa compare user data vs BMKG
✅ Auto-accept system dengan threshold
✅ UI form untuk user contribution
✅ CTA yang muncul di setiap respons chatbot
✅ Feedback notification (accepted/rejected)
```

---

### **HARI 2 — MINGGU**

#### **00:00 - 02:00 | Late Night Coding (Opsional)**
- Bug fixing
- Integration testing
- Coffee ☕☕☕

#### **02:00 - 08:00 | ISTIRAHAT (Tidur di venue/hotel)**

---

#### **08:00 - 09:00 | Breakfast & Standup**

---

#### **09:00 - 14:00 | SPRINT 4: Integration & Dashboard**

**Full-Stack Team:**
```python
# TASK 4.1: Main API Backend
# File: main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="ClimSight API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    question: str
    location: dict = None
    user_id: str = None

class ContributionRequest(BaseModel):
    user_id: str
    location: dict
    conditions: dict
    description: str = ""

@app.post("/api/chat")
async def chat_endpoint(request: QueryRequest):
    """Main chatbot endpoint"""
    try:
        # Query RAG system
        result = rag_engine.query(
            request.question,
            user_location=request.location
        )
        
        # Generate response dengan CTA
        return {
            "answer": result["answer"],
            "sources": [
                {
                    "content": doc.page_content[:200],
                    "metadata": doc.metadata
                }
                for doc in result["sources"]
            ],
            "cta": result["cta"],
            "suggested_contribution": {
                "prompt": result["cta"]["prompt"],
                "form_fields": result["cta"]["fields"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/contribute")
async def contribute_endpoint(request: ContributionRequest):
    """User contribution submission"""
    try:
        result = contribution_manager.submit_contribution(
            user_id=request.user_id,
            data={
                "location": request.location,
                "timestamp": datetime.now().isoformat(),
                "conditions": request.conditions,
                "description": request.description
            }
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stats")
async def stats_endpoint():
    """Dashboard statistics"""
    return {
        "total_queries": query_counter.get_count(),
        "total_contributions": contribution_manager.get_count(),
        "accepted_contributions": contribution_manager.get_accepted_count(),
        "avg_validation_score": contribution_manager.get_avg_score(),
        "coverage_areas": contribution_manager.get_coverage_map()
    }
```

**Frontend Team:**
```javascript
// TASK 4.2: Main Chat Interface
// File: frontend/src/App.jsx

import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import ContributionCTA from './components/ContributionCTA';
import DashboardStats from './components/DashboardStats';

function App() {
  const [messages, setMessages] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  
  useEffect(() => {
    // Get user location
    navigator.geolocation.getCurrentPosition((position) => {
      setUserLocation({
        lat: position.coords.latitude,
        lon: position.coords.longitude
      });
    });
  }, []);
  
  const sendMessage = async (message) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: message,
        location: userLocation,
        user_id: getUserId() // From localStorage
      })
    });
    
    const result = await response.json();
    
    setMessages([
      ...messages,
      { role: 'user', content: message },
      { 
        role: 'assistant', 
        content: result.answer,
        sources: result.sources,
        cta: result.cta  // ✨ Ini yang penting!
      }
    ]);
  };
  
  return (
    <div className="app">
      <header>
        <h1>🌍 ClimSight</h1>
        <p>Advisory Iklim Lokal Berbasis AI</p>
      </header>
      
      <main>
        <ChatInterface 
          messages={messages}
          onSendMessage={sendMessage}
        />
        
        {/* Show CTA after each assistant message */}
        {messages.length > 0 && 
         messages[messages.length - 1].cta && (
          <ContributionCTA 
            cta={messages[messages.length - 1].cta}
            userLocation={userLocation}
          />
        )}
      </main>
      
      <aside>
        <DashboardStats />
      </aside>
    </div>
  );
}
```

**Target Output Sprint 4:**
```
✅ API backend fully integrated
✅ Chat interface working end-to-end
✅ CTA muncul setelah setiap respons AI
✅ User bisa submit contribution via form
✅ Dashboard menampilkan statistik contribution
```

---

#### **14:00 - 15:00 | LUNCH BREAK 🍕**

---

#### **15:00 - 18:00 | SPRINT 5: Polish & Demo Preparation**

**Checklist:**
```
TECHNICAL:
□ Bug fixing critical issues
□ Error handling & edge cases
□ Loading states & UX improvements
□ Mobile responsiveness
□ Performance optimization

DEMO PREPARATION:
□ Prepare 3-5 demo scenarios:
  1. Basic query: "Bagaimana cuaca di Jakarta hari ini?"
  2. Historical analysis: "Apakah hujan di Yogyakarta makin jarang?"
  3. User contribution: Submit laporan cuaca → validation
  4. Show dashboard dengan contribution stats
  5. Explain validation mechanism

□ Prepare slides:
  - Problem statement
  - Solution architecture
  - Unique features (CTA + validation)
  - Technical stack
  - Future roadmap

□ Record demo video (backup plan jika live demo fail)

DOCUMENTATION:
□ README.md dengan setup instructions
□ API documentation (Swagger auto-generated)
□ Architecture diagram
□ Data flow diagram
```

---

#### **18:00 - 20:00 | Final Submission & Presentation**

---

## 📊 BAGIAN 3: STRUKTUR TEKNIS DETAIL

### 🔧 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Chat UI    │  │ Contribution │  │  Dashboard   │         │
│  │              │  │     Form     │  │    Stats     │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND API LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ /api/chat    │  │/api/contribute│ │  /api/stats  │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          ▼                  │                  │
┌─────────────────────┐      │                  │
│   RAG ENGINE        │      │                  │
│ ┌─────────────────┐ │      │                  │
│ │ Query Processing│ │      │                  │
│ └────────┬────────┘ │      │                  │
│          ▼          │      │                  │
│ ┌─────────────────┐ │      │                  │
│ │Vector Retrieval │ │      │                  │
│ └────────┬────────┘ │      │                  │
│          ▼          │      │                  │
│ ┌─────────────────┐ │      │                  │
│ │  LLM Generate   │ │      │                  │
│ │   + CTA Logic   │ │      │                  │
│ └─────────────────┘ │      │                  │
└─────────────────────┘      │                  │
                             ▼                  │
                   ┌──────────────────┐         │
                   │ VALIDATION ENGINE│         │
                   │ ┌──────────────┐ │         │
                   │ │Fetch BMKG    │ │         │
                   │ │Reference     │ │         │
                   │ └──────┬───────┘ │         │
                   │        ▼         │         │
                   │ ┌──────────────┐ │         │
                   │ │Calculate     │ │         │
                   │ │Correlation   │ │         │
                   │ └──────┬───────┘ │         │
                   │        ▼         │         │
                   │ ┌──────────────┐ │         │
                   │ │Accept/Reject │ │         │
                   │ └──────────────┘ │         │
                   └────────┬─────────┘         │
                            │                   │
                            ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Vector DB   │  │   SQL DB     │  │ External APIs│         │
│  │  (ChromaDB)  │  │(Contributions│  │   - BMKG     │         │
│  │              │  │   & Stats)   │  │   - NASA     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

### 🗂️ Database Schema

```sql
-- Table: user_contributions
CREATE TABLE user_contributions (
    id UUID PRIMARY KEY,
    user_id VARCHAR(50),
    location_lat DECIMAL(10, 7),
    location_lon DECIMAL(10, 7),
    timestamp TIMESTAMP,
    
    -- Weather conditions (JSON)
    conditions JSONB,
    description TEXT,
    
    -- Validation results
    validation_score DECIMAL(3, 2),
    is_validated BOOLEAN,
    bmkg_reference JSONB,
    discrepancies TEXT[],
    
    -- Status
    status VARCHAR(20), -- PENDING, ACCEPTED, REJECTED
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_location (location_lat, location_lon),
    INDEX idx_timestamp (timestamp),
    INDEX idx_status (status)
);

-- Table: query_logs
CREATE TABLE query_logs (
    id UUID PRIMARY KEY,
    user_id VARCHAR(50),
    query TEXT,
    location_lat DECIMAL(10, 7),
    location_lon DECIMAL(10, 7),
    response TEXT,
    sources_used JSONB,
    cta_generated JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Table: system_stats
CREATE TABLE system_stats (
    date DATE PRIMARY KEY,
    total_queries INTEGER,
    total_contributions INTEGER,
    accepted_contributions INTEGER,
    rejected_contributions INTEGER,
    avg_validation_score DECIMAL(3, 2),
    unique_users INTEGER
);
```

---

### 📝 Example CTA Generation Logic

```python
# File: rag_system/cta_generator.py

class CTAGenerator:
    """Generate contextual Call-to-Action untuk user contribution"""
    
    def __init__(self):
        self.templates = {
            "rainfall": {
                "prompt": "🌧️ Apakah di tempat kamu saat ini sedang hujan?",
                "fields": ["rainfall_intensity", "duration", "description"]
            },
            "temperature": {
                "prompt": "🌡️ Bagaimana suhu di tempat kamu sekarang?",
                "fields": ["temperature_estimate", "feels_like", "description"]
            },
            "wind": {
                "prompt": "💨 Apakah ada angin kencang di tempat kamu?",
                "fields": ["wind_intensity", "duration", "description"]
            },
            "general": {
                "prompt": "📍 Bantu kami dengan melaporkan kondisi cuaca terkini!",
                "fields": ["general_condition", "description"]
            }
        }
    
    def generate(self, query, location, rag_context):
        """
        Generate CTA based on query semantics
        
        Args:
            query: User's original question
            location: User's GPS coordinates
            rag_context: Context dari RAG retrieval
        """
        # Deteksi topik dari query
        topic = self._detect_topic(query, rag_context)
        
        # Pilih template yang sesuai
        template = self.templates.get(topic, self.templates["general"])
        
        # Personalize prompt dengan location
        location_name = self._geocode(location)  # Reverse geocoding
        
        personalized_prompt = (
            f"{template['prompt']}\n\n"
            f"Lokasi kamu: {location_name}\n"
            f"Dengan melaporkan, kamu membantu warga lain "
            f"mendapat informasi yang lebih akurat! 🙏"
        )
        
        return {
            "topic": topic,
            "prompt": personalized_prompt,
            "fields": template["fields"],
            "incentive": self._generate_incentive(topic)
        }
    
    def _detect_topic(self, query, context):
        """Detect main topic dari query"""
        query_lower = query.lower()
        
        keywords_map = {
            "rainfall": ["hujan", "rain", "presipitasi", "banjir"],
            "temperature": ["suhu", "panas", "dingin", "temperature"],
            "wind": ["angin", "wind", "badai", "topan"]
        }
        
        for topic, keywords in keywords_map.items():
            if any(kw in query_lower for kw in keywords):
                return topic
        
        return "general"
    
    def _generate_incentive(self, topic):
        """Generate incentive message"""
        incentives = {
            "rainfall": "Data hujan dari kamu akan membantu petani "
                       "merencanakan waktu tanam yang tepat!",
            "temperature": "Laporan suhu dari warga membantu deteksi "
                          "gelombang panas lebih cepat!",
            "wind": "Peringatan angin kencang dari kamu bisa "
                   "selamatkan nyawa orang lain!"
        }
        return incentives.get(topic, "Setiap laporan kamu sangat berharga!")
```

---

## 🎯 BAGIAN 4: KRITERIA PENILAIAN HACKATHON

```
┌──────────────────────────────────────────────────────────────────┐
│                    SCORING RUBRIC (Total: 100)                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. TECHNICAL IMPLEMENTATION (35 poin)                          │
│     □ RAG system working properly (10)                          │
│     □ API integration (BMKG/NASA POWER) (10)                    │
│     □ Validation algorithm correctness (10)                     │
│     □ Code quality & architecture (5)                           │
│                                                                  │
│  2. INNOVATION & NOVELTY (25 poin)                              │
│     □ CTA + User contribution mechanism (10)                    │
│     □ Auto-validation system (10)                               │
│     □ Unique features beyond basic RAG (5)                      │
│                                                                  │
│  3. USER EXPERIENCE (20 poin)                                   │
│     □ Interface usability (10)                                  │
│     □ Response quality & accuracy (5)                           │
│     □ CTA presentation & engagement (5)                         │
│                                                                  │
│  4. IMPACT & SCALABILITY (15 poin)                              │
│     □ Real-world applicability (7)                              │
│     □ Scalability potential (5)                                 │
│     □ Data coverage (3)                                         │
│                                                                  │
│  5. PRESENTATION & DEMO (5 poin)                                │
│     □ Clarity of explanation (3)                                │
│     □ Live demo success (2)                                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🚀 BAGIAN 5: QUICK START GUIDE

### Installation & Setup (30 menit)

```bash
# 1. Clone starter repository
git clone https://github.com/your-org/climsight-hackathon
cd climsight-hackathon

# 2. Setup Python environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. Setup environment variables
cp .env.example .env
# Edit .env dengan API keys kamu:
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...

# 4. Initialize database
python scripts/init_db.py

# 5. Download sample climate data
python scripts/download_sample_data.py

# 6. Start backend
uvicorn main:app --reload --port 8000

# 7. (Terminal baru) Start frontend
cd frontend
npm install
npm run dev

# 8. Open browser
# http://localhost:3000
```

---

## 📚 BAGIAN 6: RESOURCES & REFERENCES

### API Documentation

```
📡 BMKG API
https://github.com/infoBMKG/data-cuaca

📡 NASA POWER
https://power.larc.nasa.gov/docs/

📡 OpenAI
https://platform.openai.com/docs/

📡 LangChain
https://python.langchain.com/docs/
```

### Sample Queries untuk Testing

```
BASIC QUERIES:
1. "Bagaimana cuaca di Jakarta hari ini?"
2. "Kapan musim hujan mulai di Jawa Tengah?"
3. "Apakah suhu di Surabaya lebih panas dari tahun lalu?"

ADVANCED QUERIES:
4. "Saya petani di Yogyakarta, kapan waktu terbaik untuk menanam padi?"
5. "Apakah ada peringatan cuaca ekstrem untuk Bandung minggu ini?"
6. "Bagaimana tren curah hujan di Bali dalam 10 tahun terakhir?"

CONTRIBUTION TRIGGERS:
7. "Apakah akan hujan siang ini di Jakarta?" 
   → CTA: "Apakah saat ini sudah hujan di tempat kamu?"
```

---

## 🏆 BONUS FEATURES (Jika Waktu Tersisa)

```
LEVEL UP IDEAS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎮 Gamification
   - Badge system untuk kontributor aktif
   - Leaderboard per wilayah
   - "Citizen Meteorologist" titles

📊 Advanced Analytics
   - Heatmap contribution coverage
   - Accuracy trend analysis
   - Discrepancy pattern detection

🔔 Alert System
   - Push notification untuk peringatan cuaca
   - Crowd-sourced early warning
   - SMS gateway integration

🗣️ Multilingual Support
   - Bahasa Jawa, Sunda, dll.
   - Voice input (speech-to-text)

📱 Mobile App
   - React Native version
   - Offline-first architecture
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ✅ PRE-HACKATHON CHECKLIST

```
BEFORE THE EVENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEAM:
□ Form team (3-5 orang)
□ Assign roles (Backend, Frontend, Data, AI)
□ Setup communication (Discord/Slack)

TECHNICAL:
□ Semua anggota install dependencies
□ Test API keys berfungsi
□ Clone starter repo
□ Run sample code successfully

KNOWLEDGE:
□ Baca dokumentasi BMKG API
□ Pahami konsep RAG (minimal basic)
□ Review LangChain quickstart
□ Understand validation algorithm concept

LOGISTICS:
□ Laptop charger ✅
□ Internet backup (hotspot) ✅
□ Snacks & caffeine ✅
□ Sleeping bag (jika 48 jam) ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🎉 EXPECTED OUTCOMES

```
MINIMUM VIABLE PRODUCT:
✅ Functional chatbot yang bisa jawab pertanyaan iklim lokal
✅ Integrasi dengan minimal 2 data sources (BMKG + NASA)
✅ CTA muncul setelah setiap respons
✅ User bisa submit weather report
✅ Auto-validation dengan korelasi BMKG
✅ Feedback ke user (accepted/rejected dengan alasan)
✅ Dashboard showing contribution stats

DELIVERABLES:
📦 Working codebase (GitHub repo)
📦 Live demo (deployed atau local)
📦 Presentation deck (10-15 slides)
📦 Demo video (3-5 menit)
📦 Documentation (README + API docs)
```

---

## 🔮 FUTURE ROADMAP (Post-Hackathon)

Jika sistem ini mau dikembangkan lebih lanjut setelah hackathon:

```
PHASE 1 (1-3 bulan):
- Expand ke 100+ contributions untuk validate model
- Partner dengan BMKG untuk data access resmi
- Implement manual review untuk edge cases
- Mobile app development

PHASE 2 (3-6 bulan):
- Multi-language support (regional languages)
- Voice interface (WhatsApp voice note)
- Integration dengan kelompok tani nasional
- Government partnership (Kementan, BNPB)

PHASE 3 (6-12 bulan):
- National rollout
- Real-time alert system
- Predictive modeling dengan ML
- Academic publication tentang validation method
```

---

> 💬 **Siap Hackathon?** 
> - Mau saya buatkan **starter codebase** lengkap?
> - Atau **presentation deck template**?
> - Atau **detailed API integration guide**?
> 
> Let me know! 🚀
