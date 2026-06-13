'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'
import { Trade } from '@/types'
import { useMemo } from 'react'

interface Props {
  trades: Trade[]
}

export default function DrawdownChart({ trades }: Props) {
  const data = useMemo(() => {
    const sorted = [...trades].sort((a, b) => a.id - b.id)
    let peak = 0
    return sorted.map(t => {
      const bal = t.balance || 0
      if (bal > peak) peak = bal
      const dd = peak > 0 ? ((peak - bal) / peak) * 100 : 0
      const label = t.created_at
        ? new Date(t.created_at + 'Z').toLocaleString('th-TH', {
            day: 'numeric', month: 'short', timeZone: 'Asia/Bangkok'
          })
        : ''
      return { label, drawdown: -parseFloat(dd.toFixed(2)), balance: bal }
    })
  }, [trades])

  const minDD = Math.min(...data.map(d => d.drawdown), -0.1)

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#D85A30" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#D85A30" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[minDD * 1.1, 0.5]}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={v => `${v.toFixed(1)}%`}
          width={52}
        />
        <Tooltip
          contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#9ca3af' }}
          formatter={(v: number) => [`${Math.abs(v).toFixed(2)}%`, 'Drawdown']}
          itemStyle={{ color: '#D85A30' }}
        />
        <Area
          type="monotone"
          dataKey="drawdown"
          stroke="#D85A30"
          strokeWidth={2}
          fill="url(#ddGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#D85A30' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
