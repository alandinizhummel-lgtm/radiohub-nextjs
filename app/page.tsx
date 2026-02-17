'use client'

import { useState, useEffect } from 'react'

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
              RadioHub <span className="text-sm text-text3 font-normal">v8.2 Next.js</span>
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
                { id: 'checklist', label: '✅ Checklists' },
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

      {/* ESPECIALIDADES TABS - COMPACTO */}
      {currentSection !== 'home' && !['calculadoras', 'geradores', 'tutoriais', 'videos'].includes(currentSection) && (
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

      {/* SUB-AREAS - COMPACTO */}
      {currentSection !== 'home' && SPECS[currentSpec as keyof typeof SPECS].subs.length > 0 && (
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
          : ['calculadoras', 'geradores', 'tutoriais', 'videos'].includes(currentSection)
          ? 'pt-16'
          : 'pt-[150px]'
      } min-h-screen`}>
        <div className="container mx-auto px-8 py-12">
          
          {currentSection === 'home' && (
            <div>
              {/* HERO SECTION */}
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
              
              {/* CARDS DE SEÇÕES */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-16">
                <button
                  onClick={() => setCurrentSection('resumos')}
                  className="bg-surface border border-border rounded-xl p-6 hover:border-accent/50 hover:shadow-lg transition-all text-center group"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📚</div>
                  <div className="font-semibold text-sm mb-1 text-text">Resumos</div>
                  <div className="text-xs text-text3">Por especialidade</div>
                </button>
                
                <button
                  onClick={() => setCurrentSection('artigos')}
                  className="bg-surface border border-border rounded-xl p-6 hover:border-accent/50 hover:shadow-lg transition-all text-center group"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📄</div>
                  <div className="font-semibold text-sm mb-1 text-text">Artigos</div>
                  <div className="text-xs text-text3">Resumo de evidências</div>
                </button>
                
                <button
                  onClick={() => setCurrentSection('calculadoras')}
                  className="bg-surface border border-border rounded-xl p-6 hover:border-accent/50 hover:shadow-lg transition-all text-center group"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🧮</div>
                  <div className="font-semibold text-sm mb-1 text-text">Calculadoras</div>
                  <div className="text-xs text-text3">eGFR · TI-RADS · BI-RADS</div>
                </button>
                
                <button
                  onClick={() => setCurrentSection('geradores')}
                  className="bg-surface border border-border rounded-xl p-6 hover:border-accent/50 hover:shadow-lg transition-all text-center group"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">⚙️</div>
                  <div className="font-semibold text-sm mb-1 text-text">Geradores</div>
                  <div className="text-xs text-text3">RM Cardíaca</div>
                </button>
                
                <button
                  onClick={() => setCurrentSection('mascaras')}
                  className="bg-surface border border-border rounded-xl p-6 hover:border-accent/50 hover:shadow-lg transition-all text-center group"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📝</div>
                  <div className="font-semibold text-sm mb-1 text-text">Máscaras</div>
                  <div className="text-xs text-text3">Copie e cole no Word</div>
                </button>
                
                <button
                  onClick={() => setCurrentSection('frases')}
                  className="bg-surface border border-border rounded-xl p-6 hover:border-accent/50 hover:shadow-lg transition-all text-center group"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">💬</div>
                  <div className="font-semibold text-sm mb-1 text-text">Frases</div>
                  <div className="text-xs text-text3">1 clique · copiar</div>
                </button>
                
                <button
                  onClick={() => setCurrentSection('checklist')}
                  className="bg-surface border border-border rounded-xl p-6 hover:border-accent/50 hover:shadow-lg transition-all text-center group"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">✅</div>
                  <div className="font-semibold text-sm mb-1 text-text">Checklist</div>
                  <div className="text-xs text-text3">Relatórios estruturados</div>
                </button>
              </div>
              
              {/* ÚLTIMAS ATUALIZAÇÕES */}
              <div className="max-w-5xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-text">Últimas atualizações</h2>
                  <p className="text-sm text-text3 mt-1">NOVOS CONTEÚDOS E MELHORIAS</p>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-surface border border-border rounded-xl p-6 hover:border-border2 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="text-sm text-text3 min-w-[80px]">11 Fev</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-accent/15 text-accent text-xs font-semibold rounded">v3.1</span>
                        </div>
                        <div className="font-semibold mb-1 text-text">RadioHub v3.1</div>
                        <div className="text-sm text-text2">
                          Tórax adicionado, filtros horizontais, subáreas, painel 72%, imagens nos cards.
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-surface border border-border rounded-xl p-6 hover:border-border2 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="text-sm text-text3 min-w-[80px]">11 Fev</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-orange/15 text-orange text-xs font-semibold rounded">Artigos</span>
                        </div>
                        <div className="font-semibold mb-1 text-text">Resumo de Artigos</div>
                        <div className="text-sm text-text2">
                          Nova seção com take-aways práticos. Tórax, Neuro, GI, MSK e mais.
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-surface border border-border rounded-xl p-6 hover:border-border2 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="text-sm text-text3 min-w-[80px]">10 Fev</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-green/15 text-green text-xs font-semibold rounded">Calc</span>
                        </div>
                        <div className="font-semibold mb-1 text-text">Bosniak 2019 · BI-RADS · TI-RADS · eGFR · Contraste</div>
                        <div className="text-sm text-text2">
                          5 calculadoras ativas.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* FOOTER INFO */}
              <div className="mt-16 text-center">
                <div className="inline-flex items-center gap-2 bg-surface border border-border rounded-lg px-4 py-2 text-sm text-text3">
                  <span>🔥</span>
                  <span>Migrado para Next.js + Vercel</span>
                  <span>·</span>
                  <span>API Keys protegidas no servidor</span>
                </div>
              </div>
            </div>
          )}

          {currentSection !== 'home' && (
            <div>
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                {currentSection === 'resumos' && '📚 Resumos'}
                {currentSection === 'artigos' && '📄 Resumo de Artigos'}
                {currentSection === 'calculadoras' && '🧮 Calculadoras'}
                {currentSection === 'geradores' && '⚙️ Geradores'}
                {currentSection === 'mascaras' && '📝 Máscaras de Laudo'}
                {currentSection === 'frases' && '💬 Frases Prontas'}
                {currentSection === 'checklist' && '✅ Checklists'}
                {currentSection === 'tutoriais' && '🎓 Tutoriais'}
                {currentSection === 'videos' && '🎬 Vídeos'}
                {!['calculadoras', 'geradores', 'tutoriais', 'videos'].includes(currentSection) && (
                  <span className="text-text3 text-lg font-normal">
                    {SPECS[currentSpec as keyof typeof SPECS].icon} {SPECS[currentSpec as keyof typeof SPECS].label}
                    {currentSubArea !== 'all' && ` · ${currentSubArea}`}
                  </span>
                )}
              </h2>
              
              <div className="bg-surface border border-border rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">
                  {currentSection === 'tutoriais' && '🎓'}
                  {currentSection === 'videos' && '🎬'}
                  {!['tutoriais', 'videos'].includes(currentSection) && '🚧'}
                </div>
                <p className="text-text2 text-xl mb-4">
                  {currentSection === 'artigos' && 'Resumos de artigos científicos com take-aways práticos'}
                  {currentSection === 'calculadoras' && 'Calculadoras médicas (eGFR, TI-RADS, BI-RADS, Bosniak)'}
                  {currentSection === 'geradores' && 'Geradores automáticos de laudo (RM Cardíaca)'}
                  {currentSection === 'tutoriais' && 'Tutoriais práticos de radiologia'}
                  {currentSection === 'videos' && 'Vídeos educacionais e demonstrações'}
                  {['resumos', 'mascaras', 'frases', 'checklist'].includes(currentSection) && 'Conteúdo em desenvolvimento...'}
                </p>
                <p className="text-sm text-text3 mt-2">
                  {!['calculadoras', 'geradores', 'tutoriais', 'videos'].includes(currentSection) && currentSubArea === 'all' 
                    ? `Mostrando todos os ${currentSection} de ${SPECS[currentSpec as keyof typeof SPECS].label}`
                    : !['calculadoras', 'geradores', 'tutoriais', 'videos'].includes(currentSection)
                    ? `Mostrando ${currentSection} de ${SPECS[currentSpec as keyof typeof SPECS].label} · ${currentSubArea}`
                    : currentSection === 'tutoriais'
                    ? 'Guias passo a passo, protocolos e técnicas avançadas'
                    : currentSection === 'videos'
                    ? 'Aulas, webinars e demonstrações práticas'
                    : 'Próxima etapa de desenvolvimento'
                  }
                </p>
                {currentSection === 'tutoriais' && (
                  <div className="mt-6 max-w-2xl mx-auto text-left">
                    <p className="text-sm text-text3 mb-2">📌 Tópicos planejados:</p>
                    <ul className="text-sm text-text2 space-y-1">
                      <li>• Como protocolar exames de RM</li>
                      <li>• Passo a passo para laudo de TC de Tórax</li>
                      <li>• Técnicas de otimização de contraste</li>
                      <li>• Protocolos de urgência e emergência</li>
                    </ul>
                  </div>
                )}
                {currentSection === 'videos' && (
                  <div className="mt-6 max-w-2xl mx-auto text-left">
                    <p className="text-sm text-text3 mb-2">📌 Conteúdos planejados:</p>
                    <ul className="text-sm text-text2 space-y-1">
                      <li>• Webinars com especialistas</li>
                      <li>• Demonstrações de casos complexos</li>
                      <li>• Tutoriais em vídeo de técnicas</li>
                      <li>• Revisões de literatura recente</li>
                    </ul>
                  </div>
                )}
                <p className="text-sm text-text3 mt-4">
                  {['tutoriais', 'videos'].includes(currentSection) 
                    ? 'Seção será implementada na próxima fase de desenvolvimento'
                    : 'Próxima etapa: Integração com Firebase via API Routes'
                  }
                </p>
              </div>
            </div>
          )}
          
        </div>
      </main>
    </div>
  )
}
