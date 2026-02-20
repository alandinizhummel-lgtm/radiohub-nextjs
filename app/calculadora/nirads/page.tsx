'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  OptionGrid,
} from '@/app/calculadora/components/calculator-layout'

const modalityOpts = [
  { value: 'ct_mri', label: 'TC / RM', description: 'Tomografia computadorizada ou ressonancia magnetica' },
  { value: 'pet_ct', label: 'PET/CT', description: 'Tomografia por emissao de positrons com TC' },
]

const primaryCtMriOpts = [
  { value: '0', label: 'NI-RADS 0', description: 'Incompleto - avaliacao limitada, necessita exames adicionais' },
  { value: '1', label: 'NI-RADS 1', description: 'Resposta completa ao tratamento, sem evidencia de recorrencia' },
  { value: '2a', label: 'NI-RADS 2a', description: 'Baixa suspeita - alteracoes provavelmente pos-tratamento' },
  { value: '2b', label: 'NI-RADS 2b', description: 'Suspeita intermediaria - achados indeterminados' },
  { value: '3', label: 'NI-RADS 3', description: 'Alta suspeita para recorrencia tumoral' },
  { value: '4', label: 'NI-RADS 4', description: 'Recorrencia definitiva - progressao radiologica evidente' },
]

const primaryPetCtOpts = [
  { value: '0', label: 'NI-RADS 0', description: 'Incompleto - estudo limitado' },
  { value: '1', label: 'NI-RADS 1', description: 'Sem captacao anormal (resposta metabolica completa)' },
  { value: '2a', label: 'NI-RADS 2a', description: 'Captacao leve/difusa, provavelmente pos-tratamento' },
  { value: '2b', label: 'NI-RADS 2b', description: 'Captacao focal intermediaria, indeterminada' },
  { value: '3', label: 'NI-RADS 3', description: 'Captacao focal intensa, alta suspeita para recorrencia' },
  { value: '4', label: 'NI-RADS 4', description: 'Captacao intensa com correlacao anatomica, recorrencia definitiva' },
]

const nodeCtMriOpts = [
  { value: '0', label: 'NI-RADS 0', description: 'Incompleto - avaliacao ganglionar limitada' },
  { value: '1', label: 'NI-RADS 1', description: 'Sem linfonodomegalia suspeita, resposta completa' },
  { value: '2a', label: 'NI-RADS 2a', description: 'Linfonodo levemente aumentado, provavelmente reativo' },
  { value: '2b', label: 'NI-RADS 2b', description: 'Linfonodo com caracteristicas indeterminadas' },
  { value: '3', label: 'NI-RADS 3', description: 'Linfonodo altamente suspeito (necrose central, formato arredondado)' },
  { value: '4', label: 'NI-RADS 4', description: 'Linfonodomegalia definitivamente metastatica / progressao' },
]

const nodePetCtOpts = [
  { value: '0', label: 'NI-RADS 0', description: 'Incompleto' },
  { value: '1', label: 'NI-RADS 1', description: 'Sem captacao ganglionar anormal' },
  { value: '2a', label: 'NI-RADS 2a', description: 'Captacao ganglionar leve, provavelmente reativa' },
  { value: '2b', label: 'NI-RADS 2b', description: 'Captacao ganglionar intermediaria, indeterminada' },
  { value: '3', label: 'NI-RADS 3', description: 'Captacao ganglionar intensa, alta suspeita' },
  { value: '4', label: 'NI-RADS 4', description: 'Captacao ganglionar intensa com correlacao, definitivamente metastatico' },
]

function getManagement(cat: string): { text: string; color: string } {
  switch (cat) {
    case '0': return {
      text: 'Avaliacao incompleta. Complementar com exame adicional ou repetir com tecnica adequada.',
      color: '#eab308',
    }
    case '1': return {
      text: 'Sem evidencia de doenca residual ou recorrente. Seguimento de rotina conforme protocolo oncologico.',
      color: '#16a34a',
    }
    case '2a': return {
      text: 'Baixa suspeita - achado provavelmente pos-tratamento. Seguimento por imagem em 3-6 meses recomendado.',
      color: '#22c55e',
    }
    case '2b': return {
      text: 'Suspeita intermediaria. Seguimento em curto prazo (< 3 meses) ou biopsia/aspiracao recomendada a depender do contexto clinico.',
      color: '#f59e0b',
    }
    case '3': return {
      text: 'Alta suspeita para recorrencia. Biopsia dirigida recomendada para confirmacao histologica.',
      color: '#dc2626',
    }
    case '4': return {
      text: 'Recorrencia/progressao definitiva. Encaminhar para planejamento terapeutico (cirurgia, quimioterapia ou radioterapia).',
      color: '#dc2626',
    }
    default: return { text: '', color: 'var(--text3)' }
  }
}

