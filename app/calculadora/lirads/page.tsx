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

const riskOptions = [
  { value: 'yes', label: 'Sim', description: 'Paciente em risco para CHC (cirrose, hepatite B cronica, etc.)' },
  { value: 'no', label: 'Nao', description: 'Paciente sem fatores de risco para CHC' },
]

const priorCategoryOptions = [
  { value: 'none', label: 'Nenhuma', description: 'Avaliar pelos criterios LI-RADS' },
  { value: 'benign', label: 'Definitivamente benigno', description: 'Cisto simples, hemangioma tipico, etc.' },
  { value: 'probBenign', label: 'Provavelmente benigno', description: 'Achados sugestivos de benignidade' },
  { value: 'tiv', label: 'Tumor em veia', description: 'Realce tumoral em veia porta ou hepatica' },
  { value: 'lrm', label: 'Sugere malignidade nao-CHC', description: 'Colangiocarcinoma, metastase, etc.' },
]

const sizeOptions = [
  { value: '<10', label: '<10 mm' },
  { value: '10-19', label: '10-19 mm' },
  { value: '>=20', label: '\u226520 mm' },
]

const yesNoOptions = [
  { value: 'yes', label: 'Sim' },
  { value: 'no', label: 'Nao' },
]

const ancillaryOptions = [
  { value: 'none', label: 'Nenhum', description: 'Sem caracteristicas ancilares relevantes' },
  { value: 'benign', label: 'Favorecem benignidade', description: 'Podem reduzir 1 categoria (mas nao abaixo de LR-1)' },
  { value: 'malignant', label: 'Favorecem malignidade', description: 'Podem aumentar 1 categoria (mas nao para LR-5)' },
]

function getCategoryColor(cat: string): string {
  if (cat === 'LR-1') return '#16a34a'
  if (cat === 'LR-2') return '#22c55e'
  if (cat === 'LR-3') return '#f59e0b'
  if (cat === 'LR-4') return '#f97316'
  if (cat === 'LR-5') return '#dc2626'
  if (cat === 'LR-TIV') return '#dc2626'
  if (cat === 'LR-M') return '#9333ea'
  return 'var(--text3)'
}

function getManagement(cat: string): string {
  switch (cat) {
    case 'LR-1': return 'Sem necessidade de acompanhamento adicional para esta observacao.'
    case 'LR-2': return 'Sem necessidade de acompanhamento adicional para esta observacao. Considerar retorno a vigilancia habitual.'
    case 'LR-3': return 'Seguimento com exame contrastado em 3-6 meses. Considerar metodo alternativo (TC/RM).'
    case 'LR-4': return 'Seguimento proximo em 3 meses OU biopsia. Discutir em reuniao multidisciplinar.'
    case 'LR-5': return 'Diagnostico de CHC sem necessidade de confirmacao histologica (em contexto clinico apropriado). Tratar conforme protocolos de CHC.'
    case 'LR-TIV': return 'Provavel CHC com invasao venosa tumoral. Estadiamento e planejamento terapeutico. Tratamento conforme protocolos de CHC avancado.'
    case 'LR-M': return 'Provavel malignidade nao-CHC ou CHC atipico. Biopsia recomendada para caracterizacao histologica.'
    default: return ''
  }
}

