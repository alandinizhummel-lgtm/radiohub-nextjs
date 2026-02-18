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
  titulo,
  conteudo,
  subarea,
  autor,
  dataAtualizacao,
  tipo
}: ContentCardProps) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(conteudo)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shouldTruncate = conteudo.length > 500
  const displayContent = expanded ? conteudo : conteudo.slice(0, 500)

  const typeIcons: Record<string, string> = {
    resumo: '📚',
    artigo: '📄',
    mascara: '📝',
    frase: '💬',
    checklist: '✅',
    tutorial: '🎓',
    video: '🎬'
  }

  // Renderiza conteúdo com formatação básica
  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Títulos em negrito
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <div key={i} className="font-bold text-lg text-accent mt-4 mb-2">
            {line.replace(/\*\*/g, '')}
          </div>
        )
      }
      
      // Subtítulos
      if (line.startsWith('# ')) {
        return (
          <div key={i} className="font-bold text-base text-text mt-3 mb-1">
            {line.replace('# ', '')}
          </div>
        )
      }
      
      // Bullets
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return (
          <div key={i} className="ml-4 text-text2 text-sm mb-1">
            {line}
          </div>
        )
      }
      
      // Tabelas (detecta linhas com |)
      if (line.includes('|')) {
        const cells = line.split('|').filter(c => c.trim())
        const isHeader = line.includes('---')
        
        if (isHeader) {
          return <div key={i} className="border-t border-border my-2" />
        }
        
        return (
          <div key={i} className="grid grid-cols-3 gap-2 text-xs mb-1">
            {cells.map((cell, j) => (
              <div key={j} className={`${j === 0 ? 'font-bold text-accent' : 'text-text3'} px-2`}>
                {cell.trim()}
              </div>
            ))}
          </div>
        )
      }
      
      // Divisores
      if (line.trim() === '---') {
        return <hr key={i} className="my-4 border-border" />
      }
      
      // Alertas/Destaques
      if (line.startsWith('⚠️') || line.startsWith('✓') || line.startsWith('❗')) {
        return (
          <div key={i} className="bg-accent/10 border-l-4 border-accent px-3 py-2 my-2 text-sm text-text">
            {line}
          </div>
        )
      }
      
      // Texto normal
      if (line.trim()) {
        return (
          <p key={i} className="text-text2 text-sm mb-2 leading-relaxed">
            {line}
          </p>
        )
      }
      
      return <br key={i} />
    })
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6 hover:border-accent/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="text-3xl">{typeIcons[tipo]}</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-text mb-1">{titulo}</h3>
            {subarea && (
              <span className="inline-block px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">
                {subarea}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent hover:text-white transition-all text-sm font-semibold whitespace-nowrap ml-4"
        >
          {copied ? '✓ Copiado!' : '📋 Copiar'}
        </button>
      </div>

      <div className={`prose prose-sm max-w-none ${!expanded && shouldTruncate ? 'max-h-96 overflow-hidden' : ''}`}>
        {renderContent(displayContent)}
      </div>

      {shouldTruncate && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 text-accent hover:text-accent2 transition-colors text-sm font-semibold"
        >
          {expanded ? '↑ Ver menos' : '↓ Ver mais'}
        </button>
      )}

      {(autor || dataAtualizacao) && (
        <div className="mt-4 pt-4 border-t border-border flex items-center gap-4 text-xs text-text3">
          {autor && <span>✍️ {autor}</span>}
          {dataAtualizacao && <span>📅 {dataAtualizacao}</span>}
        </div>
      )}
    </div>
  )
}
