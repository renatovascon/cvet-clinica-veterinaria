'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

type Props = { data: { dia: string; internacoes: number }[] };

export function VolumeLine({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
        <Tooltip formatter={(value) => [`${value}`, 'Entradas']} />
        <Line
          type="monotone"
          dataKey="internacoes"
          stroke="#2f6f68"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#2f6f68' }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
