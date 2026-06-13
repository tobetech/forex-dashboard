import { Trade, StratStats, SymbolStats } from '@/types'

export function filterByDays(trades: Trade[], days: number): Trade[] {
  if (!days) return trades
  const cutoff = new Date(Date.now() - days * 86400000)
  return trades.filter(t => {
    const date = t.created_at ? new Date(t.created_at) : null
    return date && !isNaN(date.getTime()) && date >= cutoff
  })
}

export function getClosedTrades(trades: Trade[]): Trade[] {
  return trades
}

export function calcMetrics(closed: Trade[]) {
  const totalProfit = closed.reduce((s, t) => s + (t.profit || 0), 0)
  const wins = closed.filter(t => (t.profit || 0) > 0)
  const losses = closed.filter(t => (t.profit || 0) < 0)
  const winRate = closed.length ? (wins.length / closed.length) * 100 : 0
  const avgWin = wins.length ? wins.reduce((s, t) => s + (t.profit || 0), 0) / wins.length : 0
  const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + (t.profit || 0), 0) / losses.length) : 0
  const rr = avgLoss ? avgWin / avgLoss : 0
  const grossWin = wins.reduce((s, t) => s + (t.profit || 0), 0)
  const grossLoss = Math.abs(losses.reduce((s, t) => s + (t.profit || 0), 0))
  const pf = grossLoss ? grossWin / grossLoss : 0
  const lastBalance = closed.length ? (closed[0]?.balance || 0) : 0
  const maxDrawdown = calcMaxDrawdown(closed)

  return { totalProfit, wins: wins.length, losses: losses.length, winRate, avgWin, avgLoss, rr, pf, lastBalance, maxDrawdown, total: closed.length }
}

export function calcMaxDrawdown(closed: Trade[]): number {
  if (!closed.length) return 0
  const sorted = [...closed].sort((a, b) => a.id - b.id)
  let peak = sorted[0]?.balance || 0
  let maxDD = 0
  for (const t of sorted) {
    if ((t.balance || 0) > peak) peak = t.balance || 0
    const dd = peak > 0 ? ((peak - (t.balance || 0)) / peak) * 100 : 0
    if (dd > maxDD) maxDD = dd
  }
  return maxDD
}

export function calcStratStats(closed: Trade[]): StratStats[] {
  const map: Record<string, StratStats> = {}
  for (const t of closed) {
    const name = (t.order_type || 'Unknown').trim()
    if (!map[name]) map[name] = { name, profit: 0, count: 0, wins: 0, losses: 0, winRate: 0 }
    map[name].profit += t.profit || 0
    map[name].count++
    if ((t.profit || 0) > 0) map[name].wins++
    else map[name].losses++
  }
  return Object.values(map)
    .map(s => ({ ...s, winRate: s.count ? (s.wins / s.count) * 100 : 0 }))
    .sort((a, b) => b.profit - a.profit)
}

export function calcSymbolStats(closed: Trade[]): SymbolStats[] {
  const map: Record<string, SymbolStats> = {}
  for (const t of closed) {
    const sym = t.symbol || 'Other'
    if (!map[sym]) map[sym] = { symbol: sym, profit: 0, count: 0 }
    map[sym].profit += t.profit || 0
    map[sym].count++
  }
  return Object.values(map).sort((a, b) => b.profit - a.profit)
}

export function getEquityCurve(trades: Trade[]) {
  return [...trades]
    .sort((a, b) => a.id - b.id)
    .map(t => ({ time: t.created_at || '', balance: t.balance || 0 }))
}

export function fmtMoney(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function fmtPct(n: number): string {
  return n.toFixed(1) + '%'
}
