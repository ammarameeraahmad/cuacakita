import { createWeatherResponse } from '../src/lib/climsight.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const location = typeof req.query?.location === 'string' ? req.query.location : undefined;
    const hintKeys = ['adm4Hint', 'village', 'district', 'city', 'regency', 'province'];
    const locationHints = hintKeys
      .map((key) => (typeof req.query?.[key] === 'string' ? String(req.query[key]) : ''))
      .filter(Boolean);
    const weather = await createWeatherResponse({ location, locationHints });
    return res.status(200).json(weather);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
