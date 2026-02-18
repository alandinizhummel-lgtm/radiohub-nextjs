'use client'

import { useState, useEffect } from 'react'
import ContentList from '../components/ContentList'

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

const CALCULADORAS_POR_SPEC: Record<string, Array<{nome: string, descricao: string}>> = {
  neuro: [
    { nome: 'Escala NIHSS', descricao: 'Gravidade do AVC isquêmico' },
    { nome: 'ASPECTS Score', descricao: 'Extensão de isquemia no território da ACM' }
  ],
  gi: [
    { nome: 'Child-Pugh', descricao: 'Classificação de cirrose hepática' },
    { nome: 'MELD Score', descricao: 'Gravidade de doença hepática' }
  ],
  gu: [
    { nome: 'eGFR (CKD-EPI)', descricao: 'Taxa de filtração glomerular estimada' },
    { nome: 'PSA Density', descricao: 'Densidade de PSA por volume prostático' }
  ],
  mama: [
    { nome: 'BI-RADS', descricao: 'Classificação de achados mamográficos' }
  ],
  us: [
    { nome: 'Índice de Resistividade', descricao: 'Cálculo de IR ao Doppler' }
  ],
  contraste: [
    { nome: 'eGFR para Contraste', descricao: 'Segurança de administração de contraste' }
  ]
}

const GERADORES_POR_SPEC: Record<string, Array<{nome: string, descricao: string}>> = {
  neuro: [
    { nome: 'RM Encéfalo', descricao: 'Gerador de laudo de RM de crânio' },
    { nome: 'TC Crânio', descricao: 'Gerador de laudo de TC de crânio' }
  ],
  cn: [
    { nome: 'RM Pescoço', descricao: 'Gerador de laudo de RM cervical' },
    { nome: 'TC Seios da Face', descricao: 'Gerador de laudo de TC de seios paranasais' }
  ],
  gi: [
    { nome: 'RM Abdome', descricao: 'Gerador de laudo de RM abdominal' },
    { nome: 'TC Abdome', descricao: 'Gerador de laudo de TC abdominal' }
  ],
  gu: [
    { nome: 'RM Próstata (PI-RADS)', descricao: 'Gerador de laudo estruturado' }
  ],
  torax: [
    { nome: 'TC Tórax', descricao: 'Gerador de laudo de TC de tórax' },
    { nome: 'RX Tórax', descricao: 'Gerador de laudo de radiografia' }
  ],
  vasc: [
    { nome: 'AngioTC', descricao: 'Gerador de laudo de angiotomografia' }
  ]
}

