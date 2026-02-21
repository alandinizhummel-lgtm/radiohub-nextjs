import type { Metadata } from 'next'
import TiradsReport from './tirads-report'

export const metadata: Metadata = {
  title: 'Descritor de US Tireoide | RadioHub',
  description: 'Gerador de laudo estruturado de ultrassonografia da tireoide com ACR TI-RADS, Chammas, dimensões e linfonodos',
}

export default function Page() {
  return <TiradsReport />
}
