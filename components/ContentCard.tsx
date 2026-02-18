'use client'

import { useState } from 'react'

interface ContentCardProps {
  id: string
  titulo: string
  conteudo: string
  subarea?: string
  autor?: string
  dataAtualizacao?: string
  tipo: 'resumo' | 'artigo' | 'mascara' | 'frase' | 'checklist' | 'tutorial' | 'video'
}

export default function ContentCard({
  id,
  titulo,
  conteudo,
  subarea,
  autor,
  dataAtualizacao,
  tipo
}: ContentCardProps) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(conteudo)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getTipoIcon = () => {
    switch (tipo) {
      case 'resumo': return '📚'
      case 'artigo': return '📄'
      case 'mascara': return '📝'
      case 'frase': return '💬'
      case 'checklist': return '✅'
      case 'tutorial': return '🎓'
      case 'video': return '🎬'
      default: return '📄'
    }
  }

  const preview = conteudo.slice(0, 150)
  const hasMore = conteudo.length > 150

  return (
    <div className="bg-surface border border-border rounded-xl p-6 hover:border-accent/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{getTipoIcon()}</span>
            <h3 className="text-lg font-semibold text-text">{titulo}</h3>
          </div>
          {subarea && (
            <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded">
              {subarea}
            </span>
          )}
        </div>
        
        <button
          onClick={handleCopy}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            copied
              ? 'bg-green/20 text-green'
              : 'bg-accent/10 text-accent hover:bg-accent/20'
          }`}
        >
          {copied ? '✓ Copiado!' : '📋 Copiar'}
        </button>
      </div>

      <div className="mb-4">
        <p className="text-sm text-text2 whitespace-pre-wrap">
          {expanded ? conteudo : preview}
          {!expanded && hasMore && '...'}
        </p>
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-accent hover:text-accent2 mt-2"
          >
            {expanded ? '↑ Ver menos' : '↓ Ver mais'}
          </button>
        )}
      </div>

      {(autor || dataAtualizacao) && (
        <div className="flex items-center gap-4 text-xs text-text3 pt-4 border-t border-border">
          {autor && <span>✍️ {autor}</span>}
          {dataAtualizacao && <span>🕐 {dataAtualizacao}</span>}
        </div>
      )}
    </div>
  )
}
