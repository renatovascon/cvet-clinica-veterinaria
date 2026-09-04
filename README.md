# CVET — Clínica Veterinária

Sistema de gestão de internações para clínicas veterinárias. Projeto desenvolvido para a UNIVESP.

## Stack

- **Frontend:** Next.js 16, Tailwind CSS, TypeScript
- **Backend:** Hono, Prisma, PostgreSQL
- **Infra:** Docker Compose (local) · Render (produção) · GitHub Actions (CI/CD)

## Getting Started

### Pré-requisitos

- [Node.js 22+](https://nodejs.org)
- [Docker](https://www.docker.com) e Docker Compose

---

### Rodando com Docker (recomendado)

```bash
# Clone o repositório
git clone https://github.com/renatovascon/cvet-clinica-veterinaria.git
cd cvet-clinica-veterinaria

# Suba os dois serviços
docker compose up --build
```

| Serviço   | URL                     |
|-----------|-------------------------|
| Frontend  | http://localhost:3000   |
| API       | http://localhost:3001   |

O banco de dados é criado automaticamente na primeira execução, sem dados clínicos de demonstração. Cadastre usuários, leitos, tutores e pets pela aplicação.

---

### Rodando localmente (sem Docker)

**Backend**

```bash
cd backend
npm run setup   # instala dependências e cria o .env
npm run dev     # gera o client Prisma, inicializa o banco e sobe o servidor
```

> Antes de rodar `npm run dev`, suba um Postgres local (ex: `docker compose up -d db`)
> e ajuste `DATABASE_URL` no `.env` se necessário.
>
> `npm run setup` só precisa ser executado uma vez após clonar o repositório
> ou após trocar a versão do Node.js. Depois disso, `npm run dev` é suficiente.

**Frontend** (em outro terminal)

```bash
cd frontend
npm install
npm run dev                # http://localhost:3000
```

---

### Testes

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## Funcionalidades

- Cadastro de tutores com um ou mais pets
- Cadastro de leitos Normal/UTI, diária e bloqueio de períodos sobrepostos
- Internações com seleção de pet e leito existentes, período, descrição e cálculo de diárias
- Controle de status por pet (Estável · Observação · Crítico)
- Gerenciamento de medicações por internação
- **Mapa de Execução** — grade de horários de medicação por pet
- Dashboard com analytics (espécie, status, volume)
- Financeiro com saldo por internação, pagamentos e formas de pagamento

## Documentação

- [RFC de internações e leitos](docs/rfc-internacoes-leitos.md)
- [Apresentação v2.0](docs/apresentacao-v2.0.md)

## Deploy

A aplicação é hospedada no [Render](https://render.com) e o deploy é acionado automaticamente após cada push na branch `main` que passe nos testes do CI.

- Frontend: https://cvet-web.onrender.com
- API: https://cvet-api.onrender.com
