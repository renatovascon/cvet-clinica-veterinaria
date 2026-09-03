import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { calcularHorarios } from '../lib/horarios.js';

const statusSchema = z.enum(['estavel', 'observacao', 'critico']);

const medicacaoSchema = z.object({
  nome:            z.string().min(1),
  descricao:       z.string().trim().optional().default(''),
  primeiroHorario: z.string().regex(/^\d{2}:\d{2}$/),
  frequenciaHoras: z.number().int().positive(),
  fimEm:           z.string().optional(),
  cor:             z.string().default('bg-teal-500'),
  via:             z.string().default('Oral'),
  unidade:         z.string().default('mg'),
  quantidade:      z.number().positive().default(1),
  valorDose:       z.number().min(0).default(0),
  dosesAplicadas:  z.number().int().min(0).default(0),
});

const createSchema = z.object({
  petId:            z.string().min(1),
  leitoId:          z.string().trim().min(1),
  entradaEm:        z.string().date(),
  dataSaida:        z.string().date(),
  descricao:        z.string().trim().min(1),
  status:           statusSchema.default('estavel'),
  proximaMedicacao: z.string().optional().default(''),
  observacao:       z.string().optional().default(''),
  medicacoes:       z.array(medicacaoSchema).optional().default([]),
});

const updateSchema = z.object({
  status:           statusSchema.optional(),
  proximaMedicacao: z.string().min(1).optional(),
  observacao:       z.string().optional(),
});

const internacaoInclude = { pet: { include: { tutor: true } }, leito: true } as const;

function calcularDiarias(entradaEm: Date, dataSaida: Date, valorDiaria: number) {
  const dias = Math.ceil((dataSaida.getTime() - entradaEm.getTime()) / 86_400_000);
  return { quantidadeDiarias: Math.max(1, dias), valorDiarias: Math.max(1, dias) * valorDiaria };
}

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
      where: { baixa: false },
      orderBy: { entradaEm: 'desc' },
      include: { ...internacaoInclude, medicacoes: true },
    });
    return c.json(rows.map(parseMeds));
  })

  .post('/', zValidator('json', createSchema), async (c) => {
    const { medicacoes, petId, ...data } = c.req.valid('json');
    const entradaEm = new Date(`${data.entradaEm}T00:00:00.000Z`);
    const dataSaida = new Date(`${data.dataSaida}T00:00:00.000Z`);

    if (dataSaida < entradaEm) return c.json({ error: 'A data de saída deve ser posterior à entrada.' }, 400);

    const leito = await prisma.leito.findUnique({ where: { id: data.leitoId } });
    if (!leito) return c.json({ error: 'Selecione um leito válido.' }, 400);

    const conflito = await prisma.internacao.findFirst({
      where: {
        leitoId: leito.id,
        entradaEm: { lte: dataSaida },
        dataSaida: { gte: entradaEm },
      },
      select: { petNome: true, entradaEm: true, dataSaida: true },
    });
    if (conflito) {
      return c.json({
        error: `O leito ${leito.id} já está reservado para ${conflito.petNome} no período selecionado.`,
      }, 409);
    }

    const diarias = calcularDiarias(entradaEm, dataSaida, leito.valorDiaria);

    const pet = await prisma.pet.findUnique({ where: { id: petId }, include: { tutor: true } });
    if (!pet) return c.json({ error: 'Pet não encontrado.' }, 404);

    const internacao = await prisma.internacao.create({
      data: {
        ...data,
        entradaEm,
        dataSaida,
        ...diarias,
        petId: pet.id,
        petNome: pet.nome,
        especie: pet.especie,
        tutorNome: pet.tutor.nome,
        medicacoes: {
          create: medicacoes.map((m) => ({
            nome:            m.nome,
            horarios:        JSON.stringify(calcularHorarios(m.primeiroHorario, m.frequenciaHoras)),
            cor:             m.cor,
            via:             m.via,
            unidade:         m.unidade,
            quantidade:      m.quantidade,
            valorDose:       m.valorDose,
            dosesAplicadas:  m.dosesAplicadas,
            frequenciaHoras: m.frequenciaHoras,
            primeiroHorario: m.primeiroHorario,
            fimEm:           m.fimEm ? new Date(m.fimEm) : null,
          })),
        },
      },
      include: { ...internacaoInclude, medicacoes: true },
    });
    return c.json(parseMeds(internacao), 201);
  })

  .get('/:id', async (c) => {
    const row = await prisma.internacao.findUnique({
      where: { id: c.req.param('id') },
      include: { ...internacaoInclude, medicacoes: true },
    });
    if (!row) return c.json({ error: 'Internação não encontrada.' }, 404);
    return c.json(parseMeds(row));
  })

  .patch('/:id', zValidator('json', updateSchema), async (c) => {
    const row = await prisma.internacao.update({
      where: { id: c.req.param('id') },
      data: c.req.valid('json'),
      include: { ...internacaoInclude, medicacoes: true },
    });
    return c.json(parseMeds(row));
  })

  .delete('/:id', async (c) => {
    await prisma.internacao.delete({ where: { id: c.req.param('id') } });
    return c.body(null, 204);
  })

  // ── Medicações ───────────────────────────────────────────────
  .post('/:id/medicacoes', zValidator('json', medicacaoSchema), async (c) => {
    const { nome, descricao, primeiroHorario, frequenciaHoras, fimEm, cor, via, unidade, quantidade, valorDose, dosesAplicadas } = c.req.valid('json');
    const horarios = calcularHorarios(primeiroHorario, frequenciaHoras);
    const med = await prisma.medicacao.create({
      data: {
        nome,
        descricao,
        horarios:        JSON.stringify(horarios),
        cor,
        via,
        unidade,
        quantidade,
        valorDose,
        dosesAplicadas,
        frequenciaHoras,
        primeiroHorario,
        fimEm:           fimEm ? new Date(fimEm) : null,
        internacaoId:    c.req.param('id'),
      },
    });
    return c.json({ ...med, horarios }, 201);
  })

  .patch('/:id/medicacoes/:medId', zValidator('json', medicacaoSchema), async (c) => {
    const { nome, descricao, primeiroHorario, frequenciaHoras, fimEm, cor, via, unidade, quantidade, valorDose, dosesAplicadas } = c.req.valid('json');
    const horarios = calcularHorarios(primeiroHorario, frequenciaHoras);
    const med = await prisma.medicacao.update({
      where: { id: c.req.param('medId'), internacaoId: c.req.param('id') },
      data: {
        nome,
        descricao,
        horarios: JSON.stringify(horarios),
        cor,
        via,
        unidade,
        quantidade,
        valorDose,
        dosesAplicadas,
        frequenciaHoras,
        primeiroHorario,
        fimEm: fimEm ? new Date(fimEm) : null,
      },
    });
    return c.json({ ...med, horarios });
  })

  .delete('/:id/medicacoes/:medId', async (c) => {
    await prisma.medicacao.delete({ where: { id: c.req.param('medId') } });
    return c.body(null, 204);
  });
