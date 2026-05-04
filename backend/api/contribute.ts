import { MockVectorStore } from '../../src/rag/mock-vector-store';

const vectorStore = new MockVectorStore();

const MOCK_BMKG_DATA = {
  temperature: 32,
  humidity: 75,
  weather: 'Cloudy',
  precipitation: 'light',
  timestamp: new Date().toISOString()
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { location, conditions, description } = req.body;
  
  if (!conditions || typeof conditions.temperature !== 'number') {
    return res.status(400).json({ error: 'Invalid temperature data in conditions' });
  }

  const tempDiff = Math.abs(conditions.temperature - MOCK_BMKG_DATA.temperature);

  if (tempDiff <= 3) {
    await vectorStore.addDocuments([
      {
        id: `user_${Date.now()}`,
        content: `Laporan cuaca dari warga di ${location}: ${description || conditions.general_condition}`,
        metadata: { source: 'user_contributed', validation_score: 0.9 }
      }
    ]);
    return res.status(200).json({ status: 'ACCEPTED', message: 'Data accepted and verified with BMKG data' });
  } else {
    return res.status(200).json({ status: 'REJECTED', message: `Data significantly differs from official sensors (diff: ${tempDiff}C)` });
  }
}
