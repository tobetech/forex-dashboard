'use client'

import { Trade } from '@/types'
import { useMemo } from 'react'

interface Props {
  trades: Trade[]
}

const SESSIONS = [
  { name: 'เช้า', label: '06:00–12:00', hours: [6,7,8,9,10,11] },
  { name: 'บ่าย', label: '12:00–18:00', hours: [12,13,14,15,16,17] },
  { name: 'เย็น', label: '18:00–24:00', hours: [18,19,20,21,22,23] },
  { name: 'ดึก', label: '00:00–06:00', hours: [0,1,2,3,4,5] },
]

export default function TradingHours({ trades }: Props) {
  const data = useMemo(() => {
    const hourMap: Record<number, { profit: number; count: number; wins: number }> = {}
    for (let i = 0; i < 24; i++) hourMap[i] = { profit: 0, count: 0, wins: 0 }

    trades.forEach(t => {
      if (!t.created_at) return
      const date = new Date(t.created_at + 'Z')
      const bkk = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))
      const h = bkk.getHours()
      hourMap[h].profit += t.profit || 0
      hourMap[h].count++
      if ((t.profit || 0) > 0) hourMap[h].wins++
    })

    return SESSIONS.map(s => {
      const profit = s.hours.reduce((sum, h) => sum + hourMap[h].profit, 0)
      const count = s.hours.reduce((sum, h) => sum + hourMap[h].count, 0)
      const wins = s.hours.reduce((sum, h) => sum + hourMap[h].wins, 0)
      const winRate = count ? (wins / count) * 100 : 0
      // hourly breakdown
      const hours = s.hours
        .map(h => ({ hour: h, ...hourMap[h] }))
        .filter(h => h.count > 0)
      return { ...s, profit, count, winRate, hours }
    })
  }, [trades])

  const maxAbs = Math.max(...data.map(d => Math.abs(d.profit)), 1)

  return (
    <div className="space-y-4">
      {/* Session summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {data.map(s => (
          <div key={s.name} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">{s.name} <span className="text-gray-300 dark:text-gray-600">{s.label}</span></p>
            <p className={`text-base font-medium mt-1 ${s.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-500 dark:text-orange-400'}`}>
              {s.profit >= 0 ? '+' : ''}${s.profit.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{s.count} trades · {s.winRate.toFixed(0)}% win</p>
          </div>
        ))}
      </div>

      {/* Hourly bar */}
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">P&L รายชั่วโมง (เวลาไทย)</p>
        <div className="flex items-end gap-0.5 h-16">
          {Array.from({ length: 24 }, (_, h) => {
            const session = data.find(s => s.hours.includes(h))
            const hourData = session?.hours.find(hd => typeof hd === 'object' && (hd as {hour:number}).hour === h) as {hour:number;profit:number;count:number} | undefined
            const profit = hourData?.profit || 0
            const count = hourData?.count || 0
            const pct = count ? Math.abs(profit) / maxAbs : 0
            return (
              <div key={h} className="flex-1 flex flex-col items-center gap-0.5" title={`${h}:00 — $${profit.toFixed(2)} (${count} trades)`}>
                {profit >= 0 ? (
                  <>
                    <div className="w-full rounded-t-sm" style={{ height: `${pct * 56}px`, background: count ? '#1D9E75' : 'transparent' }} />
                    <div className="w-full h-0" />
                  </>
                ) : (
                  <>
                    <div className="w-full h-0" />
                    <div className="w-full rounded-b-sm" style={{ height: `${pct * 56}px`, background: count ? '#D85A30' : 'transparent' }} />
                  </>
                )}
              </div>
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-600 mt-1">
          {[0,6,12,18,23].map(h => <span key={h}>{h}:00</span>)}
        </div>
      </div>
    </div>
  )
}
