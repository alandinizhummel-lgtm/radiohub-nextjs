'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  inputCls,
  labelCls,
  labelStyle,
  OptionGrid,
} from '@/app/calculadora/components/calculator-layout'

function CheckItem({ label, checked, onChange, points }: { label: string; checked: boolean; onChange: (v: boolean) => void; points: string }) {
  return (
    <label className="flex items-center gap-2 p-2 rounded-lg cursor-pointer border text-sm"
      style={{ borderColor: checked ? 'var(--accent)' : 'var(--border)', backgroundColor: checked ? 'rgba(99,102,241,0.1)' : 'transparent', color: 'var(--text)' }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="accent-[var(--accent)]" />
      <span className="flex-1">{label}</span>
      <span className="text-xs font-mono" style={{ color: 'var(--text3)' }}>{points}</span>
    </label>
  )
}

export default function PESICalculator() {
  const [age, setAge] = useState('')
  const [male, setMale] = useState(false)
  const [cancer, setCancer] = useState(false)
  const [heartFailure, setHeartFailure] = useState(false)
  const [lungDisease, setLungDisease] = useState(false)
  const [hr110, setHr110] = useState(false)
  const [sbp100, setSbp100] = useState(false)
  const [rr30, setRr30] = useState(false)
  const [temp36, setTemp36] = useState(false)
  const [alteredMental, setAlteredMental] = useState(false)
  const [spo2_90, setSpo2_90] = useState(false)

  // sPESI extras
  const [age80, setAge80] = useState(false)

  const result = useMemo(() => {
    const ageVal = parseInt(age)

    // Original PESI
    let pesi: number | null = null
    if (!isNaN(ageVal) && ageVal > 0) {
      pesi = ageVal
      if (male) pesi += 10
      if (cancer) pesi += 30
      if (heartFailure) pesi += 10
      if (lungDisease) pesi += 10
      if (hr110) pesi += 20
      if (sbp100) pesi += 30
      if (rr30) pesi += 20
      if (temp36) pesi += 20
      if (alteredMental) pesi += 60
      if (spo2_90) pesi += 20
    }

    // sPESI
    let spesi = 0
    if (age80) spesi++
    if (cancer) spesi++
    if (heartFailure || lungDisease) spesi++
    if (hr110) spesi++
    if (sbp100) spesi++
    if (spo2_90) spesi++

    function classifyPESI(score: number | null): { cls: string; risk: string; mortality: string; color: string } {
      if (score === null) return { cls: '\u2014', risk: '\u2014', mortality: '\u2014', color: 'var(--text3)' }
      if (score <= 65) return { cls: 'Classe I', risk: 'Muito baixo', mortality: '0-1,6%', color: '#16a34a' }
      if (score <= 85) return { cls: 'Classe II', risk: 'Baixo', mortality: '1,7-3,5%', color: '#16a34a' }
      if (score <= 105) return { cls: 'Classe III', risk: 'Intermediario', mortality: '3,2-7,1%', color: '#f59e0b' }
      if (score <= 125) return { cls: 'Classe IV', risk: 'Alto', mortality: '4,0-11,4%', color: '#dc2626' }
      return { cls: 'Classe V', risk: 'Muito alto', mortality: '10,0-24,5%', color: '#dc2626' }
    }

    const pesiClass = classifyPESI(pesi)
    const spesiClass = spesi === 0
      ? { risk: 'Baixo risco', mortality: '1,0%', color: '#16a34a' }
      : { risk: 'Alto risco', mortality: '10,9%', color: '#dc2626' }

    return { pesi, spesi, pesiClass, spesiClass }
  }, [age, male, cancer, heartFailure, lungDisease, hr110, sbp100, rr30, temp36, alteredMental, spo2_90, age80])

  return (
    <CalculatorLayout
      title="Escore PESI"
      subtitle="Indice de Gravidade da Embolia Pulmonar (PESI original e simplificado)"
      references={[
        { text: 'Aujesky D, Obrosky DS, Stone RA, et al. Derivation and validation of a prognostic model for pulmonary embolism. Am J Respir Crit Care Med. 2005;172(8):1041-1046.' },
        { text: 'Jimenez D, Aujesky D, Moores L, et al. Simplification of the Pulmonary Embolism Severity Index (sPESI). Arch Intern Med. 2010;170(15):1383-1389.' },
      ]}
    >
      <Section title="Dados do Paciente">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className={labelCls} style={labelStyle}>Idade (anos)</label>
            <input type="number" className={inputCls} placeholder="Ex: 65" value={age} onChange={e => setAge(e.target.value)} min={0} max={120} />
          </div>
        </div>
        <div className="space-y-2">
          <CheckItem label="Sexo masculino" checked={male} onChange={setMale} points="+10" />
          <CheckItem label="Cancer" checked={cancer} onChange={setCancer} points="+30" />
          <CheckItem label="Insuficiencia cardiaca" checked={heartFailure} onChange={setHeartFailure} points="+10" />
          <CheckItem label="Doenca pulmonar cronica" checked={lungDisease} onChange={setLungDisease} points="+10" />
          <CheckItem label="FC &ge; 110 bpm" checked={hr110} onChange={setHr110} points="+20" />
          <CheckItem label="PAS < 100 mmHg" checked={sbp100} onChange={setSbp100} points="+30" />
          <CheckItem label="FR &ge; 30 irpm" checked={rr30} onChange={setRr30} points="+20" />
          <CheckItem label="Temperatura < 36 &deg;C" checked={temp36} onChange={setTemp36} points="+20" />
          <CheckItem label="Alteracao do estado mental" checked={alteredMental} onChange={setAlteredMental} points="+60" />
          <CheckItem label="SpO2 < 90%" checked={spo2_90} onChange={setSpo2_90} points="+20" />
        </div>
      </Section>

      <Section title="sPESI (Simplificado)">
        <p className="text-xs mb-2" style={{ color: 'var(--text3)' }}>Marque tambem se idade &gt;80 anos (criterio exclusivo do sPESI):</p>
        <CheckItem label="Idade > 80 anos" checked={age80} onChange={setAge80} points="1 pt" />
        <p className="text-xs mt-2" style={{ color: 'var(--text3)' }}>
          Os itens Cancer, IC/DPC, FC&ge;110, PAS&lt;100 e SpO2&lt;90 ja marcados acima sao compartilhados.
        </p>
      </Section>

      <Section title="Resultados">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <ResultBadge
            label="PESI Original"
            value={result.pesi !== null ? `${result.pesi} pontos` : '\u2014'}
            color={result.pesiClass.color}
            large
          />
          <ResultBadge
            label="sPESI"
            value={`${result.spesi} ponto${result.spesi !== 1 ? 's' : ''}`}
            color={result.spesiClass.color}
            large
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {result.pesi !== null && (
            <ResultBadge label={`${result.pesiClass.cls} - Risco ${result.pesiClass.risk}`} value={`Mortalidade 30d: ${result.pesiClass.mortality}`} color={result.pesiClass.color} />
          )}
          <ResultBadge label={`sPESI - ${result.spesiClass.risk}`} value={`Mortalidade 30d: ${result.spesiClass.mortality}`} color={result.spesiClass.color} />
        </div>

        <div className="mt-3 rounded-lg border p-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Classes PESI Original</p>
          <p className="text-xs" style={{ color: '#16a34a' }}>I (&le;65): Muito baixo &mdash; 0-1,6%</p>
          <p className="text-xs" style={{ color: '#16a34a' }}>II (66-85): Baixo &mdash; 1,7-3,5%</p>
          <p className="text-xs" style={{ color: '#f59e0b' }}>III (86-105): Intermediario &mdash; 3,2-7,1%</p>
          <p className="text-xs" style={{ color: '#dc2626' }}>IV (106-125): Alto &mdash; 4,0-11,4%</p>
          <p className="text-xs" style={{ color: '#dc2626' }}>V (&gt;125): Muito alto &mdash; 10,0-24,5%</p>
        </div>
      </Section>
    </CalculatorLayout>
  )
}
