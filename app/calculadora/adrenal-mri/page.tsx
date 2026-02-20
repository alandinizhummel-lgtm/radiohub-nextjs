'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  inputCls,
  labelCls,
  labelStyle,
} from '@/app/calculadora/components/calculator-layout'

export default function AdrenalMRI() {
  const [adrenalIP, setAdrenalIP] = useState('')
  const [adrenalOP, setAdrenalOP] = useState('')
  const [spleenIP, setSpleenIP] = useState('')
  const [spleenOP, setSpleenOP] = useState('')

  const result = useMemo(() => {
    const aIP = parseFloat(adrenalIP)
    const aOP = parseFloat(adrenalOP)
    const sIP = parseFloat(spleenIP)
    const sOP = parseFloat(spleenOP)

    let sii: number | null = null
    let asr: number | null = null

    if (!isNaN(aIP) && !isNaN(aOP) && aIP !== 0) {
      sii = ((aIP - aOP) / aIP) * 100
    }

    if (!isNaN(aIP) && !isNaN(aOP) && !isNaN(sIP) && !isNaN(sOP) && sOP !== 0 && sIP !== 0) {
      asr = (aOP / sOP) / (aIP / sIP)
    }

    const siiAdenoma = sii !== null && sii > 16.5
    const asrAdenoma = asr !== null && asr < 0.71

    let interpretation = ''
    let color = 'var(--text3)'

    if (siiAdenoma || asrAdenoma) {
      interpretation = 'Queda de sinal compativel com adenoma (rico em lipidos intracelulares)'
      color = '#16a34a'
    } else if (sii !== null || asr !== null) {
      interpretation = 'Sem queda de sinal significativa - nao preenche criterio de adenoma por chemical shift'
      color = '#dc2626'
    }

    return { sii, asr, siiAdenoma, asrAdenoma, interpretation, color }
  }, [adrenalIP, adrenalOP, spleenIP, spleenOP])

  return (
    <CalculatorLayout
      title="Chemical Shift Adrenal (RM)"
      subtitle="Indice de intensidade de sinal e razao adrenal-baco"
      references={[
        { text: 'Israel GM, Korobkin M, Wang C, et al. Comparison of unenhanced CT and chemical shift MRI in evaluating lipid-rich adrenal adenomas. Radiology. 2004;231(2):421-426.' },
      ]}
    >
      <Section title="Intensidade de Sinal - Adrenal">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls} style={labelStyle}>SI Adrenal em fase (IP)</label>
            <input type="number" className={inputCls} placeholder="Ex: 250" value={adrenalIP} onChange={e => setAdrenalIP(e.target.value)} min={0} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>SI Adrenal fora de fase (OP)</label>
            <input type="number" className={inputCls} placeholder="Ex: 150" value={adrenalOP} onChange={e => setAdrenalOP(e.target.value)} min={0} />
          </div>
        </div>
      </Section>

      <Section title="Intensidade de Sinal - Baco (referencia)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls} style={labelStyle}>SI Baco em fase (IP)</label>
            <input type="number" className={inputCls} placeholder="Ex: 200" value={spleenIP} onChange={e => setSpleenIP(e.target.value)} min={0} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>SI Baco fora de fase (OP)</label>
            <input type="number" className={inputCls} placeholder="Ex: 195" value={spleenOP} onChange={e => setSpleenOP(e.target.value)} min={0} />
          </div>
        </div>
      </Section>

      <Section title="Resultados">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <ResultBadge
            label="Indice de Intensidade de Sinal (SII)"
            value={result.sii !== null ? `${result.sii.toFixed(1)}%` : '\u2014'}
            color={result.siiAdenoma ? '#16a34a' : result.sii !== null ? '#dc2626' : undefined}
            large
          />
          <ResultBadge
            label="Razao Adrenal-Baco (ASR)"
            value={result.asr !== null ? result.asr.toFixed(3) : '\u2014'}
            color={result.asrAdenoma ? '#16a34a' : result.asr !== null ? '#dc2626' : undefined}
            large
          />
        </div>

        {result.interpretation && (
          <div className="mt-3 rounded-lg border p-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Interpretacao</p>
            <p className="text-sm font-semibold" style={{ color: result.color }}>{result.interpretation}</p>
          </div>
        )}

        <div className="mt-3 rounded-lg border p-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Criterios</p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>SII = (SI_IP - SI_OP) / SI_IP x 100% &mdash; &gt;16,5% = adenoma</p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>ASR = (Adrenal_OP / Baco_OP) / (Adrenal_IP / Baco_IP) &mdash; &lt;0,71 = adenoma</p>
        </div>
      </Section>
    </CalculatorLayout>
  )
}
