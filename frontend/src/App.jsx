import { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bot,
  ClipboardList,
  CloudRain,
  CloudSun,
  Droplets,
  Eye,
  Home,
  MapPin,
  Mic,
  Minus,
  MoreVertical,
  Plus,
  Send,
  Star,
  SunMedium,
  Thermometer,
  ThumbsDown,
  ThumbsUp,
  Trophy,
  UserRound,
  Wind,
} from 'lucide-react';
import './App.css';

const tabs = [
  { id: 'beranda', label: 'Beranda', icon: Home },
  { id: 'tanya', label: 'Tanya AI', icon: Bot },
  { id: 'laporan', label: 'Laporan', icon: ClipboardList },
  { id: 'data', label: 'Data', icon: BarChart3 },
  { id: 'profil', label: 'Profil', icon: UserRound },
];

const forecastDays = [
  { day: 'SEN', icon: CloudRain, high: '28°', low: '23°' },
  { day: 'SEL', icon: CloudSun, high: '30°', low: '24°' },
  { day: 'RAB', icon: SunMedium, high: '32°', low: '25°' },
  { day: 'KAM', icon: CloudSun, high: '31°', low: '24°' },
  { day: 'JUM', icon: CloudRain, high: '29°', low: '23°' },
];

const temperatureMetrics = [
  { icon: Droplets, label: 'Kelembaban', value: '78%' },
  { icon: Wind, label: 'Angin', value: '12 km/j' },
  { icon: Eye, label: 'Jarak pandang', value: '8 km' },
];

const weatherOptions = [
  { label: 'Cerah', emoji: '☀️' },
  { label: 'Berawan', emoji: '⛅' },
  { label: 'Hujan', emoji: '🌧️', active: true },
  { label: 'Badai', emoji: '⛈️' },
  { label: 'Kabut', emoji: '🌫️' },
  { label: 'Berangin', emoji: '💨' },
];

const rainIntensity = [
  { label: 'Gerimis', active: false },
  { label: 'Sedang', active: true },
  { label: 'Deras', active: false },
];

const achievements = [
  { label: 'Ahli Hujan', emoji: '🌧️', active: true },
  { label: 'Cuaca Cerah', emoji: '☀️' },
  { label: 'Penjaga Lokal', emoji: '📍' },
];

const leaderboard = [
  { rank: 1, name: 'Pak Budi', reports: '47 Laporan', avatar: '👴' },
  { rank: 2, name: 'Bu Siti', reports: '42 Laporan', avatar: '👩' },
  { rank: 3, name: 'Mas Agus', reports: '38 Laporan', avatar: '👨' },
];

