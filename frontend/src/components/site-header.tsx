import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between gap-4 py-4">
      <div>
        <Link href="/">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-moss">CVET</p>
          <p className="mt-1 text-sm text-slate-600">Gestão veterinária com foco em internação</p>
        </Link>
      </div>
      <nav className="flex items-center gap-2">
        <NavLink href="/internacoes">Internações</NavLink>
        <NavLink href="/analytics">Analytics</NavLink>
      </nav>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm transition hover:border-moss hover:text-moss"
    >
      {children}
    </Link>
  );
}
