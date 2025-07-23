import { initializeApp, getApps, getApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccountJson from '../../../serviceAccountKey.json';

const serviceAccount = serviceAccountJson as ServiceAccount;

// This check is crucial to ensure the private key is correctly formatted.
if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

const app = !getApps().length ? initializeApp({
    credential: cert(serviceAccount)
}) : getApp();

const db = getFirestore(app);

export { app, db };
