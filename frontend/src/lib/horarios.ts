export const FREQUENCIAS = [
  { horas: 4,  label: 'A cada 4 h  (6×/dia)' },
  { horas: 6,  label: 'A cada 6 h  (4×/dia)' },
  { horas: 8,  label: 'A cada 8 h  (3×/dia)' },
  { horas: 12, label: 'A cada 12 h (2×/dia)' },
  { horas: 24, label: 'A cada 24 h (1×/dia)' },
] as const;

export function calcularHorarios(primeiroHorario: string, frequenciaHoras: number): string[] {
  const [h, m] = primeiroHorario.split(':').map(Number);
  const startMin = h * 60 + m;
  const count = Math.round(1440 / (frequenciaHoras * 60));
  return Array.from({ length: count }, (_, i) => {
    const total = (startMin + i * frequenciaHoras * 60) % 1440;
    return `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;
  });
}
