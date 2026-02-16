'use client'

import { useState } from 'react'

// ESPECIALIDADES (copiadas do RadioHub original)
const SPECS = {
  neuro: {
    label: 'Neurorradiologia',
    icon: '🧠',
    subs: ['Encéfalo', 'AVC/Isquemia', 'Neoplasias Intracranianas', 'Infecção/Inflamação', 'Trauma Craniano', 'Malformações Vasculares', 'Coluna Cervical', 'Coluna Torácica', 'Coluna Lombossacra', 'Vascular Cerebral', 'Nervos Cranianos', 'Pediatria Neuro']
  },
  cn: {
    label: 'Cabeça e Pescoço',
    icon: '🦷',
    subs: ['Tireoide/Paratireoide', 'Laringe/Faringe', 'Cavidade Oral/Mandíbula', 'Órbita/Globo Ocular', 'Ouvido/Mastoide', 'Glândulas Salivares', 'Espaços Cervicais', 'Linfonodos Cervicais']
  },
  gi: {
    label: 'Abdome · Digestivo',
    icon: '🩺',
    subs: ['Fígado', 'Vias Biliares/Vesícula', 'Pâncreas', 'Baço', 'Estômago/Esôfago', 'Intestino Delgado', 'Cólon/Reto', 'Peritônio/Mesentério', 'Abdome Agudo']
  },
  gu: {
    label: 'Abdome · Geniturinário',
    icon: '🔵',
    subs: ['Rins', 'Adrenal', 'Bexiga', 'Ureter/Pelve Renal', 'Próstata', 'Testículo/Epidídimo', 'Pênis', 'Útero/Ovários', 'Retroperitônio']
  },
  msk: {
    label: 'Músculo-Esquelética',
    icon: '🦴',
    subs: ['Ombro', 'Cotovelo', 'Punho/Mão', 'Quadril', 'Joelho', 'Tornozelo/Pé', 'Coluna MSK', 'Partes Moles/Músculo', 'Tumores Ósseos/Partes Moles']
  },
  mama: {
    label: 'Mamária',
    icon: '🎀',
    subs: ['Mamografia', 'US Mama', 'RM Mama', 'BI-RADS', 'Mama Masculina', 'Intervenção/Biópsia Mama']
  },
  vasc: {
    label: 'Vascular e Interv.',
    icon: '💉',
    subs: ['Aorta Torácica', 'Aorta Abdominal', 'Artérias Periféricas', 'Veias/TEP', 'Tórax/Pulmão Vascular', 'Intervenção Arterial', 'Intervenção Venosa', 'Intervenção Não Vascular']
  },
  torax: {
    label: 'Tórax',
    icon: '🫁',
    subs: ['Parênquima Pulmonar', 'Nódulo/Massa Pulmonar', 'Infecção/Pneumonia', 'Interstício/Fibrose', 'DPOC/Enfisema', 'Derrame Pleural/Empiema', 'Mediastino', 'Pleura', 'Trauma Torácico', 'Pediatria Tórax']
  },
  us: {
    label: 'Ultrassonografia',
    icon: '🔊',
    subs: ['Abdome Geral', 'Cervical/Tireoide', 'Ginecologia', 'Obstetrícia', 'Doppler', 'Músculo-esquelético US', 'Rins/Vias/Próstata', 'Testículo/Pênis', 'Tórax US', 'Globo Ocular', 'Transfontanelar', 'Procedimentos US', 'Pediatria US']
  },
  contraste: {
    label: 'Contraste',
    icon: '💊',
    subs: ['Iodado', 'Gadolínio', 'Reações/Profilaxia']
  }
}

