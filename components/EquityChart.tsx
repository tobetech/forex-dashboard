'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

interface Props {
  data: { time: string; balance: number }[]
}

export default function EquityChart({ data }: Props) {
  const formatted = data
    .filter(d => d.time && !isNaN(new Date(d.time).getTime()))
    .map(d => ({
      ...d,
      label: format(new Date(d.time), 'd MMM', { locale: th }),
      balance: parseFloat(d.balance.toFixed(2)),
    }))

  const minBal = Math.min(...formatted.map(d => d.balance))
  const maxBal = Math.max(...formatted.map(d => d.balance))
  const padding = (maxBal - minBal) * 0.05 || 10

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={formatted} margin={{ top: 4, right: 4, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#1D9E75" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:[&>line]:stroke-gray-800" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[minBal - padding, maxBal + padding]}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={v => `$${v.toLocaleString()}`}
          width={72}
        />
        <Tooltip
          contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#9ca3af' }}
          itemStyle={{ color: '#1D9E75' }}
          formatter={(v: number) => [`$${v.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Balance']}
        />
        <Area
          type="monotone"
          dataKey="balance"
          stroke="#1D9E75"
          strokeWidth={2}
          fill="url(#equityGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#1D9E75' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
