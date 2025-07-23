
'use server';

import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Please add it to your .env file.');
}

// The raw string from the environment variable may contain literal newlines.
// 1. Sanitize the string to make it valid JSON by escaping the newlines.
const sanitizedKey = (process.env.FIREBASE_SERVICE_ACCOUNT_KEY).replace(/\n/g, '\\n');
const serviceAccount = JSON.parse(sanitizedKey);


// 2. The `cert` function needs the private key to have literal newlines.
//    So, un-escape the newlines in the private_key field.
if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

const app = !getApps().length ? initializeApp({
    credential: cert(serviceAccount)
}) : getApp();

const db = getFirestore(app);

export { app, db };
