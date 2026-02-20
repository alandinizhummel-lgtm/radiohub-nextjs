'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  inputCls,
  labelCls,
  labelStyle,
} from '@/app/calculadora/components/calculator-layout'

export default function NASCETCalculator() {
  const [stenosis, setStenosis] = useState('')
  const [distal, setDistal] = useState('')
  const [bulb, setBulb] = useState('')

  const result = useMemo(() => {
    const s = parseFloat(stenosis)
    const d = parseFloat(distal)
    const b = parseFloat(bulb)

    let nascet: number | null = null
    let ecst: number | null = null

    if (!isNaN(s) && !isNaN(d) && d > 0) {
      nascet = (1 - s / d) * 100
    }
    if (!isNaN(s) && !isNaN(b) && b > 0) {
      ecst = (1 - s / b) * 100
    }

    function classify(val: number | null): { text: string; color: string } {
      if (val === null) return { text: '\u2014', color: 'var(--text3)' }
      if (val < 50) return { text: 'Leve (<50%)', color: '#16a34a' }
      if (val < 70) return { text: 'Moderada (50-69%)', color: '#f59e0b' }
      return { text: 'Grave (\u226570%)', color: '#dc2626' }
    }

    const nascetClass = classify(nascet)

    let indication = ''
    let indicationColor = 'var(--text3)'
    if (nascet !== null) {
      if (nascet >= 70) {
        indication = 'Indicacao cirurgica em pacientes sintomaticos (NASCET)'
        indicationColor = '#dc2626'
      } else if (nascet >= 60) {
        indication = 'Considerar intervencao em pacientes assintomaticos (ACAS \u226560%)'
        indicationColor = '#f59e0b'
      } else if (nascet >= 50) {
        indication = 'Beneficio moderado com endarterectomia se sintomatico'
        indicationColor = '#f59e0b'
      } else {
        indication = 'Tratamento clinico recomendado'
        indicationColor = '#16a34a'
      }
    }

    return { nascet, ecst, nascetClass, indication, indicationColor }
  }, [stenosis, distal, bulb])

  return (
    <CalculatorLayout
      title="Estenose Carotidea (NASCET / ECST)"
      subtitle="Calculo do grau de estenose da arteria carotida interna"
      references={[
        { text: 'North American Symptomatic Carotid Endarterectomy Trial Collaborators. Beneficial effect of carotid endarterectomy in symptomatic patients with high-grade carotid stenosis. N Engl J Med. 1991;325(7):445-453.' },
        { text: 'Executive Committee for the Asymptomatic Carotid Atherosclerosis Study. Endarterectomy for asymptomatic carotid artery stenosis (ACAS). JAMA. 1995;273(18):1421-1428.' },
      ]}
    >
      <Section title="Medidas (mm)">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelCls} style={labelStyle}>Diametro na estenose (mm)</label>
            <input type="number" className={inputCls} placeholder="Ex: 1.5" value={stenosis} onChange={e => setStenosis(e.target.value)} min={0} step={0.1} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>ACI distal normal (mm)</label>
            <input type="number" className={inputCls} placeholder="Ex: 5.0" value={distal} onChange={e => setDistal(e.target.value)} min={0} step={0.1} />
            <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Para NASCET</p>
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Bulbo carotideo (mm)</label>
            <input type="number" className={inputCls} placeholder="Ex: 7.0" value={bulb} onChange={e => setBulb(e.target.value)} min={0} step={0.1} />
            <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Para ECST</p>
          </div>
        </div>
      </Section>

      <Section title="Resultados">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <ResultBadge
            label="NASCET"
            value={result.nascet !== null ? `${result.nascet.toFixed(1)}%` : '\u2014'}
            color={result.nascetClass.color}
            large
          />
          <ResultBadge
            label="ECST"
            value={result.ecst !== null ? `${result.ecst.toFixed(1)}%` : '\u2014'}
            color={result.ecst !== null ? (result.ecst >= 70 ? '#dc2626' : result.ecst >= 50 ? '#f59e0b' : '#16a34a') : undefined}
            large
          />
        </div>

        {result.nascet !== null && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <ResultBadge label="Classificacao (NASCET)" value={result.nascetClass.text} color={result.nascetClass.color} />
            <ResultBadge label="Conduta" value={result.indication} color={result.indicationColor} />
          </div>
        )}

        <div className="mt-3 rounded-lg border p-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Formulas</p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>NASCET = (1 - estenose / ACI distal) x 100%</p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>ECST = (1 - estenose / bulbo) x 100%</p>
        </div>

        <div className="mt-3 rounded-lg border p-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Classificacao</p>
          <p className="text-xs" style={{ color: '#16a34a' }}>&lt;50%: Leve</p>
          <p className="text-xs" style={{ color: '#f59e0b' }}>50-69%: Moderada</p>
          <p className="text-xs" style={{ color: '#dc2626' }}>&ge;70%: Grave &mdash; indicacao cirurgica se sintomatico</p>
        </div>
      </Section>
    </CalculatorLayout>
  )
}
