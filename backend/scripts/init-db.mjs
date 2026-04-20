// Inicializa o banco SQLite: cria a tabela e faz seed se estiver vazio.
// Executado pelo entrypoint do container antes de iniciar o servidor.
import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

const dbPath = resolve(process.cwd(), 'prisma/dev.db');
const dbDir = dirname(dbPath);

if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath);

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
    "createdAt"        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        DATETIME NOT NULL
  )
`);

const { count } = db.prepare('SELECT COUNT(*) as count FROM "Internacao"').get();

if (count === 0) {
  const insert = db.prepare(`
    INSERT INTO "Internacao"
      (id, petNome, especie, tutorNome, entradaEm, status, proximaMedicacao, observacao, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const now = new Date().toISOString();
  insert.run('seed-1', 'Luna',   'Canina', 'João Menezes',  '2026-04-18T09:20:00', 'observacao', '11:30', 'Pós-operatório, resposta adequada ao antibiótico.',    now, now);
  insert.run('seed-2', 'Mingau', 'Felina', 'Carla Santos',  '2026-04-18T14:05:00', 'estavel',    '12:10', 'Hidratação assistida e monitoramento de apetite.',     now, now);
  insert.run('seed-3', 'Thor',   'Canina', 'Mariana Costa', '2026-04-19T07:40:00', 'critico',    '10:45', 'Monitoramento contínuo de sinais vitais.',             now, now);
  console.log('Banco inicializado com dados de exemplo.');
} else {
  console.log(`Banco já possui ${count} registro(s). Seed ignorado.`);
}

db.close();
console.log('Banco de dados pronto.');
