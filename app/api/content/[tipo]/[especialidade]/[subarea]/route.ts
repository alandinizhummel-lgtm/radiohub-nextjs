// app/api/content/[tipo]/[especialidade]/[subarea]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { initAdmin, db } from '@/lib/firebase-admin'

// Tipos válidos de conteúdo
const VALID_TYPES = ['resumos', 'artigos', 'mascaras', 'frases', 'checklists', 'tutoriais', 'videos']

export async function GET(
  request: NextRequest,
  { params }: { params: { tipo: string; especialidade: string; subarea: string } }
) {
  try {
    initAdmin()
    
    const { tipo, especialidade, subarea } = params
    
    // Validar tipo
    if (!VALID_TYPES.includes(tipo)) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
    }
    
    // Buscar dados
    let query = db.collection(tipo).doc(especialidade).collection('items')
    
    // Se subarea não é "all", filtrar por subarea
    if (subarea !== 'all') {
      query = query.where('subarea', '==', subarea)
    }
    
    const snapshot = await query.get()
    
    const items = snapshot.docs.map(doc => ({
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
    
  } catch (error) {
    console.error(`Error fetching ${params.tipo}:`, error)
    return NextResponse.json(
      { error: `Failed to fetch ${params.tipo}` }, 
      { status: 500 }
    )
  }
}
