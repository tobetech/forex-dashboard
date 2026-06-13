'use client'

import { SymbolStats } from '@/types'

interface Props {
  data: SymbolStats[]
}

export default function SymbolChart({ data }: Props) {
  const maxAbs = Math.max(...data.map(d => Math.abs(d.profit)), 1)

  return (
    <div className="space-y-3 mt-2">
      {data.map(d => (
        <div key={d.symbol} className="flex items-center gap-3 text-sm">
          <span className="w-20 font-medium text-gray-800 dark:text-gray-200 truncate">{d.symbol}</span>
          <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(Math.abs(d.profit) / maxAbs) * 100}%`,
                background: d.profit >= 0 ? '#1D9E75' : '#D85A30',
              }}
            />
          </div>
          <span className={`w-20 text-right font-medium ${d.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-500 dark:text-orange-400'}`}>
            {d.profit >= 0 ? '+' : ''}${d.profit.toFixed(2)}
          </span>
          <span className="w-8 text-right text-gray-400 dark:text-gray-500 text-xs">{d.count}</span>
        </div>
      ))}
      {data.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-4">ไม่มีข้อมูล</p>
      )}
    </div>
  )
}
