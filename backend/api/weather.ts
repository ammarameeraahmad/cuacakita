import { createWeatherResponse } from '../src/lib/climsight.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const location = typeof req.query?.location === 'string' ? req.query.location : undefined;
    const weather = await createWeatherResponse(location);
    return res.status(200).json(weather);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
