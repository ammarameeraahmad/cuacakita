import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { runAgentLoop } from './rag/agent-loop';
import { Tool, Document } from './rag/types';
import { MockVectorStore } from './rag/mock-vector-store';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Mock Vector Store with some initial climate knowledge based on plan.md
const vectorStore = new MockVectorStore();
vectorStore.addDocuments([
  { id: '1', content: 'El Nino increases drought risk in Indonesia.', metadata: { source: 'BMKG_report' } },
  { id: '2', content: 'La Nina brings heavier rainfall to the region.', metadata: { source: 'NASA_POWER' } },
  { id: '3', content: 'Rising sea levels threaten coastal cities like Jakarta.', metadata: { source: 'IPCC' } }
]);

// Mock Data for API (BMKG)
const MOCK_BMKG_DATA = {
  temperature: 32,
  humidity: 75,
  weather: 'Cloudy',
  precipitation: 'light', // to match plan.md concept
  timestamp: new Date().toISOString()
};

// Tools
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

// POST /api/chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message, location } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await runAgentLoop(message, tools, 5);

    // Generate mock CTA based on plan.md concept
    const isRainQuery = message.toLowerCase().includes('hujan') || message.toLowerCase().includes('rain');
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

    res.json({
      answer: response.finalAnswer,
      sources,
      cta
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/contribute
app.post('/api/contribute', async (req, res) => {
  const { location, conditions, description } = req.body;
  if (!conditions || typeof conditions.temperature !== 'number') {
    return res.status(400).json({ error: 'Invalid temperature data in conditions' });
  }

  // Validate user data against mock BMKG data (from plan.md concept)
  const tempDiff = Math.abs(conditions.temperature - MOCK_BMKG_DATA.temperature);

  if (tempDiff <= 3) {
    // Add user contribution to vector store as mentioned in plan
    await vectorStore.addDocuments([
      {
        id: `user_${Date.now()}`,
        content: `Laporan cuaca dari warga di ${location}: ${description || conditions.general_condition}`,
        metadata: { source: 'user_contributed', validation_score: 0.9 }
      }
    ]);
    res.json({ status: 'ACCEPTED', message: 'Data accepted and verified with BMKG data' });
  } else {
    res.json({ status: 'REJECTED', message: `Data significantly differs from official sensors (diff: ${tempDiff}C)` });
  }
});

// GET /api/stats
app.get('/api/stats', (req, res) => {
  res.json({
    totalQueries: 450,
    totalContributions: 1250,
    acceptedContributions: 1100,
    rejectedContributions: 150,
    activeUsers: 300,
    avgValidationScore: 0.85
  });
});

// Export for Vercel serverless function
export default app;

// Start local server only when run directly (not in Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
