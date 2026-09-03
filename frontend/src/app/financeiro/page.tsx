'use client';

import { FormEvent, useEffect, useState } from 'react';
import { WalletCards } from 'lucide-react';

type FormaPagamento = { id: string; nome: string };
type ItemFinanceiro = {
  id: string; petNome: string; dataSaida: string | null; leito: { nome: string } | null;
  pet: { tutor: { nome: string; telefone: string } } | null;
  financeiro: { diarias: number; valorTotal: number; valorPago: number; saldo: number; encerrada: boolean };
};

const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function FinanceiroPage() {
  const [internacoes, setInternacoes] = useState<ItemFinanceiro[]>([]);
  const [formas, setFormas] = useState<FormaPagamento[]>([]);
  const [erro, setErro] = useState('');

  async function carregar() {
    try {
      const response = await fetch('/api/financeiro');
      const data = await response.json();
      setInternacoes(data.internacoes);
      setFormas(data.formasPagamento);
    } catch { setErro('Não foi possível carregar os dados financeiros.'); }
  }

  useEffect(() => { carregar(); }, []);

  async function registrarPagamento(event: FormEvent<HTMLFormElement>, internacaoId: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/financeiro/pagamentos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ internacaoId, formaPagamentoId: form.get('formaPagamentoId'), valor: Number(form.get('valor')), pagoEm: form.get('pagoEm') }) });
    if (!response.ok) { setErro('Não foi possível registrar o pagamento.'); return; }
    await carregar();
  }

  return <main className="flex min-h-full flex-col gap-6 p-6 lg:p-10">
    <header><p className="text-sm font-semibold uppercase tracking-[0.3em] text-moss">Financeiro</p><h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">Diárias e pagamentos</h1><p className="mt-2 text-sm text-slate-500">Valores calculados até a data atual ou a data de saída da internação.</p></header>
    {erro && <p role="alert" className="text-sm font-medium text-red-600">{erro}</p>}
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"><div className="divide-y divide-slate-100">{internacoes.map((item) => <article key={item.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center"><div><div className="flex items-center gap-2"><WalletCards size={18} className="text-moss" /><h2 className="font-semibold text-ink">{item.petNome}</h2></div><p className="mt-1 text-sm text-slate-500">Tutor: {item.pet?.tutor.nome ?? 'Não informado'} · {item.pet?.tutor.telefone ?? ''}</p><p className="mt-1 text-sm text-slate-500">{item.leito?.nome ?? 'Sem leito'} · {item.financeiro.diarias} diária(s) · {item.financeiro.encerrada ? 'Internação encerrada' : 'Em internação'}</p></div><div className="grid gap-2 text-sm lg:min-w-72"><p>Total: <strong>{money(item.financeiro.valorTotal)}</strong> · Pago: {money(item.financeiro.valorPago)} · Saldo: <strong className="text-moss">{money(item.financeiro.saldo)}</strong></p>{item.financeiro.encerrada && item.financeiro.saldo > 0 && <form onSubmit={(event) => registrarPagamento(event, item.id)} className="grid gap-2 sm:grid-cols-3"><select name="formaPagamentoId" required className="rounded-lg border border-slate-300 px-2 py-2 text-sm"><option value="">Pagamento</option>{formas.map((forma) => <option key={forma.id} value={forma.id}>{forma.nome}</option>)}</select><input name="valor" type="number" min="0.01" step="0.01" defaultValue={item.financeiro.saldo} required className="rounded-lg border border-slate-300 px-2 py-2 text-sm" /><input name="pagoEm" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required className="rounded-lg border border-slate-300 px-2 py-2 text-sm" /><button className="rounded-lg bg-moss px-3 py-2 text-sm font-semibold text-white sm:col-span-3">Registrar pagamento</button></form>}</div></article>)}{internacoes.length === 0 && <p className="p-8 text-center text-sm text-slate-500">Nenhuma internação para exibir.</p>}</div></section>
  </main>;
}