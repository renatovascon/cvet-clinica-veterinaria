import { InternacaoStatus } from '@/types/internacao';

const styleByStatus: Record<InternacaoStatus, string> = {
  estavel: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  observacao: 'bg-amber-100 text-amber-800 border-amber-200',
  critico: 'bg-rose-100 text-rose-800 border-rose-200'
};

const labelByStatus: Record<InternacaoStatus, string> = {
  estavel: 'Estavel',
  observacao: 'Observacao',
  critico: 'Critico'
};

type StatusBadgeProps = {
  status: InternacaoStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${styleByStatus[status]}`}>
      {labelByStatus[status]}
    </span>
  );
}