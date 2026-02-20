'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  OptionGrid,
  labelCls,
  labelStyle,
} from '@/app/calculadora/components/calculator-layout'

export default function PancreatiteCalculator() {
  // Severity
  const [organFailure, setOrganFailure] = useState('')
  const [localComplications, setLocalComplications] = useState(false)

  // Local complications
  const [weeks, setWeeks] = useState('')
  const [hasNecrosis, setHasNecrosis] = useState('')
  const [encapsulated, setEncapsulated] = useState(false)

  // CT Severity Index
  const [balthazar, setBalthazar] = useState('')
  const [necrosis, setNecrosis] = useState('')

  const result = useMemo(() => {
    // Severity classification
    let severity = '\u2014'
    let severityColor = 'var(--text3)'

    if (organFailure === 'persistent') {
      severity = 'Grave'
      severityColor = '#dc2626'
    } else if (organFailure === 'transient' || localComplications) {
      severity = 'Moderadamente grave'
      severityColor = '#f59e0b'
    } else if (organFailure === 'none' && !localComplications) {
      severity = 'Leve'
      severityColor = '#16a34a'
    }

    // Local complication type
    let complicationType = '\u2014'
    let compColor = 'var(--text3)'

    if (weeks !== '' && hasNecrosis !== '') {
      const isEarly = weeks === 'early'
      const necrosisPresent = hasNecrosis === 'yes'

      if (isEarly && !necrosisPresent) {
        complicationType = 'Colecao liquida peripancreatica aguda (APFC)'
        compColor = '#f59e0b'
      } else if (isEarly && necrosisPresent) {
        complicationType = 'Colecao necrotica aguda (ANC)'
        compColor = '#dc2626'
      } else if (!isEarly && !necrosisPresent) {
        complicationType = 'Pseudocisto (encapsulado, sem necrose)'
        compColor = '#f59e0b'
      } else {
        complicationType = 'Necrose encapsulada (WON - Walled-Off Necrosis)'
        compColor = '#dc2626'
      }
    }

    // CT Severity Index
    const bScore = balthazar !== '' ? parseInt(balthazar) : null
    const nScore = necrosis !== '' ? parseInt(necrosis) : null
    const ctsi = bScore !== null && nScore !== null ? bScore + nScore : null

    let ctsiClass = '\u2014'
    let ctsiColor = 'var(--text3)'
    if (ctsi !== null) {
      if (ctsi <= 3) { ctsiClass = 'Leve'; ctsiColor = '#16a34a' }
      else if (ctsi <= 6) { ctsiClass = 'Moderado'; ctsiColor = '#f59e0b' }
      else { ctsiClass = 'Grave'; ctsiColor = '#dc2626' }
    }

    return { severity, severityColor, complicationType, compColor, ctsi, ctsiClass, ctsiColor }
  }, [organFailure, localComplications, weeks, hasNecrosis, encapsulated, balthazar, necrosis])

  return (
    <CalculatorLayout
      title="Classificacao de Pancreatite"
      subtitle="Atlanta Revisada 2012 e Indice de Gravidade por TC (CTSI)"
      references={[
        { text: 'Banks PA, Bollen TL, Dervenis C, et al. Classification of acute pancreatitis - 2012: revision of the Atlanta classification and definitions by international consensus. Gut. 2013;62(1):102-111.' },
      ]}
    >
      <Section title="Passo 1 - Gravidade (Atlanta Revisada)">
        <div className="mb-3">
          <label className={labelCls} style={labelStyle}>Falencia organica</label>
          <OptionGrid
            options={[
              { value: 'none', label: 'Ausente', description: 'Sem falencia organica' },
              { value: 'transient', label: 'Transitoria', description: 'Resolve em < 48h' },
              { value: 'persistent', label: 'Persistente', description: 'Dura > 48h' },
            ]}
            value={organFailure}
            onChange={setOrganFailure}
            columns={3}
          />
        </div>
        <label className="flex items-center gap-2 p-3 rounded-lg cursor-pointer border text-sm"
          style={{ borderColor: localComplications ? 'var(--accent)' : 'var(--border)', backgroundColor: localComplications ? 'rgba(99,102,241,0.1)' : 'transparent', color: 'var(--text)' }}>
          <input type="checkbox" checked={localComplications} onChange={e => setLocalComplications(e.target.checked)} className="accent-[var(--accent)]" />
          <span>Complicacoes locais presentes</span>
        </label>
      </Section>

      <Section title="Passo 2 - Tipo de Complicacao Local">
        <div className="mb-3">
          <label className={labelCls} style={labelStyle}>Tempo desde o inicio</label>
          <OptionGrid
            options={[
              { value: 'early', label: '< 4 semanas', description: 'Fase precoce' },
              { value: 'late', label: '\u2265 4 semanas', description: 'Fase tardia' },
            ]}
            value={weeks}
            onChange={setWeeks}
            columns={2}
          />
        </div>
        <div className="mb-3">
          <label className={labelCls} style={labelStyle}>Presenca de necrose</label>
          <OptionGrid
            options={[
              { value: 'no', label: 'Sem necrose', description: 'Apenas colecao liquida' },
              { value: 'yes', label: 'Com necrose', description: 'Componente necrotico presente' },
            ]}
            value={hasNecrosis}
            onChange={setHasNecrosis}
            columns={2}
          />
        </div>
      </Section>

      <Section title="Passo 3 - Indice de Gravidade por TC (CTSI)">
        <div className="mb-3">
          <label className={labelCls} style={labelStyle}>Grau de Balthazar (inflamacao pancreatica)</label>
          <OptionGrid
            options={[
              { value: '0', label: 'Grau A (0)', description: 'Pancreas normal' },
              { value: '1', label: 'Grau B (1)', description: 'Aumento focal ou difuso' },
              { value: '2', label: 'Grau C (2)', description: 'Alteracoes peripancreaticas' },
              { value: '3', label: 'Grau D (3)', description: 'Colecao liquida unica' },
              { value: '4', label: 'Grau E (4)', description: 'Duas ou mais colecoes / gas' },
            ]}
            value={balthazar}
            onChange={setBalthazar}
            columns={3}
          />
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>Extensao da necrose</label>
          <OptionGrid
            options={[
              { value: '0', label: '0 pontos', description: 'Sem necrose' },
              { value: '2', label: '2 pontos', description: '< 30%' },
              { value: '4', label: '4 pontos', description: '30-50%' },
              { value: '6', label: '6 pontos', description: '> 50%' },
            ]}
            value={necrosis}
            onChange={setNecrosis}
            columns={4}
          />
        </div>
      </Section>

      <Section title="Resultados">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <ResultBadge label="Gravidade (Atlanta)" value={result.severity} color={result.severityColor} large />
          <ResultBadge label="CTSI" value={result.ctsi !== null ? `${result.ctsi} / 10` : '\u2014'} color={result.ctsiColor} large />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <ResultBadge label="Complicacao Local" value={result.complicationType} color={result.compColor} />
          <ResultBadge label="Gravidade CTSI" value={result.ctsiClass} color={result.ctsiColor} />
        </div>

        <div className="mt-3 rounded-lg border p-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Resumo - Complicacoes locais (Atlanta 2012)</p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>&lt;4 sem, sem necrose: APFC (colecao liquida aguda)</p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>&lt;4 sem, com necrose: ANC (colecao necrotica aguda)</p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>&ge;4 sem, sem necrose: Pseudocisto</p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>&ge;4 sem, com necrose: WON (necrose encapsulada)</p>
        </div>

        <div className="mt-3 rounded-lg border p-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>CTSI - Indice de Gravidade</p>
          <p className="text-xs" style={{ color: '#16a34a' }}>0-3: Leve</p>
          <p className="text-xs" style={{ color: '#f59e0b' }}>4-6: Moderado</p>
          <p className="text-xs" style={{ color: '#dc2626' }}>7-10: Grave</p>
        </div>
      </Section>
    </CalculatorLayout>
  )
}
