'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminDashboard() {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/feijaoxlogin')
    } catch {
      setLoggingOut(false)
    }
  }

  const sections = [
    { id: 'resumos', icon: '📚', label: 'Resumos' },
    { id: 'artigos', icon: '📄', label: 'Artigos' },
    { id: 'mascaras', icon: '📝', label: 'Máscaras' },
    { id: 'frases', icon: '💬', label: 'Frases' },
    { id: 'checklists', icon: '✅', label: 'Checklists' },
    { id: 'tutoriais', icon: '🎓', label: 'Tutoriais' },
    { id: 'videos', icon: '🎬', label: 'Vídeos' }
  ]

  return (
    <div className="min-h-screen bg-bg">
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-text mb-2">🔐 Admin Panel</h1>
            <p className="text-text3">Radiologyhub - Painel de Administração</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-surface2 text-text border border-border rounded-lg hover:border-accent/50 transition-all"
            >
              🌐 Ver Site
            </button>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="px-6 py-2 bg-red/20 text-red border border-red/30 rounded-lg hover:bg-red/30 transition-all disabled:opacity-50"
            >
              {loggingOut ? '⏳ Saindo...' : '🚪 Sair'}
            </button>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-8 mb-8 border border-border">
          <h2 className="text-2xl font-bold text-text mb-6">📊 Estatísticas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-bg2 rounded-xl p-6 border border-border">
              <div className="text-3xl font-bold text-accent">11</div>
              <div className="text-sm text-text3 mt-1">Especialidades</div>
            </div>
            <div className="bg-bg2 rounded-xl p-6 border border-border">
              <div className="text-3xl font-bold text-green">90+</div>
              <div className="text-sm text-text3 mt-1">Sub-áreas</div>
            </div>
            <div className="bg-bg2 rounded-xl p-6 border border-border">
              <div className="text-3xl font-bold text-orange">7</div>
              <div className="text-sm text-text3 mt-1">Tipos de Conteúdo</div>
            </div>
            <div className="bg-bg2 rounded-xl p-6 border border-border">
              <div className="text-3xl font-bold text-accent2">∞</div>
              <div className="text-sm text-text3 mt-1">Possibilidades</div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-text mb-6">📝 Gerenciar Conteúdo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => router.push(`/admin/edit/${section.id}`)}
              className="group bg-surface rounded-2xl p-8 border border-border hover:border-accent/50 transition-all hover:shadow-lg text-left"
            >
              <div className="text-5xl mb-4">{section.icon}</div>
              <h3 className="text-xl font-bold text-text mb-2 group-hover:text-accent transition-colors">{section.label}</h3>
              <p className="text-sm text-text3">Criar, editar e gerenciar {section.label.toLowerCase()}</p>
            </button>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-accent/20 to-accent2/20 border border-accent/30 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-text mb-2">🚀 Radiologyhub</h3>
          <p className="text-text2 mb-4">
            11 especialidades • Máscaras WYSIWYG • Paginação • Interface profissional
          </p>
          <div className="flex gap-2 text-sm">
            <span className="px-3 py-1 bg-accent/20 text-accent rounded-full">Neuro</span>
            <span className="px-3 py-1 bg-accent/20 text-accent rounded-full">C&P</span>
            <span className="px-3 py-1 bg-accent/20 text-accent rounded-full">Tórax</span>
            <span className="px-3 py-1 bg-accent/20 text-accent rounded-full">Cardiovascular</span>
            <span className="px-3 py-1 bg-accent/20 text-accent rounded-full">+7 mais</span>
          </div>
        </div>
      </div>
    </div>
  )
}
