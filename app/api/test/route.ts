import { NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

function initAdmin() {
  if (getApps().length === 0) {
    const firebaseAdminConfig = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }
    
    initializeApp({
      credential: cert(firebaseAdminConfig),
    })
  }
}

export async function GET() {
  try {
    initAdmin()
    const db = getFirestore()
    
    // Testa se consegue acessar o Firebase
    const testRef = db.collection('_test').doc('connection')
    await testRef.set({ 
      tested: true, 
      timestamp: new Date().toISOString() 
    })
    
    return NextResponse.json({ 
      status: 'success',
      message: 'Firebase Admin conectado com sucesso!',
      firebase: 'FUNCIONANDO! ✅',
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('Firebase Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to connect to Firebase',
        message: error.message,
        details: error.toString()
      }, 
      { status: 500 }
    )
  }
}
