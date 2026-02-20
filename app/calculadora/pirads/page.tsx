'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  OptionGrid,
} from '@/app/calculadora/components/calculator-layout'

const locationOpts = [
  { value: 'PZ', label: 'Zona Periferica (PZ)', description: 'DWI e a sequencia dominante' },
  { value: 'TZ', label: 'Zona de Transicao (TZ)', description: 'T2WI e a sequencia dominante' },
]

const dwiOpts = [
  { value: '1', label: 'DWI 1', description: 'Normal (sem alteracao no ADC ou high b-value)' },
  { value: '2', label: 'DWI 2', description: 'Linear/cuneiforme/indistinta hipointensidade no ADC' },
  { value: '3', label: 'DWI 3', description: 'Focal, hipointensidade leve-moderada no ADC; iso/levemente hiperintenso no high b-value' },
  { value: '4', label: 'DWI 4', description: 'Marcadamente hipointenso no ADC e hiperintenso no high b-value; < 1,5 cm' },
  { value: '5', label: 'DWI 5', description: 'Igual ao 4 mas >= 1,5 cm OU extensao extraprostática definida' },
]

const dceOpts = [
  { value: 'neg', label: 'DCE Negativo', description: 'Sem realce precoce ou difuso' },
  { value: 'pos', label: 'DCE Positivo', description: 'Realce precoce focal, contemporaneo ou antes do tecido adjacente' },
]

const t2wiOpts = [
  { value: '1', label: 'T2WI 1', description: 'Normal (homogeneo, intensidade de sinal intermediaria)' },
  { value: '2', label: 'T2WI 2', description: 'Hipointensidade homogenea circunscrita (nodulo tipico de BPH)' },
  { value: '3', label: 'T2WI 3', description: 'Sinal heterogeneo ou hipointensidade nao circunscrita' },
  { value: '4', label: 'T2WI 4', description: 'Lenticular ou hipointensidade homogenea moderada nao circunscrita; < 1,5 cm' },
  { value: '5', label: 'T2WI 5', description: 'Igual ao 4 mas >= 1,5 cm OU extensao extraprostatica definida' },
]

function getPIRADSLabel(score: number): { label: string; color: string } {
  switch (score) {
    case 1: return { label: 'Muito baixa (cancer clinicamente significativo altamente improvavel)', color: '#16a34a' }
    case 2: return { label: 'Baixa (cancer clinicamente significativo improvavel)', color: '#22c55e' }
    case 3: return { label: 'Intermediaria (equivoca)', color: '#eab308' }
    case 4: return { label: 'Alta (cancer clinicamente significativo provavel)', color: '#f59e0b' }
    case 5: return { label: 'Muito alta (cancer clinicamente significativo altamente provavel)', color: '#dc2626' }
    default: return { label: '', color: 'var(--text3)' }
  }
}

function getManagement(score: number): string {
  switch (score) {
    case 1: return 'Sem achados significativos. Acompanhamento de rotina.'
    case 2: return 'Sem achados significativos. Acompanhamento de rotina.'
    case 3: return 'Achado equivoco. Considerar biomarcadores, correlacao clinica ou seguimento com RM em 12 meses. Biopsia pode ser considerada.'
    case 4: return 'Biopsia dirigida por fusao RM-US ou in-bore recomendada.'
    case 5: return 'Biopsia dirigida altamente recomendada. Alta probabilidade de cancer clinicamente significativo.'
    default: return ''
  }
}

