
'use server';

import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Please add it to your .env file.');
}

// Sanitize the service account key by replacing literal newlines with their escaped version.
const sanitizedServiceAccountKey = (process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string).replace(/\n/g, '\\n');
const serviceAccount = JSON.parse(sanitizedServiceAccountKey);

// The `cert` function needs the private key to have literal newlines again.
if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

const app = !getApps().length ? initializeApp({
    credential: cert(serviceAccount)
}) : getApp();

const db = getFirestore(app);

export { app, db };
