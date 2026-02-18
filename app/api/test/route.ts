import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Import dinâmico
    const { initializeApp, getApps, cert } = await import('firebase-admin/app')
    const { getFirestore } = await import('firebase-admin/firestore')
    
    // Prepara a private key corretamente
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || ''
    
    // Remove aspas do início e fim (se tiver)
    if (privateKey.startsWith('"')) {
      privateKey = privateKey.substring(1)
    }
    if (privateKey.endsWith('"')) {
      privateKey = privateKey.substring(0, privateKey.length - 1)
    }
    
    // Substitui \n literais por quebras reais
    privateKey = privateKey.replace(/\\n/g, '\n')
    
    // Inicializa Firebase Admin
    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
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
      message: '🔥🔥🔥 FIREBASE CONECTADO COM SUCESSO! 🔥🔥🔥',
      firebase: 'FUNCIONANDO PERFEITAMENTE!',
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
