'use server';

import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Please add it to your .env file.');
}

// The service account key is a JSON string stored in an environment variable.
// It needs to be parsed before being used by the cert function.
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

// Sanitize the service account string to handle potential newline issues
// before parsing. This makes the string valid for JSON.parse().
const sanitizedServiceAccountString = serviceAccountString.replace(/\n/g, '\\n');
const serviceAccount = JSON.parse(sanitizedServiceAccountString);


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
