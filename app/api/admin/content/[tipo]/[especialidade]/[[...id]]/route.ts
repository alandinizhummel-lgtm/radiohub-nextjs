import { NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

function initAdmin() {
  if (getApps().length === 0) {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || ''
    if (privateKey.startsWith('"')) privateKey = privateKey.substring(1)
    if (privateKey.endsWith('"')) privateKey = privateKey.substring(0, privateKey.length - 1)
    privateKey = privateKey.replace(/\\n/g, '\n')

    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      } as any),
    })
  }
}

// CREATE - Adicionar novo item
export async function POST(
  request: Request,
  { params }: { params: { tipo: string; especialidade: string } }
) {
  try {
    const { tipo, especialidade } = params
    const body = await request.json()

    initAdmin()
    const db = getFirestore()

    const docRef = await db
      .collection(tipo)
      .doc(especialidade)
      .collection('items')
      .add(body)

    return NextResponse.json({ 
      success: true, 
      id: docRef.id 
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// UPDATE - Atualizar item existente
export async function PUT(
  request: Request,
  { params }: { params: { tipo: string; especialidade: string; id: string[] } }
) {
  try {
    const { tipo, especialidade, id } = params
    const itemId = id[0]
    const body = await request.json()

    initAdmin()
    const db = getFirestore()

    await db
      .collection(tipo)
      .doc(especialidade)
      .collection('items')
      .doc(itemId)
      .update(body)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Remover item
export async function DELETE(
  request: Request,
  { params }: { params: { tipo: string; especialidade: string; id: string[] } }
) {
  try {
    const { tipo, especialidade, id } = params
    const itemId = id[0]

    initAdmin()
    const db = getFirestore()

    await db
      .collection(tipo)
      .doc(especialidade)
      .collection('items')
      .doc(itemId)
      .delete()

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

---

## 🎯 COMO CRIAR:

1. **GitHub → Add file → Create new file**
2. **Nome:** `app/api/admin/content/[tipo]/[especialidade]/[[...id]]/route.ts`
   - ⚠️ **COPIA EXATAMENTE ASSIM!** Com todos os colchetes
3. **COPIA TODO O CÓDIGO ACIMA ☝️**
4. **COLA**
5. **Commit:** `Add admin CRUD API`
6. **Commit!** ✅

---

## 📂 ESTRUTURA:
```
app/
└── api/
    └── admin/
        └── content/
            └── [tipo]/
                └── [especialidade]/
                    └── [[...id]]/
                        └── route.ts  ← CRIAR AQUI
