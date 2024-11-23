import { useEffect, useState } from 'react'
import { RPC_URL, rpcGraphQL } from '../utils/rpc'
import { createSolanaRpc } from '@solana/rpc'

interface StatsPanelProps {
  title: string
  value: string
  percentage: number
  type: 'validators' | 'votingPower'
}

export default function StatsPanel({ title, type }: StatsPanelProps) {
  const [data, setData] = useState({
    current: 0,
    total: 0
  })

  const fetchStats = async () => {
    try {
      const rpc = createSolanaRpc(RPC_URL)

      if (type === 'validators') {
        const source = `
          query GetValidators {
            validators {
              votePubkey
              activatedStake
              lastVote
            }
          }
        `

        const result = (await rpcGraphQL.query(source)) as {
          data?: {
            validators: { votePubkey: string; activatedStake: string }[]
          }
        }

        if (result?.data?.validators) {
          const activeValidators = result.data.validators.filter(
            (v: { activatedStake: string }) => Number(v.activatedStake) > 0
          ).length

          setData({
            current: activeValidators,
            total: result.data.validators.length
          })
        }
      } else if (type === 'votingPower') {
        const supply = await rpc.getSupply().send()
        if (supply) {
          const total = Number(supply.value.total) / 1e9 // Convert to SOL
          const active = Number(supply.value.circulating) / 1e9
          setData({
            current: active,
            total: total
          })
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [type])

  const percentage = Math.round((data.current / data.total) * 100)

  return (
    <div className="rounded-xl bg-white p-4 dark:bg-gray-800">
      <h3 className="mb-4 font-medium text-gray-900 dark:text-white">
        {title}
      </h3>
      <div className="relative pt-1">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <span className="inline-block rounded-full bg-purple-200 px-2 py-1 text-xs font-semibold uppercase text-purple-600 dark:bg-purple-900/20">
              {percentage}%
            </span>
          </div>
          <div className="text-right">
            <span className="inline-block text-xs font-semibold text-gray-600 dark:text-gray-400">
              {type === 'votingPower'
                ? `${data.current.toFixed(2)}M`
                : data.current}
            </span>
          </div>
        </div>
        <div className="mb-4 flex h-2 overflow-hidden rounded bg-purple-200 text-xs dark:bg-purple-900/20">
          <div
            style={{ width: `${percentage}%` }}
            className="flex flex-col justify-center whitespace-nowrap bg-purple-500 text-center text-white shadow-none"
          ></div>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {type === 'votingPower'
            ? `${data.current.toFixed(2)}M from ${data.total.toFixed(2)}M`
            : `${data.current} out of ${data.total}`}
        </div>
      </div>
    </div>
  )
}
