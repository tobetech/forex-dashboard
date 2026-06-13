'use client'

import { StratStats } from '@/types'

interface Props {
  data: StratStats[]
}

export default function StrategyTable({ data }: Props) {
  const maxAbs = Math.max(...data.map(s => Math.abs(s.profit)), 1)

  return (
    <div className="space-y-3">
      {data.map(s => (
        <div key={s.name} className="flex items-center gap-3 text-sm">
          <span className="w-20 font-medium text-gray-800 dark:text-gray-200 truncate" title={s.name}>{s.name}</span>
          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(Math.abs(s.profit) / maxAbs) * 100}%`,
                background: s.profit >= 0 ? '#1D9E75' : '#D85A30',
              }}
            />
          </div>
          <span className={`w-20 text-right font-medium ${s.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-500 dark:text-orange-400'}`}>
            {s.profit >= 0 ? '+' : ''}${Math.abs(s.profit).toFixed(2)}
          </span>
          <span className="w-10 text-right text-gray-400 dark:text-gray-500 text-xs">{s.winRate.toFixed(0)}%</span>
          <span className="w-8 text-right text-gray-300 dark:text-gray-600 text-xs">{s.count}</span>
        </div>
      ))}
      {data.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-4">ไม่มีข้อมูล</p>
      )}
    </div>
  )
}
