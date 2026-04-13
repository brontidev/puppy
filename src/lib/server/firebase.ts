import { initializeApp, cert, type App } from "firebase-admin/app"
import type { ServiceAccount } from "firebase-admin"
import serviceAccount from "./service-account.json"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { getApp } from "firebase/app"

let firebaseApp: App;

try {
    firebaseApp = getApp()
} catch {
    firebaseApp = initializeApp({
        credential: cert(serviceAccount as ServiceAccount),
    })
}

export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)