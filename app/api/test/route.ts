import { NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

export async function GET() {
  try {
    // Inicializa Firebase Admin (só uma vez)
    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      })
    }
    
    // Testa escrita no Firestore
    const db = getFirestore()
    const testRef = db.collection('_test').doc('connection')
    await testRef.set({ 
      tested: true, 
      timestamp: new Date().toISOString() 
    })
    
    return NextResponse.json({ 
      status: 'success',
      message: '🔥 FIREBASE CONECTADO COM SUCESSO! 🔥',
      firebase: 'FUNCIONANDO!',
      projectId: process.env.FIREBASE_PROJECT_ID,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: 'error',
        message: error.message,
        stack: error.stack
      }, 
      { status: 500 }
    )
  }
}
