import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, Timestamp, QueryConstraint } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getAuth, Auth, User } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAi9mhV1HFDs62d1uTyJzblYE-D5UH6S6g",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "prompt-engineer-13d50.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "prompt-engineer-13d50",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "prompt-engineer-13d50.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "902007722534",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:902007722534:web:2d2e48c155b55466148ce7",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-537BB829E8"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth | null = null;
let analytics: Analytics | null = null;
let db: Firestore;

// Only initialize Firebase on the client-side
if (typeof window !== 'undefined') {
  // Check if Firebase app is already initialized
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  // Initialize Firestore
  db = getFirestore(app);
}

// Lazy load Auth and Analytics to ensure they only run on the client
const getClientAuth = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  if (!auth && typeof window !== 'undefined') {
    auth = getAuth(app);
  }
  return auth;
};

const getClientAnalytics = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  if (!analytics && typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
  return analytics;
};

export { db, getClientAuth, getClientAnalytics };
export type { User };

// Helper functions to convert Firestore timestamps
export const convertTimestamp = (timestamp: any): string => {
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  return new Date().toISOString();
};

export const createTimestamp = (): Timestamp => {
  return Timestamp.now();
};

// Helper to convert Firestore document to plain object
export const docToData = (doc: any) => {
  if (!doc) return null;
  const data = doc.data();
  if (!data) return null;
  
  const result: any = { id: doc.id, ...data };
  
  // Convert all Timestamp fields to ISO strings
  Object.keys(result).forEach(key => {
    if (result[key] && typeof result[key] === 'object' && 'toDate' in result[key]) {
      result[key] = result[key].toDate().toISOString();
    }
  });
  
  return result;
};

// Collection names
export const COLLECTIONS = {
  CLIENTS: 'clients',
  SCENARIOS: 'scenarios',
  SIMULATION_RUNS: 'simulation_runs',
  FINAL_PROMPT_SUGGESTIONS: 'final_prompt_suggestions',
};

