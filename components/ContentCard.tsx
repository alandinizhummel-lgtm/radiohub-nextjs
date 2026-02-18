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

  const renderContent = (text: string) => {
    const lines = text.split('\n')
    const elements: JSX.Element[] = []
    let i = 0

    while (i < lines.length) {
      const line = lines[i]

      if (line.trim().startsWith('IMG:')) {
        const imageUrl = line.replace('IMG:', '').trim()
        let caption = ''
        
        if (i + 1 < lines.length && lines[i + 1].trim().startsWith('LEGENDA:')) {
          caption = lines[i + 1].replace('LEGENDA:', '').trim()
          i++
        }

        elements.push(
          <div key={i} className="my-6 bg-surface2 rounded-lg overflow-hidden border border-border">
            <img 
              src={imageUrl} 
              alt={caption}
              className="w-full h-auto"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/800x400/1a1a1a/666666?text=Imagem+não+encontrada'
              }}
            />
            {caption && (
              <div className="px-4 py-3 bg-surface border-t border-border">
                <p className="text-sm text-text3 italic">
                  📷 {caption}
                </p>
              </div>
            )}
          </div>
        )
        i++
        continue
      }

      if (line.startsWith('**') && line.endsWith('**')) {
        elements.push(
          <div key={i} className="font-bold text-lg text-accent mt-4 mb-2">
            {line.replace(/\*\*/g, '')}
          </div>
        )
        i++
        continue
      }
      
      if (line.startsWith('# ')) {
        elements.push(
          <div key={i} className="font-bold text-base text-text mt-3 mb-1">
            {line.replace('# ', '')}
          </div>
        )
        i++
        continue
      }
      
      if (line.startsWith('• ') || line.startsWith('- ')) {
        elements.push(
          <div key={i} className="ml-4 text-text2 text-sm mb-1">
            {line}
          </div>
        )
        i++
        continue
      }
      
      if (line.includes('|')) {
        const cells = line.split('|').filter(c => c.trim())
        const isHeader = line.includes('---')
        
        if (isHeader) {
          elements.push(<div key={i} className="border-t border-border my-2" />)
          i++
          continue
        }
        
        elements.push(
          <div key={i} className="grid grid-cols-3 gap-2 text-xs mb-1">
            {cells.map((cell, j) => (
              <div key={j} className={`${j === 0 ? 'font-bold text-accent' : 'text-text3'} px-2`}>
                {cell.trim()}
              </div>
            ))}
          </div>
        )
        i++
        continue
      }
      
      if (line.trim() === '---') {
        elements.push(<hr key={i} className="my-4 border-border" />)
        i++
        continue
      }
      
      if (line.startsWith('⚠️') || line.startsWith('✓') || line.startsWith('❗')) {
        elements.push(
          <div key={i} className="bg-accent/10 border-l-4 border-accent px-3 py-2 my-2 text-sm text-text">
            {line}
          </div>
        )
        i++
        continue
      }
      
      if (line.trim()) {
        elements.push(
          <p key={i} className="text-text2 text-sm mb-2 leading-relaxed">
            {line}
          </p>
        )
      } else {
        elements.push(<br key={i} />)
      }
      
      i++
    }

    return elements
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
