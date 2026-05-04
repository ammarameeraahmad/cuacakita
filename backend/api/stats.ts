import { getStatsResponse } from '../src/lib/climsight.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json(getStatsResponse());
}
