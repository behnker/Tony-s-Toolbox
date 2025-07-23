
'use server';

import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Please add it to your .env file.');
}

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const serviceAccount = JSON.parse(serviceAccountString);

// The `private_key` from the environment variable has its newlines escaped as "\\n".
// The `cert` function needs the private key to have literal newlines.
if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

const app = !getApps().length ? initializeApp({
    credential: cert(serviceAccount)
}) : getApp();

const db = getFirestore(app);

export { app, db };
