export interface Trade {
  id: number
  time: string
  deal: number
  symbol: string
  type: string
  direction: string
  volume: number
  price: number
  order_id: number
  commission: number
  swap: number
  profit: number
  balance: number
  comment: string
  created_at: string
  order_type: string
}

export interface StratStats {
  name: string
  profit: number
  count: number
  wins: number
  losses: number
  winRate: number
}

export interface SymbolStats {
  symbol: string
  profit: number
  count: number
}
