import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Configuration Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBMgyg_KLqvZIxViT_qzgxtEHHEp8dkbGU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "omnitask-9aceb.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "omnitask-9aceb",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "omnitask-9aceb.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "531435434202",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:531435434202:web:34a8a4c9f59a661665b5e3",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-RD63ZQPQT2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth providers
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Analytics (only in browser and production)
export const initAnalytics = async () => {
  if (await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};

export default app;
