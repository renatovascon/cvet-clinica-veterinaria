# Planejamento Técnico: Projeto CVET - Gestão Veterinária
**Data de Atualização:** 19/04/2026
**Status:** Fase de Prototipagem e Planejamento de Engenharia

## 1. Visão Geral
O software **CVET** visa digitalizar o processo de internação da clínica do Dr. Lucas Bellucci em Socorro/SP. O foco é substituir fichas manuais por um fluxo digital centralizado, garantindo segurança e agilidade no monitoramento dos pets.

---

## 2. Engenharia de Requisitos

### 2.1 Requisitos de Usuário (Alto Nível)
- **RU01:** Registro e gestão do ciclo completo de internação.
- **RU02:** Lançamento de evolução clínica diária (sinais vitais e notas).
- **RU03:** Alertas visuais para horários de medicação pendentes.

### 2.2 Requisitos de Sistema (Especificação Técnica)
- **RF01:** Validação lógica de datas (Entrada <= Saída).
- **RF02:** Dashboard em tempo real com status dos pacientes via WebSocket/Polling.
- **RNF01 (Desempenho):** Tempo de resposta das rotas principais < 2s.
- **RNF02 (Segurança):** Comunicação via HTTPS e persistência de dados em Nuvem.

---

## 3. Arquitetura e Padrões de Software

### 3.1 Padrão Arquitetural: MVC (Model-View-Controller)
- **Model:** Gestão dos dados e regras de negócio (Pets, Prontuários).
- **View:** Interface responsiva focada na usabilidade do veterinário.
- **Controller:** Mediação entre a interface e a lógica de persistência.

### 3.2 Padrões de Projeto (Design Patterns)
- **Observer:** Para atualização automática da interface quando os dados do Model mudarem.
- **Repository:** Isolamento da lógica de banco de dados para facilitar manutenção e testes.
- **Strategy:** Para diferentes cálculos de dosagem de medicamentos.
- **Adapter:** Para integração com serviços externos (ex: geradores de PDF para alta médica).

### 3.3 Visões da Arquitetura (Modelo 4+1)
1. **Lógica:** Diagramas de classes e entidades clínicas.
2. **Processo:** Fluxo de concorrência e integridade em tempo de execução.
3. **Desenvolvimento:** Organização modular de pastas (Controllers, Repositories, Services).
4. **Física:** Deploy em nuvem (Vercel/GCP) e acesso via navegadores web.

---

## 4. Estratégia de Implementação e Testes

### 4.1 Ciclo de Desenvolvimento
- **Metodologia Ágil:** Uso de Sprints para entregas incrementais.
- **TDD (Test Driven Development):** Aplicação em funções críticas de negócio (ex: cálculos de doses e validações de prontuário).

### 4.2 Qualidade e Entrega
- **Testes de Unidade:** Validação de funções isoladas.
- **Testes de Integração:** Checagem da comunicação entre as camadas do MVC.
- **CI/CD:** Automatização de testes e deploy via GitHub Actions para garantir que apenas código validado chegue à produção.

---

## 5. Componentes de Software (Reuso)
- **Autenticação:** NextAuth/Firebase (Segurança pronta).
- **UI:** Shadcn/UI ou Material UI (Consistência visual).
- **Persistência:** PostgreSQL (Integridade relacional).
