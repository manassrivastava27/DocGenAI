import * as firebaseApp from "firebase/app";
import { getFirestore } from "firebase/firestore";
import * as firebaseAuth from "firebase/auth";

// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------
// We use Vite environment variables (import.meta.env) to keep keys secure.
// Please create a .env file in your project root to set these values.
// ------------------------------------------------------------------

const getEnvVar = (key: string): string => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  return "";
};

const firebaseConfig = {
  apiKey: "AIzaSyCaPrma3qQ8oaDVTeiaVph75spGecJkxR4",
  authDomain: "docgenai-22bet10039.firebaseapp.com",
  projectId: "docgenai-22bet10039",
  storageBucket:  "docgenai-22bet10039.firebasestorage.app",
  messagingSenderId: "529534419754",
  appId: "1:529534419754:web:904d00bf8e3488137e1453",
};

// Check if config is valid (i.e. not empty)
export const isConfigValid = () => {
  const isValid = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";
  if (!isValid) {
      console.warn("Firebase config appears invalid:", firebaseConfig);
  }
  return isValid;
};

// Initialize Firebase
// Fix for "Module has no exported member" errors
const initializeApp = (firebaseApp as any).initializeApp;
const getAuth = (firebaseAuth as any).getAuth;

const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
export const db = getFirestore(app);
export const auth = getAuth(app);