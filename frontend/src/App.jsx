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

const fallbackWeather = {
  locationLabel: 'Desa Sukamaju, 12 Okt',
  subLabel: 'Senin, 30 Maret 2024',
  current: {
    temperature: 28,
    description: 'Hujan Ringan',
    humidity: 78,
    windSpeed: 12,
    visibility: 8,
    icon: '🌧️',
  },
  forecast: [
    { day: 'SEN', label: 'Senin', description: 'Hujan Ringan', icon: '🌧️', high: 28, low: 23, rainChance: 70 },
    { day: 'SEL', label: 'Selasa', description: 'Berawan', icon: '⛅', high: 30, low: 24, rainChance: 40 },
    { day: 'RAB', label: 'Rabu', description: 'Cerah', icon: '☀️', high: 32, low: 25, rainChance: 10 },
    { day: 'KAM', label: 'Kamis', description: 'Berawan', icon: '⛅', high: 31, low: 24, rainChance: 35 },
    { day: 'JUM', label: 'Jumat', description: 'Hujan Ringan', icon: '🌧️', high: 29, low: 23, rainChance: 60 },
  ],
  temperatureSeries: [28, 30, 32, 31, 29],
  rainfallSeries: [0, 12, 45, 20, 2],
  summary: 'Data BMKG belum tersedia, memakai data demo untuk Desa Sukamaju.',
};

function buildTemperatureGeometry(values) {
  const safeValues = values && values.length >= 2 ? values : [28, 30, 32, 31, 29];
  const maxValue = Math.max(...safeValues);
  const minValue = Math.min(...safeValues);
  const range = Math.max(maxValue - minValue, 1);
  const step = 100 / (safeValues.length - 1);
  const padTop = 18;
  const padBottom = 82;
  const points = safeValues.map((value, index) => {
    const x = index * step;
    const y = padBottom - ((value - minValue) / range) * (padBottom - padTop);
    return { x, y, value };
  });

  let linePath = `M${points[0].x},${points[0].y}`;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const midX = (previous.x + current.x) / 2;
    linePath += ` Q${midX},${previous.y} ${current.x},${current.y}`;
  }

  const areaPath = `${linePath} L${points[points.length - 1].x},100 L${points[0].x},100 Z`;

  const maxIndex = safeValues.indexOf(maxValue);
  const minIndex = safeValues.indexOf(minValue);

  return { points, linePath, areaPath, maxIndex, minIndex, maxValue, minValue };
}

