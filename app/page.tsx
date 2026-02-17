'use client'

import { useState } from 'react'

// ESPECIALIDADES (copiadas do RadioHub original)
const SPECS = {
  neuro: {
    label: 'Neurorradiologia',
    icon: '🧠',
    subs: ['Encéfalo', 'AVC/Isquemia', 'Neoplasias Intracranianas']
  },
  torax: {
    label: 'Tórax',
    icon: '🫁',
    subs: ['Parênquima Pulmonar', 'Nódulo/Massa Pulmonar', 'Infecção/Pneumonia']
  }
}

export default function Home() {
  const [currentSpec, setCurrentSpec] = useState('neuro')
  const [currentSubArea, setCurrentSubArea] = useState('all')

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-blue-900 z-50 flex items-center justify-center">
        <h1 className="text-2xl font-bold">TESTE SUB-ÁREAS</h1>
      </header>

      {/* TABS ESPECIALIDADES - SEMPRE VISÍVEL */}
      <div className="fixed top-16 left-0 right-0 h-14 bg-green-700 z-40 flex items-center justify-center gap-4">
        <div className="text-white font-bold">ESPECIALIDADES:</div>
        <button
          onClick={() => setCurrentSpec('neuro')}
          className={`px-4 py-2 rounded ${currentSpec === 'neuro' ? 'bg-white text-black' : 'bg-green-900 text-white'}`}
        >
          🧠 Neuro
        </button>
        <button
          onClick={() => setCurrentSpec('torax')}
          className={`px-4 py-2 rounded ${currentSpec === 'torax' ? 'bg-white text-black' : 'bg-green-900 text-white'}`}
        >
          🫁 Tórax
        </button>
      </div>

      {/* SUB-AREAS - SEMPRE VISÍVEL COM FUNDO VERMELHO */}
      <div className="fixed top-[120px] left-0 right-0 h-16 bg-red-600 z-30 flex items-center justify-center gap-4 border-4 border-yellow-400">
        <div className="text-white font-bold text-xl">SUB-ÁREAS ({currentSpec}):</div>
        <button 
          onClick={() => setCurrentSubArea('all')}
          className={`px-4 py-2 rounded font-bold ${currentSubArea === 'all' ? 'bg-white text-black' : 'bg-red-900 text-white'}`}
        >
          TODAS
        </button>
        {SPECS[currentSpec as keyof typeof SPECS].subs.map(sub => (
          <button
            key={sub}
            onClick={() => setCurrentSubArea(sub)}
            className={`px-4 py-2 rounded font-bold ${currentSubArea === sub ? 'bg-white text-black' : 'bg-red-900 text-white'}`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* CONTEÚDO */}
      <main className="pt-[200px] p-8">
        <div className="bg-gray-800 p-12 rounded-lg text-center">
          <h2 className="text-4xl font-bold mb-4">TESTE DE DEBUG</h2>
          <p className="text-2xl mb-4">Especialidade atual: <span className="text-green-400">{currentSpec}</span></p>
          <p className="text-2xl mb-4">Sub-área atual: <span className="text-red-400">{currentSubArea}</span></p>
          
          <div className="mt-8 p-6 bg-yellow-900 rounded">
            <p className="text-xl font-bold">SE VOCÊ VÊ ESTA MENSAGEM:</p>
            <p className="text-lg mt-2">✅ O arquivo foi atualizado corretamente</p>
            <p className="text-lg mt-2">✅ As sub-áreas DEVEM estar visíveis acima (fundo VERMELHO)</p>
            <p className="text-lg mt-2">✅ Se NÃO vê o fundo vermelho = arquivo NÃO foi atualizado</p>
          </div>

          <div className="mt-8 p-6 bg-blue-900 rounded">
            <p className="text-xl font-bold">INSTRUÇÕES:</p>
            <p className="text-lg mt-2">1. Vê uma barra AZUL no topo? (header)</p>
            <p className="text-lg mt-2">2. Vê uma barra VERDE abaixo? (especialidades)</p>
            <p className="text-lg mt-2">3. Vê uma barra VERMELHA COM BORDA AMARELA? (sub-áreas)</p>
            <p className="text-lg mt-2 font-bold text-yellow-300">SE NÃO VÊ A VERMELHA = ARQUIVO NÃO ATUALIZOU!</p>
          </div>
        </div>
      </main>
    </div>
  )
}
