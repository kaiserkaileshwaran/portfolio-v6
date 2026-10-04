import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAp4kagpItW_Y6NaF4aJgUleY2BBa7fObA",
  authDomain: "the-developers-f5089.firebaseapp.com",
  projectId: "the-developers-f5089",
  storageBucket: "the-developers-f5089.firebasestorage.app",
  messagingSenderId: "929725537987",
  appId: "1:929725537987:web:daf958713c2e7c62770c76",
  measurementId: "G-SWGG3Z0E14",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export default app;
