import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Import dinâmico - só carrega quando chamar a API
    const { initializeApp, getApps, cert } = await import('firebase-admin/app')
    const { getFirestore } = await import('firebase-admin/firestore')
    
    // Inicializa Firebase Admin (só uma vez)
    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        } as any),
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
      message: '🔥 FIREBASE CONECTADO! 🔥',
      firebase: 'FUNCIONANDO!',
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: 'error',
        message: error.message
      }, 
      { status: 500 }
    )
  }
}