function App() {
  const [activeTab, setActiveTab] = useState('beranda');
  const [weather, setWeather] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeRange, setActiveRange] = useState('7 Hari');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Tanya apa saja tentang cuaca di desa kamu.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [reportState, setReportState] = useState({
    location: 'Sleman, Yogyakarta',
    condition: 'Hujan',
    intensity: 'Sedang',
    temperature: 28,
    description: '',
  });
  const [reportStatus, setReportStatus] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const [weatherResponse, statsResponse] = await Promise.allSettled([
          getWeather('Desa Sukamaju, 12 Okt'),
          getStats(),
        ]);

        if (!cancelled && weatherResponse.status === 'fulfilled') {
          setWeather(weatherResponse.value);
        }

        if (!cancelled && statsResponse.status === 'fulfilled') {
          setStats(statsResponse.value);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSendChat = async (message) => {
    const text = message.trim();

    if (!text || chatLoading) {
      return;
    }

    setChatLoading(true);
    setChatMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: 'user', content: text },
    ]);

    try {
      const response = await sendChat(text, weather?.locationLabel || 'Desa Sukamaju, 12 Okt');
      setChatMessages((current) => [
        ...current,
        { id: `assistant-${Date.now()}`, role: 'assistant', content: response.answer },
      ]);
    } catch (error) {
      console.error(error);
      setChatMessages((current) => [
        ...current,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Maaf, AI sedang tidak bisa dihubungi. Coba lagi beberapa saat.',
        },
      ]);
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
      setUserLocation(location);

      // Update report location too
      setReportState((current) => ({ ...current, location: location.locationLabel }));

      // Reload weather for the new location
      try {
        const weatherData = await getWeather(location.locationLabel);
        setWeather(weatherData);
      } catch (err) {
        console.error('Gagal memuat cuaca untuk lokasi:', err);
        setLocationError('Gagal memuat data cuaca untuk lokasi Anda.');
      }
    } catch (error) {
      console.error(error);
      setLocationError(error.message);
    } finally {
      setLocationLoading(false);
    }
  }, [locationLoading]);

  const handleSubmitReport = async () => {
    if (reportLoading) {
      return;
    }

    setReportLoading(true);
    setReportStatus('Mengirim laporan...');

    try {
      const response = await submitContribution({
        location: reportState.location,
        description: `Kondisi ${reportState.condition.toLowerCase()} dengan intensitas ${reportState.intensity.toLowerCase()}`,
        conditions: {
          temperature: reportState.temperature,
          general_condition: reportState.condition,
          rainfall_intensity: reportState.intensity,
        },
      });

      setReportStatus(response.message);
    } catch (error) {
      console.error(error);
      setReportStatus('Gagal mengirim laporan.');
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <TopBar
        activeTab={activeTab}
        weather={weather}
        locationLoading={locationLoading}
        locationError={locationError}
        onUseLocation={handleUseLocation}
      />
      <main className="app-content">
        {activeTab === 'beranda' && (
          <HomeScreen
            weather={weather}
            locationLoading={locationLoading}
            locationError={locationError}
            onUseLocation={handleUseLocation}
          />
        )}
        {activeTab === 'tanya' && (
          <ChatScreen
            messages={chatMessages}
            inputValue={chatInput}
            loading={chatLoading}
            onInputChange={setChatInput}
            onSubmit={handleSendChat}
          />
        )}
        {activeTab === 'laporan' && (
          <ReportScreen
            weather={weather}
            reportState={reportState}
            onChangeReportState={setReportState}
            onSubmit={handleSubmitReport}
            status={reportStatus}
            loading={reportLoading}
          />
        )}
        {activeTab === 'data' && (
          <DataScreen weather={weather} stats={stats} activeRange={activeRange} onRangeChange={setActiveRange} />
        )}
        {activeTab === 'profil' && <ProfileScreen stats={stats} weather={weather} />}
      </main>
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}

function TopBar({ activeTab, weather, locationLoading, locationError, onUseLocation }) {
  const isChat = activeTab === 'tanya';
  const isReport = activeTab === 'laporan';
  const activeWeather = weather || fallbackWeather;

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
            <h1 className="top-bar__title">{activeWeather.locationLabel}</h1>
            {!isReport && <p className="top-bar__subtitle">{activeWeather.subLabel}</p>}
          </div>
        </div>
        {!isReport ? (
          <button
            className={`locate-btn ${locationLoading ? 'locate-btn--loading' : ''}`}
            type="button"
            onClick={onUseLocation}
            disabled={locationLoading}
            aria-label="Gunakan lokasi saya"
            title="Gunakan lokasi saya"
          >
            {locationLoading ? (
              <span className="locate-btn__spinner" />
            ) : (
              <Navigation size={20} strokeWidth={2.3} />
            )}
          </button>
        ) : null}
      </div>
    </header>
  );
}

