import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const statusSchema = z.enum(['estavel', 'observacao', 'critico']);

const createSchema = z.object({
  petNome:          z.string().min(1, 'Nome do pet obrigatório'),
  especie:          z.string().min(1, 'Espécie obrigatória'),
  tutorNome:        z.string().min(1, 'Nome do tutor obrigatório'),
  status:           statusSchema.default('estavel'),
  proximaMedicacao: z.string().min(1, 'Próxima medicação obrigatória'),
  observacao:       z.string().optional().default(''),
});

const updateSchema = z.object({
  status:           statusSchema.optional(),
  proximaMedicacao: z.string().min(1).optional(),
  observacao:       z.string().optional(),
});

export const internacoesRoutes = new Hono()
  .get('/', async (c) => {
    const internacoes = await prisma.internacao.findMany({
      orderBy: { entradaEm: 'desc' },
    });
    return c.json(internacoes);
  })

  .post('/', zValidator('json', createSchema), async (c) => {
    const data = c.req.valid('json');
    const internacao = await prisma.internacao.create({ data });
    return c.json(internacao, 201);
  })

  .get('/:id', async (c) => {
    const internacao = await prisma.internacao.findUnique({
      where: { id: c.req.param('id') },
    });
    if (!internacao) return c.json({ error: 'Internação não encontrada.' }, 404);
    return c.json(internacao);
  })

  .patch('/:id', zValidator('json', updateSchema), async (c) => {
    const id = c.req.param('id');
    const data = c.req.valid('json');
    const internacao = await prisma.internacao.update({ where: { id }, data });
    return c.json(internacao);
  })

  .delete('/:id', async (c) => {
    await prisma.internacao.delete({ where: { id: c.req.param('id') } });
    return c.body(null, 204);
  });
