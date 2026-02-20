'use client'

import { useState, useEffect } from 'react'
import ContentList from '../components/ContentList'
import SearchBar from '../components/SearchBar'
import SpecBar from '../components/SpecBar'
import { SPECS, VALID_CONTENT_TYPES, TYPE_LABELS, type ContentType } from '@/lib/specs'
import { getFavorites, getHistory, type SavedItem } from '@/lib/user-data'

const CALCULADORAS_POR_SPEC: Record<string, Array<{nome: string, descricao: string, link?: string}>> = {
  neuro: [
    { nome: 'ASPECTS Score', descricao: 'Extensão de isquemia no território da ACM', link: '/calculadora/aspects' },
    { nome: 'NASCET', descricao: 'Grau de estenose carotídea', link: '/calculadora/nascet' },
    { nome: 'Ao-SPINE', descricao: 'Classificação de lesões vertebrais', link: '/calculadora/ao-spine' },
  ],
  cn: [
    { nome: 'ACR TI-RADS', descricao: 'Classificação de nódulos tireoidianos', link: '/calculadora/tirads' },
    { nome: 'NI-RADS', descricao: 'Avaliação pós-tratamento cabeça e pescoço', link: '/calculadora/nirads' },
    { nome: 'Volume Tireoide', descricao: 'Cálculo de volume tireoidiano', link: '/calculadora/volume-tireoide' },
  ],
  torax: [
    { nome: 'Fleischner 2017', descricao: 'Manejo de nódulos pulmonares incidentais', link: '/calculadora/fleischner' },
    { nome: 'Lung-RADS', descricao: 'Classificação de achados em rastreio pulmonar', link: '/calculadora/lung-rads' },
    { nome: 'PESI Score', descricao: 'Gravidade de embolia pulmonar', link: '/calculadora/pesi' },
  ],
  cardio: [
    { nome: 'CAD-RADS', descricao: 'Classificação de estenose coronariana na TC', link: '/calculadora/cad-rads' },
  ],
  gi: [
    { nome: 'LI-RADS', descricao: 'Classificação de lesões hepáticas (CHC)', link: '/calculadora/lirads' },
    { nome: 'C-RADS', descricao: 'Classificação de colonoscopia virtual', link: '/calculadora/crads' },
    { nome: 'Pancreatite (Balthazar)', descricao: 'Gravidade de pancreatite aguda na TC', link: '/calculadora/pancreatite' },
    { nome: 'Gordura Hepática', descricao: 'Quantificação de esteatose por TC/RM', link: '/calculadora/gordura-hepatica' },
    { nome: 'Volume Hepático', descricao: 'Volumetria hepática por fórmula elipsoide', link: '/calculadora/volume-hepatico' },
    { nome: 'Volume Baço', descricao: 'Volumetria esplênica', link: '/calculadora/volume-baco' },
    { nome: 'Trauma Hepático (AAST)', descricao: 'Classificação de trauma hepático', link: '/calculadora/trauma-hepatico' },
    { nome: 'Trauma Esplênico (AAST)', descricao: 'Classificação de trauma esplênico', link: '/calculadora/trauma-esplenico' },
  ],
  gu: [
    { nome: 'PI-RADS v2.1', descricao: 'Classificação de lesões prostáticas na RM', link: '/calculadora/pirads' },
    { nome: 'Bosniak v2019', descricao: 'Classificação de cistos renais', link: '/calculadora/bosniak' },
    { nome: 'O-RADS', descricao: 'Classificação de massas ovarianas', link: '/calculadora/orads' },
    { nome: 'eGFR (CKD-EPI)', descricao: 'Taxa de filtração glomerular estimada', link: '/calculadora/gfr' },
    { nome: 'RENAL Score', descricao: 'Complexidade de massas renais', link: '/calculadora/renal-score' },
    { nome: 'Adrenal RM', descricao: 'Caracterização de massas adrenais por RM', link: '/calculadora/adrenal-mri' },
    { nome: 'Adrenal Washout', descricao: 'Washout de massas adrenais na TC', link: '/calculadora/adrenal-washout' },
    { nome: 'Incidentalomas', descricao: 'Manejo de incidentalomas adrenais', link: '/calculadora/incidentalomas' },
    { nome: 'Volume Próstata', descricao: 'Volumetria prostática e PSA density', link: '/calculadora/volume-prostata' },
    { nome: 'Volume Bexiga', descricao: 'Cálculo de volume vesical', link: '/calculadora/volume-bexiga' },
    { nome: 'Volume Testicular', descricao: 'Volumetria testicular', link: '/calculadora/volume-testicular' },
    { nome: 'Trauma Renal (AAST)', descricao: 'Classificação de trauma renal', link: '/calculadora/trauma-renal' },
  ],
  msk: [
    { nome: 'Bone-RADS', descricao: 'Classificação de lesões ósseas incidentais', link: '/calculadora/bone-rads' },
    { nome: 'Villalta Score', descricao: 'Avaliação de síndrome pós-trombótica', link: '/calculadora/villalta' },
  ],
  mama: [
    { nome: 'BI-RADS', descricao: 'Classificação de achados mamários', link: '/calculadora/birads' },
  ],
  us: [
    { nome: 'Índice de Resistividade', descricao: 'Cálculo de IR ao Doppler', link: '/calculadora/indice-resistivo' },
    { nome: 'Idade Gestacional', descricao: 'Estimativa de IG por biometria fetal', link: '/calculadora/idade-gestacional' },
    { nome: 'Volume de Órgão', descricao: 'Cálculo de volume por fórmula elipsoide', link: '/calculadora/volume-orgao' },
  ],
  interv: [
    { nome: 'MIBG / Curie Score', descricao: 'Estadiamento de neuroblastoma', link: '/calculadora/mibg-curie' },
  ],
  contraste: [
    { nome: 'eGFR para Contraste', descricao: 'Segurança de administração de contraste', link: '/calculadora/gfr' },
  ],
}

