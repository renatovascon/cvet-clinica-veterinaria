import Link from 'next/link';
import { appInfo } from '@/lib/app-info';

const highlights = [
  'Gestão de internação centralizada',
  'Evolução clínica e alertas',
  'Base pronta para análise de dados',
];

const steps = [
  {
    title: '1. Entrada do pet',
    text: 'Registro do paciente e do tutor com validações básicas de internação.',
  },
  {
    title: '2. Acompanhamento clínico',
    text: 'Lançamento de sinais vitais, observações e pendências da medicação.',
  },
  {
    title: '3. Visualização do estado',
    text: 'Dashboard com a situação atual dos internados e visão operacional da equipe.',
  },
];

export default function HomePage() {
  return (
    <main className="flex min-h-full flex-col gap-8 p-6 lg:p-10">
      <section className="grid gap-8 rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-glow backdrop-blur md:p-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col justify-between gap-8">
          <div className="space-y-5">
            <span className="inline-flex w-fit items-center rounded-full border border-moss/15 bg-moss/10 px-4 py-1 text-sm font-semibold text-moss">
              Projeto Integrador III
            </span>
            <div className="space-y-4">
              <h1 className="max-w-2xl font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-ink md:text-5xl">
                CVET, gestão veterinária focada em internação e decisão clínica.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Base inicial da plataforma para organizar internações, acompanhar evolução diária e preparar a
                clínica para um fluxo digital confiável, acessível e pronto para análise de dados.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {highlights.map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700"
              >
                {item}
              </span>
            ))}
          </div>

          <div>
            <Link
              href="/internacoes"
              className="inline-flex items-center rounded-full bg-moss px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95"
            >
              Abrir módulo de internações
            </Link>
          </div>
        </div>

        <div className="grid gap-4 rounded-[1.75rem] bg-[linear-gradient(180deg,#0f172a_0%,#12263a_100%)] p-6 text-white">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
            <p className="text-sm uppercase tracking-[0.35em] text-sand/80">Foco da solução</p>
            <p className="mt-4 text-2xl font-semibold leading-tight">
              Fluxo clínico para pets internados com visão operacional clara.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.25rem] bg-white/10 p-4">
              <p className="text-sm text-white/70">Arquitetura</p>
              <p className="mt-2 text-lg font-semibold">MVC + padrões de projeto</p>
            </div>
            <div className="rounded-[1.25rem] bg-white/10 p-4">
              <p className="text-sm text-white/70">Banco</p>
              <p className="mt-2 text-lg font-semibold">SQLite / PostgreSQL</p>
            </div>
            <div className="rounded-[1.25rem] bg-white/10 p-4">
              <p className="text-sm text-white/70">Interface</p>
              <p className="mt-2 text-lg font-semibold">Web moderna e responsiva</p>
            </div>
            <div className="rounded-[1.25rem] bg-white/10 p-4">
              <p className="text-sm text-white/70">Entrega</p>
              <p className="mt-2 text-lg font-semibold">Cloud + CI/CD</p>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5 text-sm text-white/80">
            <p className="font-semibold text-white">Contexto</p>
            <p className="mt-2 leading-6">
              {appInfo.name} foi pensado para a clínica em {appInfo.location}, com foco em organizar a internação e
              reduzir ruído operacional no dia a dia.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-glow backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-coral">Problema</p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">
            Internações sem centralização geram perda de contexto e mais risco operacional.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            A clínica precisa consultar o histórico de cada pet de forma mais rápida, manter a evolução clínica em um
            só lugar e reduzir a dependência de anotações manuais.
          </p>
        </article>

        <article className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-glow backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-moss">Fluxo inicial</p>
          <div className="mt-6 grid gap-4">
            {steps.map((step) => (
              <div key={step.title} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-5">
                <p className="font-semibold text-ink">{step.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
