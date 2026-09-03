'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { InternacaoStatus, NovaInternacao } from '@/types/internacao';
import { calcularHorarios, FREQUENCIAS } from '@/lib/horarios';

type InternacaoFormProps = {
  onCreate: (data: NovaInternacao) => Promise<string | null>;
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
  valorDose: number;
  dosesAplicadas: number;
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

function dateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function InternacaoForm({ onCreate }: InternacaoFormProps) {
  const [pets, setPets]               = useState<{ id: string; nome: string; especie: string; tutor: { nome: string; telefone: string; cpf?: string | null } }[]>([]);
  const [petId, setPetId]             = useState('');
  const [leitos, setLeitos]           = useState<{ id: string; nome: string; tipo: 'N' | 'I'; valorDiaria: number }[]>([]);
  const [leitoId, setLeitoId]         = useState('');
  const [entradaEm, setEntradaEm]     = useState(() => dateInputValue(new Date()));
  const [dataSaida, setDataSaida]     = useState(() => defaultFimEm());
  const [descricao, setDescricao]     = useState('');
  const [status, setStatus]           = useState<InternacaoStatus>('observacao');
  const [manualHora, setManualHora]   = useState('');
  const [manualNome, setManualNome]   = useState('');
  const [observacao, setObservacao]   = useState('');
  const [medicacoes, setMedicacoes]   = useState<FormMed[]>([]);
  const [submitting, setSubmitting]   = useState(false);
  const [loadError, setLoadError]     = useState('');
  const [saveError, setSaveError]     = useState('');

  const agora = new Date().toTimeString().slice(0, 5);

  useEffect(() => {
    Promise.all([fetch('/api/leitos'), fetch('/api/pets')])
      .then(async ([leitosResponse, petsResponse]) => {
        if (!leitosResponse.ok || !petsResponse.ok) throw new Error();
        setLeitos(await leitosResponse.json());
        setPets(await petsResponse.json());
      })
      .catch(() => setLoadError('Não foi possível carregar pets e leitos do banco. Atualize a página e tente novamente.'));
  }, []);

  const petSelecionado = pets.find((pet) => pet.id === petId);
  const leitoSelecionado = leitos.find((leito) => leito.id === leitoId);
  const quantidadeDiarias = entradaEm && dataSaida
    ? Math.max(1, Math.ceil((new Date(`${dataSaida}T00:00:00`).getTime() - new Date(`${entradaEm}T00:00:00`).getTime()) / 86_400_000))
    : 0;
  const valorEstimado = quantidadeDiarias * (leitoSelecionado?.valorDiaria ?? 0);

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
        cor: 'bg-teal-500', via: 'Oral', unidade: 'mg', quantidade: 1, valorDose: 0, dosesAplicadas: 0 },
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
    if (!petSelecionado || !leitoId || !entradaEm || !dataSaida || !descricao) return;
    setSaveError('');

    const proximaMedicacao = proxHora
      ? (proxNome ? `${proxHora} — ${proxNome}` : proxHora)
      : '';

    const medicacoesValidas = medicacoes
      .filter((m) => m.nome.trim())
      .map((m) => ({
        ...m,
        horarios: calcularHorarios(m.primeiroHorario, m.frequenciaHoras),
      }));

    setSubmitting(true);
    const error = await onCreate({
      petId, petNome: petSelecionado.nome, especie: petSelecionado.especie, tutorNome: petSelecionado.tutor.nome,
      tutorTelefone: petSelecionado.tutor.telefone, tutorCpf: petSelecionado.tutor.cpf || undefined, leitoId,
      entradaEm, dataSaida, descricao,
      status, proximaMedicacao, observacao, medicacoes: medicacoesValidas,
    });
    setSubmitting(false);
    if (error) {
      setSaveError(error);
      return;
    }

    setPetId(''); setLeitoId(''); setEntradaEm(dateInputValue(new Date())); setDataSaida(defaultFimEm()); setDescricao(''); setStatus('observacao'); setManualHora(''); setManualNome('');
    setObservacao(''); setMedicacoes([]);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      {loadError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{loadError}</p>}

      <div className="grid gap-4 lg:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium text-slate-700">Pet cadastrado
          <select value={petId} onChange={(e) => setPetId(e.target.value)} required className="rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus:border-moss">
            <option value="">Selecione o pet</option>
            {pets.map((pet) => <option key={pet.id} value={pet.id}>{pet.nome} · {pet.especie} · {pet.tutor.nome}</option>)}
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
      {petSelecionado && <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700"><span className="font-semibold">Tutor:</span> {petSelecionado.tutor.nome} · {petSelecionado.tutor.telefone}</div>}
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Leito
        <select value={leitoId} onChange={(e) => setLeitoId(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus:border-moss" required>
          <option value="">Selecione o leito</option>
          {leitos.map((leito) => <option key={leito.id} value={leito.id}>Leito {leito.id} - {leito.nome} ({leito.tipo === 'I' ? 'UTI' : 'Normal'}) - R$ {leito.valorDiaria.toFixed(2).replace('.', ',')}/dia</option>)}
        </select>
      </label>
      {leitoSelecionado && <div className="grid gap-2 rounded-xl border border-moss/20 bg-moss/5 p-4 sm:grid-cols-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Leito</p><p className="mt-1 font-semibold text-ink">{leitoSelecionado.id} · {leitoSelecionado.nome}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Diária</p><p className="mt-1 font-semibold text-ink">R$ {leitoSelecionado.valorDiaria.toFixed(2).replace('.', ',')}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total estimado</p><p className="mt-1 font-semibold text-moss">R$ {valorEstimado.toFixed(2).replace('.', ',')} · {quantidadeDiarias} diária(s)</p></div></div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium text-slate-700">Data de entrada<input type="date" value={entradaEm} onChange={(e) => setEntradaEm(e.target.value)} required className="rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus:border-moss" /></label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Data de saída<input type="date" min={entradaEm} value={dataSaida} onChange={(e) => setDataSaida(e.target.value)} required className="rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus:border-moss" /></label>
      </div>
      <label className="grid gap-2 text-sm font-medium text-slate-700">Descrição da internação<textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} required className="min-h-20 rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus:border-moss" placeholder="Ex: recuperação pós-operatória" /></label>
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Observação
        <textarea
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          className="min-h-24 rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus:border-moss"
          placeholder="Ex: manter monitoramento da temperatura"
        />
      </label>

      {saveError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{saveError}</p>}

      <button
        type="submit"
        disabled={submitting || Boolean(loadError)}
        className="rounded-xl bg-moss px-4 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
      >
        {submitting ? 'Registrando...' : 'Registrar internação'}
      </button>
    </form>
  );
}
