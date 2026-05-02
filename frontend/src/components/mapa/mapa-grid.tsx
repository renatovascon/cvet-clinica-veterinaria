'use client';

import { useState } from 'react';
import { Internacao, Medicacao } from '@/types/internacao';
import { StatusBadge } from '@/components/internacoes/status-badge';

function localYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function medActiveOn(med: Medicacao, date: Date): boolean {
  if (!med.fimEm) return true;
  return localYMD(date) <= med.fimEm.slice(0, 10);
}

function getSlots(internacoes: Internacao[], date: Date): string[] {
  const all = new Set<string>();
  for (const pet of internacoes) {
    for (const med of (pet.medicacoes ?? [])) {
      if (!medActiveOn(med, date)) continue;
      for (const h of med.horarios) all.add(h);
    }
  }
  return Array.from(all).sort();
}

function currentSlot(slots: string[], isToday: boolean): string | null {
  if (!isToday) return null;
  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  for (let i = slots.length - 1; i >= 0; i--) {
    if (hhmm >= slots[i]) return slots[i];
  }
  return null;
}

function isPast(slot: string, activeSlot: string | null, date: Date): boolean {
  if (slot === activeSlot) return false;
  const now = new Date();
  const selectedYMD = localYMD(date);
  const todayYMD = localYMD(now);
  if (selectedYMD < todayYMD) return true;
  if (selectedYMD > todayYMD) return false;
  const [h, m] = slot.split(':').map(Number);
  const slotDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
  return slotDate < now;
}

type Props = { internacoes: Internacao[]; selectedDate: Date };

export function MapaGrid({ internacoes, selectedDate }: Props) {
  const [administrados, setAdministrados] = useState<Set<string>>(new Set());

  const isToday    = localYMD(selectedDate) === localYMD(new Date());
  const slots      = getSlots(internacoes, selectedDate);
  const activeSlot = currentSlot(slots, isToday);

  function toggleAdministrado(petId: string, slot: string, medNome: string) {
    const key = `${petId}-${slot}-${medNome}`;
    setAdministrados((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

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
                  slot === activeSlot ? 'bg-moss/10 text-moss' : 'text-slate-500'
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
          {internacoes.map((pet, idx) => {
            const activeMeds = (pet.medicacoes ?? []).filter((m) => medActiveOn(m, selectedDate));
            return (
              <tr
                key={pet.id}
                className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
              >
                <td className="sticky left-0 z-10 px-5 py-4" style={{ background: 'inherit' }}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{pet.petNome}</p>
                      <p className="text-xs text-slate-500">{pet.especie} · {pet.tutorNome}</p>
                    </div>
                    <StatusBadge status={pet.status} />
                  </div>
                </td>

                {slots.map((slot) => {
                  const meds = activeMeds.filter((m) => m.horarios.includes(slot));
                  const autoPast = isPast(slot, activeSlot, selectedDate);
                  const active = slot === activeSlot;

                  return (
                    <td
                      key={slot}
                      className={`px-2 py-3 text-center align-top ${active ? 'bg-moss/5' : ''}`}
                    >
                      {meds.length > 0 ? (
                        <div className="flex flex-col items-center gap-1">
                          {meds.map((med) => {
                            const key = `${pet.id}-${slot}-${med.nome}`;
                            const administrado = administrados.has(key);
                            const dimmed = administrado || autoPast;
                            return (
                              <button
                                key={med.nome}
                                type="button"
                                onClick={() => toggleAdministrado(pet.id, slot, med.nome)}
                                title={administrado ? 'Clique para desmarcar' : 'Clique para marcar como ministrado'}
                                className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold text-white transition-opacity cursor-pointer ${med.cor} ${
                                  dimmed ? 'opacity-30 grayscale' : 'hover:opacity-80'
                                }`}
                              >
                                {med.nome}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-200">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
