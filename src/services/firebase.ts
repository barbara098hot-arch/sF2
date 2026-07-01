import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDpPUYwLo0pQ73GYAe5cFGgPcpb-9YRhJk",
  authDomain: "fiorella-store-91d15.firebaseapp.com",
  projectId: "fiorella-store-91d15",
  storageBucket: "fiorella-store-91d15.firebasestorage.app",
  messagingSenderId: "729546907299",
  appId: "1:729546907299:web:d0d24238d9614bb853a916",
  measurementId: "G-2FFC7Q62WT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firestore instance
export const db = getFirestore(app);
