'use client';

import { useEffect, useState } from 'react';

const WAKE_TIMEOUT_MS = 90_000;
const MAX_ATTEMPTS    = 5;
const RETRY_DELAY_MS  = 2_000;

async function tryPing(): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WAKE_TIMEOUT_MS);
  try {
    const res = await fetch('/api/health', { signal: controller.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function pingUntilAwake(): Promise<void> {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    if (await tryPing()) return;
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
  }
}

export function BackendWakeUp({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    pingUntilAwake().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-slate-50">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-moss" />
        <p className="text-sm text-slate-500">Iniciando serviço, aguarde…</p>
      </div>
    );
  }

  return <>{children}</>;
}
