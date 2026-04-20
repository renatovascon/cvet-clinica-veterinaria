import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { internacoesRoutes } from '../routes/internacoes.js';

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    internacao: {
      findMany:   vi.fn(),
      findUnique: vi.fn(),
      create:     vi.fn(),
      update:     vi.fn(),
      delete:     vi.fn(),
    },
    tutor: {
      findFirst: vi.fn(),
      create:    vi.fn(),
    },
    pet: {
      findFirst: vi.fn(),
      create:    vi.fn(),
    },
    medicacao: {
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const fakeInternacao = () => ({
  id: 'int-1',
  petNome: 'Luna',
  especie: 'Canina',
  tutorNome: 'João',
  entradaEm: new Date('2026-04-18T09:00:00'),
  status: 'estavel',
  proximaMedicacao: '08:00',
  observacao: '',
  petId: 'pet-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  medicacoes: [],
  pet: null,
});

const app = new Hono().route('/api/internacoes', internacoesRoutes);

async function prismaMock() {
  const { prisma } = await import('../lib/prisma.js');
  return prisma;
}

beforeEach(async () => {
  const p = await prismaMock();
  vi.mocked(p.internacao.findMany).mockResolvedValue([fakeInternacao()] as never);
  vi.mocked(p.internacao.findUnique).mockResolvedValue(fakeInternacao() as never);
  vi.mocked(p.internacao.create).mockResolvedValue(fakeInternacao() as never);
  vi.mocked(p.internacao.update).mockResolvedValue(fakeInternacao() as never);
  vi.mocked(p.internacao.delete).mockResolvedValue(undefined as never);
  vi.mocked(p.tutor.findFirst).mockResolvedValue(null);
  vi.mocked(p.tutor.create).mockResolvedValue({ id: 'tutor-1', nome: 'João', telefone: '11999', email: null, createdAt: new Date(), updatedAt: new Date() });
  vi.mocked(p.pet.findFirst).mockResolvedValue(null);
  vi.mocked(p.pet.create).mockResolvedValue({ id: 'pet-1', nome: 'Luna', especie: 'Canina', raca: null, dataNascimento: null, tutorId: 'tutor-1', createdAt: new Date(), updatedAt: new Date() });
});

describe('GET /api/internacoes', () => {
  it('retorna 200 com lista de internações', async () => {
    const res = await app.request('/api/internacoes');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });
});

describe('GET /api/internacoes/:id', () => {
  it('retorna 200 quando internação existe', async () => {
    const res = await app.request('/api/internacoes/int-1');
    expect(res.status).toBe(200);
  });

  it('retorna 404 quando internação não existe', async () => {
    const p = await prismaMock();
    vi.mocked(p.internacao.findUnique).mockResolvedValueOnce(null);
    const res = await app.request('/api/internacoes/nao-existe');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/internacoes', () => {
  it('retorna 400 para dados inválidos', async () => {
    const res = await app.request('/api/internacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ petNome: 'Luna' }),
    });
    expect(res.status).toBe(400);
  });

  it('retorna 201 para dados válidos', async () => {
    const res = await app.request('/api/internacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        petNome: 'Luna',
        especie: 'Canina',
        tutorNome: 'João',
        tutorTelefone: '11999990001',
        status: 'estavel',
        proximaMedicacao: '08:00',
        observacao: '',
      }),
    });
    expect(res.status).toBe(201);
  });
});

describe('PATCH /api/internacoes/:id', () => {
  it('atualiza o status da internação', async () => {
    const res = await app.request('/api/internacoes/int-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'critico' }),
    });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/internacoes/:id', () => {
  it('retorna 204 ao deletar', async () => {
    const res = await app.request('/api/internacoes/int-1', { method: 'DELETE' });
    expect(res.status).toBe(204);
  });
});
