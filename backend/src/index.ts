import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createChatResponse, createContributionResponse, createWeatherResponse, getStatsResponse } from './lib/climsight.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// POST /api/chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message, location, locationHints, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const hints = Array.isArray(locationHints) ? locationHints.filter(Boolean) : [];
    const conversationHistory = Array.isArray(history) ? history : [];
    const response = await createChatResponse(message, location, hints, conversationHistory);

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/weather
app.get('/api/weather', async (req, res) => {
  try {
    const location = typeof req.query.location === 'string' ? req.query.location : undefined;
    const hintKeys = ['adm4Hint', 'village', 'district', 'city', 'regency', 'province'];
    const locationHints = hintKeys
      .map((key) => (typeof req.query[key] === 'string' ? String(req.query[key]) : ''))
      .filter(Boolean);

    res.json(await createWeatherResponse({ location, locationHints }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/contribute
app.post('/api/contribute', async (req, res) => {
  try {
    res.json(await createContributionResponse(req.body ?? {}));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/stats
app.get('/api/stats', (req, res) => {
  getStatsResponse()
    .then((payload) => res.json(payload))
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
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
