import { getStorage as getFirebaseStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeApp, getApps } from 'firebase/app';

// Reuse the same Firebase config as Firestore.
const firebaseConfig = {
  apiKey: "AIzaSyDpPUYwLo0pQ73GYAe5cFGgPcpb-9YRhJk",
  authDomain: "fiorella-store-91d15.firebaseapp.com",
  projectId: "fiorella-store-91d15",
  storageBucket: "fiorella-store-91d15.firebasestorage.app",
  messagingSenderId: "729546907299",
  appId: "1:729546907299:web:d0d24238d9614bb853a916",
  measurementId: "G-2FFC7Q62WT"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const storage = getFirebaseStorage(app);


export const uploadFileToStorage = async (file: File, storagePath: string) => {
  const storageRef = ref(storage, storagePath);
  // uploadBytes expects the file/Blob; browsers (including mobile) handle reading internally.
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

