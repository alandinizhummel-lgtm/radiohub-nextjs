'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import ContentCard from '@/components/ContentCard'
import { TYPE_LABELS, TYPE_SINGULAR } from '@/lib/specs'
import type { ContentItem } from '@/lib/types'
import { cachedFetch } from '@/lib/cached-fetch'
import { addToHistory } from '@/lib/user-data'

export default function ContentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const tipo = params.tipo as string
  const especialidade = params.especialidade as string
  const id = params.id as string

  const [item, setItem] = useState<ContentItem | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchItem = useCallback(async () => {
    try {
      const data = await cachedFetch(`/api/content/${tipo}/${especialidade}/item/${id}`)
      setItem(data.item)
      if (data.item) {
        addToHistory({ id, tipo, especialidade, titulo: data.item.titulo, subarea: data.item.subarea })
      }
    } catch {
      setItem(null)
    } finally {
      setLoading(false)
    }
  }, [tipo, especialidade, id])

  useEffect(() => {
    fetchItem()
  }, [fetchItem])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg pt-16">
        <div className="container mx-auto px-8 py-12">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
            <p className="text-text2">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-bg pt-16">
        <div className="container mx-auto px-8 py-12">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">❌</div>
            <p className="text-xl text-text2 mb-4">Conteúdo não encontrado</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent2"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </div>
    )
  }

  const tipoSingular = TYPE_SINGULAR[tipo as keyof typeof TYPE_SINGULAR] || tipo
  const tipoLabel = TYPE_LABELS[tipo as keyof typeof TYPE_LABELS] || tipo

  return (
    <div className="min-h-screen bg-bg pt-16">
      <div className="container mx-auto px-8 py-12 max-w-5xl">
        <button
          onClick={() => router.back()}
          className="mb-6 text-accent hover:text-accent2 transition-colors flex items-center gap-2"
        >
          ← Voltar para {tipoLabel}s
        </button>

        <ContentCard
          id={item.id}
          titulo={item.titulo}
          conteudo={item.conteudo}
          subarea={item.subarea}
          autor={item.autor}
          dataAtualizacao={item.dataAtualizacao}
          tipo={tipoSingular as any}
          especialidade={especialidade}
        />
      </div>
    </div>
  )
}
