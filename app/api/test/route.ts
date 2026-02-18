import { NextResponse } from 'next/server'

export async function GET() {
  // Verifica se as variáveis existem
  const hasVars = !!(
    process.env.FIREBASE_PROJECT_ID && 
    process.env.FIREBASE_CLIENT_EMAIL && 
    process.env.FIREBASE_PRIVATE_KEY
  )
  
  return NextResponse.json({ 
    status: 'success',
    message: 'API funcionando!',
    envVarsConfigured: hasVars,
    projectId: process.env.FIREBASE_PROJECT_ID || 'NOT_SET',
    timestamp: new Date().toISOString()
  })
}
