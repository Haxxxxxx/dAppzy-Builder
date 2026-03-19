import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, doc, getDoc } from "firebase/firestore";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAI, GoogleAIBackend } from "firebase/ai";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(() => {});
const storage = getStorage(app);
const ai = getAI(app, { backend: new GoogleAIBackend() });

export { setDoc, doc, getDoc, db, auth, storage, ai };
