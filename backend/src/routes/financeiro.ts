import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const pagamentoSchema = z.object({
  internacaoId: z.string().min(1),
  formaPagamentoId: z.string().min(1),
  valor: z.number().positive(),
  pagoEm: z.string().date().optional(),
});

function resumoFinanceiro(internacao: { entradaEm: Date; dataSaida: Date | null; leito: { valorDiaria: number } | null; pagamentos: { valor: number }[] }) {
  const hoje = new Date();
  const fim = internacao.dataSaida && internacao.dataSaida < hoje ? internacao.dataSaida : hoje;
  const diarias = Math.max(1, Math.ceil((fim.getTime() - internacao.entradaEm.getTime()) / 86_400_000));
  const valorTotal = diarias * (internacao.leito?.valorDiaria ?? 0);
  const valorPago = internacao.pagamentos.reduce((total, pagamento) => total + pagamento.valor, 0);
  return { diarias, valorTotal, valorPago, saldo: Math.max(0, valorTotal - valorPago), encerrada: Boolean(internacao.dataSaida && internacao.dataSaida <= hoje) };
}

export const financeiroRoutes = new Hono()
  .get('/', async (c) => {
    const [internacoes, formasPagamento] = await Promise.all([
      prisma.internacao.findMany({
        include: { pet: { include: { tutor: true } }, leito: true, pagamentos: { include: { formaPagamento: true }, orderBy: { pagoEm: 'desc' } } },
        orderBy: { entradaEm: 'desc' },
      }),
      prisma.formaPagamento.findMany({ orderBy: { nome: 'asc' } }),
    ]);
    return c.json({ internacoes: internacoes.map((internacao) => ({ ...internacao, financeiro: resumoFinanceiro(internacao) })), formasPagamento });
  })
  .post('/pagamentos', zValidator('json', pagamentoSchema), async (c) => {
    const { internacaoId, formaPagamentoId, valor, pagoEm } = c.req.valid('json');
    const pagamento = await prisma.pagamento.create({
      data: { internacaoId, formaPagamentoId, valor, pagoEm: pagoEm ? new Date(`${pagoEm}T12:00:00.000Z`) : new Date() },
      include: { formaPagamento: true },
    });
    return c.json(pagamento, 201);
  });