import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  onValue,
  get,
  set,
  update,
} from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const firebaseEnabled = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.databaseURL &&
    firebaseConfig.projectId
);

const app = firebaseEnabled ? initializeApp(firebaseConfig) : null;
const db = app ? getDatabase(app) : null;

export function isFirebaseEnabled() {
  return Boolean(db);
}

export function subscribeStats(callback) {
  if (!db) return () => {};
  const statsRef = ref(db, 'stats/global');
  return onValue(statsRef, (snapshot) => {
    const value = snapshot.val();
    if (!value || typeof value !== 'object') {
      callback(null);
      return;
    }
    const total = Number(value.totalContributions || 0);
    const sum = Number(value.validationScoreSum || 0);
    const avgValidationScore = total > 0 ? Number((sum / total).toFixed(2)) : 0;
    callback({ ...value, avgValidationScore });
  });
}

export function subscribeProfile(userId, callback) {
  if (!db) return () => {};
  const profileRef = ref(db, `profiles/${userId}`);
  return onValue(profileRef, (snapshot) => callback(snapshot.val() || null));
}

export function subscribeLeaderboard(callback) {
  if (!db) return () => {};
  const leaderboardRef = ref(db, 'community/leaderboard');
  return onValue(leaderboardRef, (snapshot) => callback(snapshot.val() || []));
}

export function subscribeAchievements(callback) {
  if (!db) return () => {};
  const achievementRef = ref(db, 'community/achievements');
  return onValue(achievementRef, (snapshot) => callback(snapshot.val() || []));
}

export async function updateProfile(userId, payload) {
  if (!db) return;
  const profileRef = ref(db, `profiles/${userId}`);
  await update(profileRef, payload);
}

export async function bootstrapRealtimeData(defaults) {
  if (!db) return;

  const tasks = Object.entries(defaults).map(async ([path, value]) => {
    const nodeRef = ref(db, path);
    const snapshot = await get(nodeRef);
    if (!snapshot.exists()) {
      await set(nodeRef, value);
    }
  });

  await Promise.all(tasks);
}
