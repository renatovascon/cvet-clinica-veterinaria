'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Internacao, InternacaoStatus, Medicacao } from '@/types/internacao';
import { calcularHorarios, FREQUENCIAS, resolverProximaMedicacao } from '@/lib/horarios';
import { StatusBadge } from './status-badge';

const STATUS_OPTIONS: { value: InternacaoStatus; label: string; classes: string }[] = [
  { value: 'estavel',    label: 'Estável',    classes: 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
  { value: 'observacao', label: 'Observação', classes: 'border-amber-300  bg-amber-50  text-amber-700  hover:bg-amber-100'  },
  { value: 'critico',    label: 'Crítico',    classes: 'border-rose-300   bg-rose-50   text-rose-700   hover:bg-rose-100'   },
];

const CORES     = ['bg-teal-500','bg-amber-400','bg-blue-400','bg-rose-500','bg-purple-400','bg-orange-400'];
const UNIDADES  = ['Borrifada','Cápsula','cm','Comprimido','Drágea','g','Gota(s)','l','mcg','Medida','mg','ml','UN','Sachê','UI'];
const VIAS      = ['Enema','Epidural','Inalatória','Intramuscular','Intraóssea','Intraperitoneal','Intravenosa','Oftálmica','Oral','Otológica','Sonda','Subcutânea','Tópica'];

function defaultFimEm() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

type Props = { id: string };

export function InternacaoDetalhe({ id }: Props) {
  const [internacao, setInternacao] = useState<Internacao | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  // Form state
  const [medNome, setMedNome]                   = useState('');
  const [medCor, setMedCor]                     = useState(CORES[0]);
  const [medVia, setMedVia]                     = useState('Oral');
  const [medUnidade, setMedUnidade]             = useState('mg');
  const [medQuantidade, setMedQuantidade]       = useState(1);
  const [medValorDose, setMedValorDose]         = useState(0);
  const [medPrimeiroHorario, setMedPrimeiroHorario] = useState('08:00');
  const [medFrequenciaHoras, setMedFrequenciaHoras] = useState(8);
  const [medFimEm, setMedFimEm]                 = useState(defaultFimEm);
  const [saving, setSaving]                     = useState(false);

  const medPreview = calcularHorarios(medPrimeiroHorario, medFrequenciaHoras);

  useEffect(() => {
    fetch(`/api/internacoes/${id}`)
      .then((r) => r.json())
      .then((data) => setInternacao({
        ...data,
        tutorCpf:      data.pet?.tutor?.cpf      ?? undefined,
        tutorTelefone: data.pet?.tutor?.telefone  ?? undefined,
      }))
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
    if (!medNome) return;
    setSaving(true);
    const res = await fetch(`/api/internacoes/${id}/medicacoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: medNome, cor: medCor, via: medVia, unidade: medUnidade,
        quantidade: medQuantidade, valorDose: medValorDose, dosesAplicadas: 0, primeiroHorario: medPrimeiroHorario,
        frequenciaHoras: medFrequenciaHoras, fimEm: medFimEm || undefined,
      }),
    });
    if (res.ok) {
      const nova: Medicacao = await res.json();
      setInternacao((prev) =>
        prev ? { ...prev, medicacoes: [...prev.medicacoes, nova] } : prev
      );
      setMedNome('');
      setMedCor(CORES[0]);
      setMedVia('Oral');
      setMedUnidade('mg');
      setMedQuantidade(1);
      setMedValorDose(0);
      setMedPrimeiroHorario('08:00');
      setMedFrequenciaHoras(8);
      setMedFimEm(defaultFimEm());
    }
    setSaving(false);
  }

  async function removeMedicacao(medId: string) {
    await fetch(`/api/internacoes/${id}/medicacoes/${medId}`, { method: 'DELETE' });
    setInternacao((prev) =>
      prev ? { ...prev, medicacoes: prev.medicacoes.filter((m) => (m as Medicacao & { id: string }).id !== medId) } : prev
    );
  }

  if (loading) return <p className="p-8 text-sm text-slate-500">Carregando...</p>;
  if (error || !internacao) return <p className="p-8 text-sm text-red-500">{error ?? 'Internação não encontrada.'}</p>;

  const entrada = new Date(internacao.entradaEm).toLocaleString('pt-BR', {
    dateStyle: 'short', timeStyle: 'short',
  });
  const saida = internacao.dataSaida ? new Date(internacao.dataSaida).toLocaleDateString('pt-BR') : 'Não definida';

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
            <p className="text-sm text-slate-500">{internacao.especie}</p>
            <p className="text-sm text-slate-500">
              Tutor: {internacao.tutorNome}
              {internacao.tutorCpf && <> · CPF: {internacao.tutorCpf}</>}
              {internacao.tutorTelefone && <> · Tel: {internacao.tutorTelefone}</>}
            </p>
          </div>
          <StatusBadge status={internacao.status} />
        </div>
      </div>

      {/* Info grid */}
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <InfoItem label="Entrada" value={entrada} />
        <InfoItem label="Saída" value={saida} />
        <InfoItem label="Diárias" value={`${internacao.quantidadeDiarias} · R$ ${internacao.valorDiarias.toFixed(2).replace('.', ',')}`} />
        <InfoItem label="Próxima medicação" value={resolverProximaMedicacao(internacao)} />
        <InfoItem label="Espécie" value={internacao.especie} />
        {internacao.observacao && <InfoItem label="Observação" value={internacao.observacao} />}
        <InfoItem label="Descrição" value={internacao.descricao} />
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

        {internacao.medicacoes.length === 0 ? (
          <p className="mb-4 text-sm text-slate-400">Nenhuma medicação registrada.</p>
        ) : (
          <ul className="mb-5 flex flex-col gap-2">
            {internacao.medicacoes.map((med) => {
              const m = med as Medicacao & { id: string };
              return (
                <li key={m.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`h-3 w-3 shrink-0 rounded-full ${m.cor}`} />
                    <span className="font-medium text-slate-800">{m.nome}</span>
                    <span className="text-xs text-slate-500">{m.horarios.join(' · ')}</span>
                    {m.quantidade != null && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                        {m.quantidade} {m.unidade}
                      </span>
                    )}
                    {m.via && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">{m.via}</span>}
                  </div>
                  <button onClick={() => removeMedicacao(m.id)} className="text-slate-400 hover:text-rose-500 transition">
                    <Trash2 size={15} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* Formulário de nova medicação */}
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

          <div className="grid gap-4 sm:grid-cols-4">
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Quantidade
              <input
                type="number" min="0.1" step="0.1"
                value={medQuantidade}
                onChange={(e) => setMedQuantidade(Number(e.target.value))}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-moss"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Unidade
              <select value={medUnidade} onChange={(e) => setMedUnidade(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-moss">
                {UNIDADES.map((u) => <option key={u}>{u}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Via
              <select value={medVia} onChange={(e) => setMedVia(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-moss">
                {VIAS.map((v) => <option key={v}>{v}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Preço por dose
              <input
                type="number" min="0" step="0.01"
                value={medValorDose}
                onChange={(e) => setMedValorDose(Number(e.target.value))}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-moss"
              />
            </label>
          </div>

          {/* Cor */}
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Cor</p>
            <div className="flex gap-2">
              {CORES.map((cor) => (
                <button key={cor} type="button" onClick={() => setMedCor(cor)}
                  className={`h-7 w-7 rounded-full ${cor} transition ${
                    medCor === cor ? 'ring-2 ring-offset-2 ring-slate-400' : 'opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Frequência */}
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Frequência
              <select value={medFrequenciaHoras} onChange={(e) => setMedFrequenciaHoras(Number(e.target.value))}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-moss">
                {FREQUENCIAS.map((f) => (
                  <option key={f.horas} value={f.horas}>{f.label}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Primeiro horário
              <input type="time" value={medPrimeiroHorario}
                onChange={(e) => setMedPrimeiroHorario(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-moss"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Até quando
              <input type="date" value={medFimEm}
                onChange={(e) => setMedFimEm(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-moss"
              />
            </label>
          </div>

          {/* Preview */}
          <p className="text-xs text-slate-400">
            Doses diárias: <span className="font-medium text-slate-600">{medPreview.join(' · ')}</span>
          </p>

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
