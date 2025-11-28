// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "start-hobby.firebaseapp.com",
  projectId: "start-hobby",
  storageBucket: "start-hobby.firebasestorage.app",
  messagingSenderId: "316587177938",
  appId: "1:316587177938:web:48cb4389a260a4808f7a0b",
  measurementId: "G-KE9JVFGWPX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
