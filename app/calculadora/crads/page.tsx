'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  OptionGrid,
} from '@/app/calculadora/components/calculator-layout'

const colonicOpts = [
  { value: 'C0', label: 'C0', description: 'Estudo inadequado - necessita repetir ou metodo alternativo' },
  { value: 'C1', label: 'C1', description: 'Normal ou variante anatomica benigna. Sem polipos >= 6 mm' },
  { value: 'C2', label: 'C2', description: 'Polipo intermediario (6-9 mm), <= 2 polipos. Achado benigno' },
  { value: 'C3', label: 'C3', description: 'Polipo >= 10 mm OU >= 3 polipos de 6-9 mm' },
  { value: 'C4', label: 'C4', description: 'Massa colonica ou lesao suspeita de malignidade' },
]

const extracolonicOpts = [
  { value: 'E0', label: 'E0', description: 'Avaliacao extracolonica limitada' },
  { value: 'E1', label: 'E1', description: 'Sem achados extracolonicos significativos / variante anatomica' },
  { value: 'E2', label: 'E2', description: 'Achado clinicamente insignificante (nao necessita investigacao)' },
  { value: 'E3', label: 'E3', description: 'Achado provavelmente insignificante (seguimento eventualmente necessario)' },
  { value: 'E4', label: 'E4', description: 'Achado potencialmente significativo (investigacao adicional recomendada)' },
]

function getColonicManagement(cat: string): { text: string; color: string } {
  switch (cat) {
    case 'C0': return {
      text: 'Estudo inadequado. Repetir o exame com preparo adequado ou realizar colonoscopia convencional.',
      color: '#eab308',
    }
    case 'C1': return {
      text: 'Exame normal. Seguimento de rotina em 5 anos (se indicacao de rastreamento) ou conforme protocolo institucional.',
      color: '#16a34a',
    }
    case 'C2': return {
      text: 'Polipo intermediario (6-9 mm). Opcoes: vigilancia com colonografia por TC em 3 anos ou colonoscopia com polipectomia. Discutir com o paciente.',
      color: '#f59e0b',
    }
    case 'C3': return {
      text: 'Polipo grande ou multiplos polipos intermediarios. Colonoscopia com polipectomia recomendada.',
      color: '#dc2626',
    }
    case 'C4': return {
      text: 'Massa colonica suspeita de malignidade. Colonoscopia com biopsia recomendada com urgencia. Considerar estadiamento.',
      color: '#dc2626',
    }
    default: return { text: '', color: 'var(--text3)' }
  }
}

function getExtracolonicManagement(cat: string): { text: string; color: string } {
  switch (cat) {
    case 'E0': return { text: 'Avaliacao extracolonica limitada. Considerar complementacao se clinicamente indicado.', color: '#eab308' }
    case 'E1': return { text: 'Sem achados extracolonicos relevantes. Nenhuma acao adicional necessaria.', color: '#16a34a' }
    case 'E2': return { text: 'Achado clinicamente insignificante (ex: cisto renal simples, cisto hepatico, calcificacoes benignas). Sem seguimento necessario.', color: '#16a34a' }
    case 'E3': return { text: 'Achado provavelmente insignificante mas seguimento pode ser necessario (ex: nodulo adrenal, linfonodo levemente aumentado). Considerar exame direcionado.', color: '#f59e0b' }
    case 'E4': return { text: 'Achado potencialmente significativo (ex: massa renal solida, aneurisma de aorta, linfonodomegalia suspeita). Investigacao adicional recomendada.', color: '#dc2626' }
    default: return { text: '', color: 'var(--text3)' }
  }
}

