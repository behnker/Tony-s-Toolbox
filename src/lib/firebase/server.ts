import { initializeApp, getApps, getApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccountJson from '../../../serviceAccountKey.json';

// Cast the imported JSON to the ServiceAccount type.
const serviceAccount = serviceAccountJson as ServiceAccount;

// The `private_key` from the file might have its newlines escaped as "\\n".
// The `cert` function needs the private key to have literal newlines.
if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

const app = !getApps().length ? initializeApp({
    credential: cert(serviceAccount)
}) : getApp();

const db = getFirestore(app);

export { app, db };
