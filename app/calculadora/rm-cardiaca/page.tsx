import type { Metadata } from 'next'
import CardiacCalculator from './calculator'

export const metadata: Metadata = {
  title: 'Gerador de Laudo · RM Cardíaca',
  description: 'Gerador de laudo assistido para ressonância magnética cardíaca com cálculo de volumes ventriculares. Referências ESC 2020.',
}

export default function RMCardiacaPage() {
  return <CardiacCalculator />
}
