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

const composicaoOpts = [
  { value: '0a', label: 'Cistica ou quase cistica', description: '0 pontos' },
  { value: '0b', label: 'Espongiforme', description: '0 pontos' },
  { value: '1', label: 'Mista cistica e solida', description: '1 ponto' },
  { value: '2', label: 'Solida ou quase solida', description: '2 pontos' },
]

const ecogenicidadeOpts = [
  { value: '1a', label: 'Anecoica', description: '1 ponto' },
  { value: '1b', label: 'Hiperecoica ou isoecoica', description: '1 ponto' },
  { value: '2', label: 'Hipoecoica', description: '2 pontos' },
  { value: '3', label: 'Muito hipoecoica', description: '3 pontos' },
]

const formaOpts = [
  { value: '0', label: 'Mais largo que alto', description: '0 pontos' },
  { value: '3', label: 'Mais alto que largo', description: '3 pontos' },
]

const margensOpts = [
  { value: '0a', label: 'Lisa', description: '0 pontos' },
  { value: '0b', label: 'Mal definida', description: '0 pontos' },
  { value: '2', label: 'Lobulada ou irregular', description: '2 pontos' },
  { value: '3', label: 'Extensao extra-tireoidiana', description: '3 pontos' },
]

const focosOpts = [
  { value: '0', label: 'Nenhum ou artefato cauda de cometa', description: '0 pontos' },
  { value: '1', label: 'Macrocalcificacoes', description: '1 ponto' },
  { value: '2', label: 'Calcificacoes perifericas', description: '2 pontos' },
  { value: '3', label: 'Focos ecogenicos puntiformes', description: '3 pontos' },
]

function getPoints(val: string): number {
  if (val.startsWith('0')) return 0
  return parseInt(val) || 0
}

function getTRLevel(total: number): { tr: string; label: string; color: string } {
  if (total === 0) return { tr: 'TR1', label: 'Benigno', color: '#16a34a' }
  if (total <= 2) return { tr: 'TR2', label: 'Nao suspeito', color: '#16a34a' }
  if (total === 3) return { tr: 'TR3', label: 'Levemente suspeito', color: '#eab308' }
  if (total <= 6) return { tr: 'TR4', label: 'Moderadamente suspeito', color: '#f59e0b' }
  return { tr: 'TR5', label: 'Altamente suspeito', color: '#dc2626' }
}

function getFNAB(tr: string, size: number | null): { text: string; color: string } {
  if (tr === 'TR1' || tr === 'TR2') {
    return { text: 'Nao ha indicacao de PAAF ou seguimento.', color: '#16a34a' }
  }
  if (tr === 'TR3') {
    if (size !== null && size >= 25) return { text: 'PAAF recomendada (nodulo >= 2,5 cm).', color: '#dc2626' }
    if (size !== null && size >= 15) return { text: 'Seguimento recomendado (nodulo >= 1,5 cm).', color: '#f59e0b' }
    if (size !== null) return { text: 'Sem indicacao de PAAF ou seguimento para este tamanho.', color: '#16a34a' }
    return { text: 'PAAF se >= 2,5 cm; seguimento se >= 1,5 cm.', color: '#eab308' }
  }
  if (tr === 'TR4') {
    if (size !== null && size >= 15) return { text: 'PAAF recomendada (nodulo >= 1,5 cm).', color: '#dc2626' }
    if (size !== null && size >= 10) return { text: 'Seguimento recomendado (nodulo >= 1,0 cm).', color: '#f59e0b' }
    if (size !== null) return { text: 'Sem indicacao de PAAF ou seguimento para este tamanho.', color: '#16a34a' }
    return { text: 'PAAF se >= 1,5 cm; seguimento se >= 1,0 cm.', color: '#f59e0b' }
  }
  // TR5
  if (size !== null && size >= 10) return { text: 'PAAF recomendada (nodulo >= 1,0 cm).', color: '#dc2626' }
  if (size !== null && size >= 5) return { text: 'Seguimento recomendado (nodulo >= 0,5 cm).', color: '#f59e0b' }
  if (size !== null) return { text: 'Sem indicacao de PAAF ou seguimento para este tamanho.', color: '#16a34a' }
  return { text: 'PAAF se >= 1,0 cm; seguimento se >= 0,5 cm.', color: '#dc2626' }
}