const GERADORES_POR_SPEC: Record<string, Array<{nome: string, descricao: string, link?: string}>> = {
  neuro: [
    { nome: 'RM Encéfalo', descricao: 'Gerador de laudo de RM de crânio' },
    { nome: 'TC Crânio', descricao: 'Gerador de laudo de TC de crânio' }
  ],
  cn: [
    { nome: 'RM Pescoço', descricao: 'Gerador de laudo de RM cervical' },
    { nome: 'TC Seios da Face', descricao: 'Gerador de laudo de TC de seios paranasais' }
  ],
  cardio: [
    { nome: 'RM Cardíaca', descricao: 'Volumes, FE, massa, ECV, gerador de laudo assistido', link: '/calculadora/rm-cardiaca' },
    { nome: 'AngioTC Coronárias', descricao: 'Gerador de laudo de coronário TC' },
    { nome: 'AngioTC Aorta', descricao: 'Gerador de laudo de aorta' }
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
  interv: [
    { nome: 'Relatório de Embolização', descricao: 'Gerador de laudo de procedimento' }
  ]
}

const NAV_SECTIONS = [
  { id: 'home', label: 'Home', icon: '⌂' },
  { id: 'resumos', label: 'Resumos', icon: '📚' },
  { id: 'artigos', label: 'Artigos', icon: '📄' },
  { id: 'calculadoras', label: 'Calculadoras', icon: '🧮' },
  { id: 'geradores', label: 'Geradores', icon: '⚙️' },
  { id: 'mascaras', label: 'Máscaras', icon: '📝' },
  { id: 'frases', label: 'Frases', icon: '💬' },
  { id: 'checklists', label: 'Checklists', icon: '✅' },
  { id: 'tutoriais', label: 'Tutoriais', icon: '🎓' },
  { id: 'videos', label: 'Vídeos', icon: '🎬' }
]

const HOME_SECTIONS = [
  { id: 'resumos', icon: '📚', label: 'Resumos', desc: 'Resumos técnicos por especialidade' },
  { id: 'artigos', icon: '📄', label: 'Artigos', desc: 'Resumos de artigos científicos' },
  { id: 'calculadoras', icon: '🧮', label: 'Calculadoras', desc: 'eGFR, NIHSS, BI-RADS' },
  { id: 'geradores', icon: '⚙️', label: 'Geradores', desc: 'Laudos automáticos' },
  { id: 'mascaras', icon: '📝', label: 'Máscaras', desc: 'Templates de laudo' },
  { id: 'frases', icon: '💬', label: 'Frases', desc: 'Frases prontas' },
  { id: 'checklists', icon: '✅', label: 'Checklists', desc: 'Avaliação sistemática' },
  { id: 'tutoriais', icon: '🎓', label: 'Tutoriais', desc: 'Guias passo a passo' },
  { id: 'videos', icon: '🎬', label: 'Vídeos', desc: 'Casos práticos' }
]

export default function Home() {
  const [currentSpec, setCurrentSpec] = useState('neuro')
  const [currentSubArea, setCurrentSubArea] = useState('all')
  const [currentSection, setCurrentSection] = useState('home')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [favorites, setFavorites] = useState<SavedItem[]>([])
  const [history, setHistory] = useState<SavedItem[]>([])

  const usesFirebase = VALID_CONTENT_TYPES.includes(currentSection as ContentType)
  const usesSpecs = usesFirebase || currentSection === 'calculadoras' || currentSection === 'geradores'

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme)
      document.documentElement.classList.toggle('light-mode', newTheme === 'light')
    }
  }

  const [searchItemId, setSearchItemId] = useState<string | null>(null)

  const navigateTo = (section: string, spec?: string, subArea?: string) => {
    setCurrentSection(section)
    if (spec !== undefined) setCurrentSpec(spec)
    if (subArea !== undefined) setCurrentSubArea(subArea)
    setSearchItemId(null)
    setMobileMenuOpen(false)
  }

  const handleSearchSelect = (r: { id?: string; tipo: string; especialidade: string }) => {
    setCurrentSpec(r.especialidade)
    setCurrentSection(r.tipo)
    setCurrentSubArea('all')
    setSearchItemId(r.id || null)
    setMobileMenuOpen(false)
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' || 'dark'
      setTheme(savedTheme)
      document.documentElement.classList.toggle('light-mode', savedTheme === 'light')
      setFavorites(getFavorites())
      setHistory(getHistory())
    }
  }, [])

  useEffect(() => {
    if (currentSection === 'home' && typeof window !== 'undefined') {
      setFavorites(getFavorites())
      setHistory(getHistory())
    }
  }, [currentSection])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Skip to content */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-lg">
        Ir para conteúdo principal
      </a>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-bg/98 backdrop-blur-xl border-b border-border z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-surface2 hover:bg-border transition-all"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
            <button
              onClick={() => navigateTo('home')}
              className="flex items-baseline hover:opacity-85 transition-opacity"
            >
              <span className="text-2xl sm:text-3xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-accent2 to-text bg-clip-text text-transparent">Radiology</span>
                <span className="text-accent font-extrabold">HUB</span>
              </span>
              <span className="text-xs sm:text-sm text-text3 font-medium ml-0.5">.app</span>
            </button>
          </div>

          <nav className="hidden lg:flex gap-1" aria-label="Navegação principal">
            {NAV_SECTIONS.map(section => (
              <button
                key={section.id}
                onClick={() => navigateTo(section.id)}
                aria-current={currentSection === section.id ? 'page' : undefined}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentSection === section.id
                    ? 'bg-accent/20 text-accent border border-accent/30'
                    : 'text-text3 hover:text-text hover:bg-surface2'
                }`}
              >
                <span className="hidden xl:inline" aria-hidden="true">{section.icon} </span>{section.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <SearchBar onSelectResult={handleSearchSelect} />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-surface2 hover:bg-border transition-all"
              aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-border bg-surface" aria-label="Menu mobile">
            <div className="container mx-auto px-4 py-3 grid grid-cols-3 sm:grid-cols-5 gap-2">
              {NAV_SECTIONS.map(section => (
                <button
                  key={section.id}
                  onClick={() => navigateTo(section.id)}
                  aria-current={currentSection === section.id ? 'page' : undefined}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg text-center transition-all ${
                    currentSection === section.id
                      ? 'bg-accent/20 text-accent'
                      : 'text-text3 hover:text-text hover:bg-surface2'
                  }`}
                >
                  <span className="text-lg" aria-hidden="true">{section.icon}</span>
                  <span className="text-[10px] font-medium">{section.label}</span>
                </button>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* Specialty bar */}
      {currentSection !== 'home' && usesSpecs && (
        <SpecBar
          currentSpec={currentSpec}
          currentSubArea={currentSubArea}
          usesFirebase={usesFirebase}
          onSpecChange={(spec) => { setCurrentSpec(spec); setCurrentSubArea('all') }}
          onSubAreaChange={setCurrentSubArea}
        />
      )}

      <main
        id="main-content"
        className={`${currentSection === 'home' ? 'pt-16' : usesSpecs ? 'pt-[128px] sm:pt-[176px]' : 'pt-16'} min-h-screen`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">

          {/* HOME */}
          {currentSection === 'home' && (
            <div>
              <div className="text-center max-w-4xl mx-auto mb-8 sm:mb-12">
                <h1 className="text-3xl sm:text-5xl font-bold mb-4 text-text">
                  Ferramentas para <span className="bg-gradient-to-r from-accent2 to-accent bg-clip-text text-transparent">radiologistas</span>
                </h1>
                <p className="text-sm sm:text-lg text-text2 mb-6">
                  Calculadoras médicas, resumos técnicos, geradores de laudo e checklists — tudo organizado por especialidade radiológica.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => navigateTo('resumos')}
                    className="w-full sm:w-auto px-5 py-2 bg-accent text-white rounded-lg hover:bg-accent2 transition-all font-semibold text-sm"
                  >
                    Explorar Resumos
                  </button>
                  <button
                    onClick={() => navigateTo('calculadoras')}
                    className="w-full sm:w-auto px-5 py-2 bg-surface2 text-text border border-border rounded-lg hover:border-accent/50 transition-all font-semibold text-sm"
                  >
                    Ver Calculadoras
                  </button>
                </div>
              </div>

              {/* Section grid */}
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-2 sm:gap-3 mb-8 sm:mb-12">
                {HOME_SECTIONS.map(section => (
                  <button
                    key={section.id}
                    onClick={() => navigateTo(section.id)}
                    className="bg-surface border border-border rounded-lg p-3 sm:p-4 hover:border-accent/50 hover:shadow-md transition-all cursor-pointer group text-left"
                  >
                    <div className="text-2xl sm:text-3xl mb-1 sm:mb-2" aria-hidden="true">{section.icon}</div>
                    <h3 className="text-xs sm:text-sm font-bold mb-0.5 text-text group-hover:text-accent transition-colors">{section.label}</h3>
                    <p className="text-[10px] sm:text-xs text-text3 hidden sm:block">{section.desc}</p>
                  </button>
                ))}
              </div>

              {/* Favorites */}
              {favorites.length > 0 && (
                <div className="bg-surface border border-border rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2 text-text">
                    <span aria-hidden="true">★</span> Favoritos
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {favorites.slice(0, 6).map(fav => (
                      <button
                        key={fav.id}
                        onClick={() => {
                          navigateTo(fav.tipo, fav.especialidade, 'all')
                        }}
                        className="text-left bg-surface2 border border-border rounded-lg p-3 hover:border-accent/50 transition-all group"
                      >
                        <div className="text-sm font-semibold text-text group-hover:text-accent transition-colors line-clamp-1">{fav.titulo}</div>
                        <div className="text-xs text-text3 mt-1">
                          {TYPE_LABELS[fav.tipo as keyof typeof TYPE_LABELS] || fav.tipo}
                          {fav.subarea && ` · ${fav.subarea}`}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* History */}
              {history.length > 0 && (
                <div className="bg-surface border border-border rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2 text-text">
                    <span aria-hidden="true">🕐</span> Vistos Recentemente
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {history.slice(0, 6).map(h => (
                      <button
                        key={h.id}
                        onClick={() => {
                          navigateTo(h.tipo, h.especialidade, 'all')
                        }}
                        className="text-left bg-surface2 border border-border rounded-lg p-3 hover:border-accent/50 transition-all group"
                      >
                        <div className="text-sm font-semibold text-text group-hover:text-accent transition-colors line-clamp-1">{h.titulo}</div>
                        <div className="text-xs text-text3 mt-1">
                          {TYPE_LABELS[h.tipo as keyof typeof TYPE_LABELS] || h.tipo}
                          {h.subarea && ` · ${h.subarea}`}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats + News */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
                <div className="bg-gradient-to-br from-accent/10 to-accent2/10 border border-accent/30 rounded-xl p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold mb-4 text-text">
                    <span aria-hidden="true">📊</span> Estatísticas
                  </h2>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-accent">11</div>
                      <div className="text-[10px] sm:text-xs text-text3">Especialidades</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-accent">90+</div>
                      <div className="text-[10px] sm:text-xs text-text3">Sub-áreas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-accent">9</div>
                      <div className="text-[10px] sm:text-xs text-text3">Ferramentas</div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface border border-border rounded-xl p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2 text-text">
                    <span aria-hidden="true">🔥</span> Novidades
                  </h2>
                  <div className="space-y-3 text-sm">
                    {[
                      { icon: '★', title: 'Favoritos', desc: 'Salve conteúdos para acesso rápido' },
                      { icon: '🕐', title: 'Histórico', desc: 'Últimos conteúdos acessados' },
                      { icon: '🔍', title: 'Busca avançada', desc: 'Filtre por tipo e especialidade' },
                      { icon: '↗', title: 'Compartilhar', desc: 'Envie conteúdo via link' },
                    ].map((item, i) => (
                      <div key={i} className={`flex items-start gap-3 ${i < 3 ? 'pb-3 border-b border-border' : ''}`}>
                        <div className="text-xl sm:text-2xl" aria-hidden="true">{item.icon}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-text">{item.title}</div>
                          <div className="text-xs text-text3">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONTENT SECTIONS (Firebase) */}
          {currentSection !== 'home' && usesFirebase && (
            <div>
              <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-8 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-text">
                <span>
                  {currentSection === 'resumos' && 'Resumos'}
                  {currentSection === 'artigos' && 'Resumo de Artigos'}
                  {currentSection === 'mascaras' && 'Máscaras de Laudo'}
                  {currentSection === 'frases' && 'Frases Prontas'}
                  {currentSection === 'checklists' && 'Checklists'}
                  {currentSection === 'tutoriais' && 'Tutoriais'}
                  {currentSection === 'videos' && 'Vídeos'}
                </span>
                <span className="text-text3 text-sm sm:text-lg font-normal">
                  <span aria-hidden="true">{SPECS[currentSpec as keyof typeof SPECS].icon}</span> {SPECS[currentSpec as keyof typeof SPECS].label}
                  {currentSubArea !== 'all' && ` · ${currentSubArea}`}
                </span>
              </h2>

              <ContentList
                tipo={currentSection as ContentType}
                especialidade={currentSpec}
                subarea={currentSubArea}
                initialItemId={searchItemId}
              />
            </div>
          )}

          {/* CALCULADORAS */}
          {currentSection === 'calculadoras' && (
            <div>
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-3xl font-bold flex items-center gap-3 text-text mb-2">
                  Calculadoras Médicas
                </h2>
                <p className="text-text2 text-sm">
                  <span aria-hidden="true">{SPECS[currentSpec as keyof typeof SPECS].icon}</span> {SPECS[currentSpec as keyof typeof SPECS].label}
                </p>
              </div>

              {CALCULADORAS_POR_SPEC[currentSpec]?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CALCULADORAS_POR_SPEC[currentSpec].map((calc, index) => (
                    <div
                      key={index}
                      className={`bg-surface border border-border rounded-xl p-4 sm:p-6 hover:border-accent/50 hover:shadow-lg transition-all group ${calc.link ? 'cursor-pointer' : ''}`}
                      onClick={() => calc.link && window.open(calc.link, '_self')}
                      role={calc.link ? 'link' : undefined}
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <div className="text-2xl sm:text-3xl" aria-hidden="true">🧮</div>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-text group-hover:text-accent transition-colors">{calc.nome}</h3>
                          <p className="text-xs sm:text-sm text-text3">{calc.descricao}</p>
                        </div>
                      </div>
                      {calc.link ? (
                        <div className="px-4 py-2 bg-accent/10 text-accent rounded-lg text-sm text-center font-semibold">
                          Abrir Calculadora
                        </div>
                      ) : (
                        <div className="px-4 py-2 bg-surface2 text-text3 rounded-lg text-sm text-center">
                          Em desenvolvimento
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-surface border border-border rounded-xl p-8 sm:p-16 text-center">
                  <div className="text-5xl sm:text-6xl mb-4 opacity-50" aria-hidden="true">🧮</div>
                  <p className="text-lg sm:text-xl text-text2 mb-2">Nenhuma calculadora disponível</p>
                  <p className="text-sm text-text3">Selecione outra especialidade ou aguarde novas adições</p>
                </div>
              )}
            </div>
          )}

          {/* GERADORES */}
          {currentSection === 'geradores' && (
            <div>
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-3xl font-bold flex items-center gap-3 text-text mb-2">
                  Geradores de Laudo
                </h2>
                <p className="text-text2 text-sm">
                  <span aria-hidden="true">{SPECS[currentSpec as keyof typeof SPECS].icon}</span> {SPECS[currentSpec as keyof typeof SPECS].label}
                </p>
              </div>

              {GERADORES_POR_SPEC[currentSpec]?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {GERADORES_POR_SPEC[currentSpec].map((ger, index) => (
                    <div
                      key={index}
                      className={`bg-surface border border-border rounded-xl p-4 sm:p-6 hover:border-accent/50 hover:shadow-lg transition-all group ${ger.link ? 'cursor-pointer' : ''}`}
                      onClick={() => ger.link && window.open(ger.link, '_self')}
                      role={ger.link ? 'link' : undefined}
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <div className="text-2xl sm:text-3xl" aria-hidden="true">⚙️</div>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-text group-hover:text-accent transition-colors">{ger.nome}</h3>
                          <p className="text-xs sm:text-sm text-text3">{ger.descricao}</p>
                        </div>
                      </div>
                      {ger.link ? (
                        <div className="px-4 py-2 bg-accent/10 text-accent rounded-lg text-sm text-center font-semibold">
                          Abrir Gerador
                        </div>
                      ) : (
                        <div className="px-4 py-2 bg-surface2 text-text3 rounded-lg text-sm text-center">
                          Em desenvolvimento
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-surface border border-border rounded-xl p-8 sm:p-16 text-center">
                  <div className="text-5xl sm:text-6xl mb-4 opacity-50" aria-hidden="true">⚙️</div>
                  <p className="text-lg sm:text-xl text-text2 mb-2">Nenhum gerador disponível</p>
                  <p className="text-sm text-text3">Selecione outra especialidade ou aguarde novas adições</p>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text3">
          <span>RadiologyHUB — São Paulo/SP, Brasil</span>
          <a href="/termos" className="hover:text-accent transition-colors">
            Termos de Uso e Política de Privacidade
          </a>
        </div>
      </footer>
    </div>
  )
}
