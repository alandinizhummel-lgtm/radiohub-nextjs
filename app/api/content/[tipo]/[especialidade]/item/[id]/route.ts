import { NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'
import { VALID_CONTENT_TYPES, VALID_ESPECIALIDADES } from '@/lib/specs'

export async function GET(
  request: Request,
  { params }: { params: { tipo: string; especialidade: string; id: string } }
) {
  try {
    const { tipo, especialidade, id } = params

    if (!VALID_CONTENT_TYPES.includes(tipo as any)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }

    if (!VALID_ESPECIALIDADES.includes(especialidade as any)) {
      return NextResponse.json({ error: 'Especialidade inválida' }, { status: 400 })
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const db = getDb()
    const doc = await db
      .collection(tipo)
      .doc(especialidade)
      .collection('items')
      .doc(id)
      .get()

    if (!doc.exists) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    const response = NextResponse.json({
      item: { id: doc.id, ...doc.data() }
    })

    // Cache individual items for 1h, stale for 24h
    response.headers.set('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')

    return response
  } catch {
    return NextResponse.json(
      { error: 'Erro ao buscar conteúdo' },
      { status: 500 }
    )
  }
}