export default function Home() {
  const [currentSpec, setCurrentSpec] = useState('neuro')
  const [currentSubArea, setCurrentSubArea] = useState('all')
  const [currentSection, setCurrentSection] = useState('home')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [specsMenuOpen, setSpecsMenuOpen] = useState(false)

  const handleSpecChange = (spec: string) => {
    setCurrentSpec(spec)
    setCurrentSubArea('all')
    setDropdownOpen(false)
    setSpecsMenuOpen(false)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme)
      document.documentElement.classList.toggle('light-mode', newTheme === 'light')
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' || 'dark'
      setTheme(savedTheme)
      document.documentElement.classList.toggle('light-mode', savedTheme === 'light')
    }
  }, [])

  const usesFirebase = ['resumos', 'artigos', 'mascaras', 'frases', 'checklists', 'tutoriais', 'videos'].includes(currentSection)
  const usesSpecs = usesFirebase || currentSection === 'calculadoras' || currentSection === 'geradores'

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 h-16 bg-bg/98 backdrop-blur-xl border-b border-border z-50">
        <div className="container mx-auto px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setCurrentSection('home')}
              className="text-2xl font-bold text-accent2 hover:text-accent transition-colors"
            >
              RadioHub <span className="text-sm text-text3 font-normal">v10.0</span>
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
              🔥 Next.js + Vercel
            </div>
          </div>
        </div>
      </header>

      {currentSection !== 'home' && usesSpecs && (
        <>
          <div className="fixed top-16 left-0 right-0 bg-surface border-b border-accent/30 z-40 py-2">
            <div className="container mx-auto px-8">
              <button
                onClick={() => setSpecsMenuOpen(!specsMenuOpen)}
                className="px-4 py-2 bg-surface2 border border-border rounded-lg hover:border-accent/50 transition-all flex items-center gap-2 text-sm font-medium text-text"
              >
                <span>{SPECS[currentSpec as keyof typeof SPECS].icon}</span>
                <span>{SPECS[currentSpec as keyof typeof SPECS].label}</span>
                <span className={`transition-transform ${specsMenuOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>
            </div>
          </div>

          {specsMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                style={{top: '95px'}}
                onClick={() => setSpecsMenuOpen(false)}
              />
              <div className="fixed bg-surface border-b border-accent/30 z-40 shadow-2xl" style={{top: '95px', left: 0, right: 0}}>
                <div className="container mx-auto px-8 py-3 flex flex-wrap items-center gap-1.5">
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
            </>
          )}
        </>
      )}

      {currentSection !== 'home' && usesFirebase && SPECS[currentSpec as keyof typeof SPECS].subs.length > 0 && (
        <div className="fixed z-50" style={{top: '95px', left: 0, right: 0}}>
          <div className="container mx-auto px-8 py-2">
            <div className="relative inline-block">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="px-4 py-2 bg-surface2 text-text border border-border rounded-lg hover:border-accent/50 transition-all flex items-center gap-2 text-sm font-medium"
              >
                <span>{currentSubArea === 'all' ? '⊕ Todas as sub-áreas' : currentSubArea}</span>
                <span className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>
              
              {dropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 w-64 bg-surface border border-border rounded-lg shadow-xl max-h-96 overflow-y-auto z-20">
                    <button
                      onClick={() => {
                        setCurrentSubArea('all')
                        setDropdownOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-accent/10 transition-colors ${
                        currentSubArea === 'all' ? 'bg-accent/20 text-accent font-semibold' : 'text-text'
                      }`}
                    >
                      ⊕ Todas as sub-áreas
                    </button>
                    {SPECS[currentSpec as keyof typeof SPECS].subs.map(sub => (
                      <button
                        key={sub}
                        onClick={() => {
                          setCurrentSubArea(sub)
                          setDropdownOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-accent/10 transition-colors ${
                          currentSubArea === sub ? 'bg-accent/20 text-accent font-semibold' : 'text-text'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <main className={`${
        currentSection === 'home' 
          ? 'pt-16' 
          : usesFirebase
          ? 'pt-[105px]'
          : usesSpecs
          ? 'pt-[95px]'
          : 'pt-16'
      } min-h-screen`}>
        <div className="container mx-auto px-8 py-12">
          
          {currentSection === 'home' && (
            <div>
              <div className="text-center max-w-4xl mx-auto mb-12">
                <h1 className="text-5xl font-bold mb-4 text-text">
                  Ferramentas para <span className="bg-gradient-to-r from-accent2 to-accent bg-clip-text text-transparent">radiologistas</span>
                </h1>
                <p className="text-lg text-text2 mb-6">
                  Calculadoras médicas, resumos técnicos, geradores de laudo e checklists.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setCurrentSection('resumos')}
                    className="px-5 py-2 bg-accent text-white rounded-lg hover:bg-accent2 transition-all font-semibold text-sm"
                  >
                    📚 Explorar Resumos
                  </button>
                  <button
                    onClick={() => setCurrentSection('calculadoras')}
                    className="px-5 py-2 bg-surface2 text-text border border-border rounded-lg hover:border-accent/50 transition-all font-semibold text-sm"
                  >
                    🧮 Ver Calculadoras
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-12">
                {[
                  { id: 'resumos', icon: '📚', label: 'Resumos', desc: 'Resumos técnicos' },
                  { id: 'artigos', icon: '📄', label: 'Artigos', desc: 'Artigos científicos' },
                  { id: 'calculadoras', icon: '🧮', label: 'Calculadoras', desc: 'eGFR, NIHSS' },
                  { id: 'geradores', icon: '⚙️', label: 'Geradores', desc: 'Laudos automáticos' },
                  { id: 'mascaras', icon: '📝', label: 'Máscaras', desc: 'Templates' },
                  { id: 'frases', icon: '💬', label: 'Frases', desc: 'Frases prontas' },
                  { id: 'checklists', icon: '✅', label: 'Checklists', desc: 'Avaliação' },
                  { id: 'tutoriais', icon: '🎓', label: 'Tutoriais', desc: 'Guias' },
                  { id: 'videos', icon: '🎬', label: 'Vídeos', desc: 'Casos práticos' }
                ].map(section => (
                  <div 
                    key={section.id}
                    onClick={() => setCurrentSection(section.id)}
                    className="bg-surface border border-border rounded-lg p-4 hover:border-accent/50 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="text-3xl mb-2">{section.icon}</div>
                    <h3 className="text-sm font-bold mb-1 text-text group-hover:text-accent transition-colors">{section.label}</h3>
                    <p className="text-xs text-text3">{section.desc}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface border border-border rounded-xl p-6">
                  <h2 className="text-xl font-bold mb-4 text-text">🔥 Atualizações</h2>
                  <div className="space-y-3">
                    <div className="flex gap-3 pb-3 border-b border-border">
                      <div className="text-2xl">🔥</div>
                      <div>
                        <div className="text-sm font-semibold text-text">v10.0 - UX Renovado</div>
                        <div className="text-xs text-text3">Cards + Menu retrátil • Hoje</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-accent/10 to-accent2/10 border border-accent/30 rounded-xl p-6">
                  <h2 className="text-xl font-bold mb-4 text-text">📊 Stats</h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-accent">10</div>
                      <div className="text-xs text-text3">Especialidades</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-accent">87</div>
                      <div className="text-xs text-text3">Sub-áreas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-accent">9</div>
                      <div className="text-xs text-text3">Ferramentas</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentSection !== 'home' && usesFirebase && (
            <div>
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-text">
                {currentSection === 'resumos' && '📚 Resumos'}
                {currentSection === 'artigos' && '📄 Artigos'}
                {currentSection === 'mascaras' && '📝 Máscaras'}
                {currentSection === 'frases' && '💬 Frases'}
                {currentSection === 'checklists' && '✅ Checklists'}
                {currentSection === 'tutoriais' && '🎓 Tutoriais'}
                {currentSection === 'videos' && '🎬 Vídeos'}
                <span className="text-text3 text-lg font-normal">
                  {SPECS[currentSpec as keyof typeof SPECS].icon} {SPECS[currentSpec as keyof typeof SPECS].label}
                  {currentSubArea !== 'all' && ` · ${currentSubArea}`}
                </span>
              </h2>
              
              <ContentList 
                tipo={currentSection as any}
                especialidade={currentSpec}
                subarea={currentSubArea}
              />
            </div>
          )}

          {currentSection === 'calculadoras' && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-text mb-2">🧮 Calculadoras</h2>
                <p className="text-text2">
                  {SPECS[currentSpec as keyof typeof SPECS].icon} {SPECS[currentSpec as keyof typeof SPECS].label}
                </p>
              </div>
              
              {CALCULADORAS_POR_SPEC[currentSpec] ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CALCULADORAS_POR_SPEC[currentSpec].map((calc, i) => (
                    <div key={i} className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-all">
                      <div className="flex gap-3 mb-4">
                        <div className="text-3xl">🧮</div>
                        <div>
                          <h3 className="text-lg font-bold text-text">{calc.nome}</h3>
                          <p className="text-sm text-text3">{calc.descricao}</p>
                        </div>
                      </div>
                      <button className="w-full px-4 py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent hover:text-white transition-all text-sm font-semibold">
                        🚧 Em desenvolvimento
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-surface border border-border rounded-xl p-16 text-center">
                  <div className="text-6xl mb-4 opacity-50">🧮</div>
                  <p className="text-xl text-text2">Nenhuma calculadora disponível</p>
                </div>
              )}
            </div>
          )}

          {currentSection === 'geradores' && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-text mb-2">⚙️ Geradores</h2>
                <p className="text-text2">
                  {SPECS[currentSpec as keyof typeof SPECS].icon} {SPECS[currentSpec as keyof typeof SPECS].label}
                </p>
              </div>
              
              {GERADORES_POR_SPEC[currentSpec] ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {GERADORES_POR_SPEC[currentSpec].map((ger, i) => (
                    <div key={i} className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-all">
                      <div className="flex gap-3 mb-4">
                        <div className="text-3xl">⚙️</div>
                        <div>
                          <h3 className="text-lg font-bold text-text">{ger.nome}</h3>
                          <p className="text-sm text-text3">{ger.descricao}</p>
                        </div>
                      </div>
                      <button className="w-full px-4 py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent hover:text-white transition-all text-sm font-semibold">
                        🚧 Em desenvolvimento
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-surface border border-border rounded-xl p-16 text-center">
                  <div className="text-6xl mb-4 opacity-50">⚙️</div>
                  <p className="text-xl text-text2">Nenhum gerador disponível</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
