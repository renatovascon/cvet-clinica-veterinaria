import { InternacoesBoard } from '@/components/internacoes/internacoes-board';

export const metadata = { title: 'Internações — CVET' };

export default function InternacoesPage() {
  return (
    <main className="flex min-h-full flex-col gap-6 p-6 lg:p-10">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-moss">Módulo Clínico</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-ink">
          Internações
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Visão operacional do setor com registro rápido de novos pacientes, status clínico e próxima medicação.
        </p>
      </header>

      <InternacoesBoard />
    </main>
  );
}
