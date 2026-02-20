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

const septaCountOpts = [
  { value: 'none', label: 'Nenhum septo', description: 'Sem septacoes internas' },
  { value: '1-3', label: '1 a 3 septos', description: 'Poucos septos' },
  { value: '4+', label: '4 ou mais septos', description: 'Multiplos septos' },
]

const septaThickOpts = [
  { value: 'thin', label: 'Fino e liso (<=2mm)', description: 'Septo fino uniforme' },
  { value: 'minimal', label: 'Minimamente espessado e liso (3mm)', description: 'Leve espessamento regular' },
  { value: 'thick', label: 'Espessado irregular (>=4mm)', description: 'Espessamento irregular ou nodular' },
]

const wallOpts = [
  { value: 'thin', label: 'Fina e lisa (<=2mm)', description: 'Parede fina uniforme' },
  { value: 'minimal', label: 'Minimamente espessada e lisa (3mm)', description: 'Leve espessamento regular' },
  { value: 'thick', label: 'Espessada irregular (>=4mm)', description: 'Espessamento irregular ou nodularidade' },
]

const enhancementOpts = [
  { value: 'none', label: 'Nenhum realce', description: 'Sem realce de parede ou septo' },
  { value: 'perceived', label: 'Realce percebido (nao mensuravel)', description: 'Aparente realce fino, mas aumento <20 HU (nao mensuravel)' },
  { value: 'wall_septa', label: 'Realce mensuravel de parede/septo', description: 'Realce mensuravel (>=20 HU) de parede ou septos' },
  { value: 'nodular', label: 'Componente solido com realce', description: 'Nodularidade com realce ou componente solido convexo' },
]

const attenuationOpts = [
  { value: 'water', label: 'Atenuacao de agua (-9 a 20 HU)', description: 'Conteudo simples' },
  { value: 'high_small', label: 'Hiperatenuante (>=70 HU) e <= 3cm', description: 'Alta atenuacao, cisto pequeno' },
  { value: 'high_large', label: 'Hiperatenuante (>=70 HU) e > 3cm', description: 'Alta atenuacao, cisto grande' },
  { value: 'other', label: 'Outra / indeterminada', description: 'Atenuacao variavel ou heterogenea' },
]

interface BosniakResult {
  cls: string
  label: string
  risk: string
  management: string
  color: string
}

function classifyBosniak(
  septaCount: string,
  septaThick: string,
  wall: string,
  enhancement: string,
  attenuation: string,
): BosniakResult {
  // Class IV: any nodular enhancing soft tissue
  if (enhancement === 'nodular') {
    return {
      cls: 'IV', label: 'Bosniak IV',
      risk: '~90% malignidade', management: 'Cirurgia (nefrectomia parcial ou radical) recomendada. Alta probabilidade de carcinoma de celulas renais.',
      color: '#dc2626',
    }
  }

  // Class III: thick irregular wall or septa (>=4mm) with enhancement
  if ((wall === 'thick' || septaThick === 'thick') && enhancement === 'wall_septa') {
    return {
      cls: 'III', label: 'Bosniak III',
      risk: '~50% malignidade', management: 'Cirurgia ou vigilancia ativa. Discutir com equipe de urologia. Biopsia pode ser considerada.',
      color: '#f59e0b',
    }
  }

  // Class IIF: minimally thickened wall/septa (3mm) with measurable enhancement, or high attenuation >3cm,
  // or 1-3 thin septa with measurable enhancement, or 4+ thin septa with enhancement
  if (
    ((wall === 'minimal' || septaThick === 'minimal') && enhancement === 'wall_septa') ||
    (septaCount === '1-3' && septaThick === 'thin' && enhancement === 'wall_septa') ||
    (septaCount === '4+' && septaThick === 'thin' && (enhancement === 'wall_septa' || enhancement === 'perceived')) ||
    attenuation === 'high_large'
  ) {
    return {
      cls: 'IIF', label: 'Bosniak IIF',
      risk: '~5-15% malignidade', management: 'Seguimento com imagem recomendado (5 anos). TC ou RM em 6 e 12 meses e depois anual.',
      color: '#eab308',
    }
  }

  // Class II: thin septa without measurable enhancement (none or perceived), high attenuation <=3cm
  if (
    (septaCount === '1-3' && septaThick === 'thin' && (enhancement === 'none' || enhancement === 'perceived')) ||
    attenuation === 'high_small'
  ) {
    return {
      cls: 'II', label: 'Bosniak II',
      risk: 'Benigno (~0% malignidade)', management: 'Sem seguimento necessario. Cisto benigno minimamente complexo.',
      color: '#16a34a',
    }
  }

  // Class I: simple cyst
  if (
    septaCount === 'none' && wall === 'thin' && (enhancement === 'none' || enhancement === 'perceived') && attenuation === 'water'
  ) {
    return {
      cls: 'I', label: 'Bosniak I',
      risk: 'Benigno (~0% malignidade)', management: 'Sem seguimento necessario. Cisto simples benigno.',
      color: '#16a34a',
    }
  }

  // Fallback: if thick wall/septa without definite enhancement
  if (wall === 'thick' || septaThick === 'thick') {
    return {
      cls: 'III', label: 'Bosniak III',
      risk: '~50% malignidade', management: 'Cirurgia ou vigilancia ativa. Discutir com equipe de urologia.',
      color: '#f59e0b',
    }
  }

  // Default to IIF for ambiguous cases
  return {
    cls: 'IIF', label: 'Bosniak IIF',
    risk: '~5-15% malignidade', management: 'Seguimento com imagem recomendado. Correlacao clinica necessaria.',
    color: '#eab308',
  }
}