function App() {
  const [activeTab, setActiveTab] = useState('beranda');

  return (
    <div className="app-shell">
      <TopBar activeTab={activeTab} />
      <main className="app-content">
        {activeTab === 'beranda' && <HomeScreen />}
        {activeTab === 'tanya' && <ChatScreen />}
        {activeTab === 'laporan' && <ReportScreen />}
        {activeTab === 'data' && <DataScreen />}
        {activeTab === 'profil' && <ProfileScreen />}
      </main>
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}

function TopBar({ activeTab }) {
  const isChat = activeTab === 'tanya';
  const isReport = activeTab === 'laporan';

  if (isReport) {
    return (
      <header className="top-bar top-bar--report">
        <div className="top-bar__row top-bar__row--location">
          <div className="top-bar__title-group">
            <div className="top-bar__icon top-bar__icon--report">📡</div>
            <div>
              <h1 className="top-bar__title">Laporkan Cuaca Sekarang</h1>
              <p className="top-bar__subtitle">Bantu warga lain dengan info cuaca nyata!</p>
            </div>
          </div>
        </div>
      </header>
    );
  }

  if (isChat) {
    return (
      <header className="top-bar top-bar--chat">
        <div className="top-bar__row">
          <div className="top-bar__title-group">
            <div className="top-bar__icon top-bar__icon--robot">
              <Bot size={28} strokeWidth={2.3} />
            </div>
            <div>
              <h1 className="top-bar__title">Tanya ClimSight</h1>
              <p className="top-bar__subtitle top-bar__subtitle--online">
                <span className="status-dot" /> Online
              </p>
            </div>
          </div>
          <button className="icon-button" type="button" aria-label="Menu lainnya">
            <MoreVertical size={24} />
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className={`top-bar ${isReport ? 'top-bar--report' : ''}`}>
      <div className="top-bar__row top-bar__row--location">
        <div className="top-bar__title-group">
          <MapPin className="top-bar__location-icon" size={22} />
          <div>
            <h1 className="top-bar__title">Desa Sukamaju, 12 Okt</h1>
            {!isReport && <p className="top-bar__subtitle">Senin, 30 Maret 2024</p>}
          </div>
        </div>
        {!isReport ? (
          <div className="avatar avatar--header" aria-hidden="true">
            <span>PB</span>
          </div>
        ) : null}
      </div>
    </header>
  );
}

function HomeScreen() {
  return (
    <div className="screen screen--home">
      <section className="hero-card">
        <div className="hero-card__copy">
          <div className="hero-card__temp">28°C</div>
          <div className="hero-pill">HUJAN RINGAN <span aria-hidden="true">🌧️</span></div>
        </div>
        <div className="hero-card__art" aria-hidden="true">
          <div className="hero-card__art-window">
            <div className="hero-cloud hero-cloud--big" />
            <div className="hero-cloud hero-cloud--small" />
            <div className="hero-rain hero-rain--one" />
            <div className="hero-rain hero-rain--two" />
            <div className="hero-rain hero-rain--three" />
          </div>
        </div>
        <div className="metrics-grid">
          {temperatureMetrics.map(({ icon: Icon, label, value }) => (
            <article key={label} className="metric-card">
              <Icon className="metric-card__icon" size={28} />
              <h2>{label}</h2>
              <p>{value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block">
        <h2 className="section-title">Prakiraan 5 Hari</h2>
        <div className="forecast-row">
          {forecastDays.map(({ day, icon: Icon, high, low }) => (
            <article key={day} className="forecast-card">
              <span className="forecast-card__day">{day}</span>
              <Icon className="forecast-card__icon" size={28} />
              <div className="forecast-card__temps">
                <span>{high}</span>
                <span>{low}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="advice-card">
        <div className="advice-card__header">
          <div className="advice-card__badge">🚜</div>
          <div>
            <p className="advice-card__lead">✔ Hari ini cocok untuk menyiram tanaman pagi hari</p>
          </div>
        </div>

        <div className="action-list">
          <button className="action-row action-row--positive" type="button">
            <span className="action-row__emoji">🌾</span>
            <span>Tanam</span>
            <ThumbsUp size={26} />
          </button>
          <button className="action-row action-row--negative" type="button">
            <span className="action-row__emoji">💊</span>
            <span>Semprot</span>
            <ThumbsDown size={26} />
          </button>
          <button className="action-row action-row--positive" type="button">
            <span className="action-row__emoji">🚜</span>
            <span>Bajak</span>
            <ThumbsUp size={26} />
          </button>
        </div>
      </section>
    </div>
  );
}

function ChatScreen() {
  const prompts = [
    { label: 'Akan hujan hari ini?', emoji: '🌧️' },
    { label: 'Kapan waktu tanam?', emoji: '🌾' },
    { label: 'Cuaca minggu ini?', emoji: '🌡️' },
    { label: 'Ada peringatan cuaca?', emoji: '⚠️' },
  ];

  return (
    <div className="screen screen--chat">
      <div className="chip-row chip-row--chat">
        {prompts.map((prompt) => (
          <button key={prompt.label} className="chip" type="button">
            <span className="chip__emoji" aria-hidden="true">{prompt.emoji}</span>
            <span>{prompt.label}</span>
          </button>
        ))}
      </div>

      <div className="chat-thread">
        <div className="chat-bubble chat-bubble--user">Akan hujan hari ini?</div>

        <div className="chat-message-row">
          <div className="bot-avatar" aria-hidden="true">
            <Bot size={28} />
          </div>
          <div className="chat-bubble chat-bubble--bot">
            Hujan 🌧️ akan mulai pukul 14.00 🕒. Pastikan jemuran sudah diangkat ya, Pak!
          </div>
        </div>

        <section className="confirm-card">
          <div className="confirm-card__title">
            <MapPin size={20} />
            <span>Bantu Konfirmasi!</span>
          </div>
          <p className="confirm-card__question">Bagaimana cuaca di lokasi Anda sekarang?</p>

          <div className="weather-grid">
            {weatherOptions.map((option) => (
              <button
                key={option.label}
                className={`weather-tile ${option.active ? 'weather-tile--active' : ''}`}
                type="button"
              >
                <span aria-hidden="true">{option.emoji}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>

          <div className="divider" />

          <div className="section-subtitle">Intensitas Hujan</div>
          <div className="pill-row">
            {rainIntensity.map((item) => (
              <button
                key={item.label}
                className={`pill-option ${item.active ? 'pill-option--active' : ''}`}
                type="button"
              >
                <span aria-hidden="true">💧</span>
                {item.label}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="composer">
        <button className="composer__mic" type="button" aria-label="Rekam suara">
          <Mic size={24} />
        </button>
        <label className="composer__field">
          <input type="text" placeholder="Ketik atau tekan mic..." />
        </label>
        <button className="composer__send" type="button" aria-label="Kirim pesan">
          <Send size={22} />
        </button>
      </div>
    </div>
  );
}

function ReportScreen() {
  const weatherSteps = ['Lokasi', 'Kondisi', 'Kirim'];

  return (
    <div className="screen screen--report">
      <div className="step-row step-row--report">
        {weatherSteps.map((step, index) => (
          <div key={step} className="step-row__item">
            <span className={`step-chip ${index === 0 ? 'step-chip--active' : ''}`}>
              {index === 0 ? '📍' : index === 1 ? '🌤️' : '📤'} {step}
            </span>
            {index < weatherSteps.length - 1 && <ArrowRight className="step-row__arrow" size={20} />}
          </div>
        ))}
      </div>

      <section className="report-card">
        <h3>Langkah 1: Lokasi</h3>
        <div className="map-card">
          <div className="map-pin" aria-hidden="true">📍</div>
          <div className="map-label">Sleman, Yogyakarta</div>
        </div>
        <button className="primary-button" type="button">
          Gunakan Lokasi Saya <span aria-hidden="true">📍</span>
        </button>
      </section>

      <section className="report-card">
        <h3>Langkah 2: Kondisi</h3>
        <div className="weather-grid weather-grid--report">
          {weatherOptions.map((option) => (
            <button
              key={option.label}
              className={`weather-tile weather-tile--report ${option.active ? 'weather-tile--active' : ''}`}
              type="button"
            >
              <span aria-hidden="true">{option.emoji}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        <div className="selector-card">
          <div className="selector-card__title">Intensitas Hujan:</div>
          <div className="pill-row">
            {rainIntensity.map((item) => (
              <button
                key={item.label}
                className={`pill-option ${item.active ? 'pill-option--active' : ''}`}
                type="button"
              >
                <span aria-hidden="true">💧</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="selector-card selector-card--temperature">
          <div className="selector-card__title">Suhu:</div>
          <div className="temperature-control">
            <button className="round-control" type="button" aria-label="Kurangi suhu">
              <Minus size={24} />
            </button>
            <div className="temperature-control__value">28°C</div>
            <button className="round-control" type="button" aria-label="Tambah suhu">
              <Plus size={24} />
            </button>
          </div>
        </div>
      </section>

      <button className="submit-button" type="button">
        KIRIM LAPORAN
      </button>
    </div>
  );
}

function DataScreen() {
  const weatherChartPath = 'M0,70 Q25,18 50,38 T100,58';
  const rainfall = [
    { label: 'Sen', value: '0', height: '10px', tone: 'muted' },
    { label: 'Sel', value: '12', height: '42px', tone: 'soft' },
    { label: 'Rab', value: '45', height: '128px', tone: 'strong' },
    { label: 'Kam', value: '20', height: '74px', tone: 'medium' },
    { label: 'Jum', value: '2', height: '16px', tone: 'muted' },
  ];

  return (
    <div className="screen screen--data">
      <header className="page-hero">
        <div className="page-hero__title-line">
          <div className="page-hero__icon">📊</div>
          <h2>Tren Cuaca Lokal</h2>
        </div>
        <div className="time-tabs" role="tablist" aria-label="Rentang waktu">
          <button className="time-tab time-tab--active" type="button">
            7 Hari
          </button>
          <button className="time-tab" type="button">
            1 Bulan
          </button>
          <button className="time-tab" type="button">
            1 Tahun
          </button>
        </div>
      </header>

      <section className="chart-card">
        <div className="chart-card__header">
          <h3>Suhu Harian</h3>
          <Thermometer size={20} />
        </div>
        <div className="temperature-chart">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="temperature-chart__curve" aria-hidden="true">
            <defs>
              <linearGradient id="curveGradient" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#005d90" />
                <stop offset="50%" stopColor="#a95f00" />
                <stop offset="100%" stopColor="#005d90" />
              </linearGradient>
            </defs>
            <path d={weatherChartPath} fill="none" stroke="url(#curveGradient)" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <div className="today-marker" />
          <div className="chart-bubble chart-bubble--high">34°</div>
          <div className="chart-bubble chart-bubble--low">22°</div>
        </div>
        <div className="axis-labels">
          <span>Sen</span>
          <span>Sel</span>
          <span className="axis-labels__active">Rab (Kini)</span>
          <span>Kam</span>
          <span>Jum</span>
        </div>
      </section>

      <section className="chart-card">
        <div className="chart-card__header">
          <h3>Curah Hujan</h3>
          <CloudRain size={20} />
        </div>
        <div className="rain-chart">
          {rainfall.map((bar) => (
            <div key={bar.label} className="rain-chart__bar-group">
              <div className={`rain-chart__drop rain-chart__drop--${bar.tone}`}>💧</div>
              <div className="rain-chart__value">{bar.value}</div>
              <div className={`rain-chart__bar rain-chart__bar--${bar.tone}`} style={{ height: bar.height }} />
              <span className={`rain-chart__label ${bar.label === 'Rab' ? 'rain-chart__label--active' : ''}`}>{bar.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="reports-card">
        <div className="reports-card__title">
          <Trophy size={22} />
          <h3>128 Laporan Warga Hari Ini</h3>
        </div>
        <div className="reports-card__meta">
          <span>Cakupan Wilayah</span>
          <span className="reports-card__value">85%</span>
        </div>
        <div className="progress-track">
          <div className="progress-track__fill" />
        </div>
        <div className="coverage-pill">
          <span aria-hidden="true">🗺️</span>
          <span>Wilayahmu Sudah Terlindungi</span>
        </div>
      </section>
    </div>
  );
}

function ProfileScreen() {
  return (
    <div className="screen screen--profile">
      <section className="profile-hero">
        <div className="avatar avatar--profile" aria-hidden="true">
          <span>PB</span>
          <div className="avatar__badge">✓</div>
        </div>
        <h2>Pak Budi</h2>
        <div className="profile-badge">🌾 Petani Cuaca Andal</div>
        <div className="profile-stars" aria-label="Rating 4 dari 5">
          {[0, 1, 2, 3, 4].map((index) => (
            <Star key={index} size={18} fill={index < 4 ? 'currentColor' : 'none'} />
          ))}
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card stat-card--reports">
          <div className="stat-card__icon">📤</div>
          <div>
            <div className="stat-card__value">47</div>
            <div className="stat-card__label">Total Laporan</div>
          </div>
        </article>
        <article className="stat-card stat-card--accepted">
          <div className="stat-card__icon">✅</div>
          <div>
            <div className="stat-card__value">43</div>
            <div className="stat-card__label">Diterima</div>
          </div>
        </article>
        <article className="stat-card stat-card--accuracy">
          <div className="stat-card__icon">🎯</div>
          <div>
            <div className="stat-card__value">91%</div>
            <div className="stat-card__label">Akurasi</div>
          </div>
        </article>
        <article className="stat-card stat-card--rank">
          <div className="stat-card__icon">🏆</div>
          <div>
            <div className="stat-card__value">#12</div>
            <div className="stat-card__label">Peringkat Desa</div>
          </div>
        </article>
      </section>

      <section className="section-block">
        <h3 className="section-title">Pencapaian</h3>
        <div className="achievement-row">
          {achievements.map((achievement) => (
            <article key={achievement.label} className={`achievement-card ${achievement.active ? 'achievement-card--active' : ''}`}>
              <span className="achievement-card__emoji" aria-hidden="true">{achievement.emoji}</span>
              <span>{achievement.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="leaderboard-card">
        <div className="leaderboard-card__title">
          <Trophy size={22} />
          <h3>Top Pelapor Minggu Ini - Desamu</h3>
        </div>

        <div className="leaderboard-list">
          {leaderboard.map((entry) => (
            <article key={entry.rank} className={`leaderboard-row ${entry.rank === 1 ? 'leaderboard-row--first' : ''}`}>
              <div className="leaderboard-row__rank">{entry.rank}</div>
              <div className="leaderboard-row__avatar" aria-hidden="true">{entry.avatar}</div>
              <div className="leaderboard-row__copy">
                <div className="leaderboard-row__name">{entry.name}</div>
                <div className="leaderboard-row__meta">{entry.reports}</div>
              </div>
              {entry.rank === 1 ? <Star size={18} /> : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function BottomNav({ activeTab, onChange }) {
  return (
    <nav className="bottom-nav" aria-label="Navigasi utama">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            className={`bottom-nav__item ${active ? 'bottom-nav__item--active' : ''}`}
            type="button"
            onClick={() => onChange(tab.id)}
          >
            <Icon size={22} strokeWidth={active ? 2.4 : 2} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default App;
