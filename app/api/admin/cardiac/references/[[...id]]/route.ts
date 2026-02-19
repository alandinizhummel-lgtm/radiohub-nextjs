import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { getDb } from '@/lib/firebase-admin'
import { logAudit } from '@/lib/audit-log'

function authenticateRequest(): { authenticated: boolean; username: string } {
  const token = cookies().get('admin-token')?.value
  if (!token) return { authenticated: false, username: '' }
  const result = verifyToken(token)
  return { authenticated: result.valid, username: result.username || '' }
}

function validateRefBody(body: unknown): { valid: boolean; data?: Record<string, unknown>; error?: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { valid: false, error: 'Body deve ser um objeto' }
  }
  const b = body as Record<string, unknown>
  if (!b.nome || typeof b.nome !== 'string' || b.nome.trim().length === 0) {
    return { valid: false, error: 'Nome e obrigatorio' }
  }
  if (!b.parametros || typeof b.parametros !== 'object') {
    return { valid: false, error: 'Parametros sao obrigatorios' }
  }
  const p = b.parametros as Record<string, unknown>
  if (!p.M || typeof p.M !== 'object' || !p.F || typeof p.F !== 'object') {
    return { valid: false, error: 'Parametros devem ter campos M e F' }
  }

  const data: Record<string, unknown> = {
    nome: (b.nome as string).trim(),
    parametros: b.parametros,
  }
  if (b.descricao && typeof b.descricao === 'string') {
    data.descricao = b.descricao.trim()
  }
  if (b.ageRange && typeof b.ageRange === 'object') {
    data.ageRange = b.ageRange
  }

  return { valid: true, data }
}

export async function GET(
  _request: Request,
  { params }: { params: { id?: string[] } }
) {
  try {
    const { authenticated } = authenticateRequest()
    if (!authenticated) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const db = getDb()

    if (params.id && params.id.length > 0) {
      const doc = await db.collection('cardiac_references').doc(params.id[0]).get()
      if (!doc.exists) {
        return NextResponse.json({ error: 'Referencia nao encontrada' }, { status: 404 })
      }
      return NextResponse.json({ id: doc.id, ...doc.data() })
    }

    const snapshot = await db.collection('cardiac_references').orderBy('nome').get()
    const references = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json({ references })
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar referencias' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { authenticated, username } = authenticateRequest()
    if (!authenticated) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validation = validateRefBody(body)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const db = getDb()
    const now = new Date().toISOString()
    const docRef = await db.collection('cardiac_references').add({
      ...validation.data,
      createdAt: now,
      updatedAt: now,
    })

    logAudit({ action: 'create', tipo: 'cardiac_references', especialidade: 'cardiac', itemId: docRef.id, titulo: validation.data!.nome as string, username })

    return NextResponse.json({ success: true, id: docRef.id })
  } catch {
    return NextResponse.json({ error: 'Erro ao criar referencia' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id?: string[] } }
) {
  try {
    const { authenticated, username } = authenticateRequest()
    if (!authenticated) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    if (!params.id || params.id.length === 0) {
      return NextResponse.json({ error: 'ID obrigatorio' }, { status: 400 })
    }

    const itemId = params.id[0]
    if (!/^[a-zA-Z0-9_-]+$/.test(itemId)) {
      return NextResponse.json({ error: 'ID invalido' }, { status: 400 })
    }

    const body = await request.json()
    const validation = validateRefBody(body)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const db = getDb()
    await db.collection('cardiac_references').doc(itemId).update({
      ...validation.data,
      updatedAt: new Date().toISOString(),
    })

    logAudit({ action: 'update', tipo: 'cardiac_references', especialidade: 'cardiac', itemId, titulo: validation.data!.nome as string, username })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar referencia' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id?: string[] } }
) {
  try {
    const { authenticated, username } = authenticateRequest()
    if (!authenticated) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    if (!params.id || params.id.length === 0) {
      return NextResponse.json({ error: 'ID obrigatorio' }, { status: 400 })
    }

    const itemId = params.id[0]
    if (!/^[a-zA-Z0-9_-]+$/.test(itemId)) {
      return NextResponse.json({ error: 'ID invalido' }, { status: 400 })
    }

    const db = getDb()
    await db.collection('cardiac_references').doc(itemId).delete()

    logAudit({ action: 'delete', tipo: 'cardiac_references', especialidade: 'cardiac', itemId, username })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao deletar referencia' }, { status: 500 })
  }
}
