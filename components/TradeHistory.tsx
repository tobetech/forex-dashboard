'use client'

import { Trade } from '@/types'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

interface Props {
  trades: Trade[]
}

export default function TradeHistory({ trades }: Props) {
  return (
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
          {trades.map(t => {
            const p = t.profit || 0
            const dt = t.created_at && !isNaN(new Date(t.created_at).getTime())
              ? format(new Date(t.created_at), 'd MMM HH:mm', { locale: th })
              : '-'
            return (
              <tr key={t.id} className="border-b border-gray-50 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                <td className="py-2 px-2 text-gray-400 dark:text-gray-500 whitespace-nowrap text-xs">{dt}</td>
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
          {trades.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center text-gray-400 py-8">ไม่มีข้อมูล</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
