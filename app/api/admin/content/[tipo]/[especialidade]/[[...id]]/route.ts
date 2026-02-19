import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { getDb } from '@/lib/firebase-admin'
import { VALID_CONTENT_TYPES, VALID_ESPECIALIDADES } from '@/lib/specs'
import { logAudit } from '@/lib/audit-log'

// --- Validação ---

const ALLOWED_FIELDS = ['titulo', 'conteudo', 'subarea', 'autor', 'dataAtualizacao']
const MAX_FIELD_LENGTH = 50000 // limite para conteudo
const MAX_SHORT_FIELD = 200    // limite para titulo, subarea, autor, dataAtualizacao

function validateAndSanitizeBody(body: any): { valid: boolean; data?: Record<string, string>; error?: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { valid: false, error: 'Body deve ser um objeto' }
  }

  const sanitized: Record<string, string> = {}

  for (const key of Object.keys(body)) {
    if (!ALLOWED_FIELDS.includes(key)) {
      return { valid: false, error: `Campo não permitido: ${key}` }
    }
    if (typeof body[key] !== 'string') {
      return { valid: false, error: `Campo "${key}" deve ser texto` }
    }
  }

  if (!body.titulo || typeof body.titulo !== 'string' || body.titulo.trim().length === 0) {
    return { valid: false, error: 'Título é obrigatório' }
  }

  if (!body.conteudo || typeof body.conteudo !== 'string' || body.conteudo.trim().length === 0) {
    return { valid: false, error: 'Conteúdo é obrigatório' }
  }

  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) {
      const value = body[key] as string
      const maxLen = key === 'conteudo' ? MAX_FIELD_LENGTH : MAX_SHORT_FIELD
      if (value.length > maxLen) {
        return { valid: false, error: `Campo "${key}" excede o limite de ${maxLen} caracteres` }
      }
      sanitized[key] = value.trim()
    }
  }

  return { valid: true, data: sanitized }
}

function validateParams(tipo: string, especialidade: string): string | null {
  if (!VALID_CONTENT_TYPES.includes(tipo as any)) return 'Tipo inválido'
  if (!VALID_ESPECIALIDADES.includes(especialidade as any)) return 'Especialidade inválida'
  return null
}

function authenticateRequest(): { authenticated: boolean; username: string } {
  const token = cookies().get('admin-token')?.value
  if (!token) return { authenticated: false, username: '' }
  const result = verifyToken(token)
  return { authenticated: result.valid, username: result.username || '' }
}

// --- Rotas ---

export async function POST(
  request: Request,
  { params }: { params: { tipo: string; especialidade: string } }
) {
  try {
    const { authenticated, username } = authenticateRequest()
    if (!authenticated) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { tipo, especialidade } = params
    const paramError = validateParams(tipo, especialidade)
    if (paramError) {
      return NextResponse.json({ error: paramError }, { status: 400 })
    }

    const body = await request.json()
    const validation = validateAndSanitizeBody(body)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const db = getDb()

    const docRef = await db
      .collection(tipo)
      .doc(especialidade)
      .collection('items')
      .add(validation.data!)

    logAudit({ action: 'create', tipo, especialidade, itemId: docRef.id, titulo: validation.data!.titulo, username })

    return NextResponse.json({
      success: true,
      id: docRef.id
    })
  } catch {
    return NextResponse.json(
      { error: 'Erro ao criar conteúdo' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { tipo: string; especialidade: string; id?: string[] } }
) {
  try {
    const { authenticated, username } = authenticateRequest()
    if (!authenticated) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { tipo, especialidade, id } = params

    if (!id || id.length === 0) {
      return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })
    }

    const paramError = validateParams(tipo, especialidade)
    if (paramError) {
      return NextResponse.json({ error: paramError }, { status: 400 })
    }

    const itemId = id[0]
    if (!/^[a-zA-Z0-9_-]+$/.test(itemId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const body = await request.json()
    const validation = validateAndSanitizeBody(body)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const db = getDb()

    await db
      .collection(tipo)
      .doc(especialidade)
      .collection('items')
      .doc(itemId)
      .update(validation.data!)

    logAudit({ action: 'update', tipo, especialidade, itemId, titulo: validation.data!.titulo, username })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Erro ao atualizar conteúdo' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { tipo: string; especialidade: string; id?: string[] } }
) {
  try {
    const { authenticated, username } = authenticateRequest()
    if (!authenticated) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { tipo, especialidade, id } = params

    if (!id || id.length === 0) {
      return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })
    }

    const paramError = validateParams(tipo, especialidade)
    if (paramError) {
      return NextResponse.json({ error: paramError }, { status: 400 })
    }

    const itemId = id[0]
    if (!/^[a-zA-Z0-9_-]+$/.test(itemId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const db = getDb()

    await db
      .collection(tipo)
      .doc(especialidade)
      .collection('items')
      .doc(itemId)
      .delete()

    logAudit({ action: 'delete', tipo, especialidade, itemId, username })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Erro ao deletar conteúdo' },
      { status: 500 }
    )
  }
}
