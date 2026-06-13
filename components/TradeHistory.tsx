'use client'

import { Trade } from '@/types'
import { useState } from 'react'

interface Props {
  trades: Trade[]
}

const PAGE_SIZE = 20

export default function TradeHistory({ trades }: Props) {
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(trades.length / PAGE_SIZE)
  const paginated = trades.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function formatTime(created_at: string) {
    if (!created_at) return '-'
    return new Date(created_at + 'Z').toLocaleString('th-TH', {
      day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit',
      hour12: false, timeZone: 'Asia/Bangkok',
    })
  }

  return (
    <div>
      <div className="overflow-x-auto scrollbar-thin -mx-4 px-4">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              {['Time', 'Symbol', 'Type', 'Vol', 'Price', 'Profit', 'Balance', 'Strategy'].map(h => (
                <th key={h} className="text-left text-xs text-gray-400 dark:text-gray-500 font-medium py-2 px-2 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map(t => {
              const p = t.profit || 0
              return (
                <tr key={t.id} className="border-b border-gray-50 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                  <td className="py-2 px-2 text-gray-400 dark:text-gray-500 whitespace-nowrap text-xs">{formatTime(t.created_at)}</td>
                  <td className="py-2 px-2 font-medium text-gray-800 dark:text-gray-100">{t.symbol || '-'}</td>
                  <td className="py-2 px-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      t.type === 'buy'
                        ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                        : 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300'
                    }`}>
                      {t.type || '-'}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-gray-600 dark:text-gray-400">{(t.volume || 0).toFixed(2)}</td>
                  <td className="py-2 px-2 text-gray-600 dark:text-gray-300">{(t.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className={`py-2 px-2 font-medium ${p >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-500 dark:text-orange-400'}`}>
                    {p >= 0 ? '+' : ''}{p.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-gray-600 dark:text-gray-300">
                    {(t.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-2 text-gray-400 dark:text-gray-500 text-xs">{t.order_type || '-'}</td>
                </tr>
              )
            })}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-gray-400 py-8">ไม่มีข้อมูล</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            แสดง {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, trades.length)} จาก {trades.length} รายการ
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              «
            </button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ‹
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p: number
              if (totalPages <= 5) p = i + 1
              else if (page <= 3) p = i + 1
              else if (page >= totalPages - 2) p = totalPages - 4 + i
              else p = page - 2 + i
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 text-xs rounded-md border transition-all ${
                    page === p
                      ? 'bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900'
                  }`}
                >
                  {p}
                </button>
              )
            })}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ›
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
