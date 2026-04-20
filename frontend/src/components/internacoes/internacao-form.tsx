'use client';

import { FormEvent, useState } from 'react';
import { Internacao, InternacaoStatus } from '@/types/internacao';

type InternacaoFormProps = {
  onCreate: (data: Omit<Internacao, 'id' | 'entradaEm'>) => Promise<void>;
};

const statusOptions: { value: InternacaoStatus; label: string }[] = [
  { value: 'estavel', label: 'Estável' },
  { value: 'observacao', label: 'Observação' },
  { value: 'critico', label: 'Crítico' },
];

export function InternacaoForm({ onCreate }: InternacaoFormProps) {
  const [petNome, setPetNome] = useState('');
  const [especie, setEspecie] = useState('Canina');
  const [tutorNome, setTutorNome] = useState('');
  const [status, setStatus] = useState<InternacaoStatus>('observacao');
  const [proximaMedicacao, setProximaMedicacao] = useState('');
  const [observacao, setObservacao] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!petNome || !tutorNome || !proximaMedicacao) return;

    setSubmitting(true);
    await onCreate({ petNome, especie, tutorNome, status, proximaMedicacao, observacao });
    setSubmitting(false);

    setPetNome('');
    setEspecie('Canina');
    setTutorNome('');
    setStatus('observacao');
    setProximaMedicacao('');
    setObservacao('');
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-900">Nova internação</h2>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Nome do pet
        <input
          value={petNome}
          onChange={(e) => setPetNome(e.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus:border-moss"
          placeholder="Ex: Mel"
          required
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Espécie
          <select
            value={especie}
            onChange={(e) => setEspecie(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus:border-moss"
          >
            <option>Canina</option>
            <option>Felina</option>
            <option>Outros</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as InternacaoStatus)}
            className="rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus:border-moss"
          >
            {statusOptions.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Nome do tutor
        <input
          value={tutorNome}
          onChange={(e) => setTutorNome(e.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus:border-moss"
          placeholder="Ex: Ana Lima"
          required
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Próxima medicação
        <input
          value={proximaMedicacao}
          onChange={(e) => setProximaMedicacao(e.target.value)}
          type="time"
          className="rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus:border-moss"
          required
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Observação
        <textarea
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          className="min-h-24 rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus:border-moss"
          placeholder="Ex: manter monitoramento da temperatura"
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-moss px-4 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
      >
        {submitting ? 'Registrando...' : 'Registrar internação'}
      </button>
    </form>
  );
}
