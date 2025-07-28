import { initializeApp, getApps, getApp, AppOptions } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Use environment variables provided by App Hosting.
const firebaseConfig: AppOptions = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

// Initialize the app with the config, ensuring it knows which project to use.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);

export { app, db };
