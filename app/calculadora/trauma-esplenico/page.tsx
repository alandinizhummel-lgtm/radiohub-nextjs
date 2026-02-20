'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  OptionGrid,
} from '@/app/calculadora/components/calculator-layout'

const gradeOptions = [
  {
    value: '1',
    label: 'Grau I',
    description: 'Hematoma subcapsular <10% da superficie; laceração capsular <1cm de profundidade',
  },
  {
    value: '2',
    label: 'Grau II',
    description: 'Hematoma 10-50% da superficie ou intraparenquimatoso <5cm; laceração 1-3cm de profundidade',
  },
  {
    value: '3',
    label: 'Grau III',
    description: 'Hematoma >50% ou em expansão; ruptura de hematoma subcapsular/parenquimatoso; laceração >3cm de profundidade ou envolvendo vasos trabeculares',
  },
  {
    value: '4',
    label: 'Grau IV',
    description: 'Laceração envolvendo vasos segmentares ou hilares com desvascularização maior (>25%)',
  },
  {
    value: '5',
    label: 'Grau V',
    description: 'Baço completamente fragmentado ou desvascularizado; lesão vascular hilar',
  },
]

const vascularOptions = [
  { value: 'no', label: 'Ausente', description: 'Sem lesão vascular na imagem' },
  { value: 'yes', label: 'Presente', description: 'Pseudoaneurisma, fistula AV ou extravasamento ativo (adiciona 1 grau)' },
]

function getManagement(finalGrade: number): { text: string; color: string } {
  if (finalGrade <= 2) {
    return {
      text: 'Tratamento conservador. Observação clinica com monitorização hemodinâmica e imagem de controle.',
      color: 'var(--green)',
    }
  }
  if (finalGrade === 3) {
    return {
      text: 'Tratamento conservador preferencial se estabilidade hemodinâmica. Considerar angiografia com embolização se blush ativo.',
      color: 'var(--orange)',
    }
  }
  if (finalGrade === 4) {
    return {
      text: 'Considerar angiografia com embolização. Esplenectomia parcial ou total se instabilidade hemodinâmica.',
      color: 'var(--orange)',
    }
  }
  return {
    text: 'Alta probabilidade de esplenectomia. Intervenção cirurgica necessaria na maioria dos casos.',
    color: 'var(--red)',
  }
}

export default function TraumaEsplenico() {
  const [grade, setGrade] = useState('')
  const [vascular, setVascular] = useState('')

  const result = useMemo(() => {
    if (!grade) return null

    const baseGrade = parseInt(grade)
    const hasVascular = vascular === 'yes'
    const finalGrade = Math.min(hasVascular ? baseGrade + 1 : baseGrade, 5)
    const management = getManagement(finalGrade)

    return { baseGrade, finalGrade, hasVascular, management }
  }, [grade, vascular])

  return (
    <CalculatorLayout
      title="Escala de Lesão Esplênica AAST"
      subtitle="Revisão 2018 - Classificação de trauma esplênico"
      references={[
        {
          text: 'Kozar RA, Crandall M, Shanmuganathan K, et al. Organ injury scaling 2018 update: Spleen, liver, and kidney. J Trauma Acute Care Surg. 2018;85(6):1119-1122.',
          url: 'https://pubmed.ncbi.nlm.nih.gov/30462622/',
        },
      ]}
    >
      <Section title="Grau da Lesão Esplênica">
        <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
          Selecione o grau baseado nos achados de imagem (TC com contraste).
        </p>
        <OptionGrid options={gradeOptions} value={grade} onChange={setGrade} columns={2} />
      </Section>

      <Section title="Modificador de Lesão Vascular">
        <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
          Presença de lesão vascular na imagem (pseudoaneurisma, fistula AV, extravasamento ativo) avança o grau em 1.
        </p>
        <OptionGrid options={vascularOptions} value={vascular} onChange={setVascular} columns={2} />
      </Section>

      {result && (
        <Section title="Resultado">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <ResultBadge
              label="Grau Base"
              value={`Grau ${result.baseGrade}`}
              large
            />
            <ResultBadge
              label="Grau Final"
              value={`Grau ${result.finalGrade}`}
              color={
                result.finalGrade <= 2
                  ? 'var(--green)'
                  : result.finalGrade <= 4
                  ? 'var(--orange)'
                  : 'var(--red)'
              }
              large
            />
          </div>

          {result.hasVascular && (
            <div
              className="rounded-lg border p-3 mb-3"
              style={{ backgroundColor: 'rgba(234,179,8,0.08)', borderColor: 'rgba(234,179,8,0.3)' }}
            >
              <p className="text-xs font-semibold" style={{ color: '#eab308' }}>
                Modificador vascular aplicado: grau avançado de {result.baseGrade} para {result.finalGrade}
              </p>
            </div>
          )}

          <div
            className="rounded-lg border p-4"
            style={{
              backgroundColor: 'var(--bg2)',
              borderColor: result.management.color + '44',
            }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>
              Recomendação de Conduta
            </p>
            <p className="text-sm font-semibold" style={{ color: result.management.color }}>
              {result.management.text}
            </p>
          </div>

          <div className="mt-3 rounded-lg border p-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Notas</p>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>
              A classificação AAST 2018 revisada para lesão esplênica vai de I a V. O modificador de lesão vascular avança o grau em 1 (até o maximo de V). Tratamento conservador não operatório é o padrão para a maioria das lesões esplênicas com estabilidade hemodinâmica. A vacinação contra germes encapsulados é essencial pós-esplenectomia.
            </p>
          </div>
        </Section>
      )}
    </CalculatorLayout>
  )
}
