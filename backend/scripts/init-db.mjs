import pg from 'pg';
import { randomBytes, scryptSync } from 'node:crypto';

const { Client } = pg;

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

await client.query(`
  CREATE TABLE IF NOT EXISTS "Usuario" (
    "id"        TEXT      NOT NULL PRIMARY KEY,
    "nome"      TEXT      NOT NULL,
    "cpf"       TEXT      UNIQUE,
    "email"     TEXT      NOT NULL UNIQUE,
    "senhaHash" TEXT      NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

await client.query(`
  CREATE TABLE IF NOT EXISTS "Leito" (
    "id"        TEXT      NOT NULL PRIMARY KEY,
    "nome"      TEXT      NOT NULL,
    "tipo"      TEXT      NOT NULL DEFAULT 'N',
    "valorDiaria" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

await client.query(`
  CREATE TABLE IF NOT EXISTS "Tutor" (
    "id"        TEXT      NOT NULL PRIMARY KEY,
    "nome"      TEXT      NOT NULL,
    "telefone"  TEXT      NOT NULL,
    "cpf"       TEXT,
    "email"     TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

await client.query(`
  CREATE TABLE IF NOT EXISTS "Pet" (
    "id"             TEXT      NOT NULL PRIMARY KEY,
    "nome"           TEXT      NOT NULL,
    "especie"        TEXT      NOT NULL,
    "raca"           TEXT,
    "dataNascimento" TIMESTAMP,
    "tutorId"        TEXT      NOT NULL,
    "createdAt"      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id")
  )
`);

await client.query(`
  CREATE TABLE IF NOT EXISTS "Internacao" (
    "id"               TEXT      NOT NULL PRIMARY KEY,
    "petNome"          TEXT      NOT NULL,
    "especie"          TEXT      NOT NULL,
    "tutorNome"        TEXT      NOT NULL,
    "entradaEm"        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataSaida"        TIMESTAMP,
    "descricao"        TEXT      NOT NULL DEFAULT '',
    "quantidadeDiarias" INTEGER  NOT NULL DEFAULT 0,
    "valorDiarias"     DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status"           TEXT      NOT NULL DEFAULT 'estavel',
    "proximaMedicacao" TEXT      NOT NULL,
    "observacao"       TEXT      NOT NULL DEFAULT '',
    "petId"            TEXT      REFERENCES "Pet"("id"),
    "leitoId"          TEXT      REFERENCES "Leito"("id"),
    "createdAt"        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

await client.query(`
  CREATE TABLE IF NOT EXISTS "Medicacao" (
    "id"              TEXT             NOT NULL PRIMARY KEY,
    "nome"            TEXT             NOT NULL,
    "horarios"        TEXT             NOT NULL DEFAULT '[]',
    "cor"             TEXT             NOT NULL DEFAULT 'bg-teal-500',
    "via"             TEXT             NOT NULL DEFAULT 'Oral',
    "unidade"         TEXT             NOT NULL DEFAULT 'mg',
    "quantidade"      DOUBLE PRECISION NOT NULL DEFAULT 1,
    "frequenciaHoras" INTEGER          NOT NULL DEFAULT 8,
    "primeiroHorario" TEXT             NOT NULL DEFAULT '08:00',
    "fimEm"           TIMESTAMP,
    "internacaoId"    TEXT             NOT NULL,
    "createdAt"       TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("internacaoId") REFERENCES "Internacao"("id") ON DELETE CASCADE
  )
`);

await client.query(`
  CREATE TABLE IF NOT EXISTS "FormaPagamento" (
    "id"        TEXT      NOT NULL PRIMARY KEY,
    "nome"      TEXT      NOT NULL UNIQUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

await client.query(`
  CREATE TABLE IF NOT EXISTS "Pagamento" (
    "id"               TEXT             NOT NULL PRIMARY KEY,
    "valor"            DOUBLE PRECISION NOT NULL,
    "pagoEm"           TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "internacaoId"     TEXT             NOT NULL REFERENCES "Internacao"("id") ON DELETE CASCADE,
    "formaPagamentoId" TEXT             NOT NULL REFERENCES "FormaPagamento"("id"),
    "createdAt"        TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

// Adiciona colunas em bases antigas que não as têm
await client.query(`ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "cpf" TEXT UNIQUE`);
await client.query(`ALTER TABLE "Leito" ADD COLUMN IF NOT EXISTS "tipo" TEXT NOT NULL DEFAULT 'N'`);
await client.query(`ALTER TABLE "Leito" ADD COLUMN IF NOT EXISTS "valorDiaria" DOUBLE PRECISION NOT NULL DEFAULT 0`);
await client.query(`ALTER TABLE "Internacao" ADD COLUMN IF NOT EXISTS "petId" TEXT REFERENCES "Pet"("id")`);
await client.query(`ALTER TABLE "Internacao" ADD COLUMN IF NOT EXISTS "leitoId" TEXT REFERENCES "Leito"("id")`);
await client.query(`ALTER TABLE "Internacao" ADD COLUMN IF NOT EXISTS "dataSaida" TIMESTAMP`);
await client.query(`ALTER TABLE "Internacao" ADD COLUMN IF NOT EXISTS "descricao" TEXT NOT NULL DEFAULT ''`);
await client.query(`ALTER TABLE "Internacao" ADD COLUMN IF NOT EXISTS "quantidadeDiarias" INTEGER NOT NULL DEFAULT 0`);
await client.query(`ALTER TABLE "Internacao" ADD COLUMN IF NOT EXISTS "valorDiarias" DOUBLE PRECISION NOT NULL DEFAULT 0`);
await client.query(`ALTER TABLE "Tutor" ADD COLUMN IF NOT EXISTS "cpf" TEXT`);
await client.query(`ALTER TABLE "Medicacao" ADD COLUMN IF NOT EXISTS "via" TEXT NOT NULL DEFAULT 'Oral'`);
await client.query(`ALTER TABLE "Medicacao" ADD COLUMN IF NOT EXISTS "unidade" TEXT NOT NULL DEFAULT 'mg'`);
await client.query(`ALTER TABLE "Medicacao" ADD COLUMN IF NOT EXISTS "quantidade" DOUBLE PRECISION NOT NULL DEFAULT 1`);
await client.query(`ALTER TABLE "Medicacao" ADD COLUMN IF NOT EXISTS "frequenciaHoras" INTEGER NOT NULL DEFAULT 8`);
await client.query(`ALTER TABLE "Medicacao" ADD COLUMN IF NOT EXISTS "primeiroHorario" TEXT NOT NULL DEFAULT '08:00'`);
await client.query(`ALTER TABLE "Medicacao" ADD COLUMN IF NOT EXISTS "fimEm" TIMESTAMP`);

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
  console.log(`Usuário administrador criado: ${adminEmail}`);
}

await client.query(`
  INSERT INTO "Leito" (id, nome, tipo, "valorDiaria") VALUES
    ('1', 'Canil 01', 'N', 120),
    ('2', 'Canil 02', 'N', 120),
    ('3', 'Gatil 01', 'N', 110),
    ('101', 'UTI Veterinária 01', 'I', 350)
  ON CONFLICT (id) DO NOTHING
`);

await client.query(`
  INSERT INTO "FormaPagamento" (id, nome) VALUES
    ('dinheiro', 'Dinheiro'), ('credito', 'Crédito'), ('debito', 'Débito'),
    ('pix', 'PIX'), ('transferencia', 'Transferência')
  ON CONFLICT (id) DO NOTHING
`);

await client.query(`
  UPDATE "Internacao" SET "leitoId" = CASE id
    WHEN 'seed-1' THEN '1'
    WHEN 'seed-2' THEN '3'
    WHEN 'seed-3' THEN '101'
  END
  WHERE id IN ('seed-1', 'seed-2', 'seed-3') AND "leitoId" IS NULL
`);

await client.query(`
  UPDATE "Internacao" AS internacao
  SET
    "dataSaida" = internacao."entradaEm" + INTERVAL '3 days',
    descricao = CASE internacao.id
      WHEN 'seed-1' THEN 'Recuperação pós-operatória com acompanhamento clínico.'
      WHEN 'seed-2' THEN 'Hidratação assistida e observação do apetite.'
      WHEN 'seed-3' THEN 'Monitoramento intensivo de sinais vitais.'
    END,
    "quantidadeDiarias" = 3,
    "valorDiarias" = leito."valorDiaria" * 3
  FROM "Leito" AS leito
  WHERE internacao."leitoId" = leito.id
    AND internacao.id IN ('seed-1', 'seed-2', 'seed-3')
    AND internacao."dataSaida" IS NULL
`);

const { rows: [{ count }] } = await client.query('SELECT COUNT(*)::int as count FROM "Internacao"');

if (count === 0) {
  const now = new Date().toISOString();

  await client.query(
    `INSERT INTO "Tutor" (id, nome, telefone, "createdAt", "updatedAt") VALUES
      ('tutor-1', 'João Menezes',  '11999990001', $1, $1),
      ('tutor-2', 'Carla Santos',  '11999990002', $1, $1),
      ('tutor-3', 'Mariana Costa', '11999990003', $1, $1)`,
    [now]
  );

  await client.query(
    `INSERT INTO "Pet" (id, nome, especie, "tutorId", "createdAt", "updatedAt") VALUES
      ('pet-1', 'Luna',   'Canina', 'tutor-1', $1, $1),
      ('pet-2', 'Mingau', 'Felina', 'tutor-2', $1, $1),
      ('pet-3', 'Thor',   'Canina', 'tutor-3', $1, $1)`,
    [now]
  );

  await client.query(
    `INSERT INTO "Internacao"
      (id, "petNome", especie, "tutorNome", "entradaEm", status, "proximaMedicacao", observacao, "petId", "createdAt", "updatedAt") VALUES
      ('seed-1', 'Luna',   'Canina', 'João Menezes',  '2026-04-18T09:20:00', 'observacao', '08:00', 'Pós-operatório, resposta adequada ao antibiótico.', 'pet-1', $1, $1),
      ('seed-2', 'Mingau', 'Felina', 'Carla Santos',  '2026-04-18T14:05:00', 'estavel',    '06:00', 'Hidratação assistida e monitoramento de apetite.', 'pet-2', $1, $1),
      ('seed-3', 'Thor',   'Canina', 'Mariana Costa', '2026-04-19T07:40:00', 'critico',    '08:00', 'Monitoramento contínuo de sinais vitais.', 'pet-3', $1, $1)`,
    [now]
  );

  function calcHorarios(primeiro, freqH) {
    const [h, m] = primeiro.split(':').map(Number);
    const startMin = h * 60 + m;
    const total = Math.round(1440 / (freqH * 60));
    return Array.from({ length: total }, (_, i) => {
      const min = (startMin + i * freqH * 60) % 1440;
      return `${Math.floor(min / 60).toString().padStart(2, '0')}:${(min % 60).toString().padStart(2, '0')}`;
    });
  }

  const fim = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  await client.query(
    `INSERT INTO "Medicacao"
      (id, nome, horarios, cor, via, unidade, quantidade, "frequenciaHoras", "primeiroHorario", "fimEm", "internacaoId", "createdAt", "updatedAt") VALUES
      ('med-1', 'Antibiótico',       $1, 'bg-teal-500',   'Oral',        'mg', 500, 12, '08:00', $6, 'seed-1', $7, $7),
      ('med-2', 'Anti-inflamatório', $2, 'bg-orange-500', 'Oral',        'mg', 100, 24, '12:00', $6, 'seed-1', $7, $7),
      ('med-3', 'Soro fisiológico',  $3, 'bg-blue-500',   'Intravenosa', 'ml', 250,  8, '06:00', $6, 'seed-2', $7, $7),
      ('med-4', 'Analgésico',        $4, 'bg-purple-500', 'Oral',        'mg',  50, 12, '08:00', $6, 'seed-3', $7, $7),
      ('med-5', 'Antibiótico',       $5, 'bg-teal-500',   'Oral',        'mg', 500, 12, '10:00', $6, 'seed-3', $7, $7)`,
    [
      JSON.stringify(calcHorarios('08:00', 12)),
      JSON.stringify(calcHorarios('12:00', 24)),
      JSON.stringify(calcHorarios('06:00', 8)),
      JSON.stringify(calcHorarios('08:00', 12)),
      JSON.stringify(calcHorarios('10:00', 12)),
      fim,
      now,
    ]
  );

  console.log('Banco inicializado com dados de exemplo.');
} else {
  console.log(`Banco já possui ${count} registro(s). Seed ignorado.`);
}

await client.end();
console.log('Banco de dados pronto.');
