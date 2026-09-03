# CVET - Apresentação v2.0

## 1. Proposta

Sistema web para operação de internações veterinárias, centralizando paciente, tutor, leito, tratamento e financeiro.

## 2. Fluxo da equipe

1. Cadastre tutor e um ou mais pets.
2. Cadastre leitos Normal ou UTI com seus valores de diária.
3. Crie a internação selecionando um pet e um leito disponível.
4. Acompanhe status, medicações, mapa de execução e valores.
5. Registre pagamentos no financeiro após a alta.

## 3. Regras de negócio

- Um tutor só é salvo com pelo menos um pet.
- Uma internação só é criada para pet e leito existentes.
- Um mesmo leito não pode possuir duas reservas no mesmo período.
- A diária é calculada pelo leito e pelo período de permanência.

## 4. Módulos

| Módulo | Entrega |
| --- | --- |
| Tutores | Cadastro do responsável e múltiplos pets |
| Leitos | Número, nome, tipo N/I e diária |
| Internações | Reserva, acompanhamento e medicações |
| Financeiro | Saldo acumulado e pagamentos |
| Analytics | Indicadores por espécie e status |

## 5. Tecnologia

- Next.js 16 e TypeScript no frontend.
- Hono e Prisma no backend.
- PostgreSQL em Docker Compose.

## 6. Resultado

A versão 2.0 entrega visão operacional e financeira do paciente internado, com proteção contra sobreposição de leitos e dados persistidos no PostgreSQL.