import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  
  // Remove o cookie
  response.cookies.delete('admin-token')
  
  return response
}
```

---

## 🎯 COMO CRIAR:

1. **GitHub → Add file → Create new file**
2. **Nome:** `app/api/admin/logout/route.ts`
3. **COPIA TODO O CÓDIGO ACIMA ☝️** (é bem pequeno!)
4. **COLA**
5. **Commit:** `Add admin logout API`
6. **Commit!** ✅

---

## 📂 ESTRUTURA:
```
app/
└── api/
    └── admin/
        └── logout/
            └── route.ts  ← CRIAR AQUI
