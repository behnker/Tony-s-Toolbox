import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import path from 'path';
import fs from 'fs';

function getServiceAccount() {
    const keyPath = path.resolve(process.cwd(), 'serviceAccountKey.json');

    if (!fs.existsSync(keyPath)) {
        throw new Error('serviceAccountKey.json is not found. Please add it to the root of your project. Make sure to add it to .gitignore as well.');
    }

    const serviceAccountString = fs.readFileSync(keyPath, 'utf8');
    const serviceAccount = JSON.parse(serviceAccountString);

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
