'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  OptionGrid,
  labelCls,
  labelStyle,
} from '@/app/calculadora/components/calculator-layout'

const gradeOptions = [
  { value: '0', label: '0 - Ausente' },
  { value: '1', label: '1 - Leve' },
  { value: '2', label: '2 - Moderado' },
  { value: '3', label: '3 - Grave' },
]

function ScoreRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mb-3">
      <label className={labelCls} style={labelStyle}>{label}</label>
      <OptionGrid options={gradeOptions} value={value} onChange={onChange} columns={4} />
    </div>
  )
}

export default function VillaltaCalculator() {
  const [pain, setPain] = useState('0')
  const [cramps, setCramps] = useState('0')
  const [heaviness, setHeaviness] = useState('0')
  const [pruritus, setPruritus] = useState('0')
  const [paresthesia, setParesthesia] = useState('0')

  const [edema, setEdema] = useState('0')
  const [induration, setInduration] = useState('0')
  const [hyperpigmentation, setHyperpigmentation] = useState('0')
  const [ectasia, setEctasia] = useState('0')
  const [redness, setRedness] = useState('0')
  const [calfPain, setCalfPain] = useState('0')

  const [ulcer, setUlcer] = useState(false)

  const result = useMemo(() => {
    const symptoms = [pain, cramps, heaviness, pruritus, paresthesia].reduce((a, v) => a + parseInt(v), 0)
    const signs = [edema, induration, hyperpigmentation, ectasia, redness, calfPain].reduce((a, v) => a + parseInt(v), 0)
    const total = symptoms + signs

    let classification: string
    let color: string

    if (ulcer) {
      classification = 'Grave (ulcera venosa presente)'
      color = '#dc2626'
    } else if (total >= 15) {
      classification = 'Grave'
      color = '#dc2626'
    } else if (total >= 10) {
      classification = 'Moderada'
      color = '#f59e0b'
    } else if (total >= 5) {
      classification = 'Leve'
      color = '#f59e0b'
    } else {
      classification = 'Sem sindrome pos-trombotica'
      color = '#16a34a'
    }

    return { symptoms, signs, total, classification, color }
  }, [pain, cramps, heaviness, pruritus, paresthesia, edema, induration, hyperpigmentation, ectasia, redness, calfPain, ulcer])

  return (
    <CalculatorLayout
      title="Escore de Villalta"
      subtitle="Classificacao da Sindrome Pos-Trombotica (SPT)"
      references={[
        { text: 'Villalta S, Bagatella P, Piccioli A, et al. Assessment of validity and reproducibility of a clinical scale for the post-thrombotic syndrome. Haemostasis. 1994;24(suppl 1):158a.' },
        { text: 'Kahn SR, Partsch H, Vedantham S, et al. Definition of post-thrombotic syndrome of the leg for use in clinical investigations. J Thromb Haemost. 2009;7(5):879-883.' },
      ]}
    >
      <Section title="Sintomas (0-3 cada)">
        <ScoreRow label="Dor" value={pain} onChange={setPain} />
        <ScoreRow label="Caibras" value={cramps} onChange={setCramps} />
        <ScoreRow label="Peso / sensacao de peso" value={heaviness} onChange={setHeaviness} />
        <ScoreRow label="Prurido" value={pruritus} onChange={setPruritus} />
        <ScoreRow label="Parestesia" value={paresthesia} onChange={setParesthesia} />
      </Section>

      <Section title="Sinais clinicos (0-3 cada)">
        <ScoreRow label="Edema pre-tibial" value={edema} onChange={setEdema} />
        <ScoreRow label="Induracao cutanea" value={induration} onChange={setInduration} />
        <ScoreRow label="Hiperpigmentacao" value={hyperpigmentation} onChange={setHyperpigmentation} />
        <ScoreRow label="Ectasia venosa" value={ectasia} onChange={setEctasia} />
        <ScoreRow label="Eritema / vermelhidao" value={redness} onChange={setRedness} />
        <ScoreRow label="Dor a compressao da panturrilha" value={calfPain} onChange={setCalfPain} />
      </Section>

      <Section title="Ulcera Venosa">
        <label className="flex items-center gap-2 p-3 rounded-lg cursor-pointer border text-sm"
          style={{ borderColor: ulcer ? '#dc2626' : 'var(--border)', backgroundColor: ulcer ? 'rgba(220,38,38,0.1)' : 'transparent', color: 'var(--text)' }}>
          <input type="checkbox" checked={ulcer} onChange={e => setUlcer(e.target.checked)} className="accent-[var(--accent)]" />
          <span>Ulcera venosa presente (automaticamente grave)</span>
        </label>
      </Section>

      <Section title="Resultados">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <ResultBadge label="Sintomas" value={`${result.symptoms} / 15`} />
          <ResultBadge label="Sinais" value={`${result.signs} / 18`} />
          <ResultBadge label="Total" value={`${result.total} / 33`} color={result.color} large />
        </div>

        <ResultBadge label="Classificacao" value={result.classification} color={result.color} large />

        <div className="mt-4 rounded-lg border p-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Classificacao</p>
          <p className="text-xs" style={{ color: '#16a34a' }}>0-4: Sem sindrome pos-trombotica</p>
          <p className="text-xs" style={{ color: '#f59e0b' }}>5-9: SPT leve</p>
          <p className="text-xs" style={{ color: '#f59e0b' }}>10-14: SPT moderada</p>
          <p className="text-xs" style={{ color: '#dc2626' }}>&ge;15 ou ulcera venosa: SPT grave</p>
        </div>
      </Section>
    </CalculatorLayout>
  )
}
