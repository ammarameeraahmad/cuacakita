import { useEffect, useState, useCallback } from 'react';
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
  Navigation,
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
import { getStats, getWeather, submitContribution, sendChat } from './lib/api.js';
import { getCurrentPosition, reverseGeocode } from './lib/geolocation.js';
import {
  bootstrapRealtimeData,
  subscribeStats,
  subscribeProfile,
  subscribeAchievements,
  subscribeLeaderboard,
  updateProfile,
  isFirebaseEnabled,
} from './lib/firebase.js';

const tabs = [
  { id: 'beranda', label: 'Beranda', icon: Home },
  { id: 'tanya', label: 'Tanya AI', icon: Bot },
  { id: 'laporan', label: 'Laporan', icon: ClipboardList },
  { id: 'data', label: 'Data', icon: BarChart3 },
  { id: 'profil', label: 'Profil', icon: UserRound },
];

const weatherOptions = [
  { label: 'Cerah', emoji: '☀️' },
  { label: 'Berawan', emoji: '⛅' },
  { label: 'Hujan', emoji: '🌧️' },
  { label: 'Badai', emoji: '⛈️' },
  { label: 'Kabut', emoji: '🌫️' },
  { label: 'Berangin', emoji: '💨' },
];

const rainIntensity = [
  { label: 'Gerimis' },
  { label: 'Sedang' },
  { label: 'Deras' },
];

const defaultAchievements = [
  { label: 'Ahli Hujan', emoji: '🌧️', active: true },
  { label: 'Cuaca Cerah', emoji: '☀️' },
  { label: 'Penjaga Lokal', emoji: '📍' },
];

const defaultLeaderboard = [
  { rank: 1, name: 'Pak Budi', reports: '47 Laporan', avatar: '👴' },
  { rank: 2, name: 'Bu Siti', reports: '42 Laporan', avatar: '👩' },
  { rank: 3, name: 'Mas Agus', reports: '38 Laporan', avatar: '👨' },
];

const defaultProfile = {
  displayName: 'Pak Budi',
  tagline: 'Petani Cuaca Andal',
  location: 'Sleman, Yogyakarta',
  avatarInitials: 'PB',
  rating: 4,
};

const defaultStats = {
  totalQueries: 0,
  totalContributions: 0,
  acceptedContributions: 0,
  rejectedContributions: 0,
  activeUsers: 0,
  validationScoreSum: 0,
};

const defaultCommunity = {
  'stats/global': defaultStats,
  'community/achievements': defaultAchievements,
  'community/leaderboard': defaultLeaderboard,
  'profiles/default': defaultProfile,
};

const fallbackWeather = {
  locationLabel: 'Lokasi belum tersedia',
  subLabel: 'Menunggu data BMKG',
  current: {
    temperature: 0,
    description: 'Data belum tersedia',
    humidity: 0,
    windSpeed: 0,
    visibility: 0,
    icon: '☁️',
  },
  forecast: [
    { day: 'SEN', label: 'Senin', description: 'Menunggu data', icon: '☁️', high: 0, low: 0, rainChance: 0 },
    { day: 'SEL', label: 'Selasa', description: 'Menunggu data', icon: '☁️', high: 0, low: 0, rainChance: 0 },
    { day: 'RAB', label: 'Rabu', description: 'Menunggu data', icon: '☁️', high: 0, low: 0, rainChance: 0 },
    { day: 'KAM', label: 'Kamis', description: 'Menunggu data', icon: '☁️', high: 0, low: 0, rainChance: 0 },
    { day: 'JUM', label: 'Jumat', description: 'Menunggu data', icon: '☁️', high: 0, low: 0, rainChance: 0 },
  ],
  temperatureSeries: [0, 0, 0, 0, 0],
  rainfallSeries: [0, 0, 0, 0, 0],
  summary: 'Data BMKG belum tersedia. Coba lagi beberapa saat.',
};

function buildLocationHints(location) {
  if (!location) return [];
  return [
    location.adm4Hint,
    location.village,
    location.district,
    location.city,
    location.regency,
    location.province,
  ].filter(Boolean);
}

