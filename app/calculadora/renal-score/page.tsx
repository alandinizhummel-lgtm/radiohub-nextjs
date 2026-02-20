'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  OptionGrid,
  labelCls,
  labelStyle,
} from '@/app/calculadora/components/calculator-layout'

export default function RENALScore() {
  const [radius, setRadius] = useState('')
  const [exophytic, setExophytic] = useState('')
  const [nearness, setNearness] = useState('')
  const [anterior, setAnterior] = useState('')
  const [location, setLocation] = useState('')
  const [hilar, setHilar] = useState(false)

  const result = useMemo(() => {
    const r = parseInt(radius)
    const e = parseInt(exophytic)
    const n = parseInt(nearness)
    const l = parseInt(location)

    const hasAll = !isNaN(r) && !isNaN(e) && !isNaN(n) && !isNaN(l) && anterior !== ''
    const total = hasAll ? r + e + n + l : null

    let classification = '\u2014'
    let color = 'var(--text3)'

    if (total !== null) {
      if (total <= 6) { classification = 'Baixa complexidade (4-6)'; color = '#16a34a' }
      else if (total <= 9) { classification = 'Moderada complexidade (7-9)'; color = '#f59e0b' }
      else { classification = 'Alta complexidade (10-12)'; color = '#dc2626' }
    }

    const suffix = anterior || 'x'
    const hilarSuffix = hilar ? 'h' : ''
    const scoreText = total !== null ? `${total}${suffix}${hilarSuffix}` : '\u2014'

    return { total, classification, color, scoreText }
  }, [radius, exophytic, nearness, anterior, location, hilar])

  return (
    <CalculatorLayout
      title="RENAL Nephrometry Score"
      subtitle="Classificacao da complexidade de lesoes renais"
      references={[
        { text: 'Kutikov A, Uzzo RG. The R.E.N.A.L. nephrometry score: a comprehensive standardized system for quantitating renal tumor size, location and depth. J Urol. 2009;182(3):844-853.' },
      ]}
    >
      <Section title="R - Raio (diametro maximo)">
        <OptionGrid
          options={[
            { value: '1', label: '1 ponto', description: '\u2264 4 cm' },
            { value: '2', label: '2 pontos', description: '> 4 a < 7 cm' },
            { value: '3', label: '3 pontos', description: '\u2265 7 cm' },
          ]}
          value={radius}
          onChange={setRadius}
          columns={3}
        />
      </Section>

      <Section title="E - Exofitico / Endofitico">
        <OptionGrid
          options={[
            { value: '1', label: '1 ponto', description: '\u2265 50% exofitico' },
            { value: '2', label: '2 pontos', description: '< 50% exofitico' },
            { value: '3', label: '3 pontos', description: 'Inteiramente endofitico' },
          ]}
          value={exophytic}
          onChange={setExophytic}
          columns={3}
        />
      </Section>

      <Section title="N - Proximidade ao sistema coletor ou seio renal (mm)">
        <OptionGrid
          options={[
            { value: '1', label: '1 ponto', description: '\u2265 7 mm' },
            { value: '2', label: '2 pontos', description: '> 4 a < 7 mm' },
            { value: '3', label: '3 pontos', description: '\u2264 4 mm' },
          ]}
          value={nearness}
          onChange={setNearness}
          columns={3}
        />
      </Section>

      <Section title="A - Anterior / Posterior">
        <OptionGrid
          options={[
            { value: 'a', label: 'Anterior', description: 'Face anterior' },
            { value: 'p', label: 'Posterior', description: 'Face posterior' },
            { value: 'x', label: 'Indeterminado', description: 'Nao e possivel determinar' },
          ]}
          value={anterior}
          onChange={setAnterior}
          columns={3}
        />
        <p className="text-xs mt-2" style={{ color: 'var(--text3)' }}>Nao pontua numericamente, apenas sufixo descritivo.</p>
      </Section>

      <Section title="L - Localizacao relativa as linhas polares">
        <OptionGrid
          options={[
            { value: '1', label: '1 ponto', description: '\u2265 50% acima/abaixo da linha polar' },
            { value: '2', label: '2 pontos', description: 'Cruza uma linha polar' },
            { value: '3', label: '3 pontos', description: '>50% cruza linha axial ou cruza ambas linhas polares' },
          ]}
          value={location}
          onChange={setLocation}
          columns={3}
        />
      </Section>

      <Section title="Modificador Hilar">
        <label className="flex items-center gap-2 p-3 rounded-lg cursor-pointer border text-sm"
          style={{ borderColor: hilar ? 'var(--accent)' : 'var(--border)', backgroundColor: hilar ? 'rgba(99,102,241,0.1)' : 'transparent', color: 'var(--text)' }}>
          <input type="checkbox" checked={hilar} onChange={e => setHilar(e.target.checked)} className="accent-[var(--accent)]" />
          <span>Tumor toca o hilo renal (sufixo &ldquo;h&rdquo;)</span>
        </label>
      </Section>

      <Section title="Resultados">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <ResultBadge label="RENAL Score" value={result.scoreText} color={result.color} large />
          <ResultBadge label="Classificacao" value={result.classification} color={result.color} large />
        </div>

        <div className="mt-3 rounded-lg border p-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Complexidade cirurgica</p>
          <p className="text-xs" style={{ color: '#16a34a' }}>4-6: Baixa complexidade &mdash; nefrectomia parcial favoravel</p>
          <p className="text-xs" style={{ color: '#f59e0b' }}>7-9: Moderada complexidade</p>
          <p className="text-xs" style={{ color: '#dc2626' }}>10-12: Alta complexidade &mdash; considerar nefrectomia radical</p>
        </div>
      </Section>
    </CalculatorLayout>
  )
}
