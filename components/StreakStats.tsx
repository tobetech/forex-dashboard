'use client'

import { Trade } from '@/types'
import { useMemo } from 'react'

interface Props {
  trades: Trade[]
}

export default function StreakStats({ trades }: Props) {
  const stats = useMemo(() => {
    const sorted = [...trades].sort((a, b) => a.id - b.id)

    let curWin = 0, curLoss = 0
    let maxWin = 0, maxLoss = 0
    let maxWinProfit = 0, maxLossProfit = 0
    let curWinProfit = 0, curLossProfit = 0

    for (const t of sorted) {
      const p = t.profit || 0
      if (p > 0) {
        curWin++
        curWinProfit += p
        curLoss = 0
        curLossProfit = 0
        if (curWin > maxWin) { maxWin = curWin; maxWinProfit = curWinProfit }
      } else if (p < 0) {
        curLoss++
        curLossProfit += p
        curWin = 0
        curWinProfit = 0
        if (curLoss > maxLoss) { maxLoss = curLoss; maxLossProfit = curLossProfit }
      }
    }

    // Current streak
    let currentStreak = 0
    let currentType: 'win' | 'loss' | null = null
    let currentProfit = 0
    for (let i = sorted.length - 1; i >= 0; i--) {
      const p = sorted[i].profit || 0
      if (i === sorted.length - 1) {
        currentType = p >= 0 ? 'win' : 'loss'
      }
      if ((currentType === 'win' && p >= 0) || (currentType === 'loss' && p < 0)) {
        currentStreak++
        currentProfit += p
      } else break
    }

    return { maxWin, maxWinProfit, maxLoss, maxLossProfit, currentStreak, currentType, currentProfit }
  }, [trades])

  const items = [
    {
      label: 'Max win streak',
      value: `${stats.maxWin} trades`,
      sub: `+$${stats.maxWinProfit.toFixed(2)}`,
      icon: '🔥',
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Max loss streak',
      value: `${stats.maxLoss} trades`,
      sub: `-$${Math.abs(stats.maxLossProfit).toFixed(2)}`,
      icon: '❄️',
      color: 'text-orange-500 dark:text-orange-400',
    },
    {
      label: 'Current streak',
      value: `${stats.currentStreak} ${stats.currentType === 'win' ? 'wins' : 'losses'}`,
      sub: `${stats.currentProfit >= 0 ? '+' : ''}$${stats.currentProfit.toFixed(2)}`,
      icon: stats.currentType === 'win' ? '📈' : '📉',
      color: stats.currentType === 'win' ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-500 dark:text-orange-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {items.map(item => (
        <div key={item.label} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{item.icon}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
          </div>
          <p className={`text-xl font-medium ${item.color}`}>{item.value}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{item.sub}</p>
        </div>
      ))}
    </div>
  )
}
