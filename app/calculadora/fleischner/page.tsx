'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  OptionGrid,
} from '@/app/calculadora/components/calculator-layout'

const noduleTypeOptions = [
  { value: 'solid', label: 'Sólido', description: 'Nódulo completamente sólido na TC' },
  { value: 'subsolid', label: 'Subsólido', description: 'Nódulo em vidro fosco (GGN) ou parcialmente sólido' },
]

const numberOptions = [
  { value: 'single', label: 'Único', description: 'Nódulo solitario' },
  { value: 'multiple', label: 'Múltiplos', description: 'Mais de um nódulo' },
]

const subsolidTypeOptions = [
  { value: 'ggn', label: 'Vidro Fosco Puro (GGN)', description: 'Nódulo em vidro fosco sem componente sólido' },
  { value: 'partsolid', label: 'Parcialmente Sólido', description: 'Nódulo em vidro fosco com componente sólido' },
]

const sizeOptions = [
  { value: '<6', label: '< 6 mm', description: 'Menor que 6mm' },
  { value: '6-8', label: '6 - 8 mm', description: 'Entre 6 e 8mm' },
  { value: '>8', label: '> 8 mm', description: 'Maior que 8mm' },
]

const subsolidSizeOptions = [
  { value: '<6', label: '< 6 mm', description: 'Menor que 6mm' },
  { value: '>=6', label: '>= 6 mm', description: '6mm ou maior' },
]

const riskOptions = [
  { value: 'low', label: 'Baixo Risco', description: 'Sem fatores de risco ou fatores minimos (pouca exposição ao tabaco, sem histórico familiar)' },
  { value: 'high', label: 'Alto Risco', description: 'Tabagismo, histórico familiar de câncer pulmonar, exposição ao asbesto/radônio, enfisema, fibrose pulmonar' },
]

interface Recommendation {
  title: string
  text: string
  color: string
  details?: string
}

