export interface NetworkStats {
  blockHeight: number
  blockTime: number
  apr: number
  inflation: number
  wallets: {
    total: number
    growth: number
  }
  transactions: {
    total: number
    growth: number
  }
}

export interface PriceData {
  current: number
  change24h: number
  marketCap: number
  volume24h: number
  history: {
    timestamp: number
    price: number
  }[]
}

export interface ValidatorStats {
  active: number
  participation: number
  votingPower: number
  totalStake: number
}
