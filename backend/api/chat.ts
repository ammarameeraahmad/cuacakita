import { createChatResponse } from '../src/lib/climsight.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, location } = req.body ?? {};

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await createChatResponse(message, location);

    return res.status(200).json({
      answer: response.answer,
      sources: response.sources,
      cta: response.cta,
      weather: response.weather,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
