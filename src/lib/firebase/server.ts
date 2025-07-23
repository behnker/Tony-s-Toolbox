
'use server';

import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Please add it to your .env file.');
}

// 1. Sanitize the raw string from the environment variable to make it valid JSON.
//    The private key from the .env file has literal newlines, which are invalid in a JSON string.
//    We replace them with the escaped version `\\n`.
const sanitizedKey = (process.env.FIREBASE_SERVICE_ACCOUNT_KEY).replace(/\n/g, '\\n');

// 2. Parse the sanitized string into a JavaScript object.
const serviceAccount = JSON.parse(sanitizedKey);

// 3. The `cert` function needs the private key to have literal newlines, not escaped ones.
//    So, we un-escape the newlines in the `private_key` field.
if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

const app = !getApps().length ? initializeApp({
    credential: cert(serviceAccount)
}) : getApp();

const db = getFirestore(app);

export { app, db };
