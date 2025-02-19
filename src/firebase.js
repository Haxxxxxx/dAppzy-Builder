// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // If you want to store files
import { getAnalytics } from "firebase/analytics";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBHVhd30FIhlOPKoQSP6vZ2slkwtcLsRKU",
  authDomain: "third--space.firebaseapp.com",
  databaseURL: "https://third--space-default-rtdb.firebaseio.com",
  projectId: "third--space",
  storageBucket: "third--space.appspot.com",
  messagingSenderId: "99453910780",
  appId: "1:99453910780:web:bb6bebd9df84f81e7e6179",
  measurementId: "G-83NKPT3B9E"
};


const app = initializeApp(firebaseConfig);

// Firestore DB
 const db = getFirestore(app);

// Authentication
 const auth = getAuth(app);

// Storage

const storage = getStorage(app);
export const analytics = getAnalytics(app);

export {setDoc, doc, getDoc, db, auth, storage };

// Storage (if needed)
// export const storage = getStorage(app);
