#!/bin/sh
set -e

echo "==> Inicializando banco de dados..."
node scripts/init-db.mjs

echo "==> Iniciando CVET API (Hono)..."
exec npx tsx src/index.ts
