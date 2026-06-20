'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Trade } from '@/types'
import {
  filterByDays, getClosedTrades, calcMetrics,
  calcStratStats, calcSymbolStats, getEquityCurve,
  fmtMoney, fmtPct
} from '@/lib/utils'
import MetricCard from '@/components/MetricCard'
import EquityChart from '@/components/EquityChart'
import WinRateChart from '@/components/WinRateChart'
import StrategyTable from '@/components/StrategyTable'
import SymbolChart from '@/components/SymbolChart'
import TradeHistory from '@/components/TradeHistory'
import PnLHeatmap from '@/components/PnLHeatmap'
import DrawdownChart from '@/components/DrawdownChart'
import StreakStats from '@/components/StreakStats'
import BestWorstTrades from '@/components/BestWorstTrades'
import DailyPnL from '@/components/DailyPnL'
import TradingHours from '@/components/TradingHours'

const PERIODS = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: 'All', days: 0 },
]

function SunIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  )
}

export default function Dashboard() {
  const [allTrades, setAllTrades] = useState<Trade[]>([])
  const [days, setDays] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [dark, setDark] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [countdown, setCountdown] = useState(30)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = saved ? saved === 'dark' : prefersDark
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  const fetchTrades = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('forex')
      .select('*')
      .order('id', { ascending: false })
      .limit(5000)

    if (err) {
      setError(err.message)
    } else {
      setAllTrades(data || [])
      setLastUpdated(new Date())
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchTrades() }, [fetchTrades])

  // Auto-refresh every 30s
  useEffect(() => {
    if (!autoRefresh) { setCountdown(30); return }
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { fetchTrades(); return 30 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchTrades])

  const trades = filterByDays(allTrades, days)
  const closed = getClosedTrades(trades)
  const metrics = calcMetrics(closed)
  const stratStats = calcStratStats(closed)
  const symbolStats = calcSymbolStats(closed)
  const equityCurve = getEquityCurve(closed)

  const card = 'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4'
  const cardTitle = 'text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5 gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-medium truncate">Forex Dashboard</h1>
              {lastUpdated && (
                <p className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
                  อัปเดต {lastUpdated.toLocaleTimeString('th-TH')} · {allTrades.length.toLocaleString()} rows
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <div className="flex bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-0.5">
              {PERIODS.map(p => (
                <button
                  key={p.label}
                  onClick={() => setDays(p.days)}
                  className={`px-2 sm:px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    days === p.days
                      ? 'bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button
              onClick={fetchTrades}
              disabled={loading}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-all disabled:opacity-50"
            >
              <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Auto-refresh toggle */}
            <button
              onClick={() => setAutoRefresh(a => !a)}
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs border rounded-lg transition-all ${
                autoRefresh
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  : 'border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
              }`}
              title={autoRefresh ? 'Auto-refresh on' : 'Auto-refresh off'}
            >
              <svg className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">{autoRefresh ? `${countdown}s` : 'Auto'}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-8 h-8 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-all"
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl px-4 py-3 text-sm mb-5">
            เชื่อมต่อ Supabase ไม่สำเร็จ: {error}
          </div>
        )}

        {loading && !allTrades.length ? (
          <div className="text-center py-20 text-gray-400">
            <svg className="w-6 h-6 animate-spin mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            กำลังโหลดข้อมูล...
          </div>
        ) : (
          <>
            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-4 sm:mb-5">
              <MetricCard label="Total P&L" value={(metrics.totalProfit >= 0 ? '+' : '') + '$' + fmtMoney(metrics.totalProfit)} sub={`${metrics.total} trades`} positive={metrics.totalProfit >= 0} />
              <MetricCard label="Balance" value={'$' + fmtMoney(metrics.lastBalance)} sub="Current" />
              <MetricCard label="Win rate" value={fmtPct(metrics.winRate)} sub={`${metrics.wins}W / ${metrics.losses}L`} positive={metrics.winRate >= 50} />
              <MetricCard label="Risk / reward" value={metrics.rr.toFixed(2)} sub="Avg win ÷ loss" positive={metrics.rr >= 1} />
              <MetricCard label="Profit factor" value={metrics.pf.toFixed(2)} sub="Gross P ÷ L" positive={metrics.pf >= 1} />
              <MetricCard label="Max drawdown" value={fmtPct(metrics.maxDrawdown)} sub="From peak" positive={metrics.maxDrawdown < 10} />
            </div>

            {/* Equity + Win rate */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className={`lg:col-span-2 ${card}`}>
                <p className={cardTitle}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Equity curve
                </p>
                <EquityChart data={equityCurve} />
              </div>
              <div className={card}>
                <p className={cardTitle}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" />
                  </svg>
                  Win rate
                </p>
                <WinRateChart wins={metrics.wins} losses={metrics.losses} winRate={metrics.winRate} avgWin={metrics.avgWin} avgLoss={metrics.avgLoss} rr={metrics.rr} />
              </div>
            </div>

            {/* Drawdown chart */}
            <div className={`${card} mb-3 sm:mb-4`}>
              <p className={cardTitle}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
                Drawdown
              </p>
              <DrawdownChart trades={closed} />
            </div>

            {/* Streak stats */}
            <div className="mb-3 sm:mb-4">
              <p className={`${cardTitle} mb-2`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Consecutive wins / losses
              </p>
              <StreakStats trades={closed} />
            </div>

            {/* Heatmap */}
            <div className={`${card} mb-3 sm:mb-4`}>
              <p className={cardTitle}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                P&L heatmap (วัน × ชั่วโมง, เวลาไทย)
              </p>
              <PnLHeatmap trades={closed} />
            </div>

            {/* Strategy + Symbol */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className={card}>
                <div className="flex items-center justify-between mb-3">
                  <p className={cardTitle + ' mb-0'}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Performance by strategy
                  </p>
                  <span className="text-xs text-gray-300 dark:text-gray-600">P&L · WR · Count</span>
                </div>
                <StrategyTable data={stratStats} />
              </div>
              <div className={card}>
                <p className={cardTitle}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M3 12h18M3 18h18" />
                  </svg>
                  P&L by symbol
                </p>
                <SymbolChart data={symbolStats} />
              </div>
            </div>

            {/* Trade Analysis */}
            <div className={card + ' mb-3 sm:mb-4'}>
              <p className={cardTitle}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Best / Worst trades
              </p>
              <BestWorstTrades trades={closed} />
            </div>

            <div className={card + ' mb-3 sm:mb-4'}>
              <p className={cardTitle}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Trading hours analysis (เวลาไทย)
              </p>
              <TradingHours trades={closed} />
            </div>

            {/* Daily P&L */}
            <div className={`${card} mb-3 sm:mb-4`}>
              <p className={cardTitle}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                กำไร / ขาดทุน รายวัน
                <span className="text-gray-300 dark:text-gray-600 ml-1">(คลิกเพื่อดู trades)</span>
              </p>
              <DailyPnL trades={closed} />
            </div>

            {/* Trade history */}
            <div className={card}>
              <p className={cardTitle}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent trades
                <span className="text-gray-300 dark:text-gray-600 ml-1">({trades.length} รายการ)</span>
              </p>
              <TradeHistory trades={trades} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
