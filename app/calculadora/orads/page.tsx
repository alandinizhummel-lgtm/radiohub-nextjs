'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  OptionGrid,
  inputCls,
  labelCls,
  labelStyle,
} from '@/app/calculadora/components/calculator-layout'

/* ── Shared helpers ── */

function getCategoryColor(cat: number): string {
  if (cat === 0) return 'var(--text3)'
  if (cat === 1) return '#16a34a'
  if (cat === 2) return '#22c55e'
  if (cat === 3) return '#f59e0b'
  if (cat === 4) return '#f97316'
  if (cat === 5) return '#dc2626'
  return 'var(--text3)'
}

function getCategoryLabel(cat: number): string {
  switch (cat) {
    case 0: return 'Incompleto'
    case 1: return 'Normal (sem lesao)'
    case 2: return 'Quase certamente benigno (<1%)'
    case 3: return 'Baixo risco (1-10%)'
    case 4: return 'Risco intermediario (10-50%)'
    case 5: return 'Alto risco (>=50%)'
    default: return ''
  }
}

function getManagement(cat: number): string {
  switch (cat) {
    case 0: return 'Exame incompleto. Repetir com tecnica adequada ou metodo complementar.'
    case 1: return 'Sem necessidade de seguimento por imagem para esta indicacao.'
    case 2: return 'Sem necessidade de seguimento ou, opcionalmente, US em 12 meses se achado novo.'
    case 3: return 'Seguimento com US em 3-6 meses. RM de pelve pode ser considerada para melhor caracterizacao.'
    case 4: return 'RM de pelve recomendada para melhor caracterizacao. Considerar encaminhamento para ginecologia.'
    case 5: return 'Encaminhamento para ginecologia oncologica. Considerar RM de pelve se nao realizada. Estadiamento.'
    default: return ''
  }
}

const yesNoOptions = [
  { value: 'yes', label: 'Sim' },
  { value: 'no', label: 'Nao' },
]

const menoOptions = [
  { value: 'pre', label: 'Pre-menopausa' },
  { value: 'post', label: 'Pos-menopausa' },
]

/* ── US-specific options ── */

const usLesionTypeOptions = [
  { value: 'simple', label: 'Cisto simples', description: 'Anecogenico, paredes finas e lisas, sem componente solido' },
  { value: 'classic', label: 'Lesao benigna classica', description: 'Cisto hemorragico, dermoide, endometrioma, hidrossalpinge, cisto paratubal' },
  { value: 'smooth', label: 'Parede interna lisa', description: 'Unilocular ou multilocular com parede lisa' },
  { value: 'irregular', label: 'Parede irregular / componente solido', description: 'Irregularidade da parede interna, excrescencia, componente solido' },
]

const usSolidDopplerOptions = [
  { value: 'noSolidNoDoppler', label: 'Sem componente solido, sem Doppler', description: 'Cisto unilocular simples ou multilocular sem fluxo' },
  { value: 'noSolidYesDoppler', label: 'Sem componente solido, com Doppler', description: 'Fluxo Doppler presente na parede ou septo' },
  { value: 'solidNoDoppler', label: 'Com componente solido, sem Doppler', description: 'Componente solido sem fluxo ao Doppler' },
  { value: 'solidYesDoppler', label: 'Com componente solido, com Doppler', description: 'Componente solido com fluxo ao Doppler' },
]

/* ── MRI-specific options ── */

const mriLesionOptions = [
  { value: 'simple', label: 'Cisto simples / folicular', description: 'Hipersinal T2, hipossinal T1, sem realce' },
  { value: 'endometrioma', label: 'Endometrioma / hemorragico', description: 'Hipersinal T1 com shading em T2, sem realce de componente solido' },
  { value: 'dermoid', label: 'Teratoma maduro (dermoide)', description: 'Gordura macroscopica, queda de sinal' },
  { value: 'solidBenign', label: 'Lesao solida com realce tipicamente benigno', description: 'Fibroma, tecoma - baixo sinal T2, realce tardio' },
  { value: 'indeterminate', label: 'Indeterminado', description: 'Nao se enquadra nos padroes acima' },
  { value: 'suspicious', label: 'Suspeito', description: 'Componente solido com realce, restricao a difusao, realce precoce (curva tipo 3)' },
]

/* ── Main Component ── */

