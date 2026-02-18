'use client'

import { useState, useEffect } from 'react'
import ContentCard from './ContentCard'

interface ContentListProps {
  tipo: 'resumos' | 'artigos' | 'mascaras' | 'frases' | 'checklists' | 'tutoriais' | 'videos'
  especialidade: string
  subarea: string
}

interface ContentItem {
  id: string
  titulo: string
  conteudo: string
  subarea?: string
  autor?: string
  dataAtualizacao?: string
}

export default function ContentList({ tipo, especialidade, subarea }: ContentListProps) {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchContent()
  }, [tipo, especialidade, subarea])

  const fetchContent = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/content/${tipo}/${especialidade}/${encodeURIComponent(subarea)}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch content')
      }
      
      const data = await response.json()
      setItems(data.items || [])
      
    } catch (err) {
      console.error('Error fetching content:', err)
      setError('Erro ao carregar conteúdo')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
          <p className="text-text2">Carregando {tipo}...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red/10 border border-red/30 rounded-xl p-6 text-center">
        <div className="text-4xl mb-2">⚠️</div>
        <p className="text-red">{error}</p>
        <button
          onClick={fetchContent}
          className="mt-4 px-4 py-2 bg-red/20 text-red rounded-lg hover:bg-red/30"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl p-12 text-center">
        <div className="text-6xl mb-4">📭</div>
        <p className="text-xl text-text2 mb-2">Nenhum conteúdo encontrado</p>
        <p className="text-sm text-text3">
          Ainda não há {tipo} cadastrados para esta área.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 text-sm text-text3">
        {items.length} {items.length === 1 ? 'item encontrado' : 'itens encontrados'}
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {items.map((item) => (
          <ContentCard
            key={item.id}
            id={item.id}
            titulo={item.titulo}
            conteudo={item.conteudo}
            subarea={item.subarea}
            autor={item.autor}
            dataAtualizacao={item.dataAtualizacao}
            tipo={tipo.slice(0, -1) as any}
          />
        ))}
      </div>
    </div>
  )
}
