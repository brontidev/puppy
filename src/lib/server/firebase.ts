import { type App, cert, initializeApp, getApp } from 'firebase-admin/app';
import type { ServiceAccount } from 'firebase-admin';
import { env } from '$env/dynamic/private';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let firebaseApp: App;
console.log("FIREBASE_SERVICE_ACCOUNT:", env.FIREBASE_SERVICE_ACCOUNT ? "present" : "missing")
const serviceAccount: ServiceAccount = JSON.parse(atob(env.FIREBASE_SERVICE_ACCOUNT));
console.log("keys", Object.keys(serviceAccount))

try {
	firebaseApp = getApp();
} catch {
	firebaseApp = initializeApp({
		credential: cert(serviceAccount as ServiceAccount)
	});
}

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
