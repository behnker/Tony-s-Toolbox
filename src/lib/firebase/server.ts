'use server';

import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import path from 'path';
import fs from 'fs';

// This function now securely loads the service account key from a JSON file.
// This is a more robust method than using environment variables for multi-line JSON.
function getServiceAccount() {
    // We construct a path to the file from the project root.
    // process.cwd() gives us the current working directory where the app is running.
    const keyPath = path.resolve(process.cwd(), 'serviceAccountKey.json');

    if (!fs.existsSync(keyPath)) {
        throw new Error('serviceAccountKey.json is not found. Please add it to the root of your project. Make sure to add it to .gitignore as well.');
    }

    const serviceAccountString = fs.readFileSync(keyPath, 'utf8');
    const serviceAccount = JSON.parse(serviceAccountString);

    // The `private_key` from the file might have its newlines escaped as "\\n".
    // The `cert` function needs the private key to have literal newlines.
    if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    
    return serviceAccount;
}

const serviceAccount = getServiceAccount();

const app = !getApps().length ? initializeApp({
    credential: cert(serviceAccount)
}) : getApp();

const db = getFirestore(app);

export { app, db };