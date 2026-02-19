import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termos de Uso e Política de Privacidade | RadiologyHUB.app',
  description: 'Termos de Uso e Política de Privacidade da plataforma RadiologyHUB.app',
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 bg-surface border-b border-border" style={{ zIndex: 60 }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-baseline hover:opacity-85 transition-opacity">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-accent2 to-text bg-clip-text text-transparent">Radiology</span>
              <span className="text-accent font-extrabold">HUB</span>
            </span>
            <span className="text-xs sm:text-sm text-text3 font-medium ml-0.5">.app</span>
          </Link>
          <Link href="/" className="text-sm text-accent hover:text-accent2 transition-colors">
            Voltar ao site
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-4xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-text mb-2">
          Termos de Uso e Política de Privacidade
        </h1>
        <p className="text-text3 mb-10">Última atualização: 19 de fevereiro de 2026</p>

        {/* PARTE I */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-accent mb-6 pb-2 border-b border-border">
            Parte I — Termos de Uso
          </h2>

          <div className="space-y-6 text-text2 leading-relaxed">
            <div>
              <h3 className="text-lg font-semibold text-text mb-2">1. Aceitação dos Termos</h3>
              <p>
                O uso da plataforma RadiologyHub.app implica na leitura, compreensão e aceitação integral
                destes Termos de Uso. Caso o usuário não concorde com qualquer disposição, deverá
                interromper imediatamente a utilização da plataforma.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text mb-2">2. Natureza da Plataforma</h3>
              <p>
                A RadiologyHub.app consiste exclusivamente em ferramenta digital de produtividade,
                organização textual e apoio educacional para profissionais da saúde. A plataforma não
                presta serviços médicos, não realiza diagnósticos e não substitui o julgamento clínico
                do profissional habilitado.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text mb-2">3. Declaração de Não Enquadramento como Dispositivo Médico</h3>
              <p>
                A plataforma não realiza análise de exames, processamento de imagens médicas,
                classificação de risco clínico, triagem, priorização de casos ou sugestão de condutas
                terapêuticas. Nos termos da RDC 657/2022 da ANVISA, a plataforma não se caracteriza
                como Software como Dispositivo Médico (SaMD), por não possuir finalidade médica
                diagnóstica ou terapêutica.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text mb-2">4. Uso de Ferramentas Automatizadas e IA</h3>
              <p>
                Eventuais funcionalidades automatizadas ou baseadas em algoritmos destinam-se
                exclusivamente à estruturação textual e organização de conteúdo. Não há tomada de
                decisão autônoma ou validação clínica automatizada. Todo conteúdo gerado deve ser
                revisado integralmente pelo usuário.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text mb-2">5. Responsabilidade Profissional</h3>
              <p>
                O julgamento clínico e a responsabilidade por qualquer decisão médica são exclusivos
                do profissional usuário. A plataforma não garante acurácia clínica e não responde por
                decisões tomadas com base em conteúdo gerado.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text mb-2">6. Proibição de Inserção de Dados Sensíveis</h3>
              <p>
                É expressamente proibida a inserção de dados pessoais identificáveis de pacientes.
                O usuário deverá anonimizar qualquer informação eventualmente inserida. Caso dados
                sensíveis sejam inseridos indevidamente, o usuário será considerado controlador
                independente para fins da LGPD.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text mb-2">7. Limitação de Responsabilidade</h3>
              <p>
                A responsabilidade da RadiologyHub.app limita-se ao valor eventualmente pago pelo
                usuário pelo acesso à plataforma. Não haverá responsabilidade por danos indiretos,
                lucros cessantes, perda de chance, ou danos decorrentes de decisões médicas.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text mb-2">8. Propriedade Intelectual</h3>
              <p>
                Todos os direitos relativos à plataforma, incluindo código-fonte, estrutura, layout e
                conteúdo institucional, pertencem ao titular da plataforma, sendo vedada reprodução
                não autorizada.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text mb-2">9. Foro e Legislação Aplicável</h3>
              <p>
                Estes Termos serão regidos pelas leis da República Federativa do Brasil. Fica eleito o
                foro da Comarca de São Paulo/SP, com renúncia a qualquer outro, por mais privilegiado
                que seja.
              </p>
            </div>
          </div>
        </section>

        {/* PARTE II */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-accent mb-6 pb-2 border-b border-border">
            Parte II — Política de Privacidade
          </h2>

          <div className="space-y-6 text-text2 leading-relaxed">
            <div>
              <h3 className="text-lg font-semibold text-text mb-2">1. Identificação do Controlador</h3>
              <p>
                A RadiologyHub.app é operada por <strong>RadiologyHUB</strong>, com sede em
                São Paulo/SP. Para questões relacionadas a dados pessoais, entre em contato
                pelo e-mail disponibilizado na plataforma.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text mb-2">2. Dados Coletados</h3>
              <p>
                Poderão ser coletados dados fornecidos diretamente pelo usuário (nome, e-mail,
                informações de cadastro) e dados coletados automaticamente (IP, cookies, logs de
                acesso, informações de navegação).
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text mb-2">3. Dados Não Coletados</h3>
              <p>
                A plataforma não solicita, não exige e não tem como finalidade coletar dados
                pessoais sensíveis de pacientes.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text mb-2">4. Finalidades do Tratamento</h3>
              <p>
                Os dados coletados destinam-se à gestão da conta do usuário, melhoria da experiência
                de navegação, segurança da plataforma e cumprimento de obrigações legais.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text mb-2">5. Bases Legais (LGPD)</h3>
              <p>
                O tratamento de dados poderá ocorrer com fundamento na execução de contrato,
                cumprimento de obrigação legal, legítimo interesse ou consentimento do titular,
                conforme aplicável.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text mb-2">6. Compartilhamento de Dados</h3>
              <p>
                Os dados poderão ser compartilhados com prestadores de serviço essenciais à operação
                da plataforma, observadas as medidas de segurança adequadas.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text mb-2">7. Transferência Internacional</h3>
              <p>
                Os dados poderão ser armazenados em servidores localizados no exterior, observadas as
                garantias legais aplicáveis e padrões adequados de proteção.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text mb-2">8. Segurança da Informação</h3>
              <p>
                O Controlador adota medidas técnicas e administrativas razoáveis para proteção dos
                dados pessoais contra acesso não autorizado, perda ou alteração indevida.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text mb-2">9. Retenção e Exclusão</h3>
              <p>
                Os dados serão mantidos pelo período necessário ao cumprimento das finalidades
                descritas, podendo ser excluídos mediante solicitação do titular, ressalvadas
                obrigações legais.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text mb-2">10. Direitos do Titular</h3>
              <p>
                O titular poderá solicitar confirmação de tratamento, acesso, correção, anonimização,
                portabilidade ou exclusão de dados, mediante contato pelo canal oficial indicado.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text mb-2">11. Cookies</h3>
              <p>
                A plataforma utiliza cookies para melhorar a experiência do usuário. O usuário poderá
                gerenciar preferências diretamente em seu navegador.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-border pt-6 text-center text-sm text-text3">
          <p>RadiologyHUB — São Paulo/SP, Brasil</p>
          <Link href="/" className="text-accent hover:text-accent2 transition-colors mt-2 inline-block">
            Voltar ao site
          </Link>
        </div>
      </main>
    </div>
  )
}
