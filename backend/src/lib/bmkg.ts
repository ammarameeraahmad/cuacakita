type RawBmkgForecast = {
  local_datetime?: string;
  weather_desc?: string;
  t?: string | number;
  hu?: string | number;
  ws?: string | number;
  vs_text?: string;
  image?: string;
};

type BmkgApiResponse = {
  lokasi?: {
    desa?: string;
    kecamatan?: string;
    kotkab?: string;
    provinsi?: string;
    lat?: string | number;
    lon?: string | number;
    timezone?: string;
  };
  data?: Array<{
    cuaca?: Array<RawBmkgForecast[] | RawBmkgForecast>;
  }>;
};

export type WeatherDay = {
  day: string;
  label: string;
  description: string;
  icon: string;
  high: number;
  low: number;
  rainChance: number;
};

export type WeatherSnapshot = {
  source: 'bmkg' | 'fallback';
  locationLabel: string;
  subLabel: string;
  current: {
    temperature: number;
    description: string;
    humidity: number;
    windSpeed: number;
    visibility: number;
    icon: string;
  };
  forecast: WeatherDay[];
  temperatureSeries: number[];
  rainfallSeries: number[];
  summary: string;
};

const FALLBACK_SNAPSHOT: WeatherSnapshot = {
  source: 'fallback',
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

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function toNumber(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function weatherEmoji(description: string): string {
  const lower = description.toLowerCase();

  if (lower.includes('hujan') || lower.includes('gerimis')) return '🌧️';
  if (lower.includes('badai') || lower.includes('petir')) return '⛈️';
  if (lower.includes('kabut') || lower.includes('asap')) return '🌫️';
  if (lower.includes('cerah') || lower.includes('panas')) return '☀️';
  if (lower.includes('berawan') || lower.includes('mendung')) return '⛅';
  if (lower.includes('angin')) return '💨';

  return '☁️';
}

function rainChanceFromDescription(description: string): number {
  const lower = description.toLowerCase();
  if (lower.includes('hujan deras')) return 90;
  if (lower.includes('hujan')) return 70;
  if (lower.includes('gerimis')) return 55;
  if (lower.includes('berawan')) return 35;
  if (lower.includes('cerah')) return 10;
  return 25;
}

function buildFallbackSnapshot(locationLabel?: string): WeatherSnapshot {
  return {
    ...FALLBACK_SNAPSHOT,
    locationLabel: locationLabel || FALLBACK_SNAPSHOT.locationLabel,
  };
}

function parseLocationLabel(location: BmkgApiResponse['lokasi'] | undefined, fallbackLabel?: string) {
  if (!location) {
    return fallbackLabel || FALLBACK_SNAPSHOT.locationLabel;
  }

  const parts = [location.desa, location.kecamatan, location.kotkab].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(', ');
  }

  return fallbackLabel || FALLBACK_SNAPSHOT.locationLabel;
}

function flattenForecastGroups(cuaca?: Array<RawBmkgForecast[] | RawBmkgForecast>) {
  const groups = Array.isArray(cuaca) ? cuaca : [];

  return groups.flatMap((group) => (Array.isArray(group) ? group : [group]));
}

function groupForecastByDate(periods: RawBmkgForecast[]) {
  const groups = new Map<string, RawBmkgForecast[]>();

  for (const period of periods) {
    const rawDate = period.local_datetime || '';
    const dateKey = rawDate.slice(0, 8) || 'unknown';
    const bucket = groups.get(dateKey) || [];
    bucket.push(period);
    groups.set(dateKey, bucket);
  }

  return Array.from(groups.values());
}

function formatDayFromDatetime(localDatetime?: string, index: number = 0): string {
  if (!localDatetime || localDatetime.length < 8) {
    return DAY_NAMES[(new Date().getDay() + index) % DAY_NAMES.length];
  }

  const year = Number(localDatetime.slice(0, 4));
  const month = Number(localDatetime.slice(4, 6)) - 1;
  const day = Number(localDatetime.slice(6, 8));
  const date = new Date(Date.UTC(year, month, day));

  if (Number.isNaN(date.getTime())) {
    return DAY_NAMES[(new Date().getDay() + index) % DAY_NAMES.length];
  }

  return DAY_NAMES[date.getUTCDay()] || DAY_NAMES[index % DAY_NAMES.length];
}

function buildForecast(periodGroups: RawBmkgForecast[][]): WeatherDay[] {
  return periodGroups.slice(0, 5).map((group, index) => {
    const first = group[0] || {};
    const temperatures = group.map((period) => toNumber(period.t, 28));
    const descriptions = group
      .map((period) => period.weather_desc || '')
      .filter(Boolean);
    const description = descriptions[0] || 'Berawan';

    return {
      day: DAY_NAMES[(new Date().getDay() + index) % DAY_NAMES.length],
      label: formatDayFromDatetime(first.local_datetime, index),
      description,
      icon: weatherEmoji(description),
      high: temperatures.length > 0 ? Math.max(...temperatures) : FALLBACK_SNAPSHOT.current.temperature + index,
      low: temperatures.length > 0 ? Math.min(...temperatures) : FALLBACK_SNAPSHOT.current.temperature - 5 + index,
      rainChance: Math.max(...group.map((period) => rainChanceFromDescription(period.weather_desc || ''))),
    };
  });
}

export async function getWeatherSnapshot(locationLabel?: string): Promise<WeatherSnapshot> {
  const apiUrl = process.env.BMKG_API_URL || `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${process.env.BMKG_ADM4_CODE || '31.71.01.1001'}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`BMKG request failed (${response.status})`);
    }

    const payload = (await response.json()) as BmkgApiResponse;
    const periods = flattenForecastGroups(payload?.data?.[0]?.cuaca);
    const groupedPeriods = groupForecastByDate(periods);

    if (groupedPeriods.length === 0) {
      throw new Error('BMKG response does not contain forecast data');
    }

    const forecast = buildForecast(groupedPeriods);
    const currentPeriod = groupedPeriods[0][0] || {};
    const currentDescription = currentPeriod.weather_desc || forecast[0]?.description || 'Berawan';
    const currentTemperature = toNumber(currentPeriod.t, forecast[0]?.high ?? 28);
    const currentHumidity = toNumber(currentPeriod.hu, 78);
    const currentWind = toNumber(currentPeriod.ws, 12);
    const currentVisibility = currentPeriod.vs_text ? Number.parseFloat(String(currentPeriod.vs_text).replace(/[^0-9.]/g, '')) || 8 : 8;
    const location = parseLocationLabel(payload.lokasi, locationLabel);
    const subLabel = payload.lokasi?.timezone ? `Zona waktu ${payload.lokasi.timezone}` : 'Data resmi BMKG';

    return {
      source: 'bmkg',
      locationLabel: location,
      subLabel,
      current: {
        temperature: currentTemperature,
        description: currentDescription,
        humidity: currentHumidity,
        windSpeed: currentWind,
        visibility: currentVisibility,
        icon: weatherEmoji(currentDescription),
      },
      forecast,
      temperatureSeries: forecast.map((entry) => entry.high),
      rainfallSeries: forecast.map((entry) => entry.rainChance),
      summary: `${location} diperkirakan ${currentDescription.toLowerCase()} dengan suhu ${currentTemperature}°C.`,
    };
  } catch (error) {
    console.error('[BMKG] Falling back to demo data:', error);
    return buildFallbackSnapshot(locationLabel);
  }
}
