'use client';

import { useEffect, useState } from 'react';
import { StatusDonut } from './status-donut';
import { EspecieBar } from './especie-bar';
import { VolumeLine } from './volume-line';

type AnalyticsData = {
  total: number;
  porStatus: { name: string; value: number }[];
  porEspecie: { name: string; value: number }[];
  porDia: { dia: string; internacoes: number }[];
};

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-500">Carregando dados...</p>;
  }

  if (!data) {
    return <p className="text-sm text-red-500">Erro ao carregar analytics.</p>;
  }

  const criticos = data.porStatus.find((s) => s.name === 'Crítico')?.value ?? 0;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de Internações" value={data.total} />
        <StatCard label="Estáveis" value={data.porStatus.find((s) => s.name === 'Estável')?.value ?? 0} color="text-moss" />
        <StatCard label="Em Observação" value={data.porStatus.find((s) => s.name === 'Observação')?.value ?? 0} color="text-amber-500" />
        <StatCard label="Críticos" value={criticos} color={criticos > 0 ? 'text-red-500' : undefined} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Distribuição por Status">
          <StatusDonut data={data.porStatus} />
        </ChartCard>

        <ChartCard title="Internações por Espécie">
          <EspecieBar data={data.porEspecie} />
        </ChartCard>
      </div>

      <ChartCard title="Entradas nos últimos 7 dias">
        <VolumeLine data={data.porDia} />
      </ChartCard>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className={`mt-2 text-4xl font-semibold ${color ?? 'text-slate-900'}`}>{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold text-slate-800">
        {title}
      </h2>
      {children}
    </div>
  );
}
