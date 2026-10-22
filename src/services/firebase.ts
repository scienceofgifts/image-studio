import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDummyKeyForFallbackBuild12345',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'science-of-gifts.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'science-of-gifts',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'science-of-gifts.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:dummyAppId12345',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db: Firestore = getFirestore(app);

export function isFirebaseConfigured(): boolean {
  const key = import.meta.env.VITE_FIREBASE_API_KEY;
  return Boolean(key && key !== 'AIzaSyDummyKeyForFallbackBuild12345' && key.trim() !== '');
}