export default function TIRADSCalculator() {
  const [composicao, setComposicao] = useState('')
  const [ecogenicidade, setEcogenicidade] = useState('')
  const [forma, setForma] = useState('')
  const [margens, setMargens] = useState('')
  const [focos, setFocos] = useState('')
  const [size, setSize] = useState('')

  const result = useMemo(() => {
    const filled = composicao && ecogenicidade && forma && margens && focos
    if (!filled) return null

    const total = getPoints(composicao) + getPoints(ecogenicidade) + getPoints(forma) + getPoints(margens) + getPoints(focos)
    const level = getTRLevel(total)
    const sizeVal = size ? parseFloat(size) : null
    const fnab = getFNAB(level.tr, sizeVal)

    return { total, ...level, fnab, sizeVal }
  }, [composicao, ecogenicidade, forma, margens, focos, size])

  const reportText = useMemo(() => {
    if (!result) return ''
    const sizeStr = result.sizeVal ? `Maior dimensao do nodulo: ${result.sizeVal} mm. ` : ''
    return `ACR TI-RADS: ${result.tr} (${result.total} pontos) - ${result.label}. ${sizeStr}${result.fnab.text}`
  }, [result])

  return (
    <CalculatorLayout
      title="ACR TI-RADS"
      subtitle="Thyroid Imaging Reporting and Data System (2017)"
      references={[
        { text: 'Tessler FN, Middleton WD, Grant EG, et al. ACR Thyroid Imaging, Reporting and Data System (TI-RADS): White Paper of the ACR TI-RADS Committee. Thyroid. 2017;27(11):1341-1346.', url: 'https://pubmed.ncbi.nlm.nih.gov/29091573/' },
      ]}
    >
      <Section title="Composicao">
        <OptionGrid options={composicaoOpts} value={composicao} onChange={setComposicao} columns={2} />
      </Section>

      <Section title="Ecogenicidade">
        <OptionGrid options={ecogenicidadeOpts} value={ecogenicidade} onChange={setEcogenicidade} columns={2} />
      </Section>

      <Section title="Forma">
        <OptionGrid options={formaOpts} value={forma} onChange={setForma} columns={2} />
      </Section>

      <Section title="Margens">
        <OptionGrid options={margensOpts} value={margens} onChange={setMargens} columns={2} />
      </Section>

      <Section title="Focos Ecogenicos">
        <OptionGrid options={focosOpts} value={focos} onChange={setFocos} columns={2} />
      </Section>

      <Section title="Tamanho do Nodulo">
        <div className="max-w-xs">
          <label className={labelCls} style={labelStyle}>Maior dimensao (mm)</label>
          <input type="number" className={inputCls} placeholder="Ex: 15" value={size} onChange={e => setSize(e.target.value)} min={0} step={1} />
          <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Opcional - usado para recomendacao de PAAF</p>
        </div>
      </Section>

      {result && (
        <Section title="Resultado">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <ResultBadge label="Pontuacao Total" value={`${result.total} pontos`} large />
            <ResultBadge label="Classificacao" value={result.tr} color={result.color} large />
            <ResultBadge label="Nivel de Suspeita" value={result.label} color={result.color} large />
          </div>

          <div className="rounded-lg border p-4 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: result.fnab.color + '44' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Recomendacao de PAAF</p>
            <p className="text-sm font-semibold" style={{ color: result.fnab.color }}>{result.fnab.text}</p>
          </div>

          <div className="rounded-lg border p-3 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Tabela de Pontuacao</p>
            <p className="text-xs" style={{ color: '#16a34a' }}>TR1 (0 pts): Benigno - sem PAAF</p>
            <p className="text-xs" style={{ color: '#16a34a' }}>TR2 (2 pts): Nao suspeito - sem PAAF</p>
            <p className="text-xs" style={{ color: '#eab308' }}>TR3 (3 pts): Levemente suspeito - PAAF se &ge; 2,5 cm</p>
            <p className="text-xs" style={{ color: '#f59e0b' }}>TR4 (4-6 pts): Moderadamente suspeito - PAAF se &ge; 1,5 cm</p>
            <p className="text-xs" style={{ color: '#dc2626' }}>TR5 (&ge;7 pts): Altamente suspeito - PAAF se &ge; 1,0 cm</p>
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