export default function BosniakCalculator() {
  const [septaCount, setSeptaCount] = useState('')
  const [septaThick, setSeptaThick] = useState('')
  const [wall, setWall] = useState('')
  const [enhancement, setEnhancement] = useState('')
  const [attenuation, setAttenuation] = useState('')

  const result = useMemo(() => {
    if (!wall || !enhancement || !attenuation) return null
    const sc = septaCount || 'none'
    const st = septaThick || 'thin'
    return classifyBosniak(sc, st, wall, enhancement, attenuation)
  }, [septaCount, septaThick, wall, enhancement, attenuation])

  const reportText = useMemo(() => {
    if (!result) return ''
    return `Classificacao Bosniak v2019: ${result.label}. Risco de malignidade: ${result.risk}. ${result.management}`
  }, [result])

  return (
    <CalculatorLayout
      title="Classificacao de Bosniak v2019"
      subtitle="Classificacao de cistos renais por tomografia computadorizada"
      references={[
        { text: 'Silverman SG, Pedrosa I, Ellis JH, et al. Bosniak Classification of Cystic Renal Masses, Version 2019: An Update Proposal and Needs Assessment. Radiology. 2019;292(2):475-488.', url: 'https://pubmed.ncbi.nlm.nih.gov/31210616/' },
      ]}
    >
      <Section title="Numero de Septos">
        <OptionGrid options={septaCountOpts} value={septaCount} onChange={setSeptaCount} columns={3} />
      </Section>

      {septaCount && septaCount !== 'none' && (
        <Section title="Espessura dos Septos">
          <OptionGrid options={septaThickOpts} value={septaThick} onChange={setSeptaThick} columns={3} />
        </Section>
      )}

      <Section title="Parede do Cisto">
        <OptionGrid options={wallOpts} value={wall} onChange={setWall} columns={3} />
      </Section>

      <Section title="Realce (Enhancement)">
        <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>Realce mensuravel: aumento &ge; 20 HU. Realce percebido: aparente realce fino mas nao mensuravel.</p>
        <OptionGrid options={enhancementOpts} value={enhancement} onChange={setEnhancement} columns={3} />
      </Section>

      <Section title="Atenuacao / Conteudo">
        <OptionGrid options={attenuationOpts} value={attenuation} onChange={setAttenuation} columns={2} />
      </Section>

      {result && (
        <Section title="Resultado">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <ResultBadge label="Classificacao" value={result.label} color={result.color} large />
            <ResultBadge label="Risco de Malignidade" value={result.risk} color={result.color} large />
          </div>

          <div className="rounded-lg border p-4 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: result.color + '44' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Recomendacao de Conduta</p>
            <p className="text-sm font-semibold" style={{ color: result.color }}>{result.management}</p>
          </div>

          <div className="rounded-lg border p-3 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Resumo da Classificacao Bosniak v2019</p>
            <p className="text-xs" style={{ color: '#16a34a' }}>I: Cisto simples - benigno</p>
            <p className="text-xs" style={{ color: '#16a34a' }}>II: Minimamente complexo - benigno</p>
            <p className="text-xs" style={{ color: '#eab308' }}>IIF: Minimamente complexo, necessita seguimento (5-15%)</p>
            <p className="text-xs" style={{ color: '#f59e0b' }}>III: Indeterminado (~50% malignidade)</p>
            <p className="text-xs" style={{ color: '#dc2626' }}>IV: Claramente maligno (~90% malignidade)</p>
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
