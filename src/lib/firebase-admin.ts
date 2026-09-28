import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

let firebaseConfig: any = {};
try {
  const configPath = join(process.cwd(), 'firebase-applet-config.json');
  if (existsSync(configPath)) {
    firebaseConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
  }
} catch (e) {
  console.warn('Notice: Could not load firebase-applet-config.json:', e);
}

const projectId = firebaseConfig.projectId || process.env.VITE_FIREBASE_PROJECT_ID || 'trans-anchor-459915-q9';
const databaseId = firebaseConfig.firestoreDatabaseId || process.env.VITE_FIREBASE_DATABASE_ID || 'ai-studio-gravvyfoodgrocer-26f18fd7-f5e1-4a47-9d2c-df0338a889fa';

// Credentials for a real (non-Google-hosted) server. Provide ONE of:
//  - FIREBASE_SERVICE_ACCOUNT_JSON : the whole service-account JSON as a single line
//  - FIREBASE_ADMIN_CLIENT_EMAIL + FIREBASE_ADMIN_PRIVATE_KEY
//  - GOOGLE_APPLICATION_CREDENTIALS : path to the JSON file (handled by Google's default credentials)
function buildCredential() {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      return cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
    }
    if (process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      return cert({
        projectId,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      });
    }
  } catch (e) {
    console.error('Invalid Firebase admin credentials in environment:', e);
  }
  return undefined; // falls back to Application Default Credentials
}

const credential = buildCredential();
if (!credential && process.env.NODE_ENV === 'production' && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.warn('WARNING: no Firebase admin credentials set - Firestore writes will fail.');
}

const app = getApps().length > 0
  ? getApps()[0]
  : initializeApp(credential ? { projectId, credential } : { projectId });

export const adminAuth = getAuth(app);

export const adminDb = databaseId
  ? getFirestore(app, databaseId)
  : getFirestore(app);

try {
  adminDb.settings({ ignoreUndefinedProperties: true });
} catch { }

