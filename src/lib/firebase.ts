import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, update } from 'firebase/database';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { FirebaseConfig } from '../types';

// Raw default config extracted from user code
export const DEFAULT_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyBJrTr26VT5CDDjl6PVITTGqlENAi3Kv8s",
  authDomain: "home-automation-33f31.firebaseapp.com",
  databaseURL: "https://home-automation-33f31-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "home-automation-33f31",
  storageBucket: "home-automation-33f31.firebasestorage.app",
  messagingSenderId: "556537662644",
  appId: "1:556537662644:web:2dfc9d9970f9b5a9105be1",
  email: "aislam12mr92@gmail.com",
  password: "md.atiqul??77"
};

// Retrieve from localStorage or fallback
export function getSavedConfig(): FirebaseConfig {
  const saved = localStorage.getItem('relay_hub_firebase_config');
  if (saved) {
    try {
      return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    } catch {
      return DEFAULT_CONFIG;
    }
  }
  return DEFAULT_CONFIG;
}

export function saveConfig(config: FirebaseConfig) {
  localStorage.setItem('relay_hub_firebase_config', JSON.stringify(config));
}

export function initFirebase(config: FirebaseConfig) {
  // Clear any existing apps to avoid re-init error with new credentials
  const apps = getApps();
  for (const app of apps) {
    deleteApp(app).catch(err => console.error("Error deleting old firebase app instance", err));
  }

  const app = initializeApp({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    databaseURL: config.databaseURL,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId
  });

  const auth = getAuth(app);
  const db = getDatabase(app);

  return { app, auth, db };
}
