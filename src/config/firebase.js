import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore/lite";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDFt8uov7gfrZb2M0jQ11jM8tHkFiBb_OI",
  authDomain: "taski-csv.firebaseapp.com",
  projectId: "taski-csv",
  storageBucket: "taski-csv.appspot.com",
  messagingSenderId: "1021244581588",
  appId: "1:1021244581588:web:e12fa8611690da8c023d41",
  measurementId: "G-9YJKNBRQQG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
export { auth, firestore, storage };