export default function CRADSCalculator() {
  const [colonic, setColonic] = useState('')
  const [extracolonic, setExtracolonic] = useState('')

  const colonicResult = useMemo(() => {
    if (!colonic) return null
    return getColonicManagement(colonic)
  }, [colonic])

  const extraResult = useMemo(() => {
    if (!extracolonic) return null
    return getExtracolonicManagement(extracolonic)
  }, [extracolonic])

  const reportText = useMemo(() => {
    const parts: string[] = []
    if (colonic) {
      const colonDesc = colonicOpts.find(o => o.value === colonic)?.description || ''
      const mgmt = getColonicManagement(colonic)
      parts.push(`Achados colonicos: ${colonic} - ${colonDesc}. ${mgmt.text}`)
    }
    if (extracolonic) {
      const extraDesc = extracolonicOpts.find(o => o.value === extracolonic)?.description || ''
      const mgmt = getExtracolonicManagement(extracolonic)
      parts.push(`Achados extracolonicos: ${extracolonic} - ${extraDesc}. ${mgmt.text}`)
    }
    return parts.join(' ')
  }, [colonic, extracolonic])

  return (
    <CalculatorLayout
      title="C-RADS"
      subtitle="CT Colonography Reporting and Data System"
      references={[
        { text: 'Zalis ME, Barish MA, Choi JR, et al. CT Colonography Reporting and Data System: A Consensus Proposal. Radiology. 2005;236(1):3-9.', url: 'https://pubmed.ncbi.nlm.nih.gov/15987960/' },
      ]}
    >
      <Section title="Achados Colonicos (C)">
        <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
          Classifique o achado colonico mais significativo encontrado na colonografia por TC.
        </p>
        <OptionGrid options={colonicOpts} value={colonic} onChange={setColonic} columns={2} />
      </Section>

      <Section title="Achados Extracolonicos (E)">
        <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
          Classifique o achado extracolonico mais relevante identificado no exame.
        </p>
        <OptionGrid options={extracolonicOpts} value={extracolonic} onChange={setExtracolonic} columns={2} />
      </Section>

      {(colonicResult || extraResult) && (
        <Section title="Resultado">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            {colonicResult && (
              <ResultBadge label="Classificacao Colonica" value={colonic} color={colonicResult.color} large />
            )}
            {extraResult && (
              <ResultBadge label="Classificacao Extracolonica" value={extracolonic} color={extraResult.color} large />
            )}
          </div>

          {colonicResult && (
            <div className="rounded-lg border p-4 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: colonicResult.color + '44' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Conduta - Achados Colonicos ({colonic})</p>
              <p className="text-sm font-semibold" style={{ color: colonicResult.color }}>{colonicResult.text}</p>
            </div>
          )}

          {extraResult && (
            <div className="rounded-lg border p-4 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: extraResult.color + '44' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Conduta - Achados Extracolonicos ({extracolonic})</p>
              <p className="text-sm font-semibold" style={{ color: extraResult.color }}>{extraResult.text}</p>
            </div>
          )}

          <div className="rounded-lg border p-3 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Resumo - Categorias Colonicas</p>
            <p className="text-xs" style={{ color: '#eab308' }}>C0: Estudo inadequado</p>
            <p className="text-xs" style={{ color: '#16a34a' }}>C1: Normal (sem polipos &ge; 6 mm)</p>
            <p className="text-xs" style={{ color: '#f59e0b' }}>C2: Polipo intermediario (6-9 mm, &le; 2)</p>
            <p className="text-xs" style={{ color: '#dc2626' }}>C3: Polipo &ge; 10 mm ou &ge; 3 polipos 6-9 mm</p>
            <p className="text-xs" style={{ color: '#dc2626' }}>C4: Massa colonica suspeita</p>
          </div>

          <div className="rounded-lg border p-3 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Resumo - Categorias Extracolonicas</p>
            <p className="text-xs" style={{ color: '#eab308' }}>E0: Avaliacao limitada</p>
            <p className="text-xs" style={{ color: '#16a34a' }}>E1: Sem achados significativos</p>
            <p className="text-xs" style={{ color: '#16a34a' }}>E2: Clinicamente insignificante</p>
            <p className="text-xs" style={{ color: '#f59e0b' }}>E3: Provavelmente insignificante (seguimento eventual)</p>
            <p className="text-xs" style={{ color: '#dc2626' }}>E4: Potencialmente significativo (investigar)</p>
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