function HomeScreen({ weather, locationLoading, locationError, onUseLocation }) {
  const snapshot = weather || fallbackWeather;

  return (
    <div className="screen screen--home">
      {locationError ? (
        <div className="location-status location-status--error">
          <span className="location-status__icon">⚠️</span>
          <span>{locationError}</span>
        </div>
      ) : locationLoading ? (
        <div className="location-status location-status--loading">
          <span className="location-status__icon">📍</span>
          <span>Mendapatkan lokasi Anda...</span>
        </div>
      ) : null}

      <section className="hero-card">
        <div className="hero-card__copy">
          <div className="hero-card__temp">{snapshot.current.temperature}°C</div>
          <div className="hero-pill">
            {snapshot.current.description.toUpperCase()} <span aria-hidden="true">{snapshot.current.icon}</span>
          </div>
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
          <article className="metric-card">
            <Droplets className="metric-card__icon" size={28} />
            <h2>Kelembaban</h2>
            <p>{snapshot.current.humidity}%</p>
          </article>
          <article className="metric-card">
            <Wind className="metric-card__icon" size={28} />
            <h2>Angin</h2>
            <p>{snapshot.current.windSpeed} km/j</p>
          </article>
          <article className="metric-card">
            <Eye className="metric-card__icon" size={28} />
            <h2>Jarak pandang</h2>
            <p>{snapshot.current.visibility} km</p>
          </article>
        </div>
      </section>

      <section className="section-block">
        <h2 className="section-title">Prakiraan 5 Hari</h2>
        <div className="forecast-row">
          {snapshot.forecast.map(({ day, icon, high, low }) => (
            <article key={day} className="forecast-card">
              <span className="forecast-card__day">{day}</span>
              <span className="forecast-card__icon" aria-hidden="true">{icon}</span>
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
            <span className="chip__emoji" aria-hidden="true">{prompt.emoji}</span>
            <span>{prompt.label}</span>
          </button>
        ))}
      </div>

      <div className="chat-thread">
        {messages.map((message) =>
          message.role === 'user' ? (
            <div key={message.id} className="chat-bubble chat-bubble--user">
              {message.content}
            </div>
          ) : (
            <div key={message.id} className="chat-message-row">
              <div className="bot-avatar" aria-hidden="true">
                <Bot size={28} />
              </div>
              <div className="chat-bubble chat-bubble--bot">{message.content}</div>
            </div>
          )
        )}

        {loading ? (
          <div className="chat-message-row">
            <div className="bot-avatar" aria-hidden="true">
              <Bot size={28} />
            </div>
            <div className="chat-bubble chat-bubble--bot">Sedang menganalisis data BMKG dan pengetahuan cuaca...</div>
          </div>
        ) : null}

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
          <input
            type="text"
            placeholder="Ketik atau tekan mic..."
            value={inputValue}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onSubmit(inputValue);
              }
            }}
          />
        </label>
        <button className="composer__send" type="button" aria-label="Kirim pesan" onClick={() => onSubmit(inputValue)}>
          <Send size={22} />
        </button>
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
        <button
          className="primary-button"
          type="button"
          onClick={() => onChangeReportState((current) => ({ ...current, location: snapshot.locationLabel }))}
        >
          Gunakan Lokasi Saya <span aria-hidden="true">📍</span>
        </button>
      </section>

      <section className="report-card">
        <h3>Langkah 2: Kondisi</h3>
        <div className="weather-grid weather-grid--report">
          {weatherOptions.map((option) => (
            <button
              key={option.label}
              className={`weather-tile weather-tile--report ${reportState.condition === option.label ? 'weather-tile--active' : ''}`}
              type="button"
              onClick={() => onChangeReportState((current) => ({ ...current, condition: option.label }))}
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
                className={`pill-option ${reportState.intensity === item.label ? 'pill-option--active' : ''}`}
                type="button"
                onClick={() => onChangeReportState((current) => ({ ...current, intensity: item.label }))}
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
            <button
              className="round-control"
              type="button"
              aria-label="Kurangi suhu"
              onClick={() => onChangeReportState((current) => ({ ...current, temperature: Math.max(16, current.temperature - 1) }))}
            >
              <Minus size={24} />
            </button>
            <div className="temperature-control__value">{reportState.temperature}°C</div>
            <button
              className="round-control"
              type="button"
              aria-label="Tambah suhu"
              onClick={() => onChangeReportState((current) => ({ ...current, temperature: Math.min(45, current.temperature + 1) }))}
            >
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
  const tempGeo = buildTemperatureGeometry(snapshot.temperatureSeries);
  const rainSeries = snapshot.rainfallSeries && snapshot.rainfallSeries.length
    ? snapshot.rainfallSeries
    : [0, 12, 45, 20, 2];
  const maxRain = Math.max(...rainSeries, 1);
  const totalRain = rainSeries.reduce((acc, value) => acc + value, 0);
  const peakRainIndex = rainSeries.indexOf(Math.max(...rainSeries));
  const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const todayIndex = Math.min(2, rainSeries.length - 1);

  const rainfall = rainSeries.map((value, index) => {
    const ratio = value / maxRain;
    let tone = 'muted';
    if (ratio >= 0.75) tone = 'strong';
    else if (ratio >= 0.45) tone = 'medium';
    else if (ratio >= 0.15) tone = 'soft';

    return {
      label: dayLabels[index] || `H${index + 1}`,
      value: String(value),
      ratio,
      tone,
      isToday: index === todayIndex,
      isPeak: index === peakRainIndex && value > 0,
    };
  });

  const avgTemp = Math.round(
    snapshot.temperatureSeries.reduce((acc, value) => acc + value, 0) /
      Math.max(1, snapshot.temperatureSeries.length)
  );
  const peakTempDay = snapshot.forecast?.[tempGeo.maxIndex]?.day || dayLabels[tempGeo.maxIndex];
  const peakRainDay = snapshot.forecast?.[peakRainIndex]?.day || dayLabels[peakRainIndex];

  const totalReports = stats?.totalContributions ?? 128;
  const accepted = stats?.acceptedContributions ?? 110;
  const coverage = Math.max(35, Math.min(98, Math.round((accepted / Math.max(totalReports, 1)) * 100)));

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
            <button
              key={range}
              type="button"
              role="tab"
              aria-selected={activeRange === range}
              className={`time-tab ${activeRange === range ? 'time-tab--active' : ''}`}
              onClick={() => onRangeChange(range)}
            >
              {range}
            </button>
          ))}
        </div>
      </header>

      <section className="data-highlights">
        <article className="highlight-card highlight-card--temp">
          <div className="highlight-card__icon"><Thermometer size={20} /></div>
          <div className="highlight-card__label">Rata-rata Suhu</div>
          <div className="highlight-card__value">{avgTemp}°C</div>
          <div className="highlight-card__hint">Tertinggi {tempGeo.maxValue}° · {peakTempDay}</div>
        </article>
        <article className="highlight-card highlight-card--rain">
          <div className="highlight-card__icon"><CloudRain size={20} /></div>
          <div className="highlight-card__label">Total Curah Hujan</div>
          <div className="highlight-card__value">{totalRain}<span>mm</span></div>
          <div className="highlight-card__hint">Puncak {Math.max(...rainSeries)}mm · {peakRainDay}</div>
        </article>
        <article className="highlight-card highlight-card--reports">
          <div className="highlight-card__icon"><Trophy size={20} /></div>
          <div className="highlight-card__label">Laporan Warga</div>
          <div className="highlight-card__value">{totalReports}</div>
          <div className="highlight-card__hint">Akurasi {Math.round((stats?.avgValidationScore ?? 0.85) * 100)}%</div>
        </article>
      </section>

      <section className="chart-card chart-card--temperature">
        <div className="chart-card__header">
          <div className="chart-card__heading">
            <h3>Suhu Harian</h3>
            <span className="chart-card__sub">{tempGeo.minValue}° – {tempGeo.maxValue}° Celsius</span>
          </div>
          <div className="chart-card__icon-circle chart-card__icon-circle--warm">
            <Thermometer size={20} />
          </div>
        </div>

        <div className="temperature-chart">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="temperature-chart__svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="tempLineGradient" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#005d90" />
                <stop offset="50%" stopColor="#a95f00" />
                <stop offset="100%" stopColor="#005d90" />
              </linearGradient>
              <linearGradient id="tempAreaGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#a95f00" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#005d90" stopOpacity="0" />
              </linearGradient>
            </defs>

            {[0, 25, 50, 75].map((y) => (
              <line
                key={y}
                x1="0"
                x2="100"
                y1={y + 12}
                y2={y + 12}
                stroke="#e0e2e8"
                strokeWidth="0.4"
                strokeDasharray="1.2 1.6"
              />
            ))}

            <path d={tempGeo.areaPath} fill="url(#tempAreaGradient)" />
            <path
              d={tempGeo.linePath}
              fill="none"
              stroke="url(#tempLineGradient)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {tempGeo.points.map((point, index) => {
              const isPeak = index === tempGeo.maxIndex;
              const isLow = index === tempGeo.minIndex;
              return (
                <g key={`${point.x}-${index}`}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isPeak || isLow ? 2.6 : 1.6}
                    fill={isPeak ? '#a95f00' : isLow ? '#005d90' : '#ffffff'}
                    stroke={isPeak ? '#a95f00' : '#005d90'}
                    strokeWidth="1"
                  />
                </g>
              );
            })}
          </svg>

          {tempGeo.points.map((point, index) => {
            if (index !== tempGeo.maxIndex && index !== tempGeo.minIndex) return null;
            const isPeak = index === tempGeo.maxIndex;
            return (
              <div
                key={`bubble-${index}`}
                className={`temp-bubble ${isPeak ? 'temp-bubble--high' : 'temp-bubble--low'}`}
                style={{
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                }}
              >
                {point.value}°
              </div>
            );
          })}

          {tempGeo.points[todayIndex] && (
            <div
              className="today-marker"
              style={{ left: `${tempGeo.points[todayIndex].x}%` }}
            />
          )}
        </div>

        <div className="axis-labels">
          {snapshot.forecast.map((day, index) => (
            <span
              key={`${day.day}-${index}`}
              className={index === todayIndex ? 'axis-labels__active' : ''}
            >
              {day.day}
              {index === todayIndex && <small> Kini</small>}
            </span>
          ))}
        </div>
      </section>

      <section className="chart-card chart-card--rain">
        <div className="chart-card__header">
          <div className="chart-card__heading">
            <h3>Curah Hujan</h3>
            <span className="chart-card__sub">{totalRain}mm dalam {rainSeries.length} hari</span>
          </div>
          <div className="chart-card__icon-circle chart-card__icon-circle--cool">
            <CloudRain size={20} />
          </div>
        </div>

        <div className="rain-chart">
          {rainfall.map((bar, index) => (
            <div key={`${bar.label}-${index}`} className="rain-bar">
              <div className="rain-bar__value-wrap">
                <Droplets
                  className={`rain-bar__icon rain-bar__icon--${bar.tone}`}
                  size={14}
                />
                <span className={`rain-bar__value rain-bar__value--${bar.tone}`}>
                  {bar.value}
                </span>
              </div>
              <div className="rain-bar__track">
                <div
                  className={`rain-bar__fill rain-bar__fill--${bar.tone} ${bar.isPeak ? 'rain-bar__fill--peak' : ''}`}
                  style={{ height: `${Math.max(6, bar.ratio * 100)}%` }}
                />
              </div>
              <span className={`rain-bar__label ${bar.isToday ? 'rain-bar__label--active' : ''}`}>
                {bar.label}
              </span>
            </div>
          ))}
        </div>

        <div className="rain-legend">
          <span className="rain-legend__item"><span className="rain-legend__dot rain-legend__dot--muted" /> Cerah</span>
          <span className="rain-legend__item"><span className="rain-legend__dot rain-legend__dot--soft" /> Ringan</span>
          <span className="rain-legend__item"><span className="rain-legend__dot rain-legend__dot--medium" /> Sedang</span>
          <span className="rain-legend__item"><span className="rain-legend__dot rain-legend__dot--strong" /> Lebat</span>
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

        <div className="reports-card__meta">
          <span>Cakupan Wilayah</span>
          <span className="reports-card__value">{coverage}%</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-track__fill"
            style={{ width: `${coverage}%` }}
          />
        </div>

        <div className="reports-card__footer">
          <div className="coverage-pill">
            <span aria-hidden="true">🗺️</span>
            <span>{coverage >= 80 ? 'Wilayahmu sudah terlindungi' : 'Ajak warga lain untuk melapor'}</span>
          </div>
          {snapshot.summary && (
            <p className="reports-card__summary">{snapshot.summary}</p>
          )}
        </div>
      </section>
    </div>
  );
}