export default function PIRADSCalculator() {
  const [location, setLocation] = useState('')
  const [dwi, setDwi] = useState('')
  const [dce, setDce] = useState('')
  const [t2wi, setT2wi] = useState('')

  const result = useMemo(() => {
    if (!location) return null

    if (location === 'PZ') {
      if (!dwi) return null
      const dwiScore = parseInt(dwi)
      let finalScore = dwiScore
      // If DWI=3 and DCE positive, upgrade to PI-RADS 4
      if (dwiScore === 3 && dce === 'pos') {
        finalScore = 4
      }
      const info = getPIRADSLabel(finalScore)
      const upgraded = dwiScore === 3 && dce === 'pos'
      const management = getManagement(finalScore)
      return { finalScore, info, upgraded, upgradeFrom: upgraded ? 3 : null, management }
    }

    // TZ
    if (!t2wi) return null
    const t2Score = parseInt(t2wi)
    let finalScore = t2Score
    // If T2WI=3 and DWI=5, upgrade to PI-RADS 4
    if (t2Score === 3 && dwi === '5') {
      finalScore = 4
    }
    const info = getPIRADSLabel(finalScore)
    const upgraded = t2Score === 3 && dwi === '5'
    const management = getManagement(finalScore)
    return { finalScore, info, upgraded, upgradeFrom: upgraded ? 3 : null, management }
  }, [location, dwi, dce, t2wi])

  const reportText = useMemo(() => {
    if (!result) return ''
    const zone = location === 'PZ' ? 'zona periferica' : 'zona de transicao'
    const upgrade = result.upgraded ? ` (upgradeado de PI-RADS ${result.upgradeFrom})` : ''
    return `Lesao na ${zone}. Classificacao PI-RADS v2.1: ${result.finalScore}${upgrade} - ${result.info.label}. ${result.management}`
  }, [result, location])

  return (
    <CalculatorLayout
      title="PI-RADS v2.1"
      subtitle="Prostate Imaging Reporting and Data System (2019)"
      references={[
        { text: 'Turkbey B, Rosenkrantz AB, Haider MA, et al. Prostate Imaging Reporting and Data System Version 2.1: 2019 Update of Prostate Imaging Reporting and Data System Version 2. Eur Urol. 2019;76(3):340-351.', url: 'https://pubmed.ncbi.nlm.nih.gov/30898406/' },
      ]}
    >
      <Section title="1. Localizacao da Lesao">
        <OptionGrid options={locationOpts} value={location} onChange={v => { setLocation(v); setDwi(''); setDce(''); setT2wi('') }} columns={2} />
      </Section>

      {location === 'PZ' && (
        <>
          <Section title="2. Score DWI (Sequencia Dominante na PZ)">
            <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
              Na zona periferica, DWI/ADC determina o score primario.
            </p>
            <OptionGrid options={dwiOpts} value={dwi} onChange={setDwi} columns={2} />
          </Section>

          <Section title="3. DCE (Contraste Dinamico)">
            <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
              Na PZ, DCE positivo pode elevar PI-RADS 3 para 4.
            </p>
            <OptionGrid options={dceOpts} value={dce} onChange={setDce} columns={2} />
          </Section>
        </>
      )}

      {location === 'TZ' && (
        <>
          <Section title="2. Score T2WI (Sequencia Dominante na TZ)">
            <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
              Na zona de transicao, T2WI determina o score primario.
            </p>
            <OptionGrid options={t2wiOpts} value={t2wi} onChange={setT2wi} columns={2} />
          </Section>

          <Section title="3. Score DWI (Sequencia Secundaria na TZ)">
            <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
              Na TZ, DWI score 5 pode elevar PI-RADS 3 para 4.
            </p>
            <OptionGrid options={dwiOpts} value={dwi} onChange={setDwi} columns={2} />
          </Section>
        </>
      )}

      {result && (
        <Section title="Resultado">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <ResultBadge label="PI-RADS" value={`${result.finalScore}`} color={result.info.color} large />
            <ResultBadge label="Probabilidade" value={result.info.label} color={result.info.color} />
          </div>

          {result.upgraded && (
            <div className="rounded-lg border p-3 mb-3" style={{ backgroundColor: 'rgba(234,179,8,0.08)', borderColor: 'rgba(234,179,8,0.3)' }}>
              <p className="text-xs font-semibold" style={{ color: '#eab308' }}>
                Score elevado de PI-RADS {result.upgradeFrom} para {result.finalScore} {location === 'PZ' ? 'por DCE positivo' : 'por DWI score 5'}
              </p>
            </div>
          )}

          <div className="rounded-lg border p-4 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: result.info.color + '44' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Recomendacao de Conduta</p>
            <p className="text-sm font-semibold" style={{ color: result.info.color }}>{result.management}</p>
          </div>

          <div className="rounded-lg border p-3 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Escala PI-RADS</p>
            <p className="text-xs" style={{ color: '#16a34a' }}>PI-RADS 1: Muito baixa probabilidade</p>
            <p className="text-xs" style={{ color: '#22c55e' }}>PI-RADS 2: Baixa probabilidade</p>
            <p className="text-xs" style={{ color: '#eab308' }}>PI-RADS 3: Intermediaria (equivoca)</p>
            <p className="text-xs" style={{ color: '#f59e0b' }}>PI-RADS 4: Alta probabilidade</p>
            <p className="text-xs" style={{ color: '#dc2626' }}>PI-RADS 5: Muito alta probabilidade</p>
          </div>

          {reportText && (
            <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Texto para Laudo</p>
              <p className="text-sm font-mono p-3 rounded-lg" style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)', userSelect: 'all' }}>
                {reportText}
              </p>
            </div>
          )}
        </Section>
      )}
    </CalculatorLayout>
  )
}
