'use client'

import { Trade } from '@/types'
import { useMemo } from 'react'

interface Props {
  trades: Trade[]
}

export default function BestWorstTrades({ trades }: Props) {
  const { best, worst } = useMemo(() => {
    const sorted = [...trades].sort((a, b) => (b.profit || 0) - (a.profit || 0))
    return {
      best: sorted.slice(0, 5),
      worst: sorted.slice(-5).reverse(),
    }
  }, [trades])

  function formatTime(created_at: string) {
    if (!created_at) return '-'
    return new Date(created_at + 'Z').toLocaleString('th-TH', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
      hour12: false, timeZone: 'Asia/Bangkok',
    })
  }

  const Row = ({ t, rank }: { t: Trade; rank: number }) => {
    const p = t.profit || 0
    const isPos = p >= 0
    return (
      <div className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
        <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs flex items-center justify-center font-medium flex-shrink-0">{rank}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{t.symbol || '-'}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{formatTime(t.created_at)} · {t.order_type || '-'}</p>
        </div>
        <div className="text-right">
          <p className={`text-sm font-medium ${isPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-500 dark:text-orange-400'}`}>
            {isPos ? '+' : ''}${p.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{t.type} · {t.volume} lot</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1">
          <span>🏆</span> Top 5 กำไรสูงสุด
        </p>
        {best.map((t, i) => <Row key={t.id} t={t} rank={i + 1} />)}
      </div>
      <div>
        <p className="text-xs font-medium text-orange-500 dark:text-orange-400 mb-2 flex items-center gap-1">
          <span>💸</span> Top 5 ขาดทุนสูงสุด
        </p>
        {worst.map((t, i) => <Row key={t.id} t={t} rank={i + 1} />)}
      </div>
    </div>
  )
}
