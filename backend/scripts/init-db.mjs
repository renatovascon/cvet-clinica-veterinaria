import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

const dbPath = resolve(process.cwd(), 'prisma/dev.db');
const dbDir = dirname(dbPath);

if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS "Tutor" (
    "id"        TEXT     NOT NULL PRIMARY KEY,
    "nome"      TEXT     NOT NULL,
    "telefone"  TEXT     NOT NULL,
    "email"     TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS "Pet" (
    "id"             TEXT     NOT NULL PRIMARY KEY,
    "nome"           TEXT     NOT NULL,
    "especie"        TEXT     NOT NULL,
    "raca"           TEXT,
    "dataNascimento" DATETIME,
    "tutorId"        TEXT     NOT NULL,
    "createdAt"      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      DATETIME NOT NULL,
    FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id")
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS "Internacao" (
    "id"               TEXT     NOT NULL PRIMARY KEY,
    "petNome"          TEXT     NOT NULL,
    "especie"          TEXT     NOT NULL,
    "tutorNome"        TEXT     NOT NULL,
    "entradaEm"        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status"           TEXT     NOT NULL DEFAULT 'estavel',
    "proximaMedicacao" TEXT     NOT NULL,
    "observacao"       TEXT     NOT NULL DEFAULT '',
    "petId"            TEXT     REFERENCES "Pet"("id"),
    "createdAt"        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        DATETIME NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS "Medicacao" (
    "id"           TEXT     NOT NULL PRIMARY KEY,
    "nome"         TEXT     NOT NULL,
    "horarios"     TEXT     NOT NULL DEFAULT '[]',
    "cor"          TEXT     NOT NULL DEFAULT 'bg-teal-500',
    "internacaoId" TEXT     NOT NULL,
    "createdAt"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    DATETIME NOT NULL,
    FOREIGN KEY ("internacaoId") REFERENCES "Internacao"("id") ON DELETE CASCADE
  )
`);

// Adiciona petId em bases antigas que não têm a coluna
try {
  db.exec(`ALTER TABLE "Internacao" ADD COLUMN "petId" TEXT REFERENCES "Pet"("id")`);
} catch { /* coluna já existe */ }

const { count } = db.prepare('SELECT COUNT(*) as count FROM "Internacao"').get();

if (count === 0) {
  const now = new Date().toISOString();

  const insertTutor = db.prepare(
    `INSERT INTO "Tutor" (id, nome, telefone, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`
  );
  insertTutor.run('tutor-1', 'João Menezes',  '11999990001', now, now);
  insertTutor.run('tutor-2', 'Carla Santos',  '11999990002', now, now);
  insertTutor.run('tutor-3', 'Mariana Costa', '11999990003', now, now);

  const insertPet = db.prepare(
    `INSERT INTO "Pet" (id, nome, especie, tutorId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`
  );
  insertPet.run('pet-1', 'Luna',   'Canina', 'tutor-1', now, now);
  insertPet.run('pet-2', 'Mingau', 'Felina', 'tutor-2', now, now);
  insertPet.run('pet-3', 'Thor',   'Canina', 'tutor-3', now, now);

  const insert = db.prepare(`
    INSERT INTO "Internacao"
      (id, petNome, especie, tutorNome, entradaEm, status, proximaMedicacao, observacao, petId, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insert.run('seed-1', 'Luna',   'Canina', 'João Menezes',  '2026-04-18T09:20:00', 'observacao', '11:30', 'Pós-operatório, resposta adequada ao antibiótico.',  'pet-1', now, now);
  insert.run('seed-2', 'Mingau', 'Felina', 'Carla Santos',  '2026-04-18T14:05:00', 'estavel',    '12:10', 'Hidratação assistida e monitoramento de apetite.',    'pet-2', now, now);
  insert.run('seed-3', 'Thor',   'Canina', 'Mariana Costa', '2026-04-19T07:40:00', 'critico',    '10:45', 'Monitoramento contínuo de sinais vitais.',            'pet-3', now, now);

  console.log('Banco inicializado com dados de exemplo.');
} else {
  console.log(`Banco já possui ${count} registro(s). Seed ignorado.`);
}

db.close();
console.log('Banco de dados pronto.');
