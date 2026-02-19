import { NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'
import { VALID_CONTENT_TYPES, VALID_ESPECIALIDADES } from '@/lib/specs'

const PAGE_SIZE = 20

export async function GET(
  request: Request,
  { params }: { params: { tipo: string; especialidade: string } }
) {
  try {
    const { tipo, especialidade } = params

    if (!VALID_CONTENT_TYPES.includes(tipo as any)) {
      return NextResponse.json({ error: 'Tipo invalido' }, { status: 400 })
    }

    if (!VALID_ESPECIALIDADES.includes(especialidade as any)) {
      return NextResponse.json({ error: 'Especialidade invalida' }, { status: 400 })
    }

    const url = new URL(request.url)
    const subarea = (url.searchParams.get('subarea') || 'all').normalize('NFC')
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || String(PAGE_SIZE), 10)))
    const cursor = url.searchParams.get('cursor') || ''
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))

    const db = getDb()
    const collRef = db.collection(tipo).doc(especialidade).collection('items')
    let baseQuery: FirebaseFirestore.Query = collRef

    if (subarea !== 'all') {
      baseQuery = baseQuery.where('subarea', '==', subarea)
    }

    // Get count and items in parallel
    const countQuery = baseQuery.count().get()

    let itemsQuery = baseQuery.orderBy('dataAtualizacao', 'desc')

    // Use cursor-based pagination if cursor provided, otherwise fall back to offset
    if (cursor) {
      const cursorDoc = await collRef.doc(cursor).get()
      if (cursorDoc.exists) {
        itemsQuery = itemsQuery.startAfter(cursorDoc)
      }
    } else if (page > 1) {
      itemsQuery = itemsQuery.offset((page - 1) * limit)
    }

    itemsQuery = itemsQuery.limit(limit)

    const [countSnapshot, snapshot] = await Promise.all([countQuery, itemsQuery.get()])
    const total = countSnapshot.data().count

    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))

    // Provide the last doc ID as next cursor
    const nextCursor = snapshot.docs.length === limit
      ? snapshot.docs[snapshot.docs.length - 1].id
      : null

    const response = NextResponse.json({
      items,
      count: items.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      nextCursor,
      tipo,
      especialidade,
      subarea
    })

    response.headers.set('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')

    return response
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json(
      { error: 'Erro ao buscar conteudo', detail: message },
      { status: 500 }
    )
  }
}
