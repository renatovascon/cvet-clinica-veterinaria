import pg from 'pg';
import { randomBytes, scryptSync } from 'node:crypto';
import { racasCaninas, racasFelinas } from './catalogo-racas.mjs';

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });

await client.connect();

await client.query(`
  DO $$ BEGIN
    CREATE TYPE "EspeciePet" AS ENUM ('CANINO', 'FELINO', 'OUTROS');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
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
    "id" TEXT NOT NULL PRIMARY KEY, "nome" TEXT NOT NULL, "especie" "EspeciePet" NOT NULL, "raca" TEXT, "dataNascimento" TIMESTAMP,
    "tutorId" TEXT NOT NULL REFERENCES "Tutor"("id"), "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS "Raca" (
    "id" TEXT NOT NULL PRIMARY KEY, "nome" TEXT NOT NULL, "especie" "EspeciePet" NOT NULL, "grupoFci" INTEGER,
    UNIQUE ("nome", "especie"),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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

await client.query(`
  ALTER TABLE "Pet" ALTER COLUMN "especie" TYPE "EspeciePet"
  USING CASE UPPER("especie"::text)
    WHEN 'CANINA' THEN 'CANINO'::"EspeciePet"
    WHEN 'CANINO' THEN 'CANINO'::"EspeciePet"
    WHEN 'FELINA' THEN 'FELINO'::"EspeciePet"
    WHEN 'FELINO' THEN 'FELINO'::"EspeciePet"
    ELSE 'OUTROS'::"EspeciePet"
  END
`);
await client.query(`
  DO $$ BEGIN
    IF to_regclass('public."RacaCanina"') IS NOT NULL THEN
      INSERT INTO "Raca" ("id", "nome", "especie", "grupoFci", "createdAt", "updatedAt")
      SELECT "id", "nome", 'CANINO'::"EspeciePet", "grupoFci", "createdAt", "updatedAt" FROM "RacaCanina"
      ON CONFLICT ("nome", "especie") DO NOTHING;
      DROP TABLE "RacaCanina";
    END IF;
  END $$;
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

await client.query(`
  INSERT INTO "Raca" (id, nome, especie, "grupoFci") VALUES
    ('canino-srd', 'Sem raça definida (SRD)', 'CANINO', NULL), ('canino-beagle', 'Beagle', 'CANINO', 6), ('canino-border-collie', 'Border Collie', 'CANINO', 1),
    ('canino-buldogue-frances', 'Buldogue Francês', 'CANINO', 9), ('canino-chihuahua', 'Chihuahua', 'CANINO', 9), ('canino-dachshund', 'Dachshund', 'CANINO', 4),
    ('canino-golden-retriever', 'Golden Retriever', 'CANINO', 8), ('canino-labrador-retriever', 'Labrador Retriever', 'CANINO', 8), ('canino-pastor-alemao', 'Pastor Alemão', 'CANINO', 1),
    ('canino-poodle', 'Poodle', 'CANINO', 9), ('canino-pug', 'Pug', 'CANINO', 9), ('canino-rottweiler', 'Rottweiler', 'CANINO', 2),
    ('canino-shih-tzu', 'Shih Tzu', 'CANINO', 9), ('canino-yorkshire-terrier', 'Yorkshire Terrier', 'CANINO', 3),
    ('felino-srd', 'Sem raça definida (SRD)', 'FELINO', NULL), ('felino-abissinio', 'Abissínio', 'FELINO', NULL), ('felino-american-shorthair', 'American Shorthair', 'FELINO', NULL),
    ('felino-angora-turco', 'Angorá Turco', 'FELINO', NULL), ('felino-bengal', 'Bengal', 'FELINO', NULL), ('felino-birman', 'Sagrado da Birmânia', 'FELINO', NULL),
    ('felino-bombay', 'Bombaim', 'FELINO', NULL), ('felino-british-shorthair', 'British Shorthair', 'FELINO', NULL), ('felino-maine-coon', 'Maine Coon', 'FELINO', NULL),
    ('felino-munchkin', 'Munchkin', 'FELINO', NULL), ('felino-noruegues-floresta', 'Gato Norueguês da Floresta', 'FELINO', NULL), ('felino-persian', 'Persa', 'FELINO', NULL),
    ('felino-ragdoll', 'Ragdoll', 'FELINO', NULL), ('felino-russian-blue', 'Azul Russo', 'FELINO', NULL), ('felino-siamese', 'Siamês', 'FELINO', NULL),
    ('felino-siberian', 'Siberiano', 'FELINO', NULL), ('felino-sphynx', 'Sphynx', 'FELINO', NULL)
  ON CONFLICT (nome, especie) DO NOTHING
`);

for (const [index, raca] of [...racasCaninas, ...racasFelinas].entries()) {
  await client.query(
    `INSERT INTO "Raca" (id, nome, especie, "grupoFci") VALUES ($1, $2, $3::"EspeciePet", $4) ON CONFLICT (nome, especie) DO NOTHING`,
    [`catalogo-${raca.especie.toLowerCase()}-${index}`, raca.nome, raca.especie, raca.grupoFci]
  );
}

await client.end();
console.log('Banco de dados pronto, sem dados clínicos de demonstração.');