
import { initializeApp, getApps, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// When running in a Google Cloud environment like App Hosting, 
// initializeApp() automatically discovers the project's configuration
// and credentials.
const app = !getApps().length ? initializeApp() : getApp();

const db = getFirestore(app);

export { app, db };
