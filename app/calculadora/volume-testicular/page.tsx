'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  inputCls,
  labelCls,
  labelStyle,
} from '@/app/calculadora/components/calculator-layout'

type Tab = 'testicular' | 'ovariano'

export default function VolumeTesticularOvariano() {
  const [tab, setTab] = useState<Tab>('testicular')

  /* Testicular */
  const [td1, setTd1] = useState('')
  const [td2, setTd2] = useState('')
  const [td3, setTd3] = useState('')
  const [te1, setTe1] = useState('')
  const [te2, setTe2] = useState('')
  const [te3, setTe3] = useState('')

  /* Ovariano */
  const [od1, setOd1] = useState('')
  const [od2, setOd2] = useState('')
  const [od3, setOd3] = useState('')
  const [oe1, setOe1] = useState('')
  const [oe2, setOe2] = useState('')
  const [oe3, setOe3] = useState('')
  const [menopausa, setMenopausa] = useState<'pre' | 'pos'>('pre')

  const testResult = useMemo(() => {
    const calc = (a: string, b: string, c: string) => {
      const x = parseFloat(a)
      const y = parseFloat(b)
      const z = parseFloat(c)
      return x > 0 && y > 0 && z > 0 ? (Math.PI / 6) * x * y * z : null
    }
    const vD = calc(td1, td2, td3)
    const vE = calc(te1, te2, te3)

    function classify(v: number | null): { text: string; color: string } {
      if (v === null) return { text: '—', color: 'var(--text3)' }
      if (v >= 12 && v <= 20) return { text: 'Normal', color: 'var(--green)' }
      if (v < 12) return { text: 'Reduzido', color: 'var(--orange)' }
      return { text: 'Aumentado', color: 'var(--orange)' }
    }

    return { vD, vE, classD: classify(vD), classE: classify(vE) }
  }, [td1, td2, td3, te1, te2, te3])

  const ovarResult = useMemo(() => {
    const calc = (a: string, b: string, c: string) => {
      const x = parseFloat(a)
      const y = parseFloat(b)
      const z = parseFloat(c)
      return x > 0 && y > 0 && z > 0 ? (Math.PI / 6) * x * y * z : null
    }
    const vD = calc(od1, od2, od3)
    const vE = calc(oe1, oe2, oe3)

    const limit = menopausa === 'pre' ? 20 : 10
    function classify(v: number | null): { text: string; color: string } {
      if (v === null) return { text: '—', color: 'var(--text3)' }
      if (v <= limit) return { text: 'Normal', color: 'var(--green)' }
      return { text: 'Aumentado', color: 'var(--red)' }
    }

    return { vD, vE, classD: classify(vD), classE: classify(vE), limit }
  }, [od1, od2, od3, oe1, oe2, oe3, menopausa])

  const tabBtnStyle = (active: boolean) => ({
    backgroundColor: active ? 'var(--accent)' : 'transparent',
    color: active ? '#fff' : 'var(--text3)',
    borderColor: active ? 'var(--accent)' : 'var(--border)',
  })

  return (
    <CalculatorLayout
      title="Volume Testicular / Ovariano"
      subtitle="Fórmula do elipsoide (V = π/6 × L × W × H)"
      references={[
        {
          text: 'Hsieh ML, Huang ST, Huang HC, et al. The reliability of ultrasonographic measurements for testicular volume assessment. J Clin Ultrasound. 2009;37(1):1-6.',
        },
      ]}
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setTab('testicular')}
          className="px-4 py-2 rounded-lg border text-sm font-semibold transition-all"
          style={tabBtnStyle(tab === 'testicular')}
        >
          Testicular
        </button>
        <button
          type="button"
          onClick={() => setTab('ovariano')}
          className="px-4 py-2 rounded-lg border text-sm font-semibold transition-all"
          style={tabBtnStyle(tab === 'ovariano')}
        >
          Ovariano
        </button>
      </div>

      {tab === 'testicular' && (
        <>
          <Section title="Testículo Direito">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls} style={labelStyle}>Comprimento (cm)</label>
                <input type="number" className={inputCls} placeholder="0.0" value={td1} onChange={(e) => setTd1(e.target.value)} min={0} step={0.1} />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Largura (cm)</label>
                <input type="number" className={inputCls} placeholder="0.0" value={td2} onChange={(e) => setTd2(e.target.value)} min={0} step={0.1} />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Altura (cm)</label>
                <input type="number" className={inputCls} placeholder="0.0" value={td3} onChange={(e) => setTd3(e.target.value)} min={0} step={0.1} />
              </div>
            </div>
          </Section>

          <Section title="Testículo Esquerdo">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls} style={labelStyle}>Comprimento (cm)</label>
                <input type="number" className={inputCls} placeholder="0.0" value={te1} onChange={(e) => setTe1(e.target.value)} min={0} step={0.1} />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Largura (cm)</label>
                <input type="number" className={inputCls} placeholder="0.0" value={te2} onChange={(e) => setTe2(e.target.value)} min={0} step={0.1} />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Altura (cm)</label>
                <input type="number" className={inputCls} placeholder="0.0" value={te3} onChange={(e) => setTe3(e.target.value)} min={0} step={0.1} />
              </div>
            </div>
          </Section>

          <Section title="Resultados">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <ResultBadge
                label="Testículo Direito"
                value={testResult.vD !== null ? `${testResult.vD.toFixed(1)} mL` : '—'}
                color={testResult.classD.color}
                large
              />
              <ResultBadge
                label="Testículo Esquerdo"
                value={testResult.vE !== null ? `${testResult.vE.toFixed(1)} mL` : '—'}
                color={testResult.classE.color}
                large
              />
            </div>
            <div className="rounded-lg border p-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Valores de Referência (Adultos)</p>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>Normal: 12 &ndash; 20 mL por testículo</p>
            </div>
          </Section>
        </>
      )}

      {tab === 'ovariano' && (
        <>
          <Section title="Status Menopáusico">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMenopausa('pre')}
                className="px-4 py-2 rounded-lg border text-sm font-semibold transition-all"
                style={tabBtnStyle(menopausa === 'pre')}
              >
                Pré-menopausa
              </button>
              <button
                type="button"
                onClick={() => setMenopausa('pos')}
                className="px-4 py-2 rounded-lg border text-sm font-semibold transition-all"
                style={tabBtnStyle(menopausa === 'pos')}
              >
                Pós-menopausa
              </button>
            </div>
          </Section>

          <Section title="Ovário Direito">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls} style={labelStyle}>Comprimento (cm)</label>
                <input type="number" className={inputCls} placeholder="0.0" value={od1} onChange={(e) => setOd1(e.target.value)} min={0} step={0.1} />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Largura (cm)</label>
                <input type="number" className={inputCls} placeholder="0.0" value={od2} onChange={(e) => setOd2(e.target.value)} min={0} step={0.1} />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Altura (cm)</label>
                <input type="number" className={inputCls} placeholder="0.0" value={od3} onChange={(e) => setOd3(e.target.value)} min={0} step={0.1} />
              </div>
            </div>
          </Section>

          <Section title="Ovário Esquerdo">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls} style={labelStyle}>Comprimento (cm)</label>
                <input type="number" className={inputCls} placeholder="0.0" value={oe1} onChange={(e) => setOe1(e.target.value)} min={0} step={0.1} />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Largura (cm)</label>
                <input type="number" className={inputCls} placeholder="0.0" value={oe2} onChange={(e) => setOe2(e.target.value)} min={0} step={0.1} />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Altura (cm)</label>
                <input type="number" className={inputCls} placeholder="0.0" value={oe3} onChange={(e) => setOe3(e.target.value)} min={0} step={0.1} />
              </div>
            </div>
          </Section>

          <Section title="Resultados">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <ResultBadge
                label="Ovário Direito"
                value={ovarResult.vD !== null ? `${ovarResult.vD.toFixed(1)} mL` : '—'}
                color={ovarResult.classD.color}
                large
              />
              <ResultBadge
                label="Ovário Esquerdo"
                value={ovarResult.vE !== null ? `${ovarResult.vE.toFixed(1)} mL` : '—'}
                color={ovarResult.classE.color}
                large
              />
            </div>
            <div className="rounded-lg border p-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Valores de Referência</p>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>
                Pré-menopausa: &le;20 mL | Pós-menopausa: &le;10 mL
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                Limite atual: &le;{ovarResult.limit} mL ({menopausa === 'pre' ? 'pré' : 'pós'}-menopausa)
              </p>
            </div>
          </Section>
        </>
      )}
    </CalculatorLayout>
  )
}
