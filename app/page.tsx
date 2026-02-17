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
  const [currentSubArea, setCurrentSubArea] = useState('all')
  const [currentSection, setCurrentSection] = useState('home')

  const handleSpecChange = (spec: string) => {
    setCurrentSpec(spec)
    setCurrentSubArea('all')
  }

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
              {[
                { id: 'home', label: '⌂ Home' },
                { id: 'resumos', label: '📚 Resumos' },
                { id: 'artigos', label: '📄 Artigos' },
                { id: 'calculadoras', label: '🧮 Calculadoras' },
                { id: 'geradores', label: '⚙️ Geradores' },
                { id: 'mascaras', label: '📝 Máscaras' },
                { id: 'frases', label: '💬 Frases' },
                { id: 'checklist', label: '✅ Checklists' }
              ].map(section => (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(section.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
          
          <div className="text-sm text-text3">
            🔥 Powered by Next.js + Vercel
          </div>
        </div>
      </header>

      {/* ESPECIALIDADES TABS */}
      {currentSection !== 'home' && (
        <div className="fixed top-16 left-0 right-0 bg-surface border-b-2 border-accent/30 z-40" style={{height: '56px'}}>
          <div className="container mx-auto px-8 h-full flex items-center gap-2 overflow-x-auto">
            {Object.entries(SPECS).map(([key, spec]) => (
              <button
                key={key}
                onClick={() => handleSpecChange(key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                  currentSpec === key
                    ? 'bg-accent text-white shadow-lg'
                    : 'bg-surface2 text-text2 hover:bg-border2 hover:text-text'
                }`}
              >
                {spec.icon} {spec.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SUB-AREAS - AGORA COM CORES VISÍVEIS */}
      {currentSection !== 'home' && SPECS[currentSpec as keyof typeof SPECS].subs.length > 0 && (
        <div className="fixed bg-surface2 border-b-2 border-border2 z-30" style={{top: '72px', left: 0, right: 0, height: '52px'}}>
          <div className="container mx-auto px-8 h-full flex items-center gap-2 overflow-x-auto">
            <button 
              onClick={() => setCurrentSubArea('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                currentSubArea === 'all' 
                  ? 'bg-accent/20 text-accent border-2 border-accent'
                  : 'bg-bg2 text-text3 hover:bg-border hover:text-text'
              }`}
            >
              Todas
            </button>
            {SPECS[currentSpec as keyof typeof SPECS].subs.map(sub => (
              <button
                key={sub}
                onClick={() => setCurrentSubArea(sub)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  currentSubArea === sub
                    ? 'bg-accent/20 text-accent border-2 border-accent'
                    : 'bg-bg2 text-text3 hover:bg-border hover:text-text'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className={`${currentSection === 'home' ? 'pt-16' : 'pt-[140px]'} min-h-screen`}>
        <div className="container mx-auto px-8 py-12">
          
          {currentSection === 'home' && (
            <div>
              {/* HERO SECTION */}
              <div className="text-center max-w-4xl mx-auto mb-16">
                <h1 className="text-6xl font-bold mb-6">
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
                  className="bg-surface border border-border rounded-xl p-6 hover:border-accent/30 transition-all text-center group"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📚</div>
                  <div className="font-semibold text-sm mb-1">Resumos</div>
                  <div className="text-xs text-text3">Por especialidade</div>
                </button>
                
                <button
                  onClick={() => setCurrentSection('artigos')}
                  className="bg-surface border border-border rounded-xl p-6 hover:border-accent/30 transition-all text-center group"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📄</div>
                  <div className="font-semibold text-sm mb-1">Artigos</div>
                  <div className="text-xs text-text3">Resumo de evidências</div>
                </button>
                
                <button
                  onClick={() => setCurrentSection('calculadoras')}
                  className="bg-surface border border-border rounded-xl p-6 hover:border-accent/30 transition-all text-center group"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🧮</div>
                  <div className="font-semibold text-sm mb-1">Calculadoras</div>
                  <div className="text-xs text-text3">eGFR · TI-RADS · BI-RADS</div>
                </button>
                
                <button
                  onClick={() => setCurrentSection('geradores')}
                  className="bg-surface border border-border rounded-xl p-6 hover:border-accent/30 transition-all text-center group"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">⚙️</div>
                  <div className="font-semibold text-sm mb-1">Geradores</div>
                  <div className="text-xs text-text3">RM Cardíaca</div>
                </button>
                
                <button
                  onClick={() => setCurrentSection('mascaras')}
                  className="bg-surface border border-border rounded-xl p-6 hover:border-accent/30 transition-all text-center group"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📝</div>
                  <div className="font-semibold text-sm mb-1">Máscaras</div>
                  <div className="text-xs text-text3">Copie e cole no Word</div>
                </button>
                
                <button
                  onClick={() => setCurrentSection('frases')}
                  className="bg-surface border border-border rounded-xl p-6 hover:border-accent/30 transition-all text-center group"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">💬</div>
                  <div className="font-semibold text-sm mb-1">Frases</div>
                  <div className="text-xs text-text3">1 clique · copiar</div>
                </button>
                
                <button
                  onClick={() => setCurrentSection('checklist')}
                  className="bg-surface border border-border rounded-xl p-6 hover:border-accent/30 transition-all text-center group"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">✅</div>
                  <div className="font-semibold text-sm mb-1">Checklist</div>
                  <div className="text-xs text-text3">Relatórios estruturados</div>
                </button>
              </div>
              
              {/* ÚLTIMAS ATUALIZAÇÕES */}
              <div className="max-w-5xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold">Últimas atualizações</h2>
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
                        <div className="font-semibold mb-1">RadioHub v3.1</div>
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
                        <div className="font-semibold mb-1">Resumo de Artigos</div>
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
                        <div className="font-semibold mb-1">Bosniak 2019 · BI-RADS · TI-RADS · eGFR · Contraste</div>
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
                <span className="text-text3 text-lg font-normal">
                  {SPECS[currentSpec as keyof typeof SPECS].icon} {SPECS[currentSpec as keyof typeof SPECS].label}
                  {currentSubArea !== 'all' && ` · ${currentSubArea}`}
                </span>
              </h2>
              
              <div className="bg-surface border border-border rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">🚧</div>
                <p className="text-text2">
                  {currentSection === 'artigos' && 'Resumos de artigos científicos com take-aways práticos'}
                  {currentSection === 'calculadoras' && 'Calculadoras médicas (eGFR, TI-RADS, BI-RADS, Bosniak)'}
                  {currentSection === 'geradores' && 'Geradores automáticos de laudo (RM Cardíaca)'}
                  {['resumos', 'mascaras', 'frases', 'checklist'].includes(currentSection) && 'Conteúdo em desenvolvimento...'}
                </p>
                <p className="text-sm text-text3 mt-2">
                  {currentSubArea === 'all' 
                    ? `Mostrando todos os ${currentSection} de ${SPECS[currentSpec as keyof typeof SPECS].label}`
                    : `Mostrando ${currentSection} de ${SPECS[currentSpec as keyof typeof SPECS].label} · ${currentSubArea}`
                  }
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
