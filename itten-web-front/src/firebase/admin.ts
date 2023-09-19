import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const serviceAccount = require('../../itten-web-firebase-adminsdk.json')
export const firebaseAdmin =
    getApps()[0] ??
    initializeApp({
        credential: cert(serviceAccount),
    })

/**
 * Firebase admin Authentication SDK
 */
export const auth = getAuth()
