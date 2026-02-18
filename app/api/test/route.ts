import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY || ''
    
    // Debug da chave
    const keyInfo = {
      hasKey: !!privateKey,
      keyLength: privateKey.length,
      startsCorrect: privateKey.startsWith('"-----BEGIN'),
      endsCorrect: privateKey.endsWith('KEY-----"'),
      hasSlashN: privateKey.includes('\\n'),
      firstChars: privateKey.substring(0, 50),
      lastChars: privateKey.substring(privateKey.length - 50)
    }
    
    return NextResponse.json({ 
      status: 'debug',
      keyInfo
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
