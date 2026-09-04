# Apresentação do Projeto CVET

## Slide 1: Título
- Sistema de Gestão Veterinária com Análise de Dados em Nuvem
- Projeto Integrador III - UNIVESP
- Renato Vasconcelos Coura Soares

Fala sugerida: apresentar o nome do projeto, o contexto acadêmico e a clínica parceira.

## Slide 2: Contexto e problema
- A clínica CVET precisava centralizar o controle de internações.
- O processo atual dificulta o acompanhamento de prontuários, medicações e evolução clínica.
- O uso de registros manuais aumenta o risco de falhas e retrabalho.

Fala sugerida: destacar a dor principal observada na visita e a necessidade de digitalização.

## Slide 3: Objetivo do projeto
- Desenvolver uma plataforma web para gestão veterinária.
- Focar no fluxo de internação dos pets.
- Garantir acesso centralizado, seguro e com apoio à análise de dados.

Fala sugerida: explicar que o sistema não é apenas cadastro, mas controle do ciclo de internação.

## Slide 4: Usuário e validação com a comunidade
- O projeto foi discutido com o Dr. Lucas Bellucci.
- A clínica está localizada em Socorro/SP.
- A proposta foi validada como útil para o fluxo real da rotina veterinária.

Fala sugerida: reforçar que o projeto foi construído com base em uma necessidade real.

## Slide 5: Solução proposta
- CRUD de tutores e pets, com catálogo pesquisável de raças caninas e felinas.
- Internações vinculadas a pets e leitos, com bloqueio de conflitos de período.
- Medicações com horários, doses aplicadas e preço unitário.
- Dashboard operacional, mapa de execução e financeiro com baixa após quitação.

Fala sugerida: mostrar que a solução organiza o atendimento e ajuda a tomada de decisão.

## Slide 6: Arquitetura e tecnologias
- Frontend Next.js com TypeScript e Tailwind CSS.
- API Hono com validação Zod e Prisma.
- Banco de dados: PostgreSQL.
- Infraestrutura local: Docker Compose com healthchecks.

Fala sugerida: explicar que a arquitetura foi pensada para organização, manutenção e escalabilidade.

## Slide 7: Requisitos principais
- Validação de datas na internação.
- Dashboard operacional por status e espécie.
- Soma de diárias e medicações aplicadas no fechamento.
- Tempo de resposta das rotas principais abaixo de 2 segundos.
- Comunicação segura via HTTPS.

Fala sugerida: ligar os requisitos técnicos à confiabilidade do sistema.

## Slide 8: Metodologia e estágio atual
- Metodologia baseada em Design Thinking.
- Etapas: ouvir, criar e implementar.
- O projeto já teve levantamento de requisitos, wireframes e relatório parcial.
- O MVP possui módulos de cadastros, internações, financeiro, mapa e analytics em execução.

Fala sugerida: mostrar que o projeto já tem base validada, mas ainda está evoluindo.

## Slide 9: Resultados preliminares
- Fluxo de internação com reserva de leito e prevenção de sobreposição.
- Financeiro com composição de diárias e medicamentos aplicados.
- Execução local reproduzível com Docker Compose.

Fala sugerida: destacar que a solução já tem direção clara e validação prática.

## Slide 10: Próximos passos
- Ampliar testes de integração e interface.
- Evoluir autenticação e controle de permissões.
- Adicionar prontuário e evolução clínica estruturada.

Fala sugerida: fechar mostrando o caminho até a entrega final do projeto.

## Slide 11: Encerramento
- O projeto busca melhorar a rotina da clínica e a segurança das informações.
- A proposta une gestão, tecnologia e apoio à tomada de decisão.

Fala sugerida: agradecer e abrir espaço para perguntas.