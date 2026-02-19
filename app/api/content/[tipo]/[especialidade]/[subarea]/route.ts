import { NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'
import { VALID_CONTENT_TYPES, VALID_ESPECIALIDADES } from '@/lib/specs'

const PAGE_SIZE = 20

export async function GET(
  request: Request,
  { params }: { params: { tipo: string; especialidade: string; subarea: string } }
) {
  try {
    const { tipo, especialidade } = params
    const subarea = decodeURIComponent(params.subarea)

    if (!VALID_CONTENT_TYPES.includes(tipo as any)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }

    if (!VALID_ESPECIALIDADES.includes(especialidade as any)) {
      return NextResponse.json({ error: 'Especialidade inválida' }, { status: 400 })
    }

    // Parse pagination params
    const url = new URL(request.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || String(PAGE_SIZE), 10)))

    const db = getDb()
    let query: FirebaseFirestore.Query = db.collection(tipo).doc(especialidade).collection('items')

    if (subarea !== 'all') {
      query = query.where('subarea', '==', subarea)
    }

    query = query.orderBy('dataAtualizacao', 'desc')

    // Get total count (for pagination info)
    const countSnapshot = await query.count().get()
    const total = countSnapshot.data().count

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)

    const snapshot = await query.get()

    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))

    const response = NextResponse.json({
      items,
      count: items.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      tipo,
      especialidade,
      subarea
    })

    // Cache on Vercel CDN for 1h, serve stale for 24h while revalidating
    response.headers.set('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')

    return response
  } catch {
    return NextResponse.json(
      { error: 'Erro ao buscar conteúdo' },
      { status: 500 }
    )
  }
}