export default function LIRADSCalculator() {
  const [atRisk, setAtRisk] = useState('')
  const [priorCategory, setPriorCategory] = useState('')
  const [size, setSize] = useState('')
  const [aphe, setAphe] = useState('')
  const [washout, setWashout] = useState('')
  const [capsule, setCapsule] = useState('')
  const [thresholdGrowth, setThresholdGrowth] = useState('')
  const [ancillary, setAncillary] = useState('')

  const result = useMemo(() => {
    if (atRisk !== 'yes') return null
    if (!priorCategory) return null

    if (priorCategory === 'benign') return { category: 'LR-1', description: 'Definitivamente benigno' }
    if (priorCategory === 'probBenign') return { category: 'LR-2', description: 'Provavelmente benigno' }
    if (priorCategory === 'tiv') return { category: 'LR-TIV', description: 'Tumor em veia (invasao venosa tumoral)' }
    if (priorCategory === 'lrm') return { category: 'LR-M', description: 'Provavelmente maligno, nao CHC' }

    if (!size || !aphe) return null

    const hasAPHE = aphe === 'yes'
    const hasWashout = washout === 'yes'
    const hasCapsule = capsule === 'yes'
    const hasGrowth = thresholdGrowth === 'yes'
    const additionalFeatures = (hasWashout ? 1 : 0) + (hasCapsule ? 1 : 0) + (hasGrowth ? 1 : 0)

    let category = 'LR-3'

    if (!hasAPHE) {
      if (additionalFeatures === 0) {
        category = 'LR-3'
      } else if (additionalFeatures === 1) {
        category = 'LR-3'
      } else {
        if (size === '<10') category = 'LR-3'
        else category = 'LR-4'
      }
    } else {
      // Has APHE
      if (additionalFeatures === 0) {
        if (size === '<10' || size === '10-19') category = 'LR-3'
        else category = 'LR-4' // >=20
      } else if (additionalFeatures === 1) {
        if (size === '<10') category = 'LR-4'
        else category = 'LR-5' // 10-19 or >=20
      } else {
        // 2+ additional features
        if (size === '<10') category = 'LR-4'
        else category = 'LR-5' // 10-19 or >=20
      }
    }

    // Apply ancillary features
    if (ancillary === 'benign' && category !== 'LR-1') {
      const order = ['LR-1', 'LR-2', 'LR-3', 'LR-4', 'LR-5']
      const idx = order.indexOf(category)
      if (idx > 0) category = order[idx - 1]
    } else if (ancillary === 'malignant' && category !== 'LR-5') {
      const order = ['LR-1', 'LR-2', 'LR-3', 'LR-4', 'LR-5']
      const idx = order.indexOf(category)
      if (idx >= 0 && idx < order.length - 1) {
        // Cannot upgrade to LR-5 via ancillary features
        if (idx < 3) category = order[idx + 1]
        else category = 'LR-4' // stays LR-4, cannot go to LR-5
      }
    }

    const descriptions: Record<string, string> = {
      'LR-1': 'Definitivamente benigno',
      'LR-2': 'Provavelmente benigno',
      'LR-3': 'Probabilidade intermediaria de malignidade',
      'LR-4': 'Provavelmente CHC',
      'LR-5': 'Definitivamente CHC',
    }

    return { category, description: descriptions[category] || category }
  }, [atRisk, priorCategory, size, aphe, washout, capsule, thresholdGrowth, ancillary])

  const laudoText = useMemo(() => {
    if (!result) return ''
    const parts: string[] = []
    parts.push(`Classificacao LI-RADS v2018: ${result.category} - ${result.description}.`)

    if (result.category !== 'LR-1' && result.category !== 'LR-2' && result.category !== 'LR-TIV' && result.category !== 'LR-M') {
      if (size) {
        const sizeText = size === '<10' ? 'menor que 10 mm' : size === '10-19' ? 'entre 10 e 19 mm' : 'maior ou igual a 20 mm'
        parts.push(`Observacao ${sizeText}.`)
      }
      const features: string[] = []
      if (aphe === 'yes') features.push('hipervascularizacao arterial (APHE)')
      if (washout === 'yes') features.push('washout nao periferico')
      if (capsule === 'yes') features.push('capsula com realce')
      if (thresholdGrowth === 'yes') features.push('crescimento limiar')
      if (features.length > 0) {
        parts.push(`Criterios maiores presentes: ${features.join(', ')}.`)
      }
    }
    parts.push(`Conduta: ${getManagement(result.category)}`)
    return parts.join(' ')
  }, [result, size, aphe, washout, capsule, thresholdGrowth])

  const showMajorFeatures = atRisk === 'yes' && priorCategory === 'none'

  return (
    <CalculatorLayout
      title="LI-RADS v2018"
      subtitle="Liver Imaging Reporting and Data System (TC/RM)"
      references={[
        {
          text: 'Chernyak V, Fowler KJ, Kamaya A, et al. Liver Imaging Reporting and Data System (LI-RADS) Version 2018: Imaging of Hepatocellular Carcinoma in At-Risk Patients. Radiology. 2018;289(3):816-830.',
          url: 'https://pubmed.ncbi.nlm.nih.gov/30251931/',
        },
      ]}
    >
      <Section title="1. Paciente em risco para CHC?">
        <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
          LI-RADS aplica-se apenas a pacientes em risco para carcinoma hepatocelular (cirrose, hepatite B cronica, CHC previo).
        </p>
        <OptionGrid options={riskOptions} value={atRisk} onChange={setAtRisk} columns={2} />
        {atRisk === 'no' && (
          <div className="mt-3 rounded-lg border p-3" style={{ backgroundColor: 'rgba(234,179,8,0.08)', borderColor: 'rgba(234,179,8,0.3)' }}>
            <p className="text-xs font-semibold" style={{ color: '#eab308' }}>
              LI-RADS nao se aplica a pacientes sem fatores de risco para CHC. Considere outra classificacao.
            </p>
          </div>
        )}
      </Section>

      {atRisk === 'yes' && (
        <Section title="2. Categorias especificas">
          <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
            Antes de avaliar os criterios maiores, verifique se a observacao se enquadra em uma categoria especifica.
          </p>
          <OptionGrid options={priorCategoryOptions} value={priorCategory} onChange={setPriorCategory} columns={2} />
        </Section>
      )}

      {showMajorFeatures && (
        <>
          <Section title="3. Criterios maiores">
            <div className="space-y-4">
              <div>
                <label className={labelCls} style={labelStyle}>Tamanho da observacao</label>
                <OptionGrid options={sizeOptions} value={size} onChange={setSize} columns={3} />
              </div>

              <div>
                <label className={labelCls} style={labelStyle}>Hipervascularizacao arterial (APHE nao periferica)?</label>
                <OptionGrid options={yesNoOptions} value={aphe} onChange={setAphe} columns={2} />
              </div>

              <div>
                <label className={labelCls} style={labelStyle}>Washout nao periferico (venosa/tardia)?</label>
                <OptionGrid options={yesNoOptions} value={washout} onChange={setWashout} columns={2} />
              </div>

              <div>
                <label className={labelCls} style={labelStyle}>Capsula com realce (enhancing capsule)?</label>
                <OptionGrid options={yesNoOptions} value={capsule} onChange={setCapsule} columns={2} />
              </div>

              <div>
                <label className={labelCls} style={labelStyle}>Crescimento limiar (threshold growth)?</label>
                <p className="text-xs mb-2" style={{ color: 'var(--text3)' }}>
                  Aumento &ge;50% do tamanho em &le;6 meses OU observacao nova &ge;10 mm
                </p>
                <OptionGrid options={yesNoOptions} value={thresholdGrowth} onChange={setThresholdGrowth} columns={2} />
              </div>
            </div>
          </Section>

          <Section title="4. Criterios ancilares">
            <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
              Podem ajustar a categoria em 1 nivel, porem nao podem elevar para LR-5 nem reduzir abaixo de LR-1.
            </p>
            <OptionGrid options={ancillaryOptions} value={ancillary} onChange={setAncillary} columns={3} />
          </Section>
        </>
      )}

      {result && (
        <Section title="Resultado">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <ResultBadge
              label="Categoria LI-RADS"
              value={result.category}
              color={getCategoryColor(result.category)}
              large
            />
            <ResultBadge
              label="Descricao"
              value={result.description}
              color={getCategoryColor(result.category)}
            />
          </div>

          <div className="rounded-lg border p-4 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: getCategoryColor(result.category) + '44' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Recomendacao de Conduta</p>
            <p className="text-sm font-semibold" style={{ color: getCategoryColor(result.category) }}>
              {getManagement(result.category)}
            </p>
          </div>

          <div className="rounded-lg border p-3 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Tabela Diagnostica LI-RADS v2018</p>
            <p className="text-xs mb-2 font-semibold" style={{ color: 'var(--text3)' }}>Com APHE nao periferica:</p>
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-xs" style={{ color: 'var(--text3)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th className="text-left py-1 pr-2">APHE + features adicionais</th>
                    <th className="py-1 px-2">&lt;10mm</th>
                    <th className="py-1 px-2">10-19mm</th>
                    <th className="py-1 px-2">&ge;20mm</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-1 pr-2">APHE + 0</td>
                    <td className="py-1 px-2 text-center" style={{ color: '#f59e0b' }}>LR-3</td>
                    <td className="py-1 px-2 text-center" style={{ color: '#f59e0b' }}>LR-3</td>
                    <td className="py-1 px-2 text-center" style={{ color: '#f97316' }}>LR-4</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-1 pr-2">APHE + 1</td>
                    <td className="py-1 px-2 text-center" style={{ color: '#f97316' }}>LR-4</td>
                    <td className="py-1 px-2 text-center" style={{ color: '#dc2626' }}>LR-5</td>
                    <td className="py-1 px-2 text-center" style={{ color: '#dc2626' }}>LR-5</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-2">APHE + &ge;2</td>
                    <td className="py-1 px-2 text-center" style={{ color: '#f97316' }}>LR-4</td>
                    <td className="py-1 px-2 text-center" style={{ color: '#dc2626' }}>LR-5</td>
                    <td className="py-1 px-2 text-center" style={{ color: '#dc2626' }}>LR-5</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs mb-2 font-semibold" style={{ color: 'var(--text3)' }}>Sem APHE nao periferica:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ color: 'var(--text3)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th className="text-left py-1 pr-2">Sem APHE + features adicionais</th>
                    <th className="py-1 px-2">&lt;10mm</th>
                    <th className="py-1 px-2">10-19mm</th>
                    <th className="py-1 px-2">&ge;20mm</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-1 pr-2">0 ou 1</td>
                    <td className="py-1 px-2 text-center" style={{ color: '#f59e0b' }}>LR-3</td>
                    <td className="py-1 px-2 text-center" style={{ color: '#f59e0b' }}>LR-3</td>
                    <td className="py-1 px-2 text-center" style={{ color: '#f59e0b' }}>LR-3</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-2">&ge;2</td>
                    <td className="py-1 px-2 text-center" style={{ color: '#f59e0b' }}>LR-3</td>
                    <td className="py-1 px-2 text-center" style={{ color: '#f97316' }}>LR-4</td>
                    <td className="py-1 px-2 text-center" style={{ color: '#f97316' }}>LR-4</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--text3)' }}>
              Features adicionais: washout nao periferico, capsula com realce, crescimento limiar.
            </p>
          </div>

          {laudoText && (
            <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Texto para laudo</p>
                <button
                  onClick={() => navigator.clipboard.writeText(laudoText)}
                  className="text-xs px-2 py-1 rounded border"
                  style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}
                >
                  Copiar
                </button>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text3)', whiteSpace: 'pre-wrap' }}>
                {laudoText}
              </p>
            </div>
          )}
        </Section>
      )}
    </CalculatorLayout>
  )
}
