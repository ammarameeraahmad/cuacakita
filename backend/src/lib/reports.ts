import { getFirebaseDb, getServerTimestamp } from './firebase.js';

export type ContributionReport = {
  location?: string;
  description?: string;
  conditions?: {
    temperature?: number;
    general_condition?: string;
    rainfall_intensity?: string;
  };
  status: 'ACCEPTED' | 'REJECTED';
  validationScore: number;
};

export async function saveContributionReport(report: ContributionReport) {
  const db = getFirebaseDb();
  if (!db) return null;

  const ref = db.ref('reports').push();
  await ref.set({
    ...report,
    createdAt: getServerTimestamp(),
  });

  return ref.key;
}