export default function ORADSCalculator() {
  const [tab, setTab] = useState<'us' | 'mri'>('us')

  // Shared
  const [menoStatus, setMenoStatus] = useState('')

  // US state
  const [usLesionType, setUsLesionType] = useState('')
  const [usSize, setUsSize] = useState('')
  const [usSolidDoppler, setUsSolidDoppler] = useState('')
  const [usIrregularSize, setUsIrregularSize] = useState('')

  // MRI state
  const [mriLesion, setMriLesion] = useState('')
  const [mriSize, setMriSize] = useState('')
  const [mriDWI, setMriDWI] = useState('')
  const [mriEnhancement, setMriEnhancement] = useState('')

  // US result
  const usResult = useMemo(() => {
    if (tab !== 'us') return null
    if (!menoStatus || !usLesionType) return null

    const size = parseFloat(usSize)

    if (usLesionType === 'simple') {
      if (isNaN(size)) return null
      if (menoStatus === 'pre' && size < 100) return 2
      if (menoStatus === 'post' && size <= 30) return 2
      return 3
    }

    if (usLesionType === 'classic') return 2

    if (usLesionType === 'smooth') {
      if (!usSolidDoppler) return null
      if (usSolidDoppler === 'noSolidNoDoppler') {
        if (isNaN(size)) return null
        return size < 100 ? 2 : 3
      }
      if (usSolidDoppler === 'noSolidYesDoppler') return 3
      if (usSolidDoppler === 'solidNoDoppler') return 3
      if (usSolidDoppler === 'solidYesDoppler') return 4
      return null
    }

    if (usLesionType === 'irregular') {
      const irrSize = parseFloat(usIrregularSize)
      if (isNaN(irrSize)) return null
      if (irrSize < 100) return 4
      return 5
    }

    return null
  }, [tab, menoStatus, usLesionType, usSize, usSolidDoppler, usIrregularSize])

  // MRI result
  const mriResult = useMemo(() => {
    if (tab !== 'mri') return null
    if (!mriLesion) return null

    if (mriLesion === 'simple') return 2
    if (mriLesion === 'endometrioma') return 2
    if (mriLesion === 'dermoid') return 2
    if (mriLesion === 'solidBenign') return 3

    if (mriLesion === 'indeterminate') {
      if (!mriDWI) return null
      if (mriDWI === 'no') return 3
      return 4
    }

    if (mriLesion === 'suspicious') {
      const size = parseFloat(mriSize)
      if (isNaN(size)) return null
      if (!mriEnhancement) return null
      if (mriEnhancement === 'yes') return size >= 40 ? 5 : 4
      return 4
    }

    return null
  }, [tab, mriLesion, mriSize, mriDWI, mriEnhancement])

  const currentResult = tab === 'us' ? usResult : mriResult

  const laudoText = useMemo(() => {
    if (currentResult === null) return ''
    const method = tab === 'us' ? 'O-RADS US v2022' : 'O-RADS MRI v2023'
    const parts: string[] = []
    parts.push(`Classificacao ${method}: Categoria ${currentResult} - ${getCategoryLabel(currentResult)}.`)
    parts.push(`Conduta: ${getManagement(currentResult)}`)
    return parts.join(' ')
  }, [currentResult, tab])

  return (
    <CalculatorLayout
      title="O-RADS"
      subtitle="Ovarian-Adnexal Reporting and Data System (US e RM)"
      references={[
        {
          text: 'Thomassin-Naggara I, Defined by ACR Committee. O-RADS US v2022 Risk Stratification and Management System. Radiology. 2020;294(2):328-339.',
          url: 'https://pubmed.ncbi.nlm.nih.gov/31769740/',
        },
        {
          text: 'Reinhold C, et al. O-RADS MRI Risk Stratification System. Radiology. 2023;307(1):e230589.',
          url: 'https://pubmed.ncbi.nlm.nih.gov/37014239/',
        },
      ]}
    >
      {/* Tab selector */}
      <div className="flex gap-2 mb-4">
        {(['us', 'mri'] as const).map(t => (
          <button
            key={t}
            onClick={() => {
              setTab(t)
              setMenoStatus('')
              setUsLesionType('')
              setUsSize('')
              setUsSolidDoppler('')
              setUsIrregularSize('')
              setMriLesion('')
              setMriSize('')
              setMriDWI('')
              setMriEnhancement('')
            }}
            className="flex-1 py-2 px-4 rounded-lg border text-sm font-bold transition-all"
            style={tab === t
              ? { borderColor: 'var(--accent)', backgroundColor: 'rgba(99,102,241,0.15)', color: 'var(--accent)' }
              : { borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text3)' }
            }
          >
            {t === 'us' ? 'O-RADS US' : 'O-RADS MRI'}
          </button>
        ))}
      </div>

      {/* ── US Tab ── */}
      {tab === 'us' && (
        <>
          <Section title="1. Status menopausal">
            <OptionGrid options={menoOptions} value={menoStatus} onChange={setMenoStatus} columns={2} />
          </Section>

          {menoStatus && (
            <Section title="2. Tipo de lesao">
              <OptionGrid options={usLesionTypeOptions} value={usLesionType} onChange={setUsLesionType} columns={2} />
            </Section>
          )}

          {menoStatus && (usLesionType === 'simple' || usLesionType === 'smooth') && (
            <Section title="3. Tamanho da lesao">
              <div className="max-w-xs">
                <label className={labelCls} style={labelStyle}>Maior dimensao (mm)</label>
                <input
                  type="number"
                  className={inputCls}
                  placeholder="Ex: 45"
                  value={usSize}
                  onChange={e => setUsSize(e.target.value)}
                  min={0}
                  step={1}
                />
              </div>
            </Section>
          )}

          {menoStatus && usLesionType === 'smooth' && (
            <Section title="4. Componente solido e Doppler">
              <OptionGrid options={usSolidDopplerOptions} value={usSolidDoppler} onChange={setUsSolidDoppler} columns={2} />
            </Section>
          )}

          {menoStatus && usLesionType === 'irregular' && (
            <Section title="3. Tamanho da lesao">
              <div className="max-w-xs">
                <label className={labelCls} style={labelStyle}>Maior dimensao (mm)</label>
                <input
                  type="number"
                  className={inputCls}
                  placeholder="Ex: 80"
                  value={usIrregularSize}
                  onChange={e => setUsIrregularSize(e.target.value)}
                  min={0}
                  step={1}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                  &lt;100mm: O-RADS 4 | &ge;100mm: O-RADS 5
                </p>
              </div>
            </Section>
          )}
        </>
      )}

      {/* ── MRI Tab ── */}
      {tab === 'mri' && (
        <>
          <Section title="1. Tipo de lesao na RM">
            <OptionGrid options={mriLesionOptions} value={mriLesion} onChange={setMriLesion} columns={2} />
          </Section>

          {mriLesion === 'indeterminate' && (
            <Section title="2. Restricao a difusao (DWI)">
              <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
                Ha restricao a difusao no componente solido?
              </p>
              <OptionGrid options={yesNoOptions} value={mriDWI} onChange={setMriDWI} columns={2} />
            </Section>
          )}

          {mriLesion === 'suspicious' && (
            <>
              <Section title="2. Tamanho da lesao">
                <div className="max-w-xs">
                  <label className={labelCls} style={labelStyle}>Maior dimensao do componente solido (mm)</label>
                  <input
                    type="number"
                    className={inputCls}
                    placeholder="Ex: 35"
                    value={mriSize}
                    onChange={e => setMriSize(e.target.value)}
                    min={0}
                    step={1}
                  />
                </div>
              </Section>

              <Section title="3. Realce precoce intenso (curva tipo 3)">
                <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
                  Componente solido com realce precoce e wash-out (curva time-intensity tipo 3)?
                </p>
                <OptionGrid options={yesNoOptions} value={mriEnhancement} onChange={setMriEnhancement} columns={2} />
              </Section>
            </>
          )}
        </>
      )}

      {/* ── Result ── */}
      {currentResult !== null && (
        <Section title="Resultado">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <ResultBadge
              label={tab === 'us' ? 'O-RADS US' : 'O-RADS MRI'}
              value={`Categoria ${currentResult}`}
              color={getCategoryColor(currentResult)}
              large
            />
            <ResultBadge
              label="Classificacao"
              value={getCategoryLabel(currentResult)}
              color={getCategoryColor(currentResult)}
            />
            <ResultBadge
              label="Risco estimado de malignidade"
              value={
                (currentResult as number) <= 1 ? '0%' :
                currentResult === 2 ? '<1%' :
                currentResult === 3 ? '1-10%' :
                currentResult === 4 ? '10-50%' : '>=50%'
              }
              color={getCategoryColor(currentResult)}
            />
          </div>

          <div className="rounded-lg border p-4 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: getCategoryColor(currentResult) + '44' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Recomendacao de Conduta</p>
            <p className="text-sm font-semibold" style={{ color: getCategoryColor(currentResult) }}>
              {getManagement(currentResult)}
            </p>
          </div>

          <div className="rounded-lg border p-3 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Resumo das categorias O-RADS</p>
            <div className="space-y-1">
              <p className="text-xs" style={{ color: 'var(--text3)' }}>0 - Incompleto: exame insatisfatorio</p>
              <p className="text-xs" style={{ color: '#16a34a' }}>1 - Normal: ovarios sem lesao</p>
              <p className="text-xs" style={{ color: '#22c55e' }}>2 - Quase certamente benigno: risco &lt;1%</p>
              <p className="text-xs" style={{ color: '#f59e0b' }}>3 - Baixo risco: 1-10%</p>
              <p className="text-xs" style={{ color: '#f97316' }}>4 - Risco intermediario: 10-50%</p>
              <p className="text-xs" style={{ color: '#dc2626' }}>5 - Alto risco: &ge;50%</p>
            </div>
          </div>

          {laudoText && (
            <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Texto para laudo</p>
                <button
                  onClick={() => navigator.clipboard.writeText(laudoText)}
                  className="text-xs px-2 py-1 rounded border"
                  style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}
                >
                  Copiar
                </button>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text3)', whiteSpace: 'pre-wrap' }}>
                {laudoText}
              </p>
            </div>
          )}
        </Section>
      )}
    </CalculatorLayout>
  )
}
