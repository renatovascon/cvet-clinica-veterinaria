import Link from 'next/link';
import { Internacao } from '@/types/internacao';
import { StatusBadge } from './status-badge';

type InternacaoCardProps = {
  internacao: Internacao;
};

function resolverProximaMedicacao(internacao: Internacao): string {
  const meds = internacao.medicacoes ?? [];
  if (!meds.length) return internacao.proximaMedicacao;

  const agora = new Date().toTimeString().slice(0, 5);
  const todas = meds
    .flatMap((m) => m.horarios.map((h) => ({ horario: h, nome: m.nome })))
    .sort((a, b) => a.horario.localeCompare(b.horario));

  const proxima = todas.find((m) => m.horario >= agora) ?? todas[0];
  return `${proxima.horario} — ${proxima.nome}`;
}

export function InternacaoCard({ internacao }: InternacaoCardProps) {
  const entradaFormatada = new Date(internacao.entradaEm).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
  const proximaMedicacao = resolverProximaMedicacao(internacao);

  return (
    <Link href={`/internacoes/${internacao.id}`} className="block">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-moss hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{internacao.id}</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">{internacao.petNome}</h3>
            <p className="text-sm text-slate-600">
              {internacao.especie} • Tutor: {internacao.tutorNome}
            </p>
          </div>
          <StatusBadge status={internacao.status} />
        </div>

        <div className="mt-5 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
          <p>
            <span className="font-semibold">Entrada:</span> {entradaFormatada}
          </p>
          <p>
            <span className="font-semibold">Próxima medicação:</span> {proximaMedicacao}
          </p>
        </div>

        <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">{internacao.observacao}</p>
      </article>
    </Link>
  );
}