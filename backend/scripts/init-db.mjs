import pg from 'pg';
import { randomBytes, scryptSync } from 'node:crypto';

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });

await client.connect();

await client.query(`
  CREATE TABLE IF NOT EXISTS "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY, "nome" TEXT NOT NULL, "cpf" TEXT UNIQUE,
    "email" TEXT NOT NULL UNIQUE, "senhaHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS "Leito" (
    "id" TEXT NOT NULL PRIMARY KEY, "nome" TEXT NOT NULL, "tipo" TEXT NOT NULL DEFAULT 'N', "valorDiaria" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS "Tutor" (
    "id" TEXT NOT NULL PRIMARY KEY, "nome" TEXT NOT NULL, "telefone" TEXT NOT NULL, "cpf" TEXT, "email" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS "Pet" (
    "id" TEXT NOT NULL PRIMARY KEY, "nome" TEXT NOT NULL, "especie" TEXT NOT NULL, "raca" TEXT, "dataNascimento" TIMESTAMP,
    "tutorId" TEXT NOT NULL REFERENCES "Tutor"("id"), "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS "Internacao" (
    "id" TEXT NOT NULL PRIMARY KEY, "petNome" TEXT NOT NULL, "especie" TEXT NOT NULL, "tutorNome" TEXT NOT NULL,
    "entradaEm" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "dataSaida" TIMESTAMP, "descricao" TEXT NOT NULL DEFAULT '',
    "quantidadeDiarias" INTEGER NOT NULL DEFAULT 0, "valorDiarias" DOUBLE PRECISION NOT NULL DEFAULT 0, "status" TEXT NOT NULL DEFAULT 'estavel',
    "baixa" BOOLEAN NOT NULL DEFAULT FALSE, "proximaMedicacao" TEXT NOT NULL, "observacao" TEXT NOT NULL DEFAULT '',
    "petId" TEXT REFERENCES "Pet"("id"), "leitoId" TEXT REFERENCES "Leito"("id"),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS "Medicacao" (
    "id" TEXT NOT NULL PRIMARY KEY, "nome" TEXT NOT NULL, "descricao" TEXT NOT NULL DEFAULT '', "horarios" TEXT NOT NULL DEFAULT '[]',
    "cor" TEXT NOT NULL DEFAULT 'bg-teal-500', "via" TEXT NOT NULL DEFAULT 'Oral', "unidade" TEXT NOT NULL DEFAULT 'mg',
    "quantidade" DOUBLE PRECISION NOT NULL DEFAULT 1, "valorDose" DOUBLE PRECISION NOT NULL DEFAULT 0, "dosesAplicadas" INTEGER NOT NULL DEFAULT 0,
    "frequenciaHoras" INTEGER NOT NULL DEFAULT 8, "primeiroHorario" TEXT NOT NULL DEFAULT '08:00', "fimEm" TIMESTAMP,
    "internacaoId" TEXT NOT NULL REFERENCES "Internacao"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS "FormaPagamento" (
    "id" TEXT NOT NULL PRIMARY KEY, "nome" TEXT NOT NULL UNIQUE, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS "Pagamento" (
    "id" TEXT NOT NULL PRIMARY KEY, "valor" DOUBLE PRECISION NOT NULL, "pagoEm" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "internacaoId" TEXT NOT NULL REFERENCES "Internacao"("id") ON DELETE CASCADE,
    "formaPagamentoId" TEXT NOT NULL REFERENCES "FormaPagamento"("id"), "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

await client.query(`ALTER TABLE "Internacao" ADD COLUMN IF NOT EXISTS "baixa" BOOLEAN NOT NULL DEFAULT FALSE`);
await client.query(`ALTER TABLE "Medicacao" ADD COLUMN IF NOT EXISTS "descricao" TEXT NOT NULL DEFAULT ''`);
await client.query(`ALTER TABLE "Medicacao" ADD COLUMN IF NOT EXISTS "valorDose" DOUBLE PRECISION NOT NULL DEFAULT 0`);
await client.query(`ALTER TABLE "Medicacao" ADD COLUMN IF NOT EXISTS "dosesAplicadas" INTEGER NOT NULL DEFAULT 0`);

// Remove somente os registros identificados como dados de demonstração das versões anteriores.
await client.query(`DELETE FROM "Internacao" WHERE id IN ('seed-1', 'seed-2', 'seed-3')`);
await client.query(`DELETE FROM "Pet" WHERE id IN ('pet-1', 'pet-2', 'pet-3')`);
await client.query(`DELETE FROM "Tutor" WHERE id IN ('tutor-1', 'tutor-2', 'tutor-3')`);

const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@cvet.local';
const adminPassword = process.env.ADMIN_PASSWORD ?? 'cvet123';
const adminExists = await client.query('SELECT 1 FROM "Usuario" WHERE email = $1', [adminEmail]);

if (adminExists.rowCount === 0) {
  const salt = randomBytes(16).toString('hex');
  const senhaHash = `${salt}:${scryptSync(adminPassword, salt, 64).toString('hex')}`;
  await client.query(
    `INSERT INTO "Usuario" (id, nome, email, "senhaHash") VALUES ($1, $2, $3, $4)`,
    ['admin-cvet', 'Administrador CVET', adminEmail, senhaHash]
  );
}

await client.query(`
  INSERT INTO "FormaPagamento" (id, nome) VALUES
    ('dinheiro', 'Dinheiro'), ('credito', 'Crédito'), ('debito', 'Débito'), ('pix', 'PIX'), ('transferencia', 'Transferência')
  ON CONFLICT (id) DO NOTHING
`);

await client.end();
console.log('Banco de dados pronto, sem dados clínicos de demonstração.');