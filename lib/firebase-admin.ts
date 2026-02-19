import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

function validateEnv() {
  const required = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY', 'ADMIN_TOKEN_SECRET', 'ADMIN_CREDENTIALS']
  const missing = required.filter(k => !process.env[k])
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`)
  }
}

function initAdmin() {
  if (getApps().length === 0) {
    validateEnv()
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || ''
    if (privateKey.startsWith('"')) privateKey = privateKey.substring(1)
    if (privateKey.endsWith('"')) privateKey = privateKey.substring(0, privateKey.length - 1)
    privateKey = privateKey.replace(/\\n/g, '\n')

    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    })
  }
}

export function getDb() {
  initAdmin()
  return getFirestore()
}
