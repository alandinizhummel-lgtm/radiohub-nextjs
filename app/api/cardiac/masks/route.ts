import { NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'

export async function GET() {
  try {
    const db = getDb()
    const snapshot = await db.collection('cardiac_masks').orderBy('nome').get()
    const masks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
    return NextResponse.json({ masks })
  } catch {
    return NextResponse.json({ masks: [] })
  }
}
