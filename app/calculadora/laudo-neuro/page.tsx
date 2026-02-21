import type { Metadata } from 'next'
import NeuroReport from './neuro-report'

export const metadata: Metadata = {
  title: 'Gerador de Laudo Neuro | RadioHub',
  description: 'Gerador de texto estruturado para TC e RM de crânio, angiotomografia cervical e intracraniana',
}

export default function Page() {
  return <NeuroReport />
}
