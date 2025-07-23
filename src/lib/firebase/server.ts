
'use server';

import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Please add it to your .env file.');
}

// Sanitize the service account key by replacing literal newlines with escaped newlines for JSON parsing
const serviceAccountString = (process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string).replace(/\n/g, "\\n");
const serviceAccount = JSON.parse(serviceAccountString);

// The `private_key` needs to have its escaped newlines converted back to literal newlines
// for the `cert` function to parse it correctly.
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');


const app = !getApps().length ? initializeApp({
    credential: cert(serviceAccount)
}) : getApp();

const db = getFirestore(app);

export { app, db };
