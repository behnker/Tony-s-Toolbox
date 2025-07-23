
import { initializeApp, getApps, getApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccountJson from '../../../serviceAccountKey.json';

// Cast the imported JSON to the ServiceAccount type.
const serviceAccount = serviceAccountJson as ServiceAccount;

const app = !getApps().length ? initializeApp({
    credential: cert(serviceAccount)
}) : getApp();

const db = getFirestore(app);

export { app, db };
