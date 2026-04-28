'use client';

import React, { useEffect, useState } from 'react';
import { Internacao, InternacaoStatus } from '@/types/internacao';

type InternacaoFormProps = {
  onCreate: (data: Omit<Internacao, 'id' | 'entradaEm'>) => Promise<void>;
};

type FormMed = { nome: string; horarios: string[]; cor: string };

const statusOptions: { value: InternacaoStatus; label: string }[] = [
  { value: 'estavel', label: 'Estável' },
  { value: 'observacao', label: 'Observação' },
  { value: 'critico', label: 'Crítico' },
];

const COR_OPTIONS = [
  'bg-teal-500',
  'bg-blue-500',
  'bg-orange-500',
  'bg-purple-500',
  'bg-rose-500',
  'bg-yellow-500',
];

export function InternacaoForm({ onCreate }: InternacaoFormProps) {
  const [petNome, setPetNome] = useState('');
  const [especie, setEspecie] = useState('Canina');
  const [tutorNome, setTutorNome] = useState('');
  const [tutorTelefone, setTutorTelefone] = useState('');
  const [status, setStatus] = useState<InternacaoStatus>('observacao');
  const [proxHora, setProxHora] = useState('');
  const [proxNome, setProxNome] = useState('');
  const [observacao, setObservacao] = useState('');
  const [medicacoes, setMedicacoes] = useState<FormMed[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const all = medicacoes
      .flatMap((m) => m.horarios.map((h) => ({ h, nome: m.nome })))
      .filter((x) => x.h)
      .sort((a, b) => a.h.localeCompare(b.h));
    if (all.length > 0) {
      setProxHora(all[0].h);
      setProxNome(all[0].nome);
    }
  }, [medicacoes]);

  function addMedicacao() {
    setMedicacoes((prev) => [...prev, { nome: '', horarios: [''], cor: 'bg-teal-500' }]);
  }

  function removeMedicacao(i: number) {
    setMedicacoes((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateMed(i: number, patch: Partial<FormMed>) {
    setMedicacoes((prev) => prev.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  }

  function addHorario(i: number) {
    setMedicacoes((prev) =>
      prev.map((m, idx) => (idx === i ? { ...m, horarios: [...m.horarios, ''] } : m)),
    );
  }

  function removeHorario(i: number, j: number) {
    setMedicacoes((prev) =>
      prev.map((m, idx) =>
        idx === i ? { ...m, horarios: m.horarios.filter((_, jdx) => jdx !== j) } : m,
      ),
    );
  }

  function setHorario(i: number, j: number, value: string) {
    setMedicacoes((prev) =>
      prev.map((m, idx) =>
        idx === i ? { ...m, horarios: m.horarios.map((h, jdx) => (jdx === j ? value : h)) } : m,
      ),
    );
  }

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!petNome || !tutorNome || !tutorTelefone || !proxHora) return;

    const proximaMedicacao = proxNome ? `${proxHora} — ${proxNome}` : proxHora;

    const medicacoesValidas = medicacoes
      .filter((m) => m.nome.trim())
      .map((m) => ({ ...m, horarios: m.horarios.filter(Boolean) }))
      .filter((m) => m.horarios.length > 0);

    setSubmitting(true);
    await onCreate({
      petNome, especie, tutorNome, tutorTelefone, status,
      proximaMedicacao, observacao, medicacoes: medicacoesValidas,
    });
    setSubmitting(false);

    setPetNome('');
    setEspecie('Canina');
    setTutorNome('');
    setTutorTelefone('');
    setStatus('observacao');
    setProxHora('');
    setProxNome('');
    setObservacao('');
    setMedicacoes([]);
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

      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Medicações</span>
          <button
            type="button"
            onClick={addMedicacao}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
          >
            + Adicionar medicação
          </button>
        </div>

        {medicacoes.map((med, i) => (
          <div key={i} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2">
              <input
                value={med.nome}
                onChange={(e) => updateMed(i, { nome: e.target.value })}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none transition focus:border-moss"
                placeholder="Nome do medicamento"
              />
              <button
                type="button"
                onClick={() => removeMedicacao(i)}
                className="px-1 text-lg leading-none text-slate-400 transition hover:text-rose-500"
              >
                ×
              </button>
            </div>

            <div className="flex gap-2">
              {COR_OPTIONS.map((cor) => (
                <button
                  key={cor}
                  type="button"
                  onClick={() => updateMed(i, { cor })}
                  className={`h-5 w-5 rounded-full ${cor} transition ${
                    med.cor === cor ? 'ring-2 ring-slate-400 ring-offset-1' : 'opacity-50 hover:opacity-100'
                  }`}
                />
              ))}
            </div>

            <div className="grid gap-1.5">
              {med.horarios.map((h, j) => (
                <div key={j} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={h}
                    onChange={(e) => setHorario(i, j, e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none transition focus:border-moss"
                  />
                  {med.horarios.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHorario(i, j)}
                      className="text-slate-400 transition hover:text-rose-500"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addHorario(i)}
                className="text-left text-xs text-slate-500 transition hover:text-moss"
              >
                + horário
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Próxima medicação</span>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={proxHora}
            onChange={(e) => setProxHora(e.target.value)}
            type="time"
            className="rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus:border-moss"
            required
          />
          <input
            value={proxNome}
            onChange={(e) => setProxNome(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus:border-moss"
            placeholder="Nome do medicamento"
          />
        </div>
      </div>

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
