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
    } catch (error) {
      console.error('Logout error:', error)
      setLoggingOut(false)
    }
  }

  const sections = [
    { id: 'resumos', icon: '📚', label: 'Resumos', color: 'from-blue-500 to-blue-600' },
    { id: 'artigos', icon: '📄', label: 'Artigos', color: 'from-green-500 to-green-600' },
    { id: 'mascaras', icon: '📝', label: 'Máscaras', color: 'from-purple-500 to-purple-600' },
    { id: 'frases', icon: '💬', label: 'Frases', color: 'from-yellow-500 to-yellow-600' },
    { id: 'checklists', icon: '✅', label: 'Checklists', color: 'from-red-500 to-red-600' },
    { id: 'tutoriais', icon: '🎓', label: 'Tutoriais', color: 'from-indigo-500 to-indigo-600' },
    { id: 'videos', icon: '🎬', label: 'Vídeos', color: 'from-pink-500 to-pink-600' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">🔐 Admin Panel</h1>
            <p className="text-gray-400">RadioHub v10.0 - Painel de Administração</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
            >
              🌐 Ver Site
            </button>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
            >
              {loggingOut ? '⏳ Saindo...' : '🚪 Sair'}
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-8 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">📊 Estatísticas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <div className="text-3xl font-bold text-blue-400">11</div>
              <div className="text-sm text-gray-400 mt-1">Especialidades</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <div className="text-3xl font-bold text-green-400">90+</div>
              <div className="text-sm text-gray-400 mt-1">Sub-áreas</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <div className="text-3xl font-bold text-purple-400">7</div>
              <div className="text-sm text-gray-400 mt-1">Tipos de Conteúdo</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <div className="text-3xl font-bold text-yellow-400">∞</div>
              <div className="text-sm text-gray-400 mt-1">Possibilidades</div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-6">📝 Gerenciar Conteúdo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => router.push(`/admin/edit/${section.id}`)}
              className="group relative bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-gray-600 transition-all hover:shadow-2xl hover:scale-105"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`}></div>
              <div className="relative">
                <div className="text-5xl mb-4">{section.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{section.label}</h3>
                <p className="text-sm text-gray-400">Criar, editar e gerenciar {section.label.toLowerCase()}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-2">🚀 RadioHub v10.0</h3>
          <p className="text-blue-100 mb-4">
            11 especialidades • Cards pequenos • Dropdown vertical • Imagens com legendas • Interface profissional
          </p>
          <div className="flex gap-2 text-sm">
            <span className="px-3 py-1 bg-white/20 rounded-full">Neuro</span>
            <span className="px-3 py-1 bg-white/20 rounded-full">C&P</span>
            <span className="px-3 py-1 bg-white/20 rounded-full">Tórax</span>
            <span className="px-3 py-1 bg-white/20 rounded-full">Cardiovascular</span>
            <span className="px-3 py-1 bg-white/20 rounded-full">+7 mais</span>
          </div>
        </div>
      </div>
    </div>
  )
}
