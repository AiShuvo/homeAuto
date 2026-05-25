export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  email?: string;
  password?: string;
}

export interface RelayItem {
  id: number; // 1 to 12
  key: string; // R1 to R12
  name: string; // From Names/N1
  state: boolean; // From Relay/R1
  locked: boolean; // From Lock/L1
  irCode?: string; // From Remote/C1
}

export interface AppState {
  relays: RelayItem[];
  lastHex: string;
  offlineLock: boolean;
  connected: boolean;
  loading: boolean;
  error: string | null;
  authStatus: 'unauthenticated' | 'authenticating' | 'authenticated' | 'error';
}
