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

## Dados

| Entidade | Responsabilidade |
| --- | --- |
| `Tutor` | Responsável e dados de contato |
| `Pet` | Paciente vinculado ao tutor |
| `Leito` | Número, nome, tipo e diária |
| `Internacao` | Reserva do leito, período, status e total previsto |
| `FormaPagamento` | Cadastro de meios de pagamento |
| `Pagamento` | Valor pago por internação |

## Regra de conflito

Uma nova reserva entra em conflito quando $\text{entrada existente} \le \text{saída nova}$ e $\text{saída existente} \ge \text{entrada nova}$ para o mesmo leito. A API retorna HTTP `409` e não persiste a internação.

## Endpoints

- `GET /api/pets`: pets cadastrados com tutor.
- `GET /api/leitos`: leitos e diária.
- `POST /api/internacoes`: cria uma reserva após validar pet, leito e período.
- `GET /api/financeiro`: saldos atualizados e formas de pagamento.
- `POST /api/financeiro/pagamentos`: registra um pagamento.

## Operação

O `docker compose up --build -d` cria as tabelas e insere dados iniciais idempotentes para leitos e formas de pagamento.