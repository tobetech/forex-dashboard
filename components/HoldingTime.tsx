'use client'

import { Trade } from '@/types'
import { useMemo } from 'react'

interface Props {
  trades: Trade[]
  allTrades: Trade[]
}

function formatDuration(ms: number) {
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${mins} นาที`
  const hrs = Math.floor(mins / 60)
  const rem = mins % 60
  if (hrs < 24) return rem > 0 ? `${hrs}ชม. ${rem}น.` : `${hrs} ชั่วโมง`
  const days = Math.floor(hrs / 24)
  const remHrs = hrs % 24
  return remHrs > 0 ? `${days}ว. ${remHrs}ชม.` : `${days} วัน`
}

export default function HoldingTime({ trades, allTrades }: Props) {
  const stats = useMemo(() => {
    // จับคู่ order_id เดียวกัน in→out
    const inMap: Record<number, Trade> = {}
    allTrades.forEach(t => {
      if (t.direction === 'in') inMap[t.order_id] = t
    })

    const durations: { ms: number; profit: number; symbol: string; type: string }[] = []
    trades.forEach(t => {
      if (t.direction !== 'out') return
      const openTrade = inMap[t.order_id]
      if (!openTrade?.created_at || !t.created_at) return
      const openTime = new Date(openTrade.created_at + 'Z').getTime()
      const closeTime = new Date(t.created_at + 'Z').getTime()
      const ms = closeTime - openTime
      if (ms > 0) durations.push({ ms, profit: t.profit || 0, symbol: t.symbol, type: t.type })
    })

    if (!durations.length) return null

    const avgMs = durations.reduce((s, d) => s + d.ms, 0) / durations.length
    const winDurations = durations.filter(d => d.profit > 0)
    const lossDurations = durations.filter(d => d.profit < 0)
    const avgWinMs = winDurations.length ? winDurations.reduce((s, d) => s + d.ms, 0) / winDurations.length : 0
    const avgLossMs = lossDurations.length ? lossDurations.reduce((s, d) => s + d.ms, 0) / lossDurations.length : 0
    const shortest = Math.min(...durations.map(d => d.ms))
    const longest = Math.max(...durations.map(d => d.ms))

    // Distribution buckets
    const buckets = [
      { label: '< 15น.', max: 15 * 60000, count: 0 },
      { label: '15–60น.', max: 60 * 60000, count: 0 },
      { label: '1–4ชม.', max: 4 * 3600000, count: 0 },
      { label: '4–12ชม.', max: 12 * 3600000, count: 0 },
      { label: '> 12ชม.', max: Infinity, count: 0 },
    ]
    durations.forEach(d => {
      const b = buckets.find(b => d.ms <= b.max)
      if (b) b.count++
    })
    const maxCount = Math.max(...buckets.map(b => b.count), 1)

    return { avgMs, avgWinMs, avgLossMs, shortest, longest, buckets, maxCount, total: durations.length }
  }, [trades, allTrades])

  if (!stats) {
    return (
      <p className="text-gray-400 text-sm text-center py-4">
        ไม่มีข้อมูล holding time (ต้องการข้อมูลทั้ง direction in และ out)
      </p>
    )
  }

  const items = [
    { label: 'เฉลี่ย', value: formatDuration(stats.avgMs), color: 'text-gray-800 dark:text-gray-200' },
    { label: 'เฉลี่ย (win)', value: formatDuration(stats.avgWinMs), color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'เฉลี่ย (loss)', value: formatDuration(stats.avgLossMs), color: 'text-orange-500 dark:text-orange-400' },
    { label: 'สั้นที่สุด', value: formatDuration(stats.shortest), color: 'text-gray-600 dark:text-gray-300' },
    { label: 'นานที่สุด', value: formatDuration(stats.longest), color: 'text-gray-600 dark:text-gray-300' },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {items.map(item => (
          <div key={item.label} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{item.label}</p>
            <p className={`text-sm font-medium ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">การกระจาย holding time ({stats.total} trades)</p>
        <div className="space-y-1.5">
          {stats.buckets.map(b => (
            <div key={b.label} className="flex items-center gap-3 text-xs">
              <span className="w-16 text-gray-500 dark:text-gray-400 text-right">{b.label}</span>
              <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                <div
                  className="h-full bg-blue-400 dark:bg-blue-600 rounded transition-all"
                  style={{ width: `${(b.count / stats.maxCount) * 100}%` }}
                />
              </div>
              <span className="w-8 text-gray-500 dark:text-gray-400">{b.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
