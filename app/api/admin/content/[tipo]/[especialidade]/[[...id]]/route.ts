import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { tipo: string; especialidade: string } }
) {
  try {
    const { tipo, especialidade } = params
    const body = await request.json()

    // Import dinâmico
    const { initializeApp, getApps, cert } = await import('firebase-admin/app')
    const { getFirestore } = await import('firebase-admin/firestore')
    
    // Inicializa Firebase
    if (getApps().length === 0) {
      let privateKey = process.env.FIREBASE_PRIVATE_KEY || ''
      if (privateKey.startsWith('"')) privateKey = privateKey.substring(1)
      if (privateKey.endsWith('"')) privateKey = privateKey.substring(0, privateKey.length - 1)
      privateKey = privateKey.replace(/\\n/g, '\n')

      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        } as any),
      })
    }

    const db = getFirestore()

    const docRef = await db
      .collection(tipo)
      .doc(especialidade)
      .collection('items')
      .add(body)

    return NextResponse.json({ 
      success: true, 
      id: docRef.id 
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { tipo: string; especialidade: string; id?: string[] } }
) {
  try {
    const { tipo, especialidade, id } = params
    
    if (!id || id.length === 0) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }
    
    const itemId = id[0]
    const body = await request.json()

    // Import dinâmico
    const { initializeApp, getApps, cert } = await import('firebase-admin/app')
    const { getFirestore } = await import('firebase-admin/firestore')
    
    if (getApps().length === 0) {
      let privateKey = process.env.FIREBASE_PRIVATE_KEY || ''
      if (privateKey.startsWith('"')) privateKey = privateKey.substring(1)
      if (privateKey.endsWith('"')) privateKey = privateKey.substring(0, privateKey.length - 1)
      privateKey = privateKey.replace(/\\n/g, '\n')

      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        } as any),
      })
    }

    const db = getFirestore()

    await db
      .collection(tipo)
      .doc(especialidade)
      .collection('items')
      .doc(itemId)
      .update(body)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { tipo: string; especialidade: string; id?: string[] } }
) {
  try {
    const { tipo, especialidade, id } = params
    
    if (!id || id.length === 0) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }
    
    const itemId = id[0]

    // Import dinâmico
    const { initializeApp, getApps, cert } = await import('firebase-admin/app')
    const { getFirestore } = await import('firebase-admin/firestore')
    
    if (getApps().length === 0) {
      let privateKey = process.env.FIREBASE_PRIVATE_KEY || ''
      if (privateKey.startsWith('"')) privateKey = privateKey.substring(1)
      if (privateKey.endsWith('"')) privateKey = privateKey.substring(0, privateKey.length - 1)
      privateKey = privateKey.replace(/\\n/g, '\n')

      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        } as any),
      })
    }

    const db = getFirestore()

    await db
      .collection(tipo)
      .doc(especialidade)
      .collection('items')
      .doc(itemId)
      .delete()

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
