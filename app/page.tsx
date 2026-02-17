'use client'

import { useState, useEffect } from 'react'
import ContentList from '@/components/ContentList'

// ESPECIALIDADES (copiadas do RadioHub original) - TODAS AS 10!
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
  const [currentSubArea, setCurrentSubArea] = useState('all')
  const [currentSection, setCurrentSection] = useState('home')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  const handleSpecChange = (spec: string) => {
    setCurrentSpec(spec)
    setCurrentSubArea('all')
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme)
      document.documentElement.classList.toggle('light-mode', newTheme === 'light')
    }
  }

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' || 'dark'
      setTheme(savedTheme)
      document.documentElement.classList.toggle('light-mode', savedTheme === 'light')
    }
  }, [])

  // Determinar se a seção atual usa Firebase
  const usesFirebase = ['resumos', 'artigos', 'mascaras', 'frases', 'checklists', 'tutoriais', 'videos'].includes(currentSection)

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
              RadioHub <span className="text-sm text-text3 font-normal">v9.0 Next.js</span>
            </button>
            
            <nav className="flex gap-1.5">
              {[
                { id: 'home', label: '⌂ Home' },
                { id: 'resumos', label: '📚 Resumos' },
                { id: 'artigos', label: '📄 Artigos' },
                { id: 'calculadoras', label: '🧮 Calculadoras' },
                { id: 'geradores', label: '⚙️ Geradores' },
                { id: 'mascaras', label: '📝 Máscaras' },
                { id: 'frases', label: '💬 Frases' },
                { id: 'checklists', label: '✅ Checklists' },
                { id: 'tutoriais', label: '🎓 Tutoriais' },
                { id: 'videos', label: '🎬 Vídeos' }
              ].map(section => (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(section.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    currentSection === section.id
                      ? 'bg-accent/20 text-accent border border-accent/30'
                      : 'text-text3 hover:text-text hover:bg-surface2'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-surface2 hover:bg-border transition-all"
              title={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <div className="text-sm text-text3">
              🔥 Powered by Next.js + Vercel
            </div>
          </div>
        </div>
      </header>

      {/* ESPECIALIDADES TABS - só para seções com Firebase */}
      {currentSection !== 'home' && usesFirebase && (
        <div className="fixed top-16 left-0 right-0 bg-surface border-b border-accent/30 z-40 py-1.5">
          <div className="container mx-auto px-8 flex flex-wrap items-center gap-1.5">
            {Object.entries(SPECS).map(([key, spec]) => (
              <button
                key={key}
                onClick={() => handleSpecChange(key)}
                className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap transition-all ${
                  currentSpec === key
                    ? 'bg-accent text-white shadow-md'
                    : 'bg-surface2 text-text2 hover:bg-border2 hover:text-text'
                }`}
              >
                {spec.icon} {spec.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SUB-AREAS - só para seções com Firebase */}
      {currentSection !== 'home' && usesFirebase && SPECS[currentSpec as keyof typeof SPECS].subs.length > 0 && (
        <div className="fixed bg-surface border-b border-accent/30 z-50 py-1.5" style={{top: '95px', left: 0, right: 0}}>
          <div className="container mx-auto px-8 flex flex-wrap items-center gap-1.5">
            <button 
              onClick={() => setCurrentSubArea('all')}
              className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap transition-all ${
                currentSubArea === 'all' 
                  ? 'bg-accent text-white shadow-md'
                  : 'bg-surface2 text-text hover:bg-border2'
              }`}
            >
              Todas
            </button>
            {SPECS[currentSpec as keyof typeof SPECS].subs.map(sub => (
              <button
                key={sub}
                onClick={() => setCurrentSubArea(sub)}
                className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap transition-all ${
                  currentSubArea === sub
                    ? 'bg-accent text-white shadow-md'
                    : 'bg-surface2 text-text hover:bg-border2'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className={`${
        currentSection === 'home' 
          ? 'pt-16' 
          : usesFirebase
          ? 'pt-[150px]'
          : 'pt-16'
      } min-h-screen`}>
        <div className="container mx-auto px-8 py-12">
          
          {/* HOME PAGE */}
          {currentSection === 'home' && (
            <div>
              <div className="text-center max-w-4xl mx-auto mb-16">
                <h1 className="text-6xl font-bold mb-6 text-text">
                  Ferramentas para <span className="bg-gradient-to-r from-accent2 to-accent bg-clip-text text-transparent">radiologistas</span>
                </h1>
                <p className="text-xl text-text2 mb-4">
                  Calculadoras, resumos, geradores e checklists — por especialidade, em painel lateral.
                </p>
                <p className="text-sm text-text3">
                  👁️ <strong>9 visitas</strong> (local)
                </p>
              </div>
              <div className="text-center py-20">
                <p className="text-text2 text-xl">🎉 Firebase Integration v9.0</p>
                <p className="text-text3 mt-2">Selecione uma seção acima para ver o conteúdo!</p>
              </div>
            </div>
          )}

          {/* CONTENT WITH FIREBASE - NOVO! */}
          {currentSection !== 'home' && usesFirebase && (
            <div>
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-text">
                {currentSection === 'resumos' && '📚 Resumos'}
                {currentSection === 'artigos' && '📄 Resumo de Artigos'}
                {currentSection === 'mascaras' && '📝 Máscaras de Laudo'}
                {currentSection === 'frases' && '💬 Frases Prontas'}
                {currentSection === 'checklists' && '✅ Checklists'}
                {currentSection === 'tutoriais' && '🎓 Tutoriais'}
                {currentSection === 'videos' && '🎬 Vídeos'}
                <span className="text-text3 text-lg font-normal">
                  {SPECS[currentSpec as keyof typeof SPECS].icon} {SPECS[currentSpec as keyof typeof SPECS].label}
                  {currentSubArea !== 'all' && ` · ${currentSubArea}`}
                </span>
              </h2>
              
              {/* CONTENT LIST - Carrega do Firebase! */}
              <ContentList 
                tipo={currentSection as any}
                especialidade={currentSpec}
                subarea={currentSubArea}
              />
            </div>
          )}

          {/* CALCULADORAS E GERADORES - continua igual (em desenvolvimento) */}
          {currentSection !== 'home' && !usesFirebase && (
            <div>
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-text">
                {currentSection === 'calculadoras' && '🧮 Calculadoras'}
                {currentSection === 'geradores' && '⚙️ Geradores'}
              </h2>
              
              <div className="bg-surface border border-border rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">🚧</div>
                <p className="text-text2 text-xl mb-4">
                  {currentSection === 'calculadoras' && 'Calculadoras médicas (eGFR, TI-RADS, BI-RADS, Bosniak)'}
                  {currentSection === 'geradores' && 'Geradores automáticos de laudo (RM Cardíaca)'}
                </p>
                <p className="text-sm text-text3">
                  Próxima etapa de desenvolvimento
                </p>
              </div>
            </div>
          )}
          
        </div>
      </main>
    </div>
  )
}
