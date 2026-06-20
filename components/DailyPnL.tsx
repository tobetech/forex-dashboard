'use client'

import { Trade } from '@/types'
import { useMemo, useState } from 'react'

interface Props {
  trades: Trade[]
}

interface DayData {
  date: string
  dateLabel: string
  profit: number
  count: number
  wins: number
  losses: number
  winRate: number
  trades: Trade[]
}

export default function DailyPnL({ trades }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showTrades, setShowTrades] = useState(false)

  const dailyData = useMemo(() => {
    const map: Record<string, DayData> = {}

    trades.forEach(t => {
      if (!t.created_at) return
      const date = new Date(t.created_at + 'Z')
      const bkk = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))
      const dateStr = bkk.toISOString().split('T')[0]
      const dateLabel = bkk.toLocaleDateString('th-TH', {
        day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok'
      })

      if (!map[dateStr]) map[dateStr] = { date: dateStr, dateLabel, profit: 0, count: 0, wins: 0, losses: 0, winRate: 0, trades: [] }
      map[dateStr].profit += t.profit || 0
      map[dateStr].count++
      if ((t.profit || 0) > 0) map[dateStr].wins++
      else if ((t.profit || 0) < 0) map[dateStr].losses++
      map[dateStr].trades.push(t)
    })

    return Object.values(map)
      .map(d => ({ ...d, winRate: d.count ? (d.wins / d.count) * 100 : 0 }))
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [trades])

  const selectedData = selectedDate ? dailyData.find(d => d.date === selectedDate) : null
  const maxAbs = Math.max(...dailyData.map(d => Math.abs(d.profit)), 1)

  function formatTime(created_at: string) {
    return new Date(created_at + 'Z').toLocaleString('th-TH', {
      hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Bangkok'
    })
  }

  const totalProfit = dailyData.reduce((s, d) => s + d.profit, 0)
  const profitDays = dailyData.filter(d => d.profit > 0).length
  const lossDays = dailyData.filter(d => d.profit < 0).length

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">รวมทั้งหมด</p>
          <p className={`text-lg font-medium ${totalProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-500 dark:text-orange-400'}`}>
            {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">วันที่กำไร</p>
          <p className="text-lg font-medium text-emerald-600 dark:text-emerald-400">{profitDays} วัน</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">วันที่ขาดทุน</p>
          <p className="text-lg font-medium text-orange-500 dark:text-orange-400">{lossDays} วัน</p>
        </div>
      </div>

      {/* Daily list */}
      <div className="space-y-1.5 max-h-80 overflow-y-auto scrollbar-thin pr-1">
        {dailyData.map(d => (
          <div
            key={d.date}
            onClick={() => {
              if (selectedDate === d.date) {
                setSelectedDate(null)
                setShowTrades(false)
              } else {
                setSelectedDate(d.date)
                setShowTrades(false)
              }
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all border ${
              selectedDate === d.date
                ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20'
                : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900'
            }`}
          >
            {/* Date */}
            <span className="w-28 text-xs font-medium text-gray-700 dark:text-gray-300 flex-shrink-0">{d.dateLabel}</span>

            {/* Bar */}
            <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(Math.abs(d.profit) / maxAbs) * 100}%`,
                  background: d.profit >= 0 ? '#1D9E75' : '#D85A30',
                }}
              />
            </div>

            {/* P&L */}
            <span className={`w-20 text-right text-sm font-medium flex-shrink-0 ${d.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-500 dark:text-orange-400'}`}>
              {d.profit >= 0 ? '+' : ''}${d.profit.toFixed(2)}
            </span>

            {/* Stats */}
            <span className="w-16 text-right text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
              {d.count} trades
            </span>
            <span className="w-12 text-right text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
              {d.winRate.toFixed(0)}% W
            </span>
          </div>
        ))}

        {dailyData.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">ไม่มีข้อมูล</p>
        )}
      </div>

      {/* Selected day detail */}
      {selectedData && (
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{selectedData.dateLabel}</p>
              <span className={`text-sm font-medium ${selectedData.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-500 dark:text-orange-400'}`}>
                {selectedData.profit >= 0 ? '+' : ''}${selectedData.profit.toFixed(2)}
              </span>
              <span className="text-xs text-gray-400">{selectedData.wins}W / {selectedData.losses}L</span>
            </div>
            <button
              onClick={() => setShowTrades(s => !s)}
              className="text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              {showTrades ? 'ซ่อน' : 'ดู trades'}
            </button>
          </div>

          {showTrades && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {['เวลา', 'Type', 'Volume', 'Price', 'Profit', 'Balance', 'Strategy'].map(h => (
                      <th key={h} className="text-left text-gray-400 dark:text-gray-500 font-medium py-2 px-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedData.trades
                    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    .map(t => {
                      const p = t.profit || 0
                      return (
                        <tr key={t.id} className="border-b border-gray-50 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-900/40">
                          <td className="py-2 px-3 text-gray-500 dark:text-gray-400">{formatTime(t.created_at)}</td>
                          <td className="py-2 px-3">
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                              t.type === 'buy'
                                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                                : 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300'
                            }`}>{t.type}</span>
                          </td>
                          <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{(t.volume || 0).toFixed(2)}</td>
                          <td className="py-2 px-3 text-gray-600 dark:text-gray-300">{(t.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className={`py-2 px-3 font-medium ${p >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-500 dark:text-orange-400'}`}>
                            {p >= 0 ? '+' : ''}{p.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-gray-600 dark:text-gray-300">{(t.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="py-2 px-3 text-gray-400 dark:text-gray-500">{t.order_type || '-'}</td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
