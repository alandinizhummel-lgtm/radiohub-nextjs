import { NextResponse } from 'next/server'
import { initAdmin, db } from '@/lib/firebase-admin'

export async function GET() {
  try {
    initAdmin()
    
    return NextResponse.json({ 
      status: 'success',
      message: 'Firebase Admin conectado!',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to connect' }, 
      { status: 500 }
    )
  }
}
