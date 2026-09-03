import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';

export const petsRoutes = new Hono().get('/', async (c) => {
  const pets = await prisma.pet.findMany({
    include: { tutor: { select: { id: true, nome: true, telefone: true } } },
    orderBy: { nome: 'asc' },
  });
  return c.json(pets);
});