function getRecommendation(
  noduleType: string,
  number: string,
  size: string,
  risk: string,
  subsolidType: string
): Recommendation | null {
  // SOLID SINGLE
  if (noduleType === 'solid' && number === 'single') {
    if (size === '<6') {
      if (risk === 'low') {
        return {
          title: 'Sem necessidade de acompanhamento rotineiro',
          text: 'Nenhum seguimento de rotina recomendado.',
          color: 'var(--green)',
          details: 'Nódulos sólidos unicos <6mm em pacientes de baixo risco têm probabilidade muito baixa de malignidade (<1%).',
        }
      }
      return {
        title: 'TC opcional em 12 meses',
        text: 'Seguimento opcional com TC em 12 meses.',
        color: 'var(--green)',
        details: 'Nódulos sólidos unicos <6mm em pacientes de alto risco podem justificar um unico exame de seguimento.',
      }
    }
    if (size === '6-8') {
      if (risk === 'low') {
        return {
          title: 'TC em 6-12 meses, considerar 18-24 meses',
          text: 'TC em 6-12 meses; depois considerar TC em 18-24 meses.',
          color: 'var(--orange)',
          details: 'Nódulos sólidos unicos de 6-8mm em baixo risco: seguimento inicial e avaliação de estabilidade.',
        }
      }
      return {
        title: 'TC em 6-12 meses, depois 18-24 meses',
        text: 'TC em 6-12 meses; depois TC em 18-24 meses.',
        color: 'var(--orange)',
        details: 'Nódulos sólidos unicos de 6-8mm em alto risco: seguimento em dois tempos recomendado.',
      }
    }
    // >8mm
    return {
      title: 'TC em 3 meses, PET/CT ou biópsia',
      text: 'Considerar TC em 3 meses, PET/CT ou amostragem tecidual.',
      color: 'var(--red)',
      details: 'Nódulos sólidos unicos >8mm requerem avaliação mais agressiva por maior risco de malignidade.',
    }
  }

  // SOLID MULTIPLE
  if (noduleType === 'solid' && number === 'multiple') {
    if (size === '<6') {
      if (risk === 'low') {
        return {
          title: 'Sem necessidade de acompanhamento rotineiro',
          text: 'Nenhum seguimento de rotina recomendado.',
          color: 'var(--green)',
          details: 'Nódulos sólidos multiplos <6mm em baixo risco: probabilidade muito baixa de malignidade.',
        }
      }
      return {
        title: 'TC opcional em 12 meses',
        text: 'Seguimento opcional com TC em 12 meses.',
        color: 'var(--green)',
        details: 'Nódulos sólidos multiplos <6mm em alto risco: um exame de seguimento pode ser considerado.',
      }
    }
    if (size === '6-8') {
      return {
        title: 'TC em 3-6 meses, depois 18-24 meses',
        text: 'TC em 3-6 meses; depois TC em 18-24 meses.',
        color: 'var(--orange)',
        details: `Nódulos sólidos multiplos de 6-8mm (${risk === 'low' ? 'baixo' : 'alto'} risco): seguimento em dois tempos. Nódulo dominante pode requerer avaliação individual.`,
      }
    }
    // >8mm
    return {
      title: 'TC em 3 meses, PET/CT ou biópsia (nodulo dominante)',
      text: 'O nódulo dominante (>8mm) deve ser conduzido conforme diretrizes de nódulo unico: TC em 3 meses, PET/CT ou biópsia. Demais nódulos: TC em 3-6 meses, depois 18-24 meses.',
      color: 'var(--red)',
      details: 'Nódulos sólidos multiplos >8mm: conduta baseada no nódulo mais suspeito. Considerar PET/CT ou amostragem tecidual para o nódulo dominante.',
    }
  }

  // SUBSOLID SINGLE GGN
  if (noduleType === 'subsolid' && number === 'single' && subsolidType === 'ggn') {
    if (size === '<6') {
      return {
        title: 'Sem necessidade de acompanhamento rotineiro',
        text: 'Nenhum seguimento de rotina recomendado.',
        color: 'var(--green)',
        details: 'Nódulos em vidro fosco puro <6mm são geralmente benignos. A maioria representa hiperplasia adenomatosa atipica.',
      }
    }
    return {
      title: 'TC em 6-12 meses, depois a cada 2 anos por 5 anos',
      text: 'TC em 6-12 meses; se estavel, TC a cada 2 anos por 5 anos.',
      color: 'var(--orange)',
      details: 'Nódulos em vidro fosco puro >=6mm necessitam seguimento prolongado devido ao risco de adenocarcinoma de crescimento lento.',
    }
  }

  // SUBSOLID SINGLE PART-SOLID
  if (noduleType === 'subsolid' && number === 'single' && subsolidType === 'partsolid') {
    if (size === '<6') {
      return {
        title: 'Sem necessidade de acompanhamento rotineiro',
        text: 'Nenhum seguimento de rotina recomendado.',
        color: 'var(--green)',
        details: 'Nódulos parcialmente sólidos <6mm raramente são malignos.',
      }
    }
    return {
      title: 'TC em 3-6 meses; se estavel, TC anual por 5 anos',
      text: 'TC em 3-6 meses para avaliar persistência. Se componente sólido estavel e <6mm, TC anual por 5 anos.',
      color: 'var(--orange)',
      details: 'Nódulos parcialmente sólidos >=6mm têm maior risco de malignidade. Se componente sólido >=6mm ou crescer, considerar PET/CT ou biópsia.',
    }
  }

  // SUBSOLID MULTIPLE
  if (noduleType === 'subsolid' && number === 'multiple') {
    if (size === '<6') {
      return {
        title: 'TC em 3-6 meses; se estavel, considerar 2 e 4 anos',
        text: 'TC em 3-6 meses. Se estaveis, considerar TC em 2 e 4 anos.',
        color: 'var(--orange)',
        details: 'Nódulos subsólidos multiplos <6mm: seguimento para avaliar persistência e crescimento.',
      }
    }
    return {
      title: 'TC em 3-6 meses; avaliar nódulo dominante',
      text: 'TC em 3-6 meses. Avaliar nódulo dominante conforme diretrizes de nódulo unico.',
      color: 'var(--orange)',
      details: 'Nódulos subsólidos multiplos >=6mm: seguimento inicial e avaliação individual do nódulo mais suspeito.',
    }
  }

  return null
}