function ProfileScreen({ stats, weather }) {
  const snapshot = weather || fallbackWeather;
  const statValues = stats || {
    totalQueries: 450,
    totalContributions: 1250,
    acceptedContributions: 1100,
    rejectedContributions: 150,
    activeUsers: 300,
    avgValidationScore: 0.85,
  };

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
            <div className="stat-card__value">{statValues.totalContributions}</div>
            <div className="stat-card__label">Total Laporan</div>
          </div>
        </article>
        <article className="stat-card stat-card--accepted">
          <div className="stat-card__icon">✅</div>
          <div>
            <div className="stat-card__value">{statValues.acceptedContributions}</div>
            <div className="stat-card__label">Diterima</div>
          </div>
        </article>
        <article className="stat-card stat-card--accuracy">
          <div className="stat-card__icon">🎯</div>
          <div>
            <div className="stat-card__value">{Math.round(statValues.avgValidationScore * 100)}%</div>
            <div className="stat-card__label">Akurasi</div>
          </div>
        </article>
        <article className="stat-card stat-card--rank">
          <div className="stat-card__icon">🏆</div>
          <div>
            <div className="stat-card__value">#{Math.max(1, 25 - Math.round(statValues.avgValidationScore * 10))}</div>
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
                <div className="leaderboard-row__meta">{entry.reports} • {snapshot.current.description}</div>
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
