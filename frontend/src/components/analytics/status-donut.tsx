'use client';

import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type Props = { data: { name: string; value: number }[] };

const STATUS_COLOR: Record<string, string> = {
  'Estável': '#2f6f68',
  'Observação': '#f59e0b',
  'Crítico': '#ef4444',
};

export function StatusDonut({ data }: Props) {
  const dataWithFill = data.map((d) => ({ ...d, fill: STATUS_COLOR[d.name] ?? '#94a3b8' }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={dataWithFill}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
        />
        <Tooltip formatter={(value) => [`${value} internação(ões)`, '']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
