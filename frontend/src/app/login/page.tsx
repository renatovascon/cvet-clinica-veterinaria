'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole, Mail, Stethoscope } from 'lucide-react';

const SESSION_KEY = 'cvet-user';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro('');
    setEnviando(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      const data = await response.json();

      if (!response.ok) {
        setErro(data.message ?? 'Não foi possível entrar.');
        return;
      }

      localStorage.setItem(SESSION_KEY, JSON.stringify(data));
      router.replace('/internacoes');
    } catch {
      setErro('Não foi possível conectar ao serviço.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3 text-lg font-bold tracking-widest">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-moss"><Stethoscope size={21} /></span>
          CVET
        </div>
        <div className="max-w-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sand">Gestão Veterinária</p>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-5xl font-semibold leading-tight">Cuidado clínico, organizado.</h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">Acesse a central de internações da sua equipe.</p>
        </div>
        <p className="text-sm text-slate-400">CVET · Projeto UNIVESP</p>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <form onSubmit={entrar} className="w-full max-w-sm space-y-7">
          <div className="lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-moss text-white"><Stethoscope size={21} /></div>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-moss">CVET</p>
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">Entrar</h2>
            <p className="mt-2 text-sm text-slate-500">Use suas credenciais para acessar a clínica.</p>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              E-mail
              <span className="relative mt-1.5 block">
                <Mail size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/20" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </span>
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Senha
              <span className="relative mt-1.5 block">
                <LockKeyhole size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/20" type="password" value={senha} onChange={(event) => setSenha(event.target.value)} required />
              </span>
            </label>
          </div>

          {erro && <p role="alert" className="text-sm font-medium text-red-600">{erro}</p>}
          <button type="submit" disabled={enviando} className="h-11 w-full rounded-lg bg-moss text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-wait disabled:opacity-70">
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>
          <p className="text-center text-xs text-slate-500">Acesso inicial: admin@cvet.local · cvet123</p>
        </form>
      </section>
    </main>
  );
}