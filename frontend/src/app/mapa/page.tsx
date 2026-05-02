'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Internacao } from '@/types/internacao';
import { MapaGrid } from '@/components/mapa/mapa-grid';

function localYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function MapaPage() {
  const [internacoes, setInternacoes]   = useState<Internacao[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  useEffect(() => {
    fetch('/api/internacoes')
      .then((r) => r.json())
      .then((data: Internacao[]) => setInternacoes(data))
      .catch(() => setError('Erro ao carregar internações.'))
      .finally(() => setLoading(false));
  }, []);

  function addDays(n: number) {
    setSelectedDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + n);
      return next;
    });
  }

  const isToday = localYMD(selectedDate) === localYMD(new Date());

  const dateLabel = selectedDate.toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const legendaMeds = internacoes
    .flatMap((p) => p.medicacoes ?? [])
    .reduce<{ nome: string; cor: string }[]>((acc, m) => {
      if (!acc.find((x) => x.nome === m.nome)) acc.push({ nome: m.nome, cor: m.cor });
      return acc;
    }, []);

  return (
    <main className="flex flex-col gap-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mapa de Execução</h1>
          <p className="mt-1 text-sm text-slate-500">
            Medicações dos pets internados por horário — coluna atual destacada em verde.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => addDays(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="min-w-[180px] text-center">
            <p className="text-sm font-semibold capitalize text-slate-800">{dateLabel}</p>
            {!isToday && (
              <button
                onClick={() => setSelectedDate(new Date())}
                className="text-xs text-moss hover:underline"
              >
                Ir para hoje
              </button>
            )}
          </div>
          <button
            onClick={() => addDays(1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-slate-500">Carregando...</p>}
      {error   && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          {internacoes.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum pet internado no momento.</p>
          ) : (
            <MapaGrid internacoes={internacoes} selectedDate={selectedDate} />
          )}

          {legendaMeds.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {legendaMeds.map((m) => (
                <div key={m.nome} className="flex items-center gap-1.5">
                  <span className={`h-3 w-3 rounded-full ${m.cor}`} />
                  <span className="text-xs text-slate-600">{m.nome}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
