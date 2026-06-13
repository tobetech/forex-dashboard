'use client'

interface MetricCardProps {
  label: string
  value: string
  sub?: string
  positive?: boolean | null
}

export default function MetricCard({ label, value, sub, positive }: MetricCardProps) {
  const valueColor =
    positive === true ? 'text-emerald-600 dark:text-emerald-400' :
    positive === false ? 'text-orange-500 dark:text-orange-400' :
    'text-gray-900 dark:text-white'

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className={`text-xl font-medium ${valueColor}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}
