import type { Metadata } from 'next'
import CardiacCalculator from './calculator'

export const metadata: Metadata = {
  title: 'Calculadora RM Cardíaca',
  description: 'Calculadora de volumes ventriculares e laudo assistido para ressonância magnética cardíaca. Referências ESC 2020.',
}

export default function RMCardiacaPage() {
  return <CardiacCalculator />
}
