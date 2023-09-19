import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string)
export const firebaseAdmin =
    getApps()[0] ??
    initializeApp({
        credential: cert(serviceAccount),
    })

/**
 * Firebase admin Authentication SDK
 */
export const auth = getAuth()
