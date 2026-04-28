'use client';

import { Internacao } from '@/types/internacao';
import { StatusBadge } from '@/components/internacoes/status-badge';

function getSlots(internacoes: Internacao[]): string[] {
  const all = new Set<string>();
  for (const pet of internacoes) {
    for (const med of (pet.medicacoes ?? [])) {
      for (const h of med.horarios) all.add(h);
    }
  }
  return Array.from(all).sort();
}

function currentSlot(slots: string[]): string | null {
  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  for (let i = slots.length - 1; i >= 0; i--) {
    if (hhmm >= slots[i]) return slots[i];
  }
  return null;
}

function isPast(slot: string): boolean {
  const now = new Date();
  const [h, m] = slot.split(':').map(Number);
  const slotDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
  return slotDate < now;
}

type Props = { internacoes: Internacao[] };

export function MapaGrid({ internacoes }: Props) {
  const slots      = getSlots(internacoes);
  const activeSlot = currentSlot(slots);

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="sticky left-0 z-10 min-w-[200px] bg-slate-50 px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">
              Pet
            </th>
            {slots.map((slot) => (
              <th
                key={slot}
                className={`min-w-[90px] px-3 py-3 text-center text-xs font-semibold uppercase tracking-widest ${
                  slot === activeSlot
                    ? 'bg-moss/10 text-moss'
                    : 'text-slate-500'
                }`}
              >
                {slot}
                {slot === activeSlot && (
                  <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-moss align-middle" />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {internacoes.map((pet, idx) => (
            <tr
              key={pet.id}
              className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
            >
              {/* Pet info cell */}
              <td className="sticky left-0 z-10 px-5 py-4" style={{ background: 'inherit' }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{pet.petNome}</p>
                    <p className="text-xs text-slate-500">{pet.especie} · {pet.tutorNome}</p>
                  </div>
                  <StatusBadge status={pet.status} />
                </div>
              </td>

              {/* Time slot cells */}
              {slots.map((slot) => {
                const meds = pet.medicacoes.filter((m) => m.horarios.includes(slot));
                const past = isPast(slot);
                const active = slot === activeSlot;

                return (
                  <td
                    key={slot}
                    className={`px-2 py-3 text-center align-top ${
                      active ? 'bg-moss/5' : ''
                    }`}
                  >
                    {meds.length > 0 ? (
                      <div className="flex flex-col items-center gap-1">
                        {meds.map((med) => (
                          <span
                            key={med.nome}
                            title={med.nome}
                            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold text-white ${med.cor} ${
                              past ? 'opacity-90' : ''
                            }`}
                          >
                            {med.nome}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-200">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
