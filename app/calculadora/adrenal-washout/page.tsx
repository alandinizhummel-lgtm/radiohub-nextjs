'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  inputCls,
  labelCls,
  labelStyle,
} from '@/app/calculadora/components/calculator-layout'

export default function AdrenalWashout() {
  const [unenhanced, setUnenhanced] = useState('')
  const [enhanced, setEnhanced] = useState('')
  const [delayed, setDelayed] = useState('')

  const result = useMemo(() => {
    const ue = parseFloat(unenhanced)
    const en = parseFloat(enhanced)
    const del = parseFloat(delayed)

    const lipidRich = !isNaN(ue) && ue <= 10

    let absWashout: number | null = null
    let relWashout: number | null = null

    if (!isNaN(en) && !isNaN(del) && !isNaN(ue) && en !== ue) {
      absWashout = ((en - del) / (en - ue)) * 100
    }
    if (!isNaN(en) && !isNaN(del) && en !== 0) {
      relWashout = ((en - del) / en) * 100
    }

    const absAdenoma = absWashout !== null && absWashout >= 60
    const relAdenoma = relWashout !== null && relWashout >= 40

    let interpretation = ''
    let color = 'var(--text3)'

    if (lipidRich) {
      interpretation = 'Adenoma rico em lipidos (UE <= 10 HU) - washout dispensavel'
      color = '#16a34a'
    } else if (absAdenoma || relAdenoma) {
      interpretation = 'Compativel com adenoma'
      color = '#16a34a'
    } else if (absWashout !== null || relWashout !== null) {
      interpretation = 'Nao atinge criterio de adenoma - considerar investigacao adicional'
      color = '#dc2626'
    }

    return { absWashout, relWashout, lipidRich, absAdenoma, relAdenoma, interpretation, color }
  }, [unenhanced, enhanced, delayed])

  return (
    <CalculatorLayout
      title="Washout Adrenal por TC"
      subtitle="Calculo de washout absoluto e relativo para nodulos adrenais"
      references={[
        { text: 'Caoili EM, Korobkin M, Francis IR, et al. Adrenal masses: characterization with combined unenhanced and delayed enhanced CT. Radiology. 2002;222(3):629-633.' },
      ]}
    >
      <Section title="Dados de Atenuacao (HU)">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelCls} style={labelStyle}>Sem contraste (UE) - HU</label>
            <input type="number" className={inputCls} placeholder="Ex: 5" value={unenhanced} onChange={e => setUnenhanced(e.target.value)} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Fase portal (EN) - HU</label>
            <input type="number" className={inputCls} placeholder="Ex: 80" value={enhanced} onChange={e => setEnhanced(e.target.value)} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Fase tardia 15 min (DEL) - HU</label>
            <input type="number" className={inputCls} placeholder="Ex: 30" value={delayed} onChange={e => setDelayed(e.target.value)} />
          </div>
        </div>
      </Section>

      <Section title="Resultados">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <ResultBadge
            label="Washout Absoluto"
            value={result.absWashout !== null ? `${result.absWashout.toFixed(1)}%` : '\u2014'}
            color={result.absAdenoma ? '#16a34a' : result.absWashout !== null ? '#dc2626' : undefined}
            large
          />
          <ResultBadge
            label="Washout Relativo"
            value={result.relWashout !== null ? `${result.relWashout.toFixed(1)}%` : '\u2014'}
            color={result.relAdenoma ? '#16a34a' : result.relWashout !== null ? '#dc2626' : undefined}
            large
          />
        </div>

        {result.lipidRich && (
          <ResultBadge label="Fase sem contraste" value="Adenoma rico em lipidos (UE \u2264 10 HU)" color="#16a34a" />
        )}

        {result.interpretation && (
          <div className="mt-3 rounded-lg border p-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Interpretacao</p>
            <p className="text-sm font-semibold" style={{ color: result.color }}>{result.interpretation}</p>
          </div>
        )}

        <div className="mt-3 rounded-lg border p-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Criterios</p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>Washout absoluto: (EN - DEL) / (EN - UE) x 100% &mdash; &ge;60% = adenoma</p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>Washout relativo: (EN - DEL) / EN x 100% &mdash; &ge;40% = adenoma</p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>Atenuacao sem contraste &le;10 HU = adenoma rico em lipidos (washout dispensavel)</p>
        </div>
      </Section>
    </CalculatorLayout>
  )
}
