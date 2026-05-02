'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Internacao, InternacaoStatus } from '@/types/internacao';
import { InternacaoCard } from './internacao-card';
import { InternacaoForm } from './internacao-form';

const STATUS_FILTROS: { value: InternacaoStatus; label: string }[] = [
  { value: 'critico',    label: 'Críticos'    },
  { value: 'observacao', label: 'Observação'  },
  { value: 'estavel',    label: 'Estáveis'    },
];

export function InternacoesBoard() {
  const [internacoes, setInternacoes]     = useState<Internacao[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [busca, setBusca]                 = useState('');
  const [filtroStatus, setFiltroStatus]   = useState<InternacaoStatus | null>(null);

  useEffect(() => {
    fetch('/api/internacoes')
      .then((res) => res.json())
      .then((data: Internacao[]) => setInternacoes(data))
      .catch(() => setError('Erro ao carregar internações.'))
      .finally(() => setLoading(false));
  }, []);

  const resumo = useMemo(() => ({
    total:      internacoes.length,
    criticos:   internacoes.filter((i) => i.status === 'critico').length,
    observacao: internacoes.filter((i) => i.status === 'observacao').length,
    estaveis:   internacoes.filter((i) => i.status === 'estavel').length,
  }), [internacoes]);

  const internacoesFiltradas = useMemo(() => {
    const q = busca.toLowerCase().trim();
    return internacoes
      .filter((i) => !filtroStatus || i.status === filtroStatus)
      .filter((i) => !q || i.petNome.toLowerCase().includes(q) || i.tutorNome.toLowerCase().includes(q));
  }, [internacoes, busca, filtroStatus]);

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

  function toggleStatus(status: InternacaoStatus) {
    setFiltroStatus((prev) => (prev === status ? null : status));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      {/* Left: summary + form */}
      <div className="grid content-start gap-4">
        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
          <ResumoItem label="Internados" value={resumo.total} />
          <ResumoItem
            label="Críticos" value={resumo.criticos}
            active={filtroStatus === 'critico'}
            onClick={() => toggleStatus('critico')}
          />
          <ResumoItem
            label="Observação" value={resumo.observacao}
            active={filtroStatus === 'observacao'}
            onClick={() => toggleStatus('observacao')}
          />
          <ResumoItem
            label="Estáveis" value={resumo.estaveis}
            active={filtroStatus === 'estavel'}
            onClick={() => toggleStatus('estavel')}
          />
        </div>
        <InternacaoForm onCreate={handleCreate} />
      </div>

      {/* Right: search + filtered list */}
      <div className="grid content-start gap-4">
        {/* Search + status pills */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por pet ou tutor…"
              className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-9 text-sm outline-none transition focus:border-moss"
            />
            {busca && (
              <button
                onClick={() => setBusca('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {filtroStatus && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Filtro:</span>
              {STATUS_FILTROS.filter((f) => f.value === filtroStatus).map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFiltroStatus(null)}
                  className="flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
                >
                  {f.label} <X size={11} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* List */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-1" style={{ maxHeight: '72vh' }}>
          {loading && <p className="text-sm text-slate-500">Carregando internações...</p>}
          {error   && <p className="text-sm text-red-500">{error}</p>}

          {!loading && internacoesFiltradas.length === 0 && (
            <p className="text-sm text-slate-500">
              {busca || filtroStatus ? 'Nenhum resultado para os filtros aplicados.' : 'Nenhuma internação ativa.'}
            </p>
          )}

          {internacoesFiltradas.map((internacao) => (
            <InternacaoCard key={internacao.id} internacao={internacao} />
          ))}
        </div>
      </div>
    </div>
  );
}

type ResumoItemProps = {
  label: string;
  value: number;
  active?: boolean;
  onClick?: () => void;
};

function ResumoItem({ label, value, active, onClick }: ResumoItemProps) {
  const base = 'rounded-xl p-4 transition';
  const style = onClick
    ? `cursor-pointer select-none ${active ? 'bg-moss/10 ring-2 ring-moss/40' : 'bg-slate-50 hover:bg-slate-100'}`
    : 'bg-slate-50';

  return (
    <div className={`${base} ${style}`} onClick={onClick}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
