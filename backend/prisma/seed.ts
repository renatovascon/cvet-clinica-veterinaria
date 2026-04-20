import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/prisma/client';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'prisma/dev.db');
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  const count = await prisma.internacao.count();
  if (count > 0) {
    console.log('Banco já possui dados. Seed ignorado.');
    return;
  }

  await prisma.internacao.createMany({
    data: [
      {
        petNome: 'Luna',
        especie: 'Canina',
        tutorNome: 'João Menezes',
        entradaEm: new Date('2026-04-18T09:20:00'),
        status: 'observacao',
        proximaMedicacao: '11:30',
        observacao: 'Pós-operatório, resposta adequada ao antibiótico.',
      },
      {
        petNome: 'Mingau',
        especie: 'Felina',
        tutorNome: 'Carla Santos',
        entradaEm: new Date('2026-04-18T14:05:00'),
        status: 'estavel',
        proximaMedicacao: '12:10',
        observacao: 'Hidratação assistida e monitoramento de apetite.',
      },
      {
        petNome: 'Thor',
        especie: 'Canina',
        tutorNome: 'Mariana Costa',
        entradaEm: new Date('2026-04-19T07:40:00'),
        status: 'critico',
        proximaMedicacao: '10:45',
        observacao: 'Monitoramento contínuo de sinais vitais.',
      },
    ],
  });
  console.log('Seed concluído.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
