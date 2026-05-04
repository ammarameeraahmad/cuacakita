export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    totalQueries: 450,
    totalContributions: 1250,
    acceptedContributions: 1100,
    rejectedContributions: 150,
    activeUsers: 300,
    avgValidationScore: 0.85
  });
}
