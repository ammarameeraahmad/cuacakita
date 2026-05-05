import { runAgentLoop } from '../rag/agent-loop.js';
import { Document, Tool } from '../rag/types.js';
import { addClimateDocuments, searchClimateKnowledge } from './knowledge-base.js';
import { getWeatherSnapshot, WeatherSnapshot } from './bmkg.js';
import { getDashboardStats, recordContribution, recordQuery } from './dashboard-state.js';
import { saveContributionReport } from './reports.js';

function isRainQuestion(message: string) {
  const lower = message.toLowerCase();
  return lower.includes('hujan') || lower.includes('rain') || lower.includes('gerimis');
}

function buildCta(message: string) {
  return isRainQuestion(message)
    ? {
        topic: 'rainfall',
        prompt: 'Apakah di tempat kamu saat ini sedang hujan?',
        fields: ['rainfall_intensity'],
      }
    : {
        topic: 'general',
        prompt: 'Bantu kami dengan melaporkan kondisi cuaca terkini!',
        fields: ['general_condition'],
      };
}

function buildSources(weather: WeatherSnapshot, knowledgeHits: Document[]) {
  const sources = [
    {
      id: 'bmkg',
      title: weather.source === 'bmkg' ? 'BMKG Resmi' : 'Data Demo BMKG',
    },
  ];

  if (knowledgeHits.length > 0) {
    sources.push({ id: 'vector-store', title: 'Vector DB Search' });
  }

  return sources;
}

function buildTools(weather: WeatherSnapshot): Tool[] {
  return [
    {
      name: 'get_weather_info',
      description: 'Fetch current weather information from BMKG or fallback demo data.',
      execute: async () => JSON.stringify(weather),
    },
    {
      name: 'search_climate_knowledge',
      description: 'Search the knowledge base for climate-related information.',
      execute: async (input: string) => {
        const docs = await searchClimateKnowledge(input, 3);
        if (docs.length === 0) {
          return 'No specific climate information found.';
        }

        return docs.map((doc: Document) => `[${doc.metadata?.source ?? 'unknown'}] ${doc.content}`).join('\n');
      },
    },
  ];
}

function buildLocalChatAnswer(weather: WeatherSnapshot, knowledgeHits: Document[]) {
  const summary = `${weather.locationLabel} saat ini ${weather.current.description.toLowerCase()} dengan suhu ${weather.current.temperature}°C.`;
  const detail = `Kelembaban ${weather.current.humidity}% dan angin ${weather.current.windSpeed} km/j.`;
  const forecast = weather.forecast[0]
    ? `Prakiraan hari ini: ${weather.forecast[0].description.toLowerCase()} (maks ${weather.forecast[0].high}° / min ${weather.forecast[0].low}°).`
    : '';
  const knowledge = knowledgeHits.length > 0
    ? `Info tambahan: ${knowledgeHits.map((doc) => doc.content).slice(0, 2).join(' ')}`
    : '';

  return [summary, detail, forecast, knowledge].filter(Boolean).join(' ');
}

export async function createChatResponse(message: string, location?: string, locationHints: string[] = []) {
  await recordQuery();
  const weather = await getWeatherSnapshot(location, locationHints);
  const knowledgeHits = await searchClimateKnowledge(message, 3);
  const tools = buildTools(weather);
  const hasGroqKey = Boolean(process.env.GROQ_API_KEY);
  const response = hasGroqKey
    ? await runAgentLoop(message, tools, 3)
    : { finalAnswer: buildLocalChatAnswer(weather, knowledgeHits), conversationHistory: [], totalSteps: 0 };

  const cta = buildCta(message);
  const ctaText = cta.prompt ? `\n\n${cta.prompt}` : '';

  return {
    answer: `${response.finalAnswer}${ctaText}`,
    sources: buildSources(weather, knowledgeHits),
    cta: cta,
    weather,
  };
}

export async function createWeatherResponse(input?: { location?: string; locationHints?: string[] }) {
  return getWeatherSnapshot(input?.location, input?.locationHints ?? []);
}

export async function createContributionResponse(input: {
  location?: string;
  locationHints?: string[];
  conditions?: { temperature?: number; general_condition?: string; rainfall_intensity?: string };
  description?: string;
}) {
  const weather = await getWeatherSnapshot(input.location, input.locationHints ?? []);
  const submittedTemperature = Number(input.conditions?.temperature ?? weather.current.temperature);
  const tempDiff = Math.abs(submittedTemperature - weather.current.temperature);
  const validationScore = Math.max(0, 1 - tempDiff / 10);
  const accepted = tempDiff <= 3;

  await recordContribution(accepted, validationScore);

  if (accepted) {
    await addClimateDocuments([
      {
        id: `user_${Date.now()}`,
        content: `Laporan cuaca dari warga di ${input.location || weather.locationLabel}: ${input.description || input.conditions?.general_condition || 'laporan cuaca terkini'}`,
        metadata: { source: 'user_contributed', validation_score: Number(validationScore.toFixed(2)) },
      },
    ]);
  }

  await saveContributionReport({
    location: input.location || weather.locationLabel,
    description: input.description,
    conditions: input.conditions,
    status: accepted ? 'ACCEPTED' : 'REJECTED',
    validationScore: Number(validationScore.toFixed(2)),
  });

  return {
    status: accepted ? 'ACCEPTED' : 'REJECTED',
    message: accepted
      ? 'Data accepted and verified with BMKG data'
      : `Data significantly differs from official sensors (diff: ${tempDiff.toFixed(1)}C)`,
    validationScore: Number(validationScore.toFixed(2)),
    referenceWeather: weather,
  };
}

export async function getStatsResponse() {
  return getDashboardStats();
}
