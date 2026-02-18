'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const SECTIONS = [
  { id: 'resumos', label: 'Resumos', icon: '📚', color: 'from-blue-500 to-blue-600' },
  { id: 'artigos', label: 'Artigos', icon: '📄', color: 'from-purple-500 to-purple-600' },
  { id: 'mascaras', label: 'Máscaras', icon: '📝', color: 'from-green-500 to-green-600' },
  { id: 'frases', label: 'Frases', icon: '💬', color: 'from-yellow-500 to-yellow-600' },
  { id: 'checklists', label: 'Checklists', icon: '✅', color: 'from-pink-500 to-pink-600' },
  { id: 'tutoriais', label: 'Tutoriais', icon: '🎓', color: 'from-indigo-500 to-indigo-600' },
  { id: 'videos', label: 'Vídeos', icon: '🎬', color: 'from-red-500 to-red-600' },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [selectedSection, setSelectedSection] = useState<string | null>(null)

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/feijaoxlogin')
  }

  if (selectedSection) {
    router.push(`/admin/edit/${selectedSection}`)
    return null
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-surface border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-accent2">🔐 Admin Panel</h1>
            <span className="text-sm text-text3">RadioHub v9.1</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-surface2 text-text rounded-lg hover:bg-border2 transition-all text-sm font-semibold"
            >
              🏠 Ver Site
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red/10 text-red rounded-lg hover:bg-red/20 transition-all text-sm font-semibold"
            >
              🚪 Sair
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-8 py-12">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold mb-4 text-text">
            Bem-vindo ao Painel Administrativo
          </h2>
          <p className="text-text2 text-lg">
            Selecione uma seção abaixo para gerenciar o conteúdo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold text-accent">10</div>
            <div className="text-sm text-text3">Especialidades</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="text-3xl mb-2">🏷️</div>
            <div className="text-2xl font-bold text-accent">87</div>
            <div className="text-sm text-text3">Sub-áreas</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="text-3xl mb-2">📚</div>
            <div className="text-2xl font-bold text-accent">1</div>
            <div className="text-sm text-text3">Itens Totais</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold text-accent">2</div>
            <div className="text-sm text-text3">Admins Ativos</div>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold mb-6 text-text">Gerenciar Conteúdo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SECTIONS.map(section => (
              <button
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                className="bg-surface border border-border rounded-xl p-8 hover:border-accent/50 hover:shadow-xl transition-all group text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`text-5xl p-4 rounded-2xl bg-gradient-to-br ${section.color} bg-opacity-10`}>
                    {section.icon}
                  </div>
                  <div className="text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </div>
                </div>
                <h4 className="text-xl font-bold text-text group-hover:text-accent transition-colors mb-2">
                  {section.label}
                </h4>
                <p className="text-sm text-text3 mb-4">
                  Adicionar, editar e remover {section.label.toLowerCase()}
                </p>
                <div className="flex items-center gap-2 text-xs text-text3">
                  <span>✏️ Editar</span>
                  <span>•</span>
                  <span>➕ Adicionar</span>
                  <span>•</span>
                  <span>🗑️ Deletar</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-accent/10 to-accent2/10 border border-accent/30 rounded-xl p-8">
          <h3 className="text-xl font-bold mb-4 text-text">⚡ Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent2 transition-all font-semibold">
              ➕ Adicionar Resumo Rápido
            </button>
            <button className="px-6 py-3 bg-surface2 text-text border border-border rounded-lg hover:border-accent/50 transition-all font-semibold">
              📥 Importar JSON
            </button>
            <button className="px-6 py-3 bg-surface2 text-text border border-border rounded-lg hover:border-accent/50 transition-all font-semibold">
              📊 Ver Estatísticas
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
