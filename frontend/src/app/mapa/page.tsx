'use client';

import { useEffect, useState } from 'react';
import { Internacao } from '@/types/internacao';
import { MapaGrid } from '@/components/mapa/mapa-grid';

export default function MapaPage() {
  const [internacoes, setInternacoes] = useState<Internacao[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/internacoes')
      .then((r) => r.json())
      .then((data: Internacao[]) => setInternacoes(data))
      .catch(() => setError('Erro ao carregar internações.'))
      .finally(() => setLoading(false));
  }, []);

  const legendaMeds = internacoes
    .flatMap((p) => p.medicacoes ?? [])
    .reduce<{ nome: string; cor: string }[]>((acc, m) => {
      if (!acc.find((x) => x.nome === m.nome)) acc.push({ nome: m.nome, cor: m.cor });
      return acc;
    }, []);

  return (
    <main className="flex flex-col gap-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mapa de Execução</h1>
        <p className="mt-1 text-sm text-slate-500">
          Medicações dos pets internados por horário — coluna atual destacada em verde.
        </p>
      </div>

      {loading && <p className="text-sm text-slate-500">Carregando...</p>}
      {error   && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          {internacoes.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum pet internado no momento.</p>
          ) : (
            <MapaGrid internacoes={internacoes} />
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
