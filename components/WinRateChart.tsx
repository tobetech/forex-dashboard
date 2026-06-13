'use client'

import { PieChart, Pie, Cell, Tooltip } from 'recharts'

interface Props {
  wins: number
  losses: number
  winRate: number
  avgWin: number
  avgLoss: number
  rr: number
}

export default function WinRateChart({ wins, losses, winRate, avgWin, avgLoss, rr }: Props) {
  const data = [
    { name: 'Win', value: wins || 0.01 },
    { name: 'Loss', value: losses || 0.01 },
  ]

  const stats = [
    { label: 'Win rate', value: winRate.toFixed(1) + '%', color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Avg win', value: '+$' + avgWin.toFixed(2), color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Avg loss', value: '-$' + avgLoss.toFixed(2), color: 'text-orange-500 dark:text-orange-400' },
    { label: 'R:R ratio', value: rr.toFixed(2), color: rr >= 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-500 dark:text-orange-400' },
  ]

  return (
    <div>
      <div className="flex justify-center">
        <PieChart width={140} height={140}>
          <Pie
            data={data}
            cx={70}
            cy={70}
            innerRadius={42}
            outerRadius={62}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell fill="#1D9E75" />
            <Cell fill="#D85A30" />
          </Pie>
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
            formatter={(v: number, name: string) => [v, name]}
          />
        </PieChart>
      </div>
      <div className="mt-2 space-y-2">
        {stats.map(s => (
          <div key={s.label} className="flex justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-1.5 last:border-0">
            <span className="text-gray-500 dark:text-gray-400">{s.label}</span>
            <span className={`font-medium ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
