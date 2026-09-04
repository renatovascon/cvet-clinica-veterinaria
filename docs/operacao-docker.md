# Operação com Docker

## Pré-requisito

Instale somente o Docker Desktop (Windows/macOS) ou Docker Engine com Docker Compose v2 (Linux). Node.js, npm, PostgreSQL, Prisma e dependências do projeto são instalados dentro das imagens Docker.

```bash
docker compose version
```

## Primeira execução e atualização

Na raiz do repositório:

```bash
docker compose up --build -d
```

O Compose baixa PostgreSQL, instala dependências com `npm ci`, gera o cliente Prisma, constrói o frontend e inicia nesta ordem:

1. `db`: PostgreSQL em `localhost:5432`.
2. `api`: Hono em `http://localhost:3001`, após o healthcheck do banco.
3. `web`: Next.js em `http://localhost:3000`, após o healthcheck da API.

Confirme a execução:

```bash
docker compose ps
```

Todos os serviços devem chegar ao estado `healthy`.

## Dados e diagnóstico

O volume `cvet-db` preserva os dados. Para parar sem apagá-los:

```bash
docker compose down
```

Para remover também os dados locais:

```bash
docker compose down -v
```

Logs por serviço:

```bash
docker compose logs -f api
docker compose logs -f web
docker compose logs -f db
```

O banco local usa `localhost:5432`, usuário `cvet`, senha `cvet` e banco `cvet`. O DDL está em `docs/schema-postgresql.sql`.

## Dados fictícios opcionais

O ambiente inicia sem dados clínicos. Para inserir manualmente 10 tutores e 18 pets fictícios:

```bash
docker compose exec api node scripts/seed-demo.mjs
```

O script não duplica registros em uma nova execução.