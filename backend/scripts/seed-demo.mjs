import pg from 'pg';
import { randomUUID } from 'node:crypto';

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });

const tutores = [
  ['Amanda Ribeiro', '11981234501', 'amanda.ribeiro@exemplo.local'],
  ['Bruno Martins', '11981234502', 'bruno.martins@exemplo.local'],
  ['Camila Nogueira', '11981234503', 'camila.nogueira@exemplo.local'],
  ['Diego Almeida', '11981234504', 'diego.almeida@exemplo.local'],
  ['Elisa Ferreira', '11981234505', 'elisa.ferreira@exemplo.local'],
  ['Felipe Cardoso', '11981234506', 'felipe.cardoso@exemplo.local'],
  ['Gabriela Lopes', '11981234507', 'gabriela.lopes@exemplo.local'],
  ['Henrique Costa', '11981234508', 'henrique.costa@exemplo.local'],
  ['Isabela Rocha', '11981234509', 'isabela.rocha@exemplo.local'],
  ['Joao Viana', '11981234510', 'joao.viana@exemplo.local'],
];

const nomesPets = ['Amora', 'Bento', 'Cacau', 'Dora', 'Estrela', 'Fubá', 'Gaia', 'Hulk', 'Iris', 'Jade', 'Kiko', 'Lua', 'Maya', 'Nino', 'Olivia', 'Pipoca', 'Quico', 'Zeca'];

function embaralhar(itens) {
  return [...itens].sort(() => Math.random() - 0.5);
}

function dataNascimentoAleatoria() {
  const ano = 2015 + Math.floor(Math.random() * 10);
  const mes = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
  const dia = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

await client.connect();

const existente = await client.query(`SELECT 1 FROM "Tutor" WHERE email LIKE '%@exemplo.local' LIMIT 1`);
if (existente.rowCount) {
  console.log('Dados fictícios já foram inseridos. Nenhuma alteração foi feita.');
  await client.end();
  process.exit(0);
}

const { rows: racas } = await client.query(`SELECT nome, especie FROM "Raca" WHERE especie IN ('CANINO', 'FELINO')`);
const racasCaninas = racas.filter((raca) => raca.especie === 'CANINO');
const racasFelinas = racas.filter((raca) => raca.especie === 'FELINO');
if (!racasCaninas.length || !racasFelinas.length) throw new Error('Catálogo de raças não encontrado. Execute primeiro: npm run db:init');

const tutorIds = new Map();
for (const [nome, telefone, email] of tutores) {
  const id = `demo-tutor-${randomUUID()}`;
  await client.query(`INSERT INTO "Tutor" (id, nome, telefone, email) VALUES ($1, $2, $3, $4)`, [id, nome, telefone, email]);
  tutorIds.set(nome, id);
}

for (const [indice, nome] of embaralhar(nomesPets).entries()) {
  const especie = Math.random() < 0.6 ? 'CANINO' : 'FELINO';
  const catalogo = especie === 'CANINO' ? racasCaninas : racasFelinas;
  const raca = catalogo[Math.floor(Math.random() * catalogo.length)].nome;
  const [tutorNome] = tutores[indice % tutores.length];
  await client.query(
    `INSERT INTO "Pet" (id, nome, especie, raca, "dataNascimento", "tutorId") VALUES ($1, $2, $3::"EspeciePet", $4, $5, $6)`,
    [`demo-pet-${randomUUID()}`, nome, especie, raca, dataNascimentoAleatoria(), tutorIds.get(tutorNome)]
  );
}

await client.end();
console.log('Criados 10 tutores fictícios e 18 pets fictícios com espécies e raças variadas.');