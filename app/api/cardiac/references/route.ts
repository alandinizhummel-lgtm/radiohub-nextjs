import { NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const full = searchParams.get('full') === 'true'

    const db = getDb()
    const snapshot = await db.collection('cardiac_references').orderBy('nome').get()
    const references = snapshot.docs.map(doc => {
      const data = doc.data()
      if (!full) {
        // Return only metadata without the full parametros object
        return {
          id: doc.id,
          nome: data.nome,
          descricao: data.descricao || '',
          ageRange: data.ageRange || null,
        }
      }
      return { id: doc.id, ...data }
    })
    return NextResponse.json({ references })
  } catch {
    return NextResponse.json({ references: [] })
  }
}
