export function calcularHorarios(primeiroHorario: string, frequenciaHoras: number): string[] {
  const [h, m] = primeiroHorario.split(':').map(Number);
  const startMin = h * 60 + m;
  const count = Math.round(1440 / (frequenciaHoras * 60));
  return Array.from({ length: count }, (_, i) => {
    const total = (startMin + i * frequenciaHoras * 60) % 1440;
    return `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;
  });
}
