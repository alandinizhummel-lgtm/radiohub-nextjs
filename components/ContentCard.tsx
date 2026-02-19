'use client'

import { useState, useMemo, useEffect } from 'react'
import DOMPurify from 'dompurify'
import { isFavorite, toggleFavorite } from '@/lib/user-data'
import MarkdownRenderer from '@/components/MarkdownRenderer'

interface ContentCardProps {
  id: string
  titulo: string
  conteudo: string
  subarea?: string
  autor?: string
  dataAtualizacao?: string
  tipo: 'resumo' | 'artigo' | 'mascara' | 'frase' | 'checklist' | 'tutorial' | 'video'
  especialidade?: string
}

export default function ContentCard({
  id,
  titulo,
  conteudo,
  subarea,
  autor,
  dataAtualizacao,
  tipo,
  especialidade
}: ContentCardProps) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [fav, setFav] = useState(false)
  const [shared, setShared] = useState(false)

  useEffect(() => {
    setFav(isFavorite(id))
  }, [id])

  const handleFavorite = () => {
    const tipoPlural = tipo + (tipo.endsWith('a') || tipo.endsWith('o') ? 's' : 's')
    const added = toggleFavorite({ id, tipo: tipoPlural, especialidade: especialidade || '', titulo, subarea })
    setFav(added)
  }

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, url })
        return
      } catch { /* user cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch { /* ignore */ }
  }

  // Detect HTML content with actual tags (not just < in text like "valor < 5")
  const isHtmlContent = tipo === 'mascara' && /<[a-z][\s\S]*>/i.test(conteudo)

  // Sanitize HTML content to prevent XSS
  const sanitizedHtml = useMemo(() => {
    if (!isHtmlContent) return ''
    return DOMPurify.sanitize(conteudo, {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'p', 'b', 'strong', 'i', 'em', 'u', 'br', 'hr', 'ul', 'ol', 'li', 'div', 'span', 'table', 'tr', 'td', 'th', 'thead', 'tbody'],
      ALLOWED_ATTR: ['class', 'style'],
      ALLOW_DATA_ATTR: false,
      // Only allow safe CSS properties (text-align for centering)
      SANITIZE_DOM: true,
    })
  }, [conteudo, isHtmlContent])

  const handleCopy = async () => {
    try {
      if (isHtmlContent) {
        const styledHtml = `<div style="font-family:'Calibri',sans-serif;font-size:12pt;line-height:1.5;">${sanitizedHtml}</div>`
        const htmlBlob = new Blob([styledHtml], { type: 'text/html' })
        // Extract plain text safely (only in browser)
        const div = document.createElement('div')
        div.innerHTML = conteudo
        const plainText = div.textContent || div.innerText || ''
        const textBlob = new Blob([plainText], { type: 'text/plain' })
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': htmlBlob,
            'text/plain': textBlob,
          })
        ])
      } else {
        await navigator.clipboard.writeText(conteudo)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      try {
        await navigator.clipboard.writeText(conteudo)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        setCopied(false)
      }
    }
  }

  const typeIcons: Record<string, string> = {
    resumo: '📚',
    artigo: '📄',
    mascara: '📝',
    frase: '💬',
    checklist: '✅',
    tutorial: '🎓',
    video: '🎬'
  }

  const renderInlineBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/)
    return parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="font-bold text-text">{part.slice(2, -2)}</strong>
      }
      return <span key={j}>{part}</span>
    })
  }

  // renderMascara kept for mascara type content
  const renderMascara = (text: string) => {
    const lines = text.split('\n')
    const elements: JSX.Element[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()

      if (!trimmed) {
        elements.push(<div key={i} className="h-4" />)
        continue
      }

      if (trimmed.startsWith('@@')) {
        elements.push(
          <div key={i} className="text-center mb-8">
            <h2 className="text-base font-bold text-text uppercase tracking-wide">
              {trimmed.slice(2).trim()}
            </h2>
          </div>
        )
        continue
      }

      if (trimmed.startsWith('## ')) {
        elements.push(
          <div key={i} className="mt-6 mb-2">
            <h3 className="text-sm font-bold text-text">
              {trimmed.slice(3).trim()}
            </h3>
          </div>
        )
        continue
      }

      if (trimmed === '---') {
        elements.push(<hr key={i} className="my-4 border-border" />)
        continue
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        elements.push(
          <div key={i} className="ml-4 text-text text-sm mb-1 leading-relaxed">
            {renderInlineBold(trimmed)}
          </div>
        )
        continue
      }

      elements.push(
        <p key={i} className="text-text text-sm mb-3 leading-relaxed">
          {renderInlineBold(trimmed)}
        </p>
      )
    }

    return elements
  }


  // For HTML masks: use CSS to truncate instead of slicing HTML
  const mascaraTruncateClass = !expanded ? 'max-h-96 overflow-hidden' : ''

  return (
    <div className="bg-surface border border-border rounded-xl p-4 sm:p-6 hover:border-accent/30 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="text-2xl sm:text-3xl" aria-hidden="true">{typeIcons[tipo]}</div>
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-text mb-1">{titulo}</h3>
            {subarea && (
              <span className="inline-block px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">
                {subarea}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 self-end sm:self-auto">
          <button
            onClick={handleFavorite}
            aria-label={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            className={`px-3 py-2 rounded-lg transition-all text-sm font-semibold ${fav ? 'bg-orange/20 text-orange' : 'bg-surface2 text-text3 hover:text-orange hover:bg-orange/10'}`}
          >
            {fav ? '★' : '☆'}
          </button>
          <button
            onClick={handleShare}
            aria-label={shared ? 'Link copiado' : 'Compartilhar'}
            className="px-3 py-2 bg-surface2 text-text3 rounded-lg hover:text-accent hover:bg-accent/10 transition-all text-sm font-semibold"
          >
            {shared ? '✓' : '↗'}
          </button>
          <button
            onClick={handleCopy}
            aria-label={copied ? 'Conteúdo copiado' : 'Copiar conteúdo'}
            className="px-4 py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent hover:text-white transition-all text-sm font-semibold whitespace-nowrap"
          >
            {copied ? '✓ Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>

      <div className="prose prose-sm max-w-none">
        {tipo === 'mascara' ? (
          isHtmlContent ? (
            <div
              className={`bg-bg2 rounded-lg px-4 sm:px-10 py-4 sm:py-8 border border-border shadow-inner mascara-content text-text text-sm leading-relaxed ${mascaraTruncateClass}`}
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          ) : (
            <div className={`bg-bg2 rounded-lg px-4 sm:px-10 py-4 sm:py-8 border border-border shadow-inner ${mascaraTruncateClass}`}>
              {renderMascara(conteudo)}
            </div>
          )
        ) : (
          <div className={!expanded && conteudo.length > 500 ? 'max-h-96 overflow-hidden' : ''}>
            <MarkdownRenderer content={conteudo} />
          </div>
        )}
      </div>

      {conteudo.length > 500 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 text-accent hover:text-accent2 transition-colors text-sm font-semibold"
        >
          {expanded ? '↑ Ver menos' : '↓ Ver mais'}
        </button>
      )}

      {(autor || dataAtualizacao) && (
        <div className="mt-4 pt-4 border-t border-border flex items-center gap-4 text-xs text-text3">
          {autor && <span><span aria-hidden="true">✍️</span> {autor}</span>}
          {dataAtualizacao && <span><span aria-hidden="true">📅</span> {dataAtualizacao}</span>}
        </div>
      )}
    </div>
  )
}