export default function Fleischner() {
  const [noduleType, setNoduleType] = useState('')
  const [number, setNumber] = useState('')
  const [size, setSize] = useState('')
  const [risk, setRisk] = useState('')
  const [subsolidType, setSubsolidType] = useState('')

  const handleNoduleTypeChange = (v: string) => {
    setNoduleType(v)
    setSubsolidType('')
    setSize('')
  }

  const handleNumberChange = (v: string) => {
    setNumber(v)
    setSize('')
  }

  const needsSubsolidType = noduleType === 'subsolid' && number === 'single'
  const needsRisk = noduleType === 'solid'

  const currentSizeOptions = useMemo(() => {
    if (noduleType === 'subsolid') return subsolidSizeOptions
    return sizeOptions
  }, [noduleType])

  const canShowResult = useMemo(() => {
    if (!noduleType || !number || !size) return false
    if (needsSubsolidType && !subsolidType) return false
    if (needsRisk && !risk) return false
    return true
  }, [noduleType, number, size, risk, subsolidType, needsSubsolidType, needsRisk])

  const recommendation = useMemo(() => {
    if (!canShowResult) return null
    return getRecommendation(noduleType, number, size, risk, subsolidType)
  }, [canShowResult, noduleType, number, size, risk, subsolidType])

  return (
    <CalculatorLayout
      title="Critérios de Fleischner 2017"
      subtitle="Diretrizes da Sociedade Fleischner para manejo de nódulos pulmonares incidentais"
      references={[
        {
          text: 'MacMahon H, Naidich DP, Goo JM, et al. Guidelines for Management of Incidental Pulmonary Nodules Detected on CT Images: From the Fleischner Society 2017. Radiology. 2017;284(1):228-243.',
          url: 'https://pubmed.ncbi.nlm.nih.gov/28240562/',
        },
      ]}
    >
      <Section title="1. Tipo de Nódulo">
        <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
          Selecione a morfologia do nódulo pulmonar.
        </p>
        <OptionGrid options={noduleTypeOptions} value={noduleType} onChange={handleNoduleTypeChange} columns={2} />
      </Section>

      {noduleType && (
        <Section title="2. Número de Nódulos">
          <OptionGrid options={numberOptions} value={number} onChange={handleNumberChange} columns={2} />
        </Section>
      )}

      {needsSubsolidType && number && (
        <Section title="3. Subtipo Subsólido">
          <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
            Especifique se o nódulo subsólido é puro vidro fosco ou parcialmente sólido.
          </p>
          <OptionGrid options={subsolidTypeOptions} value={subsolidType} onChange={setSubsolidType} columns={2} />
        </Section>
      )}

      {noduleType && number && (!needsSubsolidType || subsolidType) && (
        <Section title={needsSubsolidType ? '4. Tamanho' : '3. Tamanho'}>
          <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
            Tamanho do nódulo (ou do maior nódulo, se multiplos). Usar a média dos diâmetros longo e curto no corte axial.
          </p>
          <OptionGrid options={currentSizeOptions} value={size} onChange={setSize} columns={noduleType === 'solid' ? 3 : 2} />
        </Section>
      )}

      {needsRisk && size && (
        <Section title="4. Nivel de Risco do Paciente">
          <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
            Avalie os fatores de risco do paciente para malignidade pulmonar.
          </p>
          <OptionGrid options={riskOptions} value={risk} onChange={setRisk} columns={2} />
        </Section>
      )}

      {recommendation && (
        <Section title="Recomendação">
          <ResultBadge
            label="Conduta Recomendada"
            value={recommendation.title}
            color={recommendation.color}
            large
          />

          <div
            className="mt-3 rounded-lg border p-4"
            style={{
              backgroundColor: 'var(--bg2)',
              borderColor: recommendation.color + '44',
            }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>
              Detalhes
            </p>
            <p className="text-sm" style={{ color: recommendation.color }}>
              {recommendation.text}
            </p>
            {recommendation.details && (
              <p className="text-xs mt-2" style={{ color: 'var(--text3)' }}>
                {recommendation.details}
              </p>
            )}
          </div>

          <div className="mt-3 rounded-lg border p-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Parâmetros Selecionados</p>
            <div className="grid grid-cols-2 gap-1">
              <p className="text-xs" style={{ color: 'var(--text3)' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Tipo:</span>{' '}
                {noduleType === 'solid' ? 'Sólido' : 'Subsólido'}
              </p>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Número:</span>{' '}
                {number === 'single' ? 'Único' : 'Múltiplos'}
              </p>
              {subsolidType && (
                <p className="text-xs" style={{ color: 'var(--text3)' }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Subtipo:</span>{' '}
                  {subsolidType === 'ggn' ? 'Vidro fosco puro' : 'Parcialmente sólido'}
                </p>
              )}
              <p className="text-xs" style={{ color: 'var(--text3)' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Tamanho:</span>{' '}
                {size === '<6' ? '< 6mm' : size === '6-8' ? '6-8mm' : size === '>8' ? '> 8mm' : '>= 6mm'}
              </p>
              {risk && (
                <p className="text-xs" style={{ color: 'var(--text3)' }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Risco:</span>{' '}
                  {risk === 'low' ? 'Baixo' : 'Alto'}
                </p>
              )}
            </div>
          </div>

          <div className="mt-3 rounded-lg border p-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Observações Importantes</p>
            <div className="space-y-1">
              <p className="text-xs" style={{ color: 'var(--text3)' }}>
                Estas diretrizes aplicam-se a nódulos pulmonares incidentais em adultos (&gt;=35 anos) sem câncer primario conhecido.
              </p>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>
                Não se aplicam a pacientes com câncer conhecido, imunodeficiência ou rastreamento de câncer de pulmão.
              </p>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>
                O tamanho deve ser a média dos eixos longo e curto no corte axial onde o nódulo é maior.
              </p>
            </div>
          </div>
        </Section>
      )}
    </CalculatorLayout>
  )
}
