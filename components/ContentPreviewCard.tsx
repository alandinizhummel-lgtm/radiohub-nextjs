'use client'

import { useRouter } from 'next/navigation'

interface ContentPreviewCardProps {
  id: string
  titulo: string
  conteudo: string
  subarea?: string
  autor?: string
  dataAtualizacao?: string
  tipo: 'resumos' | 'artigos' | 'mascaras' | 'frases' | 'checklists' | 'tutoriais' | 'videos'
  especialidade: string
}

export default function ContentPreviewCard({
  id,
  titulo,
  conteudo,
  subarea,
  autor,
  dataAtualizacao,
  tipo,
  especialidade
}: ContentPreviewCardProps) {
  const router = useRouter()

  const typeIcons: Record<string, string> = {
    resumos: '📚',
    artigos: '📄',
    mascaras: '📝',
    frases: '💬',
    checklists: '✅',
    tutoriais: '🎓',
    videos: '🎬'
  }

  const preview = conteudo
    .replace(/IMG:.*\n/g, '')
    .replace(/LEGENDA:.*\n/g, '')
    .replace(/\*\*/g, '')
    .replace(/# /g, '')
    .slice(0, 150) + '...'

  const handleClick = () => {
    router.push(`/${tipo}/${especialidade}/${id}`)
  }

  return (
    <div 
      onClick={handleClick}
      className="bg-surface border border-border rounded-xl p-5 hover:border-accent hover:shadow-lg transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="text-3xl">{typeIcons[tipo]}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-text mb-1 group-hover:text-accent transition-colors line-clamp-2">
            {titulo}
          </h3>
          {subarea && (
            <span className="inline-block px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">
              {subarea}
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-text3 mb-3 line-clamp-3 leading-relaxed">
        {preview}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-3 text-xs text-text3">
          {autor && <span>✍️ {autor}</span>}
          {dataAtualizacao && <span>📅 {dataAtualizacao}</span>}
        </div>
        <div className="text-accent text-sm font-semibold group-hover:translate-x-1 transition-transform">
          Abrir →
        </div>
      </div>
    </div>
  )
}
