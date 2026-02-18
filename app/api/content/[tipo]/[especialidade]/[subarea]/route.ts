import { NextResponse } from 'next/server'

const VALID_TYPES = ['resumos', 'artigos', 'mascaras', 'frases', 'checklists', 'tutoriais', 'videos']

export async function GET(
  request: Request,
  { params }: { params: { tipo: string; especialidade: string; subarea: string } }
) {
  try {
    const { tipo, especialidade } = params
    
    // DECODIFICA a subarea (resolve problema da barra /)
    const subarea = decodeURIComponent(params.subarea)
    
    // Valida tipo
    if (!VALID_TYPES.includes(tipo)) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
    }
    
    // Import dinâmico
    const { initializeApp, getApps, cert } = await import('firebase-admin/app')
    const { getFirestore } = await import('firebase-admin/firestore')
    
    // Prepara private key
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || ''
    if (privateKey.startsWith('"')) privateKey = privateKey.substring(1)
    if (privateKey.endsWith('"')) privateKey = privateKey.substring(0, privateKey.length - 1)
    privateKey = privateKey.replace(/\\n/g, '\n')
    
    // Inicializa Firebase
    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        } as any),
      })
    }
    
    // Busca dados
    const db = getFirestore()
    let query = db.collection(tipo).doc(especialidade).collection('items')
    
    // Filtra por subarea se não for "all"
    if (subarea !== 'all') {
      query = query.where('subarea', '==', subarea) as any
    }
    
    const snapshot = await query.get()
    
    const items = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json({ 
      items,
      count: items.length,
      tipo,
      especialidade,
      subarea
    })
    
  } catch (error: any) {
    console.error('Error fetching content:', error)
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    )
  }
}
