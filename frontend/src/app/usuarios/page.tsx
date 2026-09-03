'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Plus, UserCog } from 'lucide-react';

type Usuario = { id: string; nome: string; cpf: string | null; email: string; createdAt: string };
const emptyForm = { nome: '', cpf: '', email: '', senha: '' };

function formatarCpf(cpf: string | null) {
  if (!cpf) return 'Não informado';
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch('/api/usuarios').then((response) => response.json()).then(setUsuarios).catch(() => setErro('Não foi possível carregar os usuários.'));
  }, []);

  async function cadastrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      const response = await fetch('/api/usuarios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) { setErro(data.message ?? 'Não foi possível cadastrar o usuário.'); return; }
      setUsuarios((atual) => [...atual, data].sort((a, b) => a.nome.localeCompare(b.nome)));
      setForm(emptyForm);
    } catch { setErro('Não foi possível conectar ao serviço.'); } finally { setSalvando(false); }
  }

  return <main className="flex min-h-full flex-col gap-6 p-6 lg:p-10">
    <header><p className="text-sm font-semibold uppercase tracking-[0.3em] text-moss">Administração</p><h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">Usuários do sistema</h1><p className="mt-2 text-sm text-slate-500">Gerencie os acessos da equipe clínica.</p></header>
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <form onSubmit={cadastrar} className="grid content-start gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-ink"><Plus size={19} className="text-moss" /><h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">Novo usuário</h2></div>
        <Field label="Nome completo" value={form.nome} onChange={(nome) => setForm({ ...form, nome })} required />
        <Field label="CPF" value={form.cpf} onChange={(cpf) => setForm({ ...form, cpf: cpf.replace(/\D/g, '').slice(0, 11) })} required inputMode="numeric" />
        <Field label="E-mail" value={form.email} onChange={(email) => setForm({ ...form, email })} required type="email" />
        <Field label="Senha" value={form.senha} onChange={(senha) => setForm({ ...form, senha })} required type="password" />
        {erro && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{erro}</p>}
        <button disabled={salvando} className="h-11 rounded-lg bg-moss text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-70">{salvando ? 'Salvando...' : 'Cadastrar usuário'}</button>
      </form>
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-ink">Acessos cadastrados</h2><span className="text-sm text-slate-500">{usuarios.length} usuário(s)</span></div><div className="divide-y divide-slate-100">{usuarios.map((usuario) => <article key={usuario.id} className="flex items-center gap-4 px-5 py-4"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-moss/10 text-moss"><UserCog size={18} /></span><div><h3 className="font-semibold text-ink">{usuario.nome}</h3><p className="text-sm text-slate-500">{formatarCpf(usuario.cpf)} · {usuario.email}</p></div></article>)}{usuarios.length === 0 && <p className="p-8 text-center text-sm text-slate-500">Nenhum usuário cadastrado.</p>}</div></section>
    </div>
  </main>;
}

function Field({ label, value, onChange, required, type = 'text', inputMode }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string; inputMode?: 'numeric' }) {
  return <label className="grid gap-1.5 text-sm font-medium text-slate-700">{label}<input type={type} inputMode={inputMode} value={value} onChange={(event) => onChange(event.target.value)} required={required} minLength={type === 'password' ? 6 : undefined} className="h-10 rounded-lg border border-slate-300 px-3 outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/15" /></label>;
}