function getCatColor(cat: string): string {
  switch (cat) {
    case '0': return '#eab308'
    case '1': return '#16a34a'
    case '2a': return '#22c55e'
    case '2b': return '#f59e0b'
    case '3': return '#dc2626'
    case '4': return '#dc2626'
    default: return 'var(--text3)'
  }
}

export default function NIRADSCalculator() {
  const [modality, setModality] = useState('')
  const [primary, setPrimary] = useState('')
  const [node, setNode] = useState('')

  const primaryOpts = modality === 'pet_ct' ? primaryPetCtOpts : primaryCtMriOpts
  const nodeOpts = modality === 'pet_ct' ? nodePetCtOpts : nodeCtMriOpts

  const primaryMgmt = useMemo(() => primary ? getManagement(primary) : null, [primary])
  const nodeMgmt = useMemo(() => node ? getManagement(node) : null, [node])

  const reportText = useMemo(() => {
    const parts: string[] = []
    const mod = modality === 'pet_ct' ? 'PET/CT' : 'TC/RM'
    if (primary) {
      const desc = primaryOpts.find(o => o.value === primary)?.description || ''
      const mgmt = getManagement(primary)
      parts.push(`NI-RADS sitio primario (${mod}): ${primary} - ${desc}. ${mgmt.text}`)
    }
    if (node) {
      const desc = nodeOpts.find(o => o.value === node)?.description || ''
      const mgmt = getManagement(node)
      parts.push(`NI-RADS linfonodos (${mod}): ${node} - ${desc}. ${mgmt.text}`)
    }
    return parts.join(' ')
  }, [modality, primary, node, primaryOpts, nodeOpts])

  return (
    <CalculatorLayout
      title="NI-RADS"
      subtitle="Neck Imaging Reporting and Data System"
      references={[
        { text: 'Aiken AH, Farber LA, Glastonbury CM, et al. Neck Imaging Reporting and Data System (NI-RADS): A White Paper of the ACR NI-RADS Committee. AJNR Am J Neuroradiol. 2020;41(6):S1-S11.', url: 'https://pubmed.ncbi.nlm.nih.gov/32554424/' },
      ]}
    >
      <Section title="Modalidade">
        <OptionGrid options={modalityOpts} value={modality} onChange={v => { setModality(v); setPrimary(''); setNode('') }} columns={2} />
      </Section>

      {modality && (
        <>
          <Section title="Sitio Primario">
            <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
              Classifique os achados no sitio primario do tumor tratado.
            </p>
            <OptionGrid options={primaryOpts} value={primary} onChange={setPrimary} columns={2} />
          </Section>

          <Section title="Linfonodos Cervicais">
            <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
              Classifique os achados linfonodais cervicais (avaliacao separada).
            </p>
            <OptionGrid options={nodeOpts} value={node} onChange={setNode} columns={2} />
          </Section>
        </>
      )}

      {(primaryMgmt || nodeMgmt) && (
        <Section title="Resultado">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            {primary && (
              <ResultBadge label="Sitio Primario" value={`NI-RADS ${primary}`} color={getCatColor(primary)} large />
            )}
            {node && (
              <ResultBadge label="Linfonodos" value={`NI-RADS ${node}`} color={getCatColor(node)} large />
            )}
          </div>

          {primaryMgmt && (
            <div className="rounded-lg border p-4 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: primaryMgmt.color + '44' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Conduta - Sitio Primario (NI-RADS {primary})</p>
              <p className="text-sm font-semibold" style={{ color: primaryMgmt.color }}>{primaryMgmt.text}</p>
            </div>
          )}

          {nodeMgmt && (
            <div className="rounded-lg border p-4 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: nodeMgmt.color + '44' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Conduta - Linfonodos (NI-RADS {node})</p>
              <p className="text-sm font-semibold" style={{ color: nodeMgmt.color }}>{nodeMgmt.text}</p>
            </div>
          )}

          <div className="rounded-lg border p-3 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Resumo das Categorias NI-RADS</p>
            <p className="text-xs" style={{ color: '#eab308' }}>0: Incompleto</p>
            <p className="text-xs" style={{ color: '#16a34a' }}>1: Sem evidencia de recorrencia</p>
            <p className="text-xs" style={{ color: '#22c55e' }}>2a: Baixa suspeita (provavelmente pos-tratamento)</p>
            <p className="text-xs" style={{ color: '#f59e0b' }}>2b: Suspeita intermediaria</p>
            <p className="text-xs" style={{ color: '#dc2626' }}>3: Alta suspeita para recorrencia</p>
            <p className="text-xs" style={{ color: '#dc2626' }}>4: Recorrencia definitiva</p>
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
