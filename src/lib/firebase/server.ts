
import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import "server-only";

if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Please add it to your .env.local file.');
}

// Sanitize the service account key by removing invalid control characters
const serviceAccountString = (process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string).replace(/\\n/g, "\\n");
const serviceAccount = JSON.parse(serviceAccountString);


const app = !getApps().length ? initializeApp({
    credential: cert(serviceAccount)
}) : getApp();

const db = getFirestore(app);

export { app, db };
