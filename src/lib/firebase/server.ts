'use server';

import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Please add it to your .env file.');
}

// The service account key is a JSON string stored in an environment variable.
// The private_key within this JSON has its newlines stored as literal '\n',
// which is invalid in a JSON string. We must first replace these with the
// escaped '\\n' to make the string parsable.
const serviceAccountString = (process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string).replace(/\n/g, '\\n');
const serviceAccount = JSON.parse(serviceAccountString);


// After parsing, the `private_key` has escaped newlines (\\n). The `cert`
// function requires literal newlines (\n) to correctly parse the RSA key.
// We must now un-escape the newlines in the private_key field.
if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

const app = !getApps().length ? initializeApp({
    credential: cert(serviceAccount)
}) : getApp();

const db = getFirestore(app);

export { app, db };
