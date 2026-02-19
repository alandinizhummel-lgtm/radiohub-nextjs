import { NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'
import { VALID_CONTENT_TYPES, VALID_ESPECIALIDADES } from '@/lib/specs'

const MAX_RESULTS = 30

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')?.trim().toLowerCase()
    const tipo = url.searchParams.get('tipo') || ''
    const especialidade = url.searchParams.get('especialidade') || ''

    if (!query || query.length < 2) {
      return NextResponse.json({ items: [], total: 0 })
    }

    if (tipo && !VALID_CONTENT_TYPES.includes(tipo as any)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }

    if (especialidade && !VALID_ESPECIALIDADES.includes(especialidade as any)) {
      return NextResponse.json({ error: 'Especialidade inválida' }, { status: 400 })
    }

    const db = getDb()
    const tipos = tipo ? [tipo] : [...VALID_CONTENT_TYPES]
    const specs = especialidade ? [especialidade] : [...VALID_ESPECIALIDADES]

    // Run ALL queries in parallel instead of sequential loops
    const promises: Promise<{ tipo: string; especialidade: string; docs: FirebaseFirestore.QueryDocumentSnapshot[] }>[] = []

    for (const t of tipos) {
      for (const s of specs) {
        promises.push(
          db.collection(t).doc(s).collection('items')
            .orderBy('dataAtualizacao', 'desc')
            .limit(30)
            .get()
            .then(snapshot => ({ tipo: t, especialidade: s, docs: snapshot.docs }))
            .catch(() => ({ tipo: t, especialidade: s, docs: [] }))
        )
      }
    }

    const allResults = await Promise.all(promises)

    // Filter results client-side
    const results: any[] = []
    for (const { tipo: t, especialidade: s, docs } of allResults) {
      for (const doc of docs) {
        if (results.length >= MAX_RESULTS) break
        const data = doc.data()
        const titulo = (data.titulo || '').toLowerCase()
        const subarea = (data.subarea || '').toLowerCase()
        const conteudo = (data.conteudo || '').toLowerCase()
        if (titulo.includes(query) || subarea.includes(query) || conteudo.includes(query)) {
          results.push({
            id: doc.id,
            tipo: t,
            especialidade: s,
            titulo: data.titulo,
            subarea: data.subarea,
            autor: data.autor,
            dataAtualizacao: data.dataAtualizacao,
          })
        }
      }
      if (results.length >= MAX_RESULTS) break
    }

    // Sort by relevance: title matches first, then subarea, then content
    results.sort((a, b) => {
      const aTitle = (a.titulo || '').toLowerCase().includes(query) ? 0 : 1
      const bTitle = (b.titulo || '').toLowerCase().includes(query) ? 0 : 1
      return aTitle - bTitle
    })

    const response = NextResponse.json({
      items: results.slice(0, MAX_RESULTS),
      total: results.length,
      query,
    })

    response.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=3600')

    return response
  } catch {
    return NextResponse.json(
      { error: 'Erro na busca' },
      { status: 500 }
    )
  }
}