function App() {
  const [activeTab, setActiveTab] = useState('beranda');
  const [weather, setWeather] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeRange, setActiveRange] = useState('7 Hari');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [locationContext, setLocationContext] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { id: 'welcome', role: 'assistant', content: 'Tanya apa saja tentang cuaca di desa kamu.' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileStatus, setProfileStatus] = useState('');
  const [achievements, setAchievements] = useState(defaultAchievements);
  const [leaderboard, setLeaderboard] = useState(defaultLeaderboard);
  const [reportState, setReportState] = useState({
    location: defaultProfile.location,
    condition: 'Hujan',
    intensity: 'Sedang',
    temperature: 28,
    description: '',
  });
  const [reportStatus, setReportStatus] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const userId = 'default';

  useEffect(() => {
    let cancelled = false;
    const unsubscribers = [];

    if (isFirebaseEnabled()) {
      bootstrapRealtimeData(defaultCommunity).catch((error) => {
        console.warn('Bootstrap realtime data failed:', error);
      });

      unsubscribers.push(
        subscribeStats((value) => {
          if (!cancelled) setStats(value || null);
        })
      );
      unsubscribers.push(
        subscribeProfile(userId, (value) => {
          if (!cancelled) setProfile(value || null);
        })
      );
      unsubscribers.push(
        subscribeAchievements((value) => {
          if (!cancelled && Array.isArray(value)) setAchievements(value);
        })
      );
      unsubscribers.push(
        subscribeLeaderboard((value) => {
          if (!cancelled && Array.isArray(value)) setLeaderboard(value);
        })
      );
    }

    const loadData = async () => {
      try {
        // Try to auto-detect location
        let locationName = 'Desa Sukamaju, 12 Okt';
        let locationHints = {};
        try {
          const position = await getCurrentPosition({ timeout: 5000 });
          const location = await reverseGeocode(position.lat, position.lng);
          if (location.locationLabel) {
            locationName = location.locationLabel;
            locationHints = {
              adm4Hint: location.adm4Hint,
              village: location.village,
              district: location.district,
              city: location.city,
              regency: location.regency,
              province: location.province,
            };
            if (!cancelled) {
              setLocationContext(location);
              setLocationError('');
            }
            if (!cancelled) {
              setReportState((current) => ({ ...current, location: location.locationLabel }));
            }
          }
        } catch (error) {
          // Geolocation failed, use default
          console.log('Auto-location failed, using default');
          if (!cancelled) {
            setLocationError('Gagal mendapatkan lokasi perangkat. Menggunakan lokasi default.');
          }
        }

        const weatherResponse = await getWeather({ location: locationName, ...locationHints });
        if (!cancelled) setWeather(weatherResponse);

        if (!isFirebaseEnabled()) {
          const statsResponse = await getStats();
          if (!cancelled) setStats(statsResponse);
        }
      } catch (error) { console.error(error); }
    };
    loadData();
    return () => {
      cancelled = true;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  useEffect(() => {
    if (!profile?.location) return;
    if (locationContext) return;
    setReportState((current) => ({
      ...current,
      location: profile.location || current.location,
    }));
  }, [profile?.location, locationContext]);

  const handleSendChat = async (message) => {
    const text = message.trim();
    if (!text || chatLoading) return;
    const newUserMessage = { id: `user-${Date.now()}`, role: 'user', content: text };
    setChatLoading(true);
    // Compute history from current messages before adding new
    const history = chatMessages.slice(-5).map(m => ({ role: m.role, content: m.content }));
    setChatMessages((current) => [...current, newUserMessage]);
    try {
      const locationLabel = weather?.locationLabel || locationContext?.locationLabel || reportState.location || 'Desa Sukamaju, 12 Okt';
      const userName = profile?.displayName || 'pengguna';
      const response = await sendChat(text, locationLabel, buildLocationHints(locationContext), history, userName);
      setChatMessages((current) => [...current, { id: `assistant-${Date.now()}`, role: 'assistant', content: response.answer }]);
    } catch {
      setChatMessages((current) => [...current, { id: `error-${Date.now()}`, role: 'assistant', content: 'Maaf, AI sedang tidak bisa dihubungi. Coba lagi beberapa saat.' }]);
    } finally {
      setChatLoading(false);
      setChatInput('');
    }
  };

  const handleUseLocation = useCallback(async () => {
    if (locationLoading) return;
    setLocationLoading(true);
    setLocationError('');
    try {
      const position = await getCurrentPosition();
      const location = await reverseGeocode(position.lat, position.lng);
      setReportState((current) => ({ ...current, location: location.locationLabel }));
      setLocationContext(location);
      try {
        const weatherData = await getWeather({
          location: location.locationLabel,
          adm4Hint: location.adm4Hint,
          village: location.village,
          district: location.district,
          city: location.city,
          regency: location.regency,
          province: location.province,
        });
        setWeather(weatherData);
      } catch {
        setLocationError('Gagal memuat data cuaca untuk lokasi Anda.');
      }
    } catch (error) {
      setLocationError(error.message);
    } finally {
      setLocationLoading(false);
    }
  }, [locationLoading]);

  const handleSubmitReport = async () => {
    if (reportLoading) return;
    setReportLoading(true);
    setReportStatus('Mengirim laporan...');
    try {
      const response = await submitContribution({
        location: reportState.location,
        locationHints: buildLocationHints(locationContext),
        description: `Kondisi ${reportState.condition.toLowerCase()} dengan intensitas ${reportState.intensity.toLowerCase()}`,
        conditions: { temperature: reportState.temperature, general_condition: reportState.condition, rainfall_intensity: reportState.intensity },
      });
      setReportStatus(response.message);
    } catch {
      setReportStatus('Gagal mengirim laporan.');
    } finally {
      setReportLoading(false);
    }
  };

  const handleSaveProfile = async (payload) => {
    if (!isFirebaseEnabled()) {
      setProfileStatus('Firebase belum dikonfigurasi.');
      return;
    }
    if (profileSaving) return;
    setProfileSaving(true);
    setProfileStatus('Menyimpan perubahan...');
    try {
      await updateProfile(userId, { ...payload, updatedAt: Date.now() });
      setProfileStatus('Profil berhasil diperbarui.');
    } catch {
      setProfileStatus('Gagal menyimpan profil.');
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="app-shell">
      <TopBar activeTab={activeTab} weather={weather} locationLoading={locationLoading} locationError={locationError} onUseLocation={handleUseLocation} />
      <main className="app-content">
        {activeTab === 'beranda' && <HomeScreen weather={weather} locationLoading={locationLoading} locationError={locationError} onUseLocation={handleUseLocation} />}
        {activeTab === 'tanya' && <ChatScreen messages={chatMessages} inputValue={chatInput} loading={chatLoading} onInputChange={setChatInput} onSubmit={handleSendChat} />}
        {activeTab === 'laporan' && <ReportScreen weather={weather} reportState={reportState} onChangeReportState={setReportState} onSubmit={handleSubmitReport} status={reportStatus} loading={reportLoading} />}
        {activeTab === 'data' && <DataScreen weather={weather} stats={stats} activeRange={activeRange} onRangeChange={setActiveRange} />}
        {activeTab === 'profil' && (
          <ProfileScreen
            stats={stats}
            weather={weather}
            profile={profile}
            achievements={achievements}
            leaderboard={leaderboard}
            onSaveProfile={handleSaveProfile}
            saving={profileSaving}
            status={profileStatus}
          />
        )}
      </main>
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}

function TopBar({ activeTab, weather, locationLoading, onUseLocation }) {
  const isChat = activeTab === 'tanya';
  const isReport = activeTab === 'laporan';
  const activeWeather = weather || fallbackWeather;

  if (isReport) return (
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

  if (isChat) return (
    <header className="top-bar top-bar--chat">
      <div className="top-bar__row">
        <div className="top-bar__title-group">
          <div className="top-bar__icon top-bar__icon--robot"><Bot size={28} strokeWidth={2.3} /></div>
          <div>
            <h1 className="top-bar__title">Tanya ClimSight</h1>
            <p className="top-bar__subtitle top-bar__subtitle--online"><span className="status-dot" /> Online</p>
          </div>
        </div>
        <button className="icon-button" type="button" aria-label="Menu lainnya"><MoreVertical size={24} /></button>
      </div>
    </header>
  );

  return (
    <header className="top-bar">
      <div className="top-bar__row top-bar__row--location">
        <div className="top-bar__title-group">
          <MapPin className="top-bar__location-icon" size={22} />
          <div>
            <h1 className="top-bar__title">{activeWeather.locationLabel}</h1>
            <p className="top-bar__subtitle">{activeWeather.subLabel}</p>
          </div>
        </div>
        <button className={`locate-btn ${locationLoading ? 'locate-btn--loading' : ''}`} type="button" onClick={onUseLocation} disabled={locationLoading} aria-label="Gunakan lokasi saya" title="Gunakan lokasi saya">
          {locationLoading ? <span className="locate-btn__spinner" /> : <Navigation size={20} strokeWidth={2.3} />}
        </button>
      </div>
    </header>
  );
}

function HomeScreen({ weather, locationLoading, locationError }) {
  const snapshot = weather || fallbackWeather;

  return (
    <div className="screen screen--home">
      {locationError ? (
        <div className="location-status location-status--error"><span className="location-status__icon">⚠️</span><span>{locationError}</span></div>
      ) : locationLoading ? (
        <div className="location-status location-status--loading"><span className="location-status__icon">📍</span><span>Mendapatkan lokasi Anda...</span></div>
      ) : null}

      <section className="hero-card">
        <div className="hero-card__copy">
          <div className="hero-card__temp">{snapshot.current.temperature}°C</div>
          <div className="hero-pill">{snapshot.current.description.toUpperCase()} <span aria-hidden="true">{snapshot.current.icon}</span></div>
        </div>
        <div className="hero-card__art" aria-hidden="true">
          <div className="hero-card__art-window">
            <div className="hero-cloud hero-cloud--big" /><div className="hero-cloud hero-cloud--small" />
            <div className="hero-rain hero-rain--one" /><div className="hero-rain hero-rain--two" /><div className="hero-rain hero-rain--three" />
          </div>
        </div>
        <div className="metrics-grid">
          <article className="metric-card"><Droplets className="metric-card__icon" size={28} /><h2>Kelembaban</h2><p>{snapshot.current.humidity}%</p></article>
          <article className="metric-card"><Wind className="metric-card__icon" size={28} /><h2>Angin</h2><p>{snapshot.current.windSpeed} km/j</p></article>
          <article className="metric-card"><Eye className="metric-card__icon" size={28} /><h2>Jarak pandang</h2><p>{snapshot.current.visibility} km</p></article>
        </div>
      </section>

      <section className="section-block">
        <h2 className="section-title">Prakiraan 5 Hari</h2>
        <div className="forecast-row">
          {snapshot.forecast.map(({ day, icon, high, low }) => (
            <article key={day} className="forecast-card">
              <span className="forecast-card__day">{day}</span>
              <span className="forecast-card__icon" aria-hidden="true">{icon}</span>
              <div className="forecast-card__temps"><span>{high}°</span><span>{low}°</span></div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function ChatScreen({ messages, inputValue, loading, onInputChange, onSubmit }) {
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
          <button key={prompt.label} className="chip" type="button" onClick={() => onSubmit(prompt.label)}>
            <span className="chip__emoji" aria-hidden="true">{prompt.emoji}</span><span>{prompt.label}</span>
          </button>
        ))}
      </div>

      <div className="chat-thread">
        {messages.map((message) =>
          message.role === 'user' ? (
            <div key={message.id} className="chat-bubble chat-bubble--user">{message.content}</div>
          ) : (
            <div key={message.id} className="chat-message-row">
              <div className="bot-avatar" aria-hidden="true"><Bot size={28} /></div>
              <div className="chat-bubble chat-bubble--bot">{message.content}</div>
            </div>
          )
        )}

        {loading ? (
          <div className="chat-message-row">
            <div className="bot-avatar" aria-hidden="true"><Bot size={28} /></div>
            <div className="chat-bubble chat-bubble--bot">Sedang menganalisis data BMKG dan pengetahuan cuaca...</div>
          </div>
        ) : null}
      </div>

      <div className="composer">
        <button className="composer__mic" type="button" aria-label="Rekam suara"><Mic size={24} /></button>
        <label className="composer__field">
          <input type="text" placeholder="Ketik atau tekan mic..." value={inputValue}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); onSubmit(inputValue); } }} />
        </label>
        <button className="composer__send" type="button" aria-label="Kirim pesan" onClick={() => onSubmit(inputValue)}><Send size={22} /></button>
      </div>
    </div>
  );
}

function ReportScreen({ weather, reportState, onChangeReportState, onSubmit, status, loading }) {
  const snapshot = weather || fallbackWeather;
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
          <div className="map-label">{reportState.location || snapshot.locationLabel}</div>
        </div>
      </section>

      <section className="report-card">
        <h3>Langkah 2: Kondisi</h3>
        <div className="weather-grid weather-grid--report">
          {weatherOptions.map((option) => (
            <button key={option.label}
              className={`weather-tile weather-tile--report ${reportState.condition === option.label ? 'weather-tile--active' : ''}`}
              type="button"
              onClick={() => onChangeReportState((current) => ({ ...current, condition: option.label }))}>
              <span aria-hidden="true">{option.emoji}</span><span>{option.label}</span>
            </button>
          ))}
        </div>

        <div className="selector-card">
          <div className="selector-card__title">Intensitas Hujan:</div>
          <div className="pill-row">
            {rainIntensity.map((item) => (
              <button key={item.label}
                className={`pill-option ${reportState.intensity === item.label ? 'pill-option--active' : ''}`}
                type="button"
                onClick={() => onChangeReportState((current) => ({ ...current, intensity: item.label }))}>
                <span aria-hidden="true">💧</span>{item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="selector-card selector-card--temperature">
          <div className="selector-card__title">Suhu:</div>
          <div className="temperature-control">
            <button className="round-control" type="button" aria-label="Kurangi suhu"
              onClick={() => onChangeReportState((current) => ({ ...current, temperature: Math.max(16, current.temperature - 1) }))}>
              <Minus size={24} />
            </button>
            <div className="temperature-control__value">{reportState.temperature}°C</div>
            <button className="round-control" type="button" aria-label="Tambah suhu"
              onClick={() => onChangeReportState((current) => ({ ...current, temperature: Math.min(45, current.temperature + 1) }))}>
              <Plus size={24} />
            </button>
          </div>
        </div>
      </section>

      {status ? <div className="report-status">{status}</div> : null}
      <button className="submit-button" type="button" onClick={onSubmit} disabled={loading}>
        {loading ? 'MENGIRIM...' : 'KIRIM LAPORAN'}
      </button>
    </div>
  );
}

function DataScreen({ weather, stats, activeRange, onRangeChange }) {
  const snapshot = weather || fallbackWeather;
  const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  // ── Temperature bars ──
  const temps = snapshot.forecast.map((day, i) => ({ label: day.day, high: day.high, low: day.low, isToday: i === 2 }));
  const allTemps = [...snapshot.temperatureSeries, ...snapshot.forecast.map((d) => d.low)];
  const maxTemp = Math.max(...allTemps, 30);
  const minTemp = Math.min(...allTemps, 20);
  const tempRange = Math.max(maxTemp - minTemp, 5);
  const tempBars = temps.map((t) => ({
    ...t,
    highPct: Math.max(6, ((t.high - minTemp) / tempRange) * 100),
    lowPct: Math.max(4, ((t.low - minTemp) / tempRange) * 100),
  }));
  const avgTemp = Math.round(snapshot.temperatureSeries.reduce((a, v) => a + v, 0) / Math.max(1, snapshot.temperatureSeries.length));

  // ── Rain bars ──
  const rainSeries = snapshot.rainfallSeries && snapshot.rainfallSeries.length ? snapshot.rainfallSeries : [0, 12, 45, 20, 2];
  const maxRain = Math.max(...rainSeries, 1);
  const totalRain = rainSeries.reduce((a, v) => a + v, 0);
  const peakRainIndex = rainSeries.indexOf(Math.max(...rainSeries));
  const todayIndex = Math.min(2, rainSeries.length - 1);
  const rainfall = rainSeries.map((value, index) => {
    const ratio = value / maxRain;
    let tone = 'muted';
    if (value >= 20) tone = 'strong';
    else if (value >= 10) tone = 'medium';
    else if (value >= 1) tone = 'soft';
    return { label: dayLabels[index] || `H${index + 1}`, value: Math.round(value), ratio, tone, isToday: index === todayIndex, isPeak: index === peakRainIndex && value > 0 };
  });

  const totalReports = stats?.totalContributions ?? 0;
  const accepted = stats?.acceptedContributions ?? 0;
  const coverage = Math.min(100, Math.round((accepted / Math.max(totalReports, 1)) * 100));
  const ranges = ['7 Hari', '1 Bulan', '1 Tahun'];

  return (
    <div className="screen screen--data">
      <header className="page-hero page-hero--data">
        <div className="page-hero__title-line">
          <div className="page-hero__icon">📊</div>
          <div>
            <h2>Tren Cuaca Lokal</h2>
            <p className="page-hero__subtitle">{snapshot.locationLabel} · Pantau pola cuaca desa</p>
          </div>
        </div>
        <div className="time-tabs" role="tablist" aria-label="Rentang waktu">
          {ranges.map((range) => (
            <button key={range} type="button" role="tab" aria-selected={activeRange === range}
              className={`time-tab ${activeRange === range ? 'time-tab--active' : ''}`}
              onClick={() => onRangeChange(range)}>{range}</button>
          ))}
        </div>
      </header>

      <section className="data-highlights">
        <article className="highlight-card highlight-card--temp">
          <div className="highlight-card__icon"><Thermometer size={20} /></div>
          <div className="highlight-card__label">Rata-rata Suhu</div>
          <div className="highlight-card__value">{avgTemp}°C</div>
          <div className="highlight-card__hint">Tertinggi {maxTemp}°</div>
        </article>
        <article className="highlight-card highlight-card--rain">
          <div className="highlight-card__icon"><CloudRain size={20} /></div>
          <div className="highlight-card__label">Total Curah Hujan</div>
          <div className="highlight-card__value">{totalRain}<span>mm</span></div>
          <div className="highlight-card__hint">Puncak {Math.max(...rainSeries)}mm</div>
        </article>
        <article className="highlight-card highlight-card--reports">
          <div className="highlight-card__icon"><Trophy size={20} /></div>
          <div className="highlight-card__label">Laporan Warga</div>
          <div className="highlight-card__value">{totalReports}</div>
          <div className="highlight-card__hint">Akurasi {Math.round((stats?.avgValidationScore ?? 0) * 100)}%</div>
        </article>
      </section>

      <section className="chart-card chart-card--temperature">
        <div className="chart-card__header">
          <div className="chart-card__heading">
            <h3>Suhu Harian</h3>
            <span className="chart-card__sub">{minTemp}° – {maxTemp}° Celsius</span>
          </div>
          <div className="chart-card__icon-circle chart-card__icon-circle--warm"><Thermometer size={20} /></div>
        </div>

        <div className="temp-chart">
          {tempBars.map((bar) => (
            <div key={bar.label} className="temp-bar">
              <span className="temp-bar__value temp-bar__value--high">{bar.high}°</span>
              <div className="temp-bar__high" style={{ height: `${bar.highPct}%` }} />
              <div className="temp-bar__low" style={{ height: `${bar.lowPct}%` }} />
              <span className="temp-bar__value temp-bar__value--low">{bar.low}°</span>
              <span className={`temp-bar__label ${bar.isToday ? 'temp-bar__label--active' : ''}`}>{bar.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="chart-card chart-card--rain">
        <div className="chart-card__header">
          <div className="chart-card__heading">
            <h3>Curah Hujan</h3>
            <span className="chart-card__sub">{totalRain}mm dalam {rainSeries.length} hari</span>
          </div>
          <div className="chart-card__icon-circle chart-card__icon-circle--cool"><CloudRain size={20} /></div>
        </div>

        <div className="rain-chart">
          {rainfall.map((bar, index) => (
            <div key={`${bar.label}-${index}`} className="rain-bar">
              <span className={`rain-bar__value rain-bar__value--${bar.tone}`}>{bar.value}mm</span>
              <div className={`rain-bar__fill rain-bar__fill--${bar.tone} ${bar.isPeak ? 'rain-bar__fill--peak' : ''}`}
                style={{ height: `${Math.max(6, bar.ratio * 100)}%` }} />
              <span className={`rain-bar__label ${bar.isToday ? 'rain-bar__label--active' : ''}`}>{bar.label}</span>
            </div>
          ))}
        </div>

        <div className="rain-legend">
          <span className="rain-legend__item"><span className="rain-legend__dot rain-legend__dot--muted" /> 0 mm</span>
          <span className="rain-legend__item"><span className="rain-legend__dot rain-legend__dot--soft" /> 1-9 mm</span>
          <span className="rain-legend__item"><span className="rain-legend__dot rain-legend__dot--medium" /> 10-19 mm</span>
          <span className="rain-legend__item"><span className="rain-legend__dot rain-legend__dot--strong" /> 20+ mm</span>
        </div>
      </section>

      <section className="reports-card">
        <div className="reports-card__title">
          <div className="reports-card__title-icon"><Trophy size={22} /></div>
          <div>
            <h3>{totalReports} Laporan Warga Hari Ini</h3>
            <p className="reports-card__caption">Terima kasih sudah ikut bantu memantau cuaca!</p>
          </div>
        </div>
        <div className="reports-card__meta"><span>Cakupan Wilayah</span><span className="reports-card__value">{coverage}%</span></div>
        <div className="progress-track"><div className="progress-track__fill" style={{ width: `${coverage}%` }} /></div>
        <div className="reports-card__footer">
          <div className="coverage-pill">
            <span aria-hidden="true">🗺️</span>
            <span>{coverage >= 80 ? 'Wilayahmu sudah terlindungi' : 'Ajak warga lain untuk melapor'}</span>
          </div>
          {snapshot.summary && <p className="reports-card__summary">{snapshot.summary}</p>}
        </div>
      </section>
    </div>
  );
}

function ProfileScreen({ stats, weather, profile, achievements, leaderboard, onSaveProfile, saving, status }) {
  const snapshot = weather || fallbackWeather;
  const statValues = stats || {
    totalQueries: 0,
    totalContributions: 0,
    acceptedContributions: 0,
    rejectedContributions: 0,
    activeUsers: 0,
    avgValidationScore: 0,
  };
  const safeProfile = profile || defaultProfile;
  const [editing, setEditing] = useState(false);
  const [formState, setFormState] = useState({
    displayName: safeProfile.displayName,
    tagline: safeProfile.tagline,
    location: safeProfile.location,
    avatarInitials: safeProfile.avatarInitials,
  });

  useEffect(() => {
    setFormState({
      displayName: safeProfile.displayName,
      tagline: safeProfile.tagline,
      location: safeProfile.location,
      avatarInitials: safeProfile.avatarInitials,
    });
  }, [safeProfile.displayName, safeProfile.tagline, safeProfile.location, safeProfile.avatarInitials]);

  const ratingValue = Math.max(1, Math.min(5, Number(safeProfile.rating || 4)));

  return (
    <div className="screen screen--profile">
      <section className="profile-hero">
        <div className="avatar avatar--profile" aria-hidden="true">
          <span>{safeProfile.avatarInitials || '??'}</span>
          <div className="avatar__badge">✓</div>
        </div>
        <h2>{safeProfile.displayName}</h2>
        <div className="profile-badge">{safeProfile.tagline}</div>
        <div className="profile-stars" aria-label={`Rating ${ratingValue} dari 5`}>
          {[0, 1, 2, 3, 4].map((index) => (
            <Star key={index} size={18} fill={index < ratingValue ? 'currentColor' : 'none'} />
          ))}
        </div>
        <div className="profile-location">{safeProfile.location || snapshot.locationLabel}</div>
        <button className="profile-edit-button" type="button" onClick={() => setEditing((value) => !value)}>
          {editing ? 'Tutup' : 'Ubah Profil'}
        </button>
      </section>

      {editing ? (
        <section className="profile-editor">
          <div className="profile-field">
            <label>Nama</label>
            <input
              type="text"
              value={formState.displayName}
              onChange={(event) => setFormState((current) => ({ ...current, displayName: event.target.value }))}
            />
          </div>
          <div className="profile-field">
            <label>Tagline</label>
            <input
              type="text"
              value={formState.tagline}
              onChange={(event) => setFormState((current) => ({ ...current, tagline: event.target.value }))}
            />
          </div>
          <div className="profile-field">
            <label>Lokasi</label>
            <input
              type="text"
              value={formState.location}
              onChange={(event) => setFormState((current) => ({ ...current, location: event.target.value }))}
            />
          </div>
          <div className="profile-field profile-field--short">
            <label>Inisial</label>
            <input
              type="text"
              value={formState.avatarInitials}
              maxLength={3}
              onChange={(event) => setFormState((current) => ({ ...current, avatarInitials: event.target.value.toUpperCase() }))}
            />
          </div>
          <button
            className="primary-button"
            type="button"
            disabled={saving}
            onClick={() => onSaveProfile({
              displayName: formState.displayName,
              tagline: formState.tagline,
              location: formState.location,
              avatarInitials: formState.avatarInitials,
            })}
          >
            {saving ? 'MENYIMPAN...' : 'SIMPAN PROFIL'}
          </button>
          {status ? <div className="profile-status">{status}</div> : null}
        </section>
      ) : null}

      <section className="stats-grid">
        <article className="stat-card stat-card--reports">
          <div className="stat-card__icon">📤</div>
          <div><div className="stat-card__value">{statValues.totalContributions}</div><div className="stat-card__label">Total Laporan</div></div>
        </article>
        <article className="stat-card stat-card--accepted">
          <div className="stat-card__icon">✅</div>
          <div><div className="stat-card__value">{statValues.acceptedContributions}</div><div className="stat-card__label">Diterima</div></div>
        </article>
        <article className="stat-card stat-card--accuracy">
          <div className="stat-card__icon">🎯</div>
          <div><div className="stat-card__value">{Math.round(statValues.avgValidationScore * 100)}%</div><div className="stat-card__label">Akurasi</div></div>
        </article>
        <article className="stat-card stat-card--rank">
          <div className="stat-card__icon">🏆</div>
          <div><div className="stat-card__value">#{Math.max(1, 25 - Math.round(statValues.avgValidationScore * 10))}</div><div className="stat-card__label">Peringkat Desa</div></div>
        </article>
      </section>

      <section className="section-block">
        <h3 className="section-title">Pencapaian</h3>
        <div className="achievement-row">
          {(achievements || []).map((a) => (
            <article key={a.label} className={`achievement-card ${a.active ? 'achievement-card--active' : ''}`}>
              <span className="achievement-card__emoji" aria-hidden="true">{a.emoji}</span><span>{a.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="leaderboard-card">
        <div className="leaderboard-card__title"><Trophy size={22} /><h3>Top Pelapor Minggu Ini - Desamu</h3></div>
        <div className="leaderboard-list">
          {(leaderboard || []).length === 0 ? (
            <div className="empty-state">Belum ada data pelapor minggu ini.</div>
          ) : (
            (leaderboard || []).map((entry) => (
              <article key={entry.rank} className={`leaderboard-row ${entry.rank === 1 ? 'leaderboard-row--first' : ''}`}>
                <div className="leaderboard-row__rank">{entry.rank}</div>
                <div className="leaderboard-row__avatar" aria-hidden="true">{entry.avatar}</div>
                <div className="leaderboard-row__copy">
                  <div className="leaderboard-row__name">{entry.name}</div>
                  <div className="leaderboard-row__meta">{entry.reports}</div>
                </div>
                {entry.rank === 1 ? <Star size={18} /> : null}
              </article>
            ))
          )}
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
          <button key={tab.id} className={`bottom-nav__item ${active ? 'bottom-nav__item--active' : ''}`}
            type="button" onClick={() => onChange(tab.id)}>
            <Icon size={22} strokeWidth={active ? 2.4 : 2} /><span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default App;