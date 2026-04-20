import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const statusSchema = z.enum(['estavel', 'observacao', 'critico']);

const createSchema = z.object({
  petNome:          z.string().min(1),
  especie:          z.string().min(1),
  tutorNome:        z.string().min(1),
  tutorTelefone:    z.string().min(1),
  status:           statusSchema.default('estavel'),
  proximaMedicacao: z.string().min(1),
  observacao:       z.string().optional().default(''),
});

const updateSchema = z.object({
  status:           statusSchema.optional(),
  proximaMedicacao: z.string().min(1).optional(),
  observacao:       z.string().optional(),
});

const medicacaoSchema = z.object({
  nome:     z.string().min(1),
  horarios: z.array(z.string()).min(1),
  cor:      z.string().default('bg-teal-500'),
});

const petInclude = { pet: { include: { tutor: true } } } as const;

function parseMeds(internacao: Record<string, unknown> & { medicacoes?: { horarios: string }[] }) {
  return {
    ...internacao,
    medicacoes: (internacao.medicacoes ?? []).map((m) => ({
      ...m,
      horarios: JSON.parse(m.horarios) as string[],
    })),
  };
}

export const internacoesRoutes = new Hono()

  // ── Internações ──────────────────────────────────────────────
  .get('/', async (c) => {
    const rows = await prisma.internacao.findMany({
      orderBy: { entradaEm: 'desc' },
      include: { ...petInclude, medicacoes: true },
    });
    return c.json(rows.map(parseMeds));
  })

  .post('/', zValidator('json', createSchema), async (c) => {
    const { tutorTelefone, ...data } = c.req.valid('json');

    let tutor = await prisma.tutor.findFirst({
      where: { nome: data.tutorNome, telefone: tutorTelefone },
    });
    if (!tutor) {
      tutor = await prisma.tutor.create({
        data: { nome: data.tutorNome, telefone: tutorTelefone },
      });
    }

    let pet = await prisma.pet.findFirst({
      where: { nome: data.petNome, tutorId: tutor.id },
    });
    if (!pet) {
      pet = await prisma.pet.create({
        data: { nome: data.petNome, especie: data.especie, tutorId: tutor.id },
      });
    }

    const internacao = await prisma.internacao.create({
      data: { ...data, petId: pet.id },
      include: { ...petInclude, medicacoes: true },
    });
    return c.json(parseMeds(internacao), 201);
  })

  .get('/:id', async (c) => {
    const row = await prisma.internacao.findUnique({
      where: { id: c.req.param('id') },
      include: { ...petInclude, medicacoes: true },
    });
    if (!row) return c.json({ error: 'Internação não encontrada.' }, 404);
    return c.json(parseMeds(row));
  })

  .patch('/:id', zValidator('json', updateSchema), async (c) => {
    const row = await prisma.internacao.update({
      where: { id: c.req.param('id') },
      data: c.req.valid('json'),
      include: { ...petInclude, medicacoes: true },
    });
    return c.json(parseMeds(row));
  })

  .delete('/:id', async (c) => {
    await prisma.internacao.delete({ where: { id: c.req.param('id') } });
    return c.body(null, 204);
  })

  // ── Medicações ───────────────────────────────────────────────
  .post('/:id/medicacoes', zValidator('json', medicacaoSchema), async (c) => {
    const { nome, horarios, cor } = c.req.valid('json');
    const med = await prisma.medicacao.create({
      data: {
        nome,
        horarios: JSON.stringify(horarios),
        cor,
        internacaoId: c.req.param('id'),
      },
    });
    return c.json({ ...med, horarios }, 201);
  })

  .delete('/:id/medicacoes/:medId', async (c) => {
    await prisma.medicacao.delete({ where: { id: c.req.param('medId') } });
    return c.body(null, 204);
  });
