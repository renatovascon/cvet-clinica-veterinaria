# RFC: Controle de Internações e Leitos

## Contexto

O CVET organiza pacientes internados, responsáveis, leitos, medicações e valores de diária. Esta RFC define o vínculo obrigatório entre uma internação, um pet cadastrado e um leito reservado.

## Decisões

- Uma internação seleciona um pet existente e usa os dados do tutor vinculados a ele.
- Cada internação possui leito, data de entrada, data de saída e descrição.
- O período é bloqueado quando existe outra internação no mesmo leito com datas sobrepostas.
- O total é calculado por $\max(1, \lceil \text{saída} - \text{entrada} \rceil) \times \text{diária do leito}$.
- Leitos possuem tipo `N` (Normal) ou `I` (UTI) e valor diário.
- O financeiro calcula valores até a data atual para internações abertas e até a alta para internações encerradas.
- Cada medicação possui unidade, quantidade por dose, preço unitário, doses aplicadas e texto livre. Somente doses aplicadas entram no fechamento.
- A quitação exige o saldo integral; a mesma transação registra o pagamento, define a saída e marca `baixa: true`.
- A relação operacional de internações retorna apenas registros com `baixa: false`.

## Dados

| Entidade | Responsabilidade |
| --- | --- |
| `Tutor` | Responsável e dados de contato |
| `Pet` | Paciente vinculado ao tutor |
| `Leito` | Número, nome, tipo e diária |
| `Internacao` | Reserva do leito, período, status e total previsto |
| `Medicacao` | Prescrição vinculada, doses aplicadas e valor por dose |
| `Raca` | Catálogo de raças caninas e felinas por enum de espécie |
| `FormaPagamento` | Cadastro de meios de pagamento |
| `Pagamento` | Valor pago por internação |

## Regra de conflito

Uma nova reserva entra em conflito quando $\text{entrada existente} \le \text{saída nova}$ e $\text{saída existente} \ge \text{entrada nova}$ para o mesmo leito. A API retorna HTTP `409` e não persiste a internação.

## Endpoints

- `GET /api/pets`: pets cadastrados com tutor.
- `GET /api/leitos`: leitos e diária.
- `GET /api/racas?especie=CANINO|FELINO`: catálogo de raças pesquisável.
- `GET|POST /api/tutores`, `PUT|DELETE /api/tutores/:id`: gestão de tutores e pets.
- `POST /api/internacoes`: cria uma reserva após validar pet, leito e período.
- `GET /api/financeiro`: saldos atualizados e formas de pagamento.
- `POST /api/financeiro/pagamentos`: quita o saldo e efetua a baixa da internação.

## Operação

O `docker compose up --build -d` cria ou atualiza as tabelas e insere somente as formas de pagamento de referência. Não cria dados clínicos de demonstração. O DDL de referência está em `docs/schema-postgresql.sql`.