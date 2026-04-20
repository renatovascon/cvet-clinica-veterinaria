'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, Plus, X } from 'lucide-react';
import { Internacao, InternacaoStatus, Medicacao } from '@/types/internacao';
import { StatusBadge } from './status-badge';

const STATUS_OPTIONS: { value: InternacaoStatus; label: string; classes: string }[] = [
  { value: 'estavel',    label: 'Estável',    classes: 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
  { value: 'observacao', label: 'Observação', classes: 'border-amber-300  bg-amber-50  text-amber-700  hover:bg-amber-100'  },
  { value: 'critico',    label: 'Crítico',    classes: 'border-rose-300   bg-rose-50   text-rose-700   hover:bg-rose-100'   },
];

const CORES = [
  'bg-teal-500', 'bg-amber-400', 'bg-blue-400',
  'bg-rose-500', 'bg-purple-400', 'bg-orange-400',
];

type Props = { id: string };

export function InternacaoDetalhe({ id }: Props) {
  const [internacao, setInternacao] = useState<Internacao | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  // Form state
  const [medNome, setMedNome]       = useState('');
  const [medCor, setMedCor]         = useState(CORES[0]);
  const [medHorarios, setMedHorarios] = useState<string[]>(['08:00']);
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    fetch(`/api/internacoes/${id}`)
      .then((r) => r.json())
      .then((data) => setInternacao(data))
      .catch(() => setError('Erro ao carregar internação.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function updateStatus(status: InternacaoStatus) {
    const res = await fetch(`/api/internacoes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) setInternacao((prev) => prev ? { ...prev, status } : prev);
  }

  async function addMedicacao() {
    if (!medNome || medHorarios.length === 0) return;
    setSaving(true);
    const res = await fetch(`/api/internacoes/${id}/medicacoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: medNome, horarios: medHorarios, cor: medCor }),
    });
    if (res.ok) {
      const nova: Medicacao = await res.json();
      setInternacao((prev) =>
        prev ? { ...prev, medicacoes: [...prev.medicacoes, nova] } : prev
      );
      setMedNome('');
      setMedCor(CORES[0]);
      setMedHorarios(['08:00']);
    }
    setSaving(false);
  }

  async function removeMedicacao(medId: string) {
    await fetch(`/api/internacoes/${id}/medicacoes/${medId}`, { method: 'DELETE' });
    setInternacao((prev) =>
      prev ? { ...prev, medicacoes: prev.medicacoes.filter((m) => (m as Medicacao & { id: string }).id !== medId) } : prev
    );
  }

  function addHorario() {
    setMedHorarios((h) => [...h, '08:00']);
  }

  function removeHorario(i: number) {
    setMedHorarios((h) => h.filter((_, idx) => idx !== i));
  }

  function setHorario(i: number, val: string) {
    setMedHorarios((h) => h.map((v, idx) => (idx === i ? val : v)));
  }

  if (loading) return <p className="p-8 text-sm text-slate-500">Carregando...</p>;
  if (error || !internacao) return <p className="p-8 text-sm text-red-500">{error ?? 'Internação não encontrada.'}</p>;

  const entrada = new Date(internacao.entradaEm).toLocaleString('pt-BR', {
    dateStyle: 'short', timeStyle: 'short',
  });

  return (
    <main className="flex flex-col gap-6 p-6 lg:p-8">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/internacoes" className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
          <ArrowLeft size={16} />
        </Link>
        <div className="flex flex-1 items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{internacao.id}</p>
            <h1 className="text-2xl font-bold text-slate-900">{internacao.petNome}</h1>
            <p className="text-sm text-slate-500">{internacao.especie} · Tutor: {internacao.tutorNome}</p>
          </div>
          <StatusBadge status={internacao.status} />
        </div>
      </div>

      {/* Info grid */}
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <InfoItem label="Entrada" value={entrada} />
        <InfoItem label="Próxima medicação" value={internacao.proximaMedicacao} />
        <InfoItem label="Espécie" value={internacao.especie} />
        {internacao.observacao && <InfoItem label="Observação" value={internacao.observacao} />}
      </div>

      {/* Status control */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Alterar status</p>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateStatus(opt.value)}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${opt.classes} ${
                internacao.status === opt.value ? 'ring-2 ring-offset-1 ring-current' : ''
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Medicações */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">Medicações</p>

        {/* List */}
        {internacao.medicacoes.length === 0 ? (
          <p className="mb-4 text-sm text-slate-400">Nenhuma medicação registrada.</p>
        ) : (
          <ul className="mb-5 flex flex-col gap-2">
            {internacao.medicacoes.map((med) => {
              const m = med as Medicacao & { id: string };
              return (
                <li key={m.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`h-3 w-3 rounded-full ${m.cor}`} />
                    <span className="font-medium text-slate-800">{m.nome}</span>
                    <span className="text-xs text-slate-500">{m.horarios.join(' · ')}</span>
                  </div>
                  <button
                    onClick={() => removeMedicacao(m.id)}
                    className="text-slate-400 hover:text-rose-500 transition"
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* Add form */}
        <div className="grid gap-4 rounded-xl border border-dashed border-slate-300 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Nova medicação</p>

          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Nome
            <input
              value={medNome}
              onChange={(e) => setMedNome(e.target.value)}
              placeholder="Ex: Dipirona"
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-moss"
            />
          </label>

          {/* Color picker */}
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Cor</p>
            <div className="flex gap-2">
              {CORES.map((cor) => (
                <button
                  key={cor}
                  type="button"
                  onClick={() => setMedCor(cor)}
                  className={`h-7 w-7 rounded-full ${cor} transition ${
                    medCor === cor ? 'ring-2 ring-offset-2 ring-slate-400' : 'opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Horários */}
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Horários</p>
            <div className="flex flex-wrap gap-2">
              {medHorarios.map((h, i) => (
                <div key={i} className="flex items-center gap-1">
                  <input
                    type="time"
                    value={h}
                    onChange={(e) => setHorario(i, e.target.value)}
                    className="rounded-xl border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-moss"
                  />
                  {medHorarios.length > 1 && (
                    <button type="button" onClick={() => removeHorario(i)} className="text-slate-400 hover:text-rose-500">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addHorario}
                className="flex items-center gap-1 rounded-xl border border-dashed border-slate-300 px-3 py-1.5 text-xs text-slate-500 hover:border-moss hover:text-moss"
              >
                <Plus size={13} /> Horário
              </button>
            </div>
          </div>

          <button
            onClick={addMedicacao}
            disabled={saving || !medNome}
            className="rounded-xl bg-moss px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
          >
            {saving ? 'Salvando...' : 'Adicionar medicação'}
          </button>
        </div>
      </section>
    </main>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}
