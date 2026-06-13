'use client'

import { Trade } from '@/types'
import { useMemo } from 'react'

interface Props {
  trades: Trade[]
}

const DAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function PnLHeatmap({ trades }: Props) {
  const hourlyData = useMemo(() => {
    const map: Record<string, { profit: number; count: number }> = {}
    trades.forEach(t => {
      if (!t.created_at) return
      const date = new Date(t.created_at + 'Z')
      const bkkDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))
      const day = bkkDate.getDay()
      const hour = bkkDate.getHours()
      const key = `${day}-${hour}`
      if (!map[key]) map[key] = { profit: 0, count: 0 }
      map[key].profit += t.profit || 0
      map[key].count++
    })
    return map
  }, [trades])

  const allProfits = Object.values(hourlyData).map(d => d.profit)
  const maxAbs = Math.max(...allProfits.map(Math.abs), 1)

  function getColor(profit: number, count: number) {
    if (!count) return 'bg-gray-100 dark:bg-gray-800'
    const intensity = Math.min(Math.abs(profit) / maxAbs, 1)
    if (profit > 0) {
      if (intensity > 0.66) return 'bg-emerald-500'
      if (intensity > 0.33) return 'bg-emerald-300'
      return 'bg-emerald-100 dark:bg-emerald-900'
    } else {
      if (intensity > 0.66) return 'bg-orange-500'
      if (intensity > 0.33) return 'bg-orange-300'
      return 'bg-orange-100 dark:bg-orange-900'
    }
  }

  // แสดงเฉพาะ hour ที่มีข้อมูล
  const activeHours = HOURS.filter(h => DAYS.some((_, d) => hourlyData[`${d}-${h}`]?.count))

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-separate border-spacing-0.5">
          <thead>
            <tr>
              <th className="text-gray-400 dark:text-gray-500 font-normal w-6 text-left pb-1">Day</th>
              {activeHours.map(h => (
                <th key={h} className="text-gray-400 dark:text-gray-500 font-normal text-center pb-1 min-w-[22px]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day, d) => (
              <tr key={d}>
                <td className="text-gray-500 dark:text-gray-400 pr-1 py-0.5 font-medium">{day}</td>
                {activeHours.map(h => {
                  const cell = hourlyData[`${d}-${h}`]
                  return (
                    <td key={h} className="py-0.5">
                      <div
                        className={`h-5 w-full rounded-sm ${getColor(cell?.profit || 0, cell?.count || 0)} cursor-default`}
                        title={cell ? `${day} ${h}:00 — $${cell.profit.toFixed(2)} (${cell.count} trades)` : ''}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
        <span>ขาดทุน</span>
        <div className="flex gap-0.5">
          <div className="w-4 h-3 rounded-sm bg-orange-500" />
          <div className="w-4 h-3 rounded-sm bg-orange-300" />
          <div className="w-4 h-3 rounded-sm bg-orange-100 dark:bg-orange-900" />
          <div className="w-4 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
          <div className="w-4 h-3 rounded-sm bg-emerald-100 dark:bg-emerald-900" />
          <div className="w-4 h-3 rounded-sm bg-emerald-300" />
          <div className="w-4 h-3 rounded-sm bg-emerald-500" />
        </div>
        <span>กำไร</span>
      </div>
    </div>
  )
}
