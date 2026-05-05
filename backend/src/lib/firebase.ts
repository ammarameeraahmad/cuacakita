import admin from 'firebase-admin';

type FirebaseConfig = {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
  databaseURL?: string;
};

let firebaseApp: admin.app.App | null = null;

function getFirebaseConfig(): FirebaseConfig {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  return {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  };
}

export function isFirebaseConfigured() {
  const config = getFirebaseConfig();
  return Boolean(config.projectId && config.clientEmail && config.privateKey && config.databaseURL);
}

export function getFirebaseDb(): admin.database.Database | null {
  if (!isFirebaseConfigured()) return null;

  if (!firebaseApp) {
    const config = getFirebaseConfig();
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.projectId,
        clientEmail: config.clientEmail,
        privateKey: config.privateKey,
      }),
      databaseURL: config.databaseURL,
    });
  }

  return admin.database(firebaseApp);
}

export function getServerTimestamp() {
  return admin.database.ServerValue.TIMESTAMP;
}
