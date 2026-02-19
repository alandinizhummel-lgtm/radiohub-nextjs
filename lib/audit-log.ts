import { getDb } from './firebase-admin'

interface AuditEntry {
  action: 'create' | 'update' | 'delete'
  tipo: string
  especialidade: string
  itemId: string
  titulo?: string
  username: string
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const db = getDb()
    await db.collection('audit_logs').add({
      ...entry,
      timestamp: new Date().toISOString(),
    })
  } catch {
    // Audit logging should never break the main flow
  }
}
