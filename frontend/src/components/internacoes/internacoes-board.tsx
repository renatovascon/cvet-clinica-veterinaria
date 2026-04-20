'use client';

import { useEffect, useMemo, useState } from 'react';
import { Internacao } from '@/types/internacao';
import { InternacaoCard } from './internacao-card';
import { InternacaoForm } from './internacao-form';

export function InternacoesBoard() {
  const [internacoes, setInternacoes] = useState<Internacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/internacoes')
      .then((res) => res.json())
      .then((data: Internacao[]) => setInternacoes(data))
      .catch(() => setError('Erro ao carregar internações.'))
      .finally(() => setLoading(false));
  }, []);

  const resumo = useMemo(() => ({
    total: internacoes.length,
    criticos: internacoes.filter((i) => i.status === 'critico').length,
    observacao: internacoes.filter((i) => i.status === 'observacao').length,
    estaveis: internacoes.filter((i) => i.status === 'estavel').length,
  }), [internacoes]);

  async function handleCreate(data: Omit<Internacao, 'id' | 'entradaEm'>) {
    const res = await fetch('/api/internacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) return;
    const created: Internacao = await res.json();
    setInternacoes((current) => [created, ...current]);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="grid content-start gap-4">
        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
          <ResumoItem label="Internados" value={resumo.total} />
          <ResumoItem label="Críticos" value={resumo.criticos} />
          <ResumoItem label="Observação" value={resumo.observacao} />
          <ResumoItem label="Estáveis" value={resumo.estaveis} />
        </div>
        <InternacaoForm onCreate={handleCreate} />
      </div>

      <div className="grid content-start gap-4">
        {loading && (
          <p className="text-sm text-slate-500">Carregando internações...</p>
        )}
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        {!loading && internacoes.length === 0 && (
          <p className="text-sm text-slate-500">Nenhuma internação ativa.</p>
        )}
        {internacoes.map((internacao) => (
          <InternacaoCard key={internacao.id} internacao={internacao} />
        ))}
      </div>
    </div>
  );
}

type ResumoItemProps = { label: string; value: number };

function ResumoItem({ label, value }: ResumoItemProps) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
