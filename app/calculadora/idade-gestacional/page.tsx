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

export default function IdadeGestacional() {
  const [method, setMethod] = useState('crl')
  const [measurement, setMeasurement] = useState('')
  const [lmpDate, setLmpDate] = useState('')

  const result = useMemo(() => {
    const val = parseFloat(measurement)
    if (isNaN(val) || val <= 0) return null

    let gaWeeks: number | null = null

    switch (method) {
      case 'crl': {
        // Hadlock 1992 polynomial: CRL in mm → GA in weeks
        const crlMm = val
        if (crlMm > 0 && crlMm <= 120) {
          gaWeeks = 5.2876 + 0.1584 * crlMm - 0.000265 * crlMm * crlMm
        }
        break
      }
      case 'bpd': {
        // BPD in cm: GA = 9.54 + 1.482*BPD + 0.1676*BPD^2
        const bpdCm = val / 10 // input in mm, convert to cm
        if (bpdCm > 0) {
          gaWeeks = 9.54 + 1.482 * bpdCm + 0.1676 * bpdCm * bpdCm
        }
        break
      }
      case 'fl': {
        // FL in cm: GA = 10.35 + 2.460*FL + 0.170*FL^2
        const flCm = val / 10
        if (flCm > 0) {
          gaWeeks = 10.35 + 2.460 * flCm + 0.170 * flCm * flCm
        }
        break
      }
      case 'ac': {
        // Hadlock AC formula: AC in cm
        // GA = 8.14 + 0.753*AC + 0.0036*AC^2
        const acCm = val / 10
        if (acCm > 0) {
          gaWeeks = 8.14 + 0.753 * acCm + 0.0036 * acCm * acCm
        }
        break
      }
    }

    if (gaWeeks === null || gaWeeks < 4 || gaWeeks > 44) return null

    const weeks = Math.floor(gaWeeks)
    const days = Math.round((gaWeeks - weeks) * 7)
    const gaText = `${weeks} semanas e ${days} dia${days !== 1 ? 's' : ''}`

    // EDD calculation
    let eddText: string | null = null
    if (lmpDate) {
      const lmp = new Date(lmpDate)
      if (!isNaN(lmp.getTime())) {
        const edd = new Date(lmp)
        edd.setDate(edd.getDate() + 280) // 40 weeks
        eddText = edd.toLocaleDateString('pt-BR')
      }
    }

    // GA from LMP
    let gaLmpText: string | null = null
    if (lmpDate) {
      const lmp = new Date(lmpDate)
      if (!isNaN(lmp.getTime())) {
        const today = new Date()
        const diffMs = today.getTime() - lmp.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        const lmpWeeks = Math.floor(diffDays / 7)
        const lmpDays = diffDays % 7
        gaLmpText = `${lmpWeeks} semanas e ${lmpDays} dia${lmpDays !== 1 ? 's' : ''}`
      }
    }

    // Trimester
    let trimester = ''
    let trimesterColor = 'var(--text3)'
    if (gaWeeks < 14) { trimester = '1o trimestre'; trimesterColor = '#16a34a' }
    else if (gaWeeks < 28) { trimester = '2o trimestre'; trimesterColor = '#f59e0b' }
    else { trimester = '3o trimestre'; trimesterColor = '#dc2626' }

    return { gaWeeks, gaText, weeks, days, eddText, gaLmpText, trimester, trimesterColor }
  }, [method, measurement, lmpDate])

  const methodLabels: Record<string, { label: string; unit: string; placeholder: string }> = {
    crl: { label: 'CCN - Comprimento Cabeça-Nadega', unit: 'mm', placeholder: 'Ex: 45' },
    bpd: { label: 'DBP - Diametro Biparietal', unit: 'mm', placeholder: 'Ex: 50' },
    fl: { label: 'CF - Comprimento do Femur', unit: 'mm', placeholder: 'Ex: 30' },
    ac: { label: 'CA - Circunferencia Abdominal', unit: 'mm', placeholder: 'Ex: 200' },
  }

  const current = methodLabels[method]

  return (
    <CalculatorLayout
      title="Idade Gestacional por Biometria Fetal"
      subtitle="Calculo da IG por CCN, DBP, CF e CA"
      references={[
        { text: 'Hadlock FP, Deter RL, Harrist RB, Park SK. Fetal head circumference: relation to menstrual age. AJR Am J Roentgenol. 1982;138(4):649-653.' },
        { text: 'Hadlock FP, Shah YP, Kanon DJ, Lindsey JV. Fetal crown-rump length: reevaluation of relation to menstrual age (5-18 weeks) with high-resolution real-time US. Radiology. 1992;182(2):501-505.' },
        { text: 'Robinson HP, Fleming JEE. A critical evaluation of sonar crown-rump length measurements. Br J Obstet Gynaecol. 1975;82(9):702-710.' },
      ]}
    >
      <Section title="Metodo de Medicao">
        <OptionGrid
          options={[
            { value: 'crl', label: 'CCN', description: 'Comprimento cabeca-nadega (1o tri)' },
            { value: 'bpd', label: 'DBP', description: 'Diametro biparietal' },
            { value: 'fl', label: 'CF', description: 'Comprimento do femur' },
            { value: 'ac', label: 'CA', description: 'Circunferencia abdominal' },
          ]}
          value={method}
          onChange={setMethod}
          columns={4}
        />
      </Section>

      <Section title="Dados">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls} style={labelStyle}>{current.label} ({current.unit})</label>
            <input type="number" className={inputCls} placeholder={current.placeholder} value={measurement} onChange={e => setMeasurement(e.target.value)} min={0} step={0.1} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Data da Ultima Menstruacao (DUM) - opcional</label>
            <input type="date" className={inputCls} value={lmpDate} onChange={e => setLmpDate(e.target.value)} />
            <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Para calculo da DPP e IG pela DUM</p>
          </div>
        </div>
      </Section>

      <Section title="Resultados">
        {result ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <ResultBadge label="Idade Gestacional (US)" value={result.gaText} color="var(--accent)" large />
              <ResultBadge label="Trimestre" value={result.trimester} color={result.trimesterColor} large />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              {result.eddText && (
                <ResultBadge label="Data Provavel do Parto (DPP)" value={result.eddText} color="var(--accent)" />
              )}
              {result.gaLmpText && (
                <ResultBadge label="IG pela DUM" value={result.gaLmpText} color="var(--text2)" />
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm" style={{ color: 'var(--text3)' }}>
              Insira a medida para calcular a idade gestacional.
            </p>
          </div>
        )}

        <div className="mt-3 rounded-lg border p-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Formulas utilizadas</p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>CCN (mm): IG = 5,2876 + 0,1584 x CCN - 0,000265 x CCN² (Hadlock 1992)</p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>DBP (cm): IG = 9,54 + 1,482 x DBP + 0,1676 x DBP²</p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>CF (cm): IG = 10,35 + 2,460 x CF + 0,170 x CF²</p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>CA (cm): IG = 8,14 + 0,753 x CA + 0,0036 x CA² (Hadlock)</p>
        </div>

        <div className="mt-3 rounded-lg border p-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Parametro ideal por trimestre</p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>1o trimestre (ate 13+6 sem): CCN e o parametro mais preciso</p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>2o trimestre (14-27+6 sem): DBP, CF e CA combinados</p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>3o trimestre (&ge;28 sem): menor precisao, multiplos parametros</p>
        </div>
      </Section>
    </CalculatorLayout>
  )
}
