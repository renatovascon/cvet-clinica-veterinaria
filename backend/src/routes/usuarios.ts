import { randomBytes, scryptSync } from 'node:crypto';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const usuarioSchema = z.object({
  nome: z.string().trim().min(2),
  cpf: z.string().trim().min(11).max(14),
  email: z.string().trim().email(),
  senha: z.string().min(6),
});

function criarSenhaHash(senha: string) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(senha, salt, 64).toString('hex')}`;
}

const usuarioPublico = { id: true, nome: true, cpf: true, email: true, createdAt: true } as const;

export const usuariosRoutes = new Hono()
  .get('/', async (c) => c.json(await prisma.usuario.findMany({ select: usuarioPublico, orderBy: { nome: 'asc' } })))
  .post('/', zValidator('json', usuarioSchema), async (c) => {
    const { nome, cpf, email, senha } = c.req.valid('json');
    const cpfNormalizado = cpf.replace(/\D/g, '');
    const emailNormalizado = email.toLowerCase();
    const existente = await prisma.usuario.findFirst({ where: { OR: [{ email: emailNormalizado }, { cpf: cpfNormalizado }] } });

    if (existente) return c.json({ message: 'Já existe um usuário com este CPF ou e-mail.' }, 409);

    const usuario = await prisma.usuario.create({
      data: { nome, cpf: cpfNormalizado, email: emailNormalizado, senhaHash: criarSenhaHash(senha) },
      select: usuarioPublico,
    });
    return c.json(usuario, 201);
  });