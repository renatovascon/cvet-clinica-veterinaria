import { Hono } from 'hono';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const especieSchema = z.enum(['CANINO', 'FELINO', 'OUTROS']);

export const racasRoutes = new Hono().get('/', async (c) => {
  const especie = especieSchema.safeParse(c.req.query('especie'));
  if (!especie.success) return c.json({ error: 'Informe uma espécie válida.' }, 400);

  const racas = await prisma.raca.findMany({
    where: { especie: especie.data },
    select: { id: true, nome: true, especie: true, grupoFci: true },
    orderBy: { nome: 'asc' },
  });
  return c.json(racas);
});