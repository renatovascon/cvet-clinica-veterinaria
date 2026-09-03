'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Plus, UsersRound } from 'lucide-react';

type Tutor = {
  id: string;
  nome: string;
  telefone: string;
  cpf: string | null;
  email: string | null;
  pets: { id: string; nome: string; especie: string }[];
};

const emptyForm = { nome: '', telefone: '', cpf: '', email: '' };
type PetForm = { nome: string; especie: string; raca: string; dataNascimento: string };
const emptyPet = (): PetForm => ({ nome: '', especie: 'Canina', raca: '', dataNascimento: '' });

export default function TutoresPage() {
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [pets, setPets] = useState<PetForm[]>([emptyPet()]);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch('/api/tutores').then((response) => response.json()).then(setTutores).catch(() => setErro('Não foi possível carregar os tutores.'));
  }, []);

  async function cadastrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro('');
    setSalvando(true);

    try {
      const response = await fetch('/api/tutores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, pets }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErro(data.message ?? 'Não foi possível cadastrar o tutor.');
        return;
      }
      setTutores((atual) => [...atual, data].sort((a, b) => a.nome.localeCompare(b.nome)));
      setForm(emptyForm);
      setPets([emptyPet()]);
    } catch {
      setErro('Não foi possível conectar ao serviço.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="flex min-h-full flex-col gap-6 p-6 lg:p-10">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-moss">Cadastro</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">Tutores</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Mantenha os responsáveis pelos pacientes organizados em uma única base.</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
        <form onSubmit={cadastrar} className="grid content-start gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-ink"><Plus size={19} className="text-moss" /><h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">Novo tutor</h2></div>
          <Field label="Nome completo" value={form.nome} onChange={(nome) => setForm({ ...form, nome })} required />
          <Field label="Telefone" value={form.telefone} onChange={(telefone) => setForm({ ...form, telefone })} required inputMode="tel" />
          <Field label="CPF" value={form.cpf} onChange={(cpf) => setForm({ ...form, cpf })} />
          <Field label="E-mail" value={form.email} onChange={(email) => setForm({ ...form, email })} type="email" />
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-ink">Pets</h3>
              <button type="button" onClick={() => setPets((atual) => [...atual, emptyPet()])} className="inline-flex items-center gap-1.5 text-sm font-semibold text-moss"><Plus size={16} />Adicionar pet</button>
            </div>
            <div className="mt-3 grid gap-4">
              {pets.map((pet, index) => (
                <fieldset key={index} className="grid gap-3 rounded-lg bg-slate-50 p-3">
                  <div className="flex items-center justify-between"><legend className="text-sm font-semibold text-slate-700">Pet {index + 1}</legend>{pets.length > 1 && <button type="button" onClick={() => setPets((atual) => atual.filter((_, petIndex) => petIndex !== index))} className="text-xs font-semibold text-red-600">Remover</button>}</div>
                  <Field label="Nome" value={pet.nome} onChange={(nome) => atualizarPet(index, { nome })} required />
                  <div className="grid grid-cols-2 gap-3">
                    <label className="grid gap-1.5 text-sm font-medium text-slate-700">Espécie<select value={pet.especie} onChange={(event) => atualizarPet(index, { especie: event.target.value })} className="h-10 rounded-lg border border-slate-300 bg-white px-2 outline-none focus:border-moss"><option>Canina</option><option>Felina</option><option>Outros</option></select></label>
                    <Field label="Raça" value={pet.raca} onChange={(raca) => atualizarPet(index, { raca })} />
                  </div>
                  <Field label="Nascimento" value={pet.dataNascimento} onChange={(dataNascimento) => atualizarPet(index, { dataNascimento })} type="date" />
                </fieldset>
              ))}
            </div>
          </div>
          {erro && <p role="alert" className="text-sm font-medium text-red-600">{erro}</p>}
          <button disabled={salvando} className="h-11 rounded-lg bg-moss text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-70">{salvando ? 'Salvando...' : 'Cadastrar tutor e pets'}</button>
        </form>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-ink">Base de tutores</h2>
            <span className="text-sm font-medium text-slate-500">{tutores.length} cadastro(s)</span>
          </div>
          <div className="divide-y divide-slate-100">
            {tutores.map((tutor) => (
              <article key={tutor.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <h3 className="font-semibold text-ink">{tutor.nome}</h3>
                  <p className="mt-1 text-sm text-slate-500">{tutor.telefone}{tutor.email && ` · ${tutor.email}`}</p>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {tutor.pets.length > 0 ? tutor.pets.map((pet) => <span key={pet.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{pet.nome} · {pet.especie}</span>) : <span className="text-xs text-slate-400">Sem pets cadastrados</span>}
                </div>
              </article>
            ))}
            {tutores.length === 0 && <div className="flex min-h-48 flex-col items-center justify-center gap-2 text-slate-500"><UsersRound size={28} className="text-slate-300" /><p className="text-sm">Nenhum tutor cadastrado.</p></div>}
          </div>
        </section>
      </div>
    </main>
  );

  function atualizarPet(index: number, patch: Partial<PetForm>) {
    setPets((atual) => atual.map((pet, petIndex) => petIndex === index ? { ...pet, ...patch } : pet));
  }
}

function Field({ label, value, onChange, required, type = 'text', inputMode }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string; inputMode?: 'tel' }) {
  return <label className="grid gap-1.5 text-sm font-medium text-slate-700">{label}<input type={type} inputMode={inputMode} value={value} onChange={(event) => onChange(event.target.value)} required={required} className="h-10 rounded-lg border border-slate-300 px-3 outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/15" /></label>;
}