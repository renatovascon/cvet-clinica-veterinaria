import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';

export const metadata = { title: 'Análise de Dados — CVET' };

export default function AnalyticsPage() {
  return (
    <main className="flex min-h-full flex-col gap-6 p-6 lg:p-10">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-moss">Relatórios</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-ink">
          Análise de Dados
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Estatísticas de internações registradas na clínica.
        </p>
      </header>

      <AnalyticsDashboard />
    </main>
  );
}
