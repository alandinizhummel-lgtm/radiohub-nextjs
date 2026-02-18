import { NextResponse } from 'next/server'
import { getDb } from '../../../lib/firebase-admin'

export async function GET() {
  try {
    const db = getDb()
    
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
