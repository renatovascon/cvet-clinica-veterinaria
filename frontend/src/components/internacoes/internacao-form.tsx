'use client';

import React, { useMemo, useState } from 'react';
import { Internacao, InternacaoStatus } from '@/types/internacao';
import { calcularHorarios, FREQUENCIAS } from '@/lib/horarios';

type InternacaoFormProps = {
  onCreate: (data: Omit<Internacao, 'id' | 'entradaEm'>) => Promise<void>;
};

type FormMed = {
  nome: string;
  primeiroHorario: string;
  frequenciaHoras: number;
  fimEm: string;
  cor: string;
  via: string;
  unidade: string;
  quantidade: number;
};

const statusOptions: { value: InternacaoStatus; label: string }[] = [
  { value: 'estavel',    label: 'Estável' },
  { value: 'observacao', label: 'Observação' },
  { value: 'critico',    label: 'Crítico' },
];

const COR_OPTIONS = ['bg-teal-500','bg-blue-500','bg-orange-500','bg-purple-500','bg-rose-500','bg-yellow-500'];
const UNIDADES    = ['Borrifada','Cápsula','cm','Comprimido','Drágea','g','Gota(s)','l','mcg','Medida','mg','ml','UN','Sachê','UI'];
const VIAS        = ['Enema','Epidural','Inalatória','Intramuscular','Intraóssea','Intraperitoneal','Intravenosa','Oftálmica','Oral','Otológica','Sonda','Subcutânea','Tópica'];

function defaultFimEm() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

export function InternacaoForm({ onCreate }: InternacaoFormProps) {
  const [petNome, setPetNome]         = useState('');
  const [especie, setEspecie]         = useState('Canina');
  const [tutorNome, setTutorNome]     = useState('');
  const [tutorTelefone, setTutorTelefone] = useState('');
  const [tutorCpf, setTutorCpf]       = useState('');
  const [status, setStatus]           = useState<InternacaoStatus>('observacao');
  const [manualHora, setManualHora]   = useState('');
  const [manualNome, setManualNome]   = useState('');
  const [observacao, setObservacao]   = useState('');
  const [medicacoes, setMedicacoes]   = useState<FormMed[]>([]);
  const [submitting, setSubmitting]   = useState(false);

  const agora = new Date().toTimeString().slice(0, 5);

  const autoMed = useMemo(() => {
    const all = medicacoes
      .filter((m) => m.nome && m.primeiroHorario)
      .flatMap((m) =>
        calcularHorarios(m.primeiroHorario, m.frequenciaHoras).map((h) => ({ h, nome: m.nome }))
      )
      .sort((a, b) => a.h.localeCompare(b.h));
    return all.find((x) => x.h >= agora) ?? all[0] ?? null;
  }, [medicacoes, agora]);

  const proxHora = autoMed?.h ?? manualHora;
  const proxNome = autoMed?.nome ?? manualNome;

  function addMedicacao() {
    setMedicacoes((prev) => [
      ...prev,
      { nome: '', primeiroHorario: '08:00', frequenciaHoras: 8, fimEm: defaultFimEm(),
        cor: 'bg-teal-500', via: 'Oral', unidade: 'mg', quantidade: 1 },
    ]);
  }

  function removeMedicacao(i: number) {
    setMedicacoes((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateMed(i: number, patch: Partial<FormMed>) {
    setMedicacoes((prev) => prev.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  }

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!petNome || !tutorNome || !tutorTelefone || !proxHora) return;

    const proximaMedicacao = proxNome ? `${proxHora} — ${proxNome}` : proxHora;

    const medicacoesValidas = medicacoes
      .filter((m) => m.nome.trim())
      .map((m) => ({
        ...m,
        horarios: calcularHorarios(m.primeiroHorario, m.frequenciaHoras),
      }));

    setSubmitting(true);
    await onCreate({
      petNome, especie, tutorNome, tutorTelefone, tutorCpf: tutorCpf || undefined,
      status, proximaMedicacao, observacao, medicacoes: medicacoesValidas,
    });
    setSubmitting(false);

    setPetNome(''); setEspecie('Canina'); setTutorNome(''); setTutorTelefone('');
    setTutorCpf(''); setStatus('observacao'); setManualHora(''); setManualNome('');
    setObservacao(''); setMedicacoes([]);
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

      <div className="grid gap-4 sm:grid-cols-2">
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
          Telefone do tutor
          <input
            value={tutorTelefone}
            onChange={(e) => setTutorTelefone(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus:border-moss"
            placeholder="Ex: 11999990001"
            required
          />
        </label>

      </div>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          CPF do tutor
          <input
            value={tutorCpf}
            onChange={(e) => setTutorCpf(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus:border-moss"
            placeholder="Ex: 000.000.000-00"
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
