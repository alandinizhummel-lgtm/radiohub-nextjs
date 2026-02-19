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
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)

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

  if (selectedItem) {
    return (
      <div>
        <button
          onClick={() => setSelectedItem(null)}
          className="mb-6 text-accent hover:text-accent2 transition-colors flex items-center gap-2"
        >
          ← Voltar para a lista
        </button>
        <ContentCard
          id={selectedItem.id}
          titulo={selectedItem.titulo}
          conteudo={selectedItem.conteudo}
          subarea={selectedItem.subarea}
          autor={selectedItem.autor}
          dataAtualizacao={selectedItem.dataAtualizacao}
          tipo={tipo.slice(0, -1) as any}
        />
      </div>
    )
  }

  const typeIcons: Record<string, string> = {
    resumos: '📚',
    artigos: '📄',
    mascaras: '📝',
    frases: '💬',
    checklists: '✅',
    tutoriais: '🎓',
    videos: '🎬'
  }

  return (
    <div>
      <div className="mb-4 text-sm text-text3">
        {items.length} {items.length === 1 ? 'item encontrado' : 'itens encontrados'}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="bg-surface border border-border rounded-xl p-5 hover:border-accent hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="text-3xl">{typeIcons[tipo]}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-text mb-1 group-hover:text-accent transition-colors line-clamp-2">
                  {item.titulo}
                </h3>
                {item.subarea && (
                  <span className="inline-block px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">
                    {item.subarea}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-3 text-xs text-text3">
                {item.autor && <span>✍️ {item.autor}</span>}
                {item.dataAtualizacao && <span>📅 {item.dataAtualizacao}</span>}
              </div>
              <div className="text-accent text-sm font-semibold group-hover:translate-x-1 transition-transform">
                Ver →
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
