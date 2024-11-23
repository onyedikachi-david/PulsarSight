import React, { useEffect, useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { Tooltip } from './ui/Tooltip'
import { RPC_URL } from '../utils/rpc'
import { createSolanaRpc } from '@solana/rpc'

interface PriceData {
  price: number
  priceChange24h: number
  volume24h: number
  marketCap: number
  circulatingSupply: number
  totalSupply: number
}

export default function PriceSection() {
  const [priceData, setPriceData] = useState<PriceData>({
    price: 0,
    priceChange24h: 0,
    volume24h: 0,
    marketCap: 0,
    circulatingSupply: 0,
    totalSupply: 0
  })

  const fetchPriceData = async () => {
    try {
      const rpc = createSolanaRpc(RPC_URL)
      const supplyInfo = await rpc.getSupply().send()

      if (supplyInfo) {
        const totalSupply = Number(supplyInfo.value.total)
        const circulatingSupply = Number(supplyInfo.value.circulating)

        // For this example, we're using a mock price since we don't have a real price feed
        // In a real application, you would fetch this from a price oracle or API
        const mockPrice = 0.0 // Set to 0 for SOON network

        setPriceData({
          price: mockPrice,
          priceChange24h: 0,
          volume24h: 0,
          marketCap: mockPrice * totalSupply,
          circulatingSupply,
          totalSupply
        })
      }
    } catch (error) {
      console.error('Error fetching price data:', error)
    }
  }

  useEffect(() => {
    fetchPriceData()
    const interval = setInterval(fetchPriceData, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const isPriceUp = priceData.priceChange24h > 0
  const TrendIcon = isPriceUp ? TrendingUp : TrendingDown
  const formattedPrice = priceData.price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  })
  const formattedPriceChange =
    Math.abs(priceData.priceChange24h).toFixed(2) + '%'

  return (
    <div className="glass-card hover-card">
      <div className="border-b border-gray-200 p-6 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary-500/10">
              <DollarSign className="size-5 text-primary-500" />
            </div>
            <h2 className="text-xl font-semibold">SOON Price</h2>
          </div>
          <Tooltip content="View Price Chart">
            <button className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
              <BarChart3 className="size-5 text-gray-500" />
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="font-mono text-3xl font-bold">{formattedPrice}</div>
            <div
              className={`mt-2 flex items-center space-x-2 ${
                isPriceUp ? 'text-green-500' : 'text-red-500'
              }`}
            >
              <TrendIcon className="size-4" />
              <span className="font-medium">{formattedPriceChange}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                24h
              </span>
            </div>
          </div>
          <div className="h-16 w-32 rounded-lg bg-gray-100 dark:bg-gray-800">
            {/* Placeholder for mini price chart */}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <PriceMetric
            icon={<Wallet className="size-5" />}
            label="24h Volume"
            value={formatCurrency(priceData.volume24h)}
            tooltip="Trading volume in the last 24 hours"
          />
          <PriceMetric
            icon={<BarChart3 className="size-5" />}
            label="Market Cap"
            value={formatCurrency(priceData.marketCap)}
            tooltip="Total market capitalization"
          />
          <PriceMetric
            icon={<ArrowUpRight className="size-5" />}
            label="Circulating Supply"
            value={formatNumber(priceData.circulatingSupply)}
            subValue={`${(
              (priceData.circulatingSupply / priceData.totalSupply) *
              100
            ).toFixed(1)}%`}
            tooltip="Number of tokens in circulation"
          />
          <PriceMetric
            icon={<ArrowDownRight className="size-5" />}
            label="Total Supply"
            value={formatNumber(priceData.totalSupply)}
            tooltip="Maximum number of tokens"
          />
        </div>
      </div>
    </div>
  )
}

interface PriceMetricProps {
  icon: React.ReactNode
  label: string
  value: string
  subValue?: string
  tooltip: string
}

function PriceMetric({
  icon,
  label,
  value,
  subValue,
  tooltip
}: PriceMetricProps) {
  return (
    <Tooltip content={tooltip}>
      <div className="flex cursor-help items-start space-x-3 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
          <div className="text-gray-500">{icon}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {label}
          </div>
          <div className="font-mono font-medium">{value}</div>
          {subValue && (
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {subValue}
            </div>
          )}
        </div>
      </div>
    </Tooltip>
  )
}

function formatCurrency(value: number): string {
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`
  }
  if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`
  }
  return `$${value.toFixed(2)}`
}

function formatNumber(value: number): string {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`
  }
  return value.toLocaleString()
}
