'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import ContentCard from '@/components/ContentCard'

export default function ContentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const tipo = params.tipo as string
  const especialidade = params.especialidade as string
  const id = params.id as string

  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchItem()
  }, [])

  const fetchItem = async () => {
    try {
      const response = await fetch(`/api/content/${tipo}/${especialidade}/all`)
      const data = await response.json()
      const foundItem = data.items.find((i: any) => i.id === id)
      setItem(foundItem)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const typeLabels: Record<string, string> = {
    resumos: 'Resumo',
    artigos: 'Artigo',
    mascaras: 'Máscara',
    frases: 'Frase',
    checklists: 'Checklist',
    tutoriais: 'Tutorial',
    videos: 'Vídeo'
  }

  return (
    <div className="min-h-screen bg-bg pt-16">
      <div className="container mx-auto px-8 py-12 max-w-5xl">
        <button
          onClick={() => router.back()}
          className="mb-6 text-accent hover:text-accent2 transition-colors flex items-center gap-2"
        >
          ← Voltar para {typeLabels[tipo]}s
        </button>

        <ContentCard
          id={item.id}
          titulo={item.titulo}
          conteudo={item.conteudo}
          subarea={item.subarea}
          autor={item.autor}
          dataAtualizacao={item.dataAtualizacao}
          tipo={tipo.slice(0, -1) as any}
        />
      </div>
    </div>
  )
}
