import { runAgentLoop } from '../../src/rag/agent-loop';
import { Tool } from '../../src/rag/types';
import { MockVectorStore } from '../../src/rag/mock-vector-store';

const vectorStore = new MockVectorStore();
vectorStore.addDocuments([
  { id: '1', content: 'El Nino increases drought risk in Indonesia.', metadata: { source: 'BMKG_report' } },
  { id: '2', content: 'La Nina brings heavier rainfall to the region.', metadata: { source: 'NASA_POWER' } },
  { id: '3', content: 'Rising sea levels threaten coastal cities like Jakarta.', metadata: { source: 'IPCC' } }
]);

const MOCK_BMKG_DATA = {
  temperature: 32,
  humidity: 75,
  weather: 'Cloudy',
  precipitation: 'light',
  timestamp: new Date().toISOString()
};

const tools: Tool[] = [
  {
    name: 'get_weather_info',
    description: 'Fetch current weather information from mock BMKG.',
    execute: async (input: string) => {
      return JSON.stringify(MOCK_BMKG_DATA);
    }
  },
  {
    name: 'search_climate_knowledge',
    description: 'Search the knowledge base for climate-related information.',
    execute: async (input: string) => {
      const docs = await vectorStore.similaritySearch(input, 2);
      if (docs.length === 0) return "No specific climate information found.";
      return docs.map(d => `[${d.metadata?.source}] ${d.content}`).join('\n');
    }
  }
];

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await runAgentLoop(req.body.message, tools, 5);

    const isRainQuery = req.body.message?.toLowerCase().includes('hujan') || req.body.message?.toLowerCase().includes('rain');
    const cta = {
      topic: isRainQuery ? "rainfall" : "general",
      prompt: isRainQuery
        ? "Apakah di tempat kamu saat ini sedang hujan?"
        : "Bantu kami dengan melaporkan kondisi cuaca terkini!",
      fields: isRainQuery ? ["rainfall_intensity"] : ["general_condition"]
    };

    const sources = [
      { id: '1', title: 'BMKG Reference' },
      { id: '2', title: 'Vector DB Search' }
    ];

    return res.status(200).json({
      answer: response.finalAnswer,
      sources,
      cta
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