export default function Home() {
  const [currentSpec, setCurrentSpec] = useState('neuro')
  const [currentSection, setCurrentSection] = useState('home')

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-bg/98 backdrop-blur-xl border-b border-border z-50">
        <div className="container mx-auto px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setCurrentSection('home')}
              className="text-2xl font-bold text-accent2 hover:text-accent transition-colors"
            >
              RadioHub <span className="text-sm text-text3 font-normal">v6.0 Next.js</span>
            </button>
            
            <nav className="flex gap-2">
              {['home', 'resumos', 'mascaras', 'frases', 'checklist'].map(section => (
                <button
                  key={section}
                  onClick={() => setCurrentSection(section)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentSection === section
                      ? 'bg-accent/20 text-accent border border-accent/30'
                      : 'text-text3 hover:text-text hover:bg-surface2'
                  }`}
                >
                  {section === 'home' ? '⌂ Home' : 
                   section === 'resumos' ? '📚 Resumos' :
                   section === 'mascaras' ? '📝 Máscaras' :
                   section === 'frases' ? '💬 Frases' : '✅ Checklists'}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="text-sm text-text3">
            🔥 Powered by Next.js + Vercel
          </div>
        </div>
      </header>

      {/* ESPECIALIDADES TABS */}
      {currentSection !== 'home' && (
        <div className="fixed top-16 left-0 right-0 h-14 bg-bg/96 backdrop-blur-lg border-b border-border z-40">
          <div className="container mx-auto px-8 h-full flex items-center gap-2 overflow-x-auto">
            {Object.entries(SPECS).map(([key, spec]) => (
              <button
                key={key}
                onClick={() => setCurrentSpec(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  currentSpec === key
                    ? 'bg-accent/15 text-accent border border-accent/30'
                    : 'text-text3 hover:text-text hover:bg-surface'
                }`}
              >
                {spec.icon} {spec.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SUB-AREAS */}
      {currentSection !== 'home' && SPECS[currentSpec as keyof typeof SPECS].subs.length > 0 && (
        <div className="fixed top-30 left-0 right-0 h-12 bg-bg/94 backdrop-blur-md border-b border-border z-30">
          <div className="container mx-auto px-8 h-full flex items-center gap-2 overflow-x-auto">
            <button className="px-3 py-1.5 rounded-2xl text-xs font-medium bg-accent/10 text-accent2">
              Todas
            </button>
            {SPECS[currentSpec as keyof typeof SPECS].subs.map(sub => (
              <button
                key={sub}
                className="px-3 py-1.5 rounded-2xl text-xs font-medium text-text3 hover:text-text hover:bg-surface whitespace-nowrap"
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className={`${currentSection === 'home' ? 'pt-16' : 'pt-42'} min-h-screen`}>
        <div className="container mx-auto px-8 py-12">
          
          {currentSection === 'home' && (
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-accent2 to-accent bg-clip-text text-transparent">
                RadioHub Next.js
              </h1>
              <p className="text-xl text-text2 mb-12">
                Plataforma profissional de ferramentas para radiologia
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                <div className="bg-surface border border-border rounded-xl p-8 hover:border-accent/30 transition-all">
                  <div className="text-4xl mb-4">🔒</div>
                  <h3 className="text-lg font-semibold mb-2">Seguro</h3>
                  <p className="text-sm text-text2">API Keys protegidas no servidor</p>
                </div>
                
                <div className="bg-surface border border-border rounded-xl p-8 hover:border-accent/30 transition-all">
                  <div className="text-4xl mb-4">⚡</div>
                  <h3 className="text-lg font-semibold mb-2">Rápido</h3>
                  <p className="text-sm text-text2">Next.js com SSR e otimizações</p>
                </div>
                
                <div className="bg-surface border border-border rounded-xl p-8 hover:border-accent/30 transition-all">
                  <div className="text-4xl mb-4">🎨</div>
                  <h3 className="text-lg font-semibold mb-2">Organizado</h3>
                  <p className="text-sm text-text2">Componentes React reutilizáveis</p>
                </div>
              </div>
            </div>
          )}

          {currentSection !== 'home' && (
            <div>
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                {currentSection === 'resumos' && '📚 Resumos'}
                {currentSection === 'mascaras' && '📝 Máscaras de Laudo'}
                {currentSection === 'frases' && '💬 Frases Prontas'}
                {currentSection === 'checklist' && '✅ Checklists'}
                <span className="text-text3 text-lg font-normal">
                  {SPECS[currentSpec as keyof typeof SPECS].icon} {SPECS[currentSpec as keyof typeof SPECS].label}
                </span>
              </h2>
              
              <div className="bg-surface border border-border rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">🚧</div>
                <p className="text-text2">
                  Conteúdo em desenvolvimento...
                </p>
                <p className="text-sm text-text3 mt-2">
                  Próxima etapa: Integração com Firebase via API Routes
                </p>
              </div>
            </div>
          )}
          
        </div>
      </main>
    </div>
  )
}
