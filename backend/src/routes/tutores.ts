import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const tutorSchema = z.object({
  nome: z.string().trim().min(2),
  telefone: z.string().trim().min(8),
  cpf: z.string().trim().optional(),
  email: z.union([z.string().trim().email(), z.literal('')]).optional(),
  pets: z.array(z.object({
    nome: z.string().trim().min(1),
    especie: z.string().trim().min(1),
    raca: z.string().trim().optional(),
    dataNascimento: z.string().date().optional(),
  })).min(1, 'Cadastre ao menos um pet.'),
});

export const tutoresRoutes = new Hono()
  .get('/', async (c) => {
    const tutores = await prisma.tutor.findMany({
      include: { pets: { select: { id: true, nome: true, especie: true } } },
      orderBy: { nome: 'asc' },
    });
    return c.json(tutores);
  })
  .post('/', zValidator('json', tutorSchema), async (c) => {
    const { nome, telefone, cpf, email, pets } = c.req.valid('json');
    const tutorExistente = await prisma.tutor.findFirst({ where: { nome, telefone } });

    if (tutorExistente) {
      return c.json({ message: 'Já existe um tutor cadastrado com este nome e telefone.' }, 409);
    }

    const tutor = await prisma.tutor.create({
      data: {
        nome,
        telefone,
        cpf: cpf || null,
        email: email || null,
        pets: {
          create: pets.map((pet) => ({
            nome: pet.nome,
            especie: pet.especie,
            raca: pet.raca || null,
            dataNascimento: pet.dataNascimento ? new Date(pet.dataNascimento) : null,
          })),
        },
      },
      include: { pets: { select: { id: true, nome: true, especie: true } } },
    });
    return c.json(tutor, 201);
  });