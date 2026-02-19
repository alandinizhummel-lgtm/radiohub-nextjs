'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import ContentCard from './ContentCard'
import { TYPE_SINGULAR, type ContentType } from '@/lib/specs'
import type { ContentItem } from '@/lib/types'
import { cachedFetch } from '@/lib/cached-fetch'
import { addToHistory } from '@/lib/user-data'

interface ContentListProps {
  tipo: ContentType
  especialidade: string
  subarea: string
  initialItemId?: string | null
}

function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-surface2 rounded-lg" />
        <div className="flex-1">
          <div className="h-5 bg-surface2 rounded w-3/4 mb-2" />
          <div className="h-4 bg-surface2 rounded w-1/3" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex gap-3">
          <div className="h-3 bg-surface2 rounded w-16" />
          <div className="h-3 bg-surface2 rounded w-20" />
        </div>
        <div className="h-4 bg-surface2 rounded w-10" />
      </div>
    </div>
  )
}

function FraseCard({ item }: { item: ContentItem }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  // Strip markdown formatting for plain text copy
  const plainText = (item.conteudo || '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/^---$/gm, '')
    .replace(/^- /gm, '• ')
    .trim()

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(plainText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  // Extract first few meaningful lines for preview
  const previewLines = plainText.split('\n').filter(l => l.trim()).slice(0, 3).join('\n')

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden hover:border-accent/40 transition-all">
      {/* Header: always visible */}
      <div className="p-4 flex items-center gap-3">
        <div className="text-2xl flex-shrink-0" aria-hidden="true">💬</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-text line-clamp-1">{item.titulo}</h3>
          {item.subarea && (
            <span className="text-xs text-text3">{item.subarea}</span>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-1.5 bg-surface2 text-text3 rounded-lg hover:text-text hover:bg-border transition-all text-xs font-semibold"
            aria-expanded={expanded}
          >
            {expanded ? '↑ Recolher' : '↓ Expandir'}
          </button>
          <button
            onClick={handleCopy}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              copied
                ? 'bg-green/20 text-green'
                : 'bg-accent/10 text-accent hover:bg-accent hover:text-white'
            }`}
          >
            {copied ? '✓ Copiado' : 'Copiar'}
          </button>
        </div>
      </div>

      {/* Preview: always show first lines */}
      {!expanded && (
        <div className="px-4 pb-4 -mt-1">
          <p className="text-xs text-text3 line-clamp-2 whitespace-pre-line">{previewLines}</p>
        </div>
      )}

      {/* Expanded: full content */}
      {expanded && (
        <div className="border-t border-border bg-bg2 px-4 py-4">
          <pre className="text-sm text-text whitespace-pre-wrap font-sans leading-relaxed">{plainText}</pre>
        </div>
      )}
    </div>
  )
}

export default function ContentList({ tipo, especialidade, subarea, initialItemId }: ContentListProps) {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const cursors = useRef<Record<number, string>>({})

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let url = `/api/content/${tipo}/${especialidade}/items?subarea=${encodeURIComponent(subarea)}&page=${page}&limit=20`

      // Use cursor for pages > 1 if available (faster than offset)
      const cursor = cursors.current[page]
      if (cursor) {
        url += `&cursor=${encodeURIComponent(cursor)}`
      }

      const data = await cachedFetch(url)
      setItems(data.items || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)

      // Store cursor for next page
      if (data.nextCursor) {
        cursors.current[page + 1] = data.nextCursor
      }

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar conteúdo'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [tipo, especialidade, subarea, page])

  // Reset page and cursors when filters change
  useEffect(() => {
    setPage(1)
    setSelectedItem(null)
    cursors.current = {}
  }, [tipo, especialidade, subarea])

  // Open specific item directly (from search or deep link)
  useEffect(() => {
    if (!initialItemId) return
    setLoading(true)
    cachedFetch(`/api/content/${tipo}/${especialidade}/item/${initialItemId}`)
      .then(data => {
        if (data.item) {
          setSelectedItem(data.item)
          addToHistory({ id: data.item.id, tipo, especialidade, titulo: data.item.titulo, subarea: data.item.subarea })
        }
      })
      .catch(() => { /* item not found, show list instead */ })
      .finally(() => setLoading(false))
  }, [initialItemId, tipo, especialidade])

  useEffect(() => {
    if (!initialItemId) fetchContent()
  }, [fetchContent, initialItemId])

  if (loading) {
    return (
      <div>
        <div className="mb-4 h-4 bg-surface2 rounded w-32 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
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
          tipo={TYPE_SINGULAR[tipo] as any}
          especialidade={especialidade}
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

  // For frases: render inline expandable cards with copy buttons
  if (tipo === 'frases') {
    return (
      <div>
        <div className="mb-4 text-sm text-text3">
          {total} {total === 1 ? 'item encontrado' : 'itens encontrados'}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <FraseCard key={item.id} item={item} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-surface2 text-text border border-border rounded-lg hover:border-accent/50 transition-all text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Anterior
            </button>
            <span className="px-4 py-2 text-sm text-text2">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-surface2 text-text border border-border rounded-lg hover:border-accent/50 transition-all text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Próxima →
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 text-sm text-text3">
        {total} {total === 1 ? 'item encontrado' : 'itens encontrados'}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              addToHistory({ id: item.id, tipo, especialidade, titulo: item.titulo, subarea: item.subarea })
              setSelectedItem(item)
            }}
            className="bg-surface border border-border rounded-xl p-5 hover:border-accent hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="text-3xl" aria-hidden="true">{typeIcons[tipo]}</div>
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
                {item.autor && <span><span aria-hidden="true">✍️</span> {item.autor}</span>}
                {item.dataAtualizacao && <span><span aria-hidden="true">📅</span> {item.dataAtualizacao}</span>}
              </div>
              <div className="text-accent text-sm font-semibold group-hover:translate-x-1 transition-transform">
                Ver →
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-surface2 text-text border border-border rounded-lg hover:border-accent/50 transition-all text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Anterior
          </button>
          <span className="px-4 py-2 text-sm text-text2">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-surface2 text-text border border-border rounded-lg hover:border-accent/50 transition-all text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  )
}
