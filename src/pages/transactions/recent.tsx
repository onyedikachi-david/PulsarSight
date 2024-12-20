import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RPC_URL, rpcGraphQL } from '../../utils/rpc'
import {
  Activity,
  XCircle,
  CheckCircle,
  RefreshCw,
  Zap,
  Coins,
  ArrowRightLeft,
  Clock,
  BarChart2,
  Layers,
  Cpu,
  Shield,
  Users,
  Star,
  ExternalLink,
  Hash,
  FileText,
  Sparkles,
  Banknote
} from 'lucide-react'
import { createSolanaRpc } from '@solana/rpc'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

type TransactionData = {
  signatures: string[]
  meta: {
    err: unknown | null
    fee: string
    logMessages: string[]
  } | null
  slot: string
  blockTime: number | null
}

interface BlockResponse {
  data: {
    block: {
      parentSlot: string
      transactions: TransactionData[]
    }
  }
}

const getTimeAgo = (timestamp: number) => {
  const seconds = Math.floor(Date.now() / 1000 - timestamp)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const getTransactionType = (tx: TransactionData) => {
  const instructions = tx.meta?.logMessages || []
  if (instructions.some((msg) => msg.includes('Transfer'))) {
    return { type: 'Transfer', icon: ArrowRightLeft, color: 'text-blue-500' }
  } else if (instructions.some((msg) => msg.includes('Stake'))) {
    return { type: 'Stake', icon: Shield, color: 'text-green-500' }
  } else if (instructions.some((msg) => msg.includes('Vote'))) {
    return { type: 'Vote', icon: Users, color: 'text-indigo-500' }
  } else if (instructions.some((msg) => msg.includes('Create'))) {
    return { type: 'Create', icon: Layers, color: 'text-purple-500' }
  }
  return { type: 'Contract', icon: Cpu, color: 'text-gray-500' }
}

const getTransactionsByHour = (transactions: TransactionData[]) => {
  const now = Date.now() / 1000
  const hourlyData = new Array(7).fill(0)

  transactions.forEach((tx) => {
    if (tx.blockTime) {
      const hoursDiff = (now - tx.blockTime) / (60 * 60)
      if (hoursDiff <= 24) {
        const index = Math.min(6, Math.floor(hoursDiff / 4))
        hourlyData[6 - index]++
      }
    }
  })

  console.log('Hourly transaction data:', hourlyData)
  return hourlyData
}

const RecentTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)

      const rpc = createSolanaRpc(RPC_URL)
      const latestSlot = await rpc.getSlot().send()
      console.log('Latest slot:', latestSlot)

      const source = `
        query GetRecentTransactions($slot: Slot!) {
          block(slot: $slot) {
            parentSlot
            transactions {
              signatures
              meta {
                err
                fee
                logMessages
              }
              slot
              blockTime
            }
          }
        }
      `

      // Fetch transactions from last 10 blocks for more data
      const blocks = []
      let currentSlot: bigint | undefined = BigInt(latestSlot)

      for (let i = 0; i < 10 && currentSlot; i++) {
        try {
          const result = (await rpcGraphQL.query(source, {
            slot: currentSlot.toString()
          })) as BlockResponse

          if (result?.data?.block?.transactions?.length > 0) {
            blocks.push(...result.data.block.transactions)
          }

          // Update currentSlot for next iteration
          currentSlot = result?.data?.block?.parentSlot
            ? BigInt(result.data.block.parentSlot)
            : undefined
        } catch (err) {
          console.warn(`Failed to fetch block at slot ${currentSlot}:`, err)
          break
        }
      }

      // Sort transactions by blockTime to ensure proper ordering
      const sortedTransactions = blocks.sort((a, b) => {
        return (b.blockTime || 0) - (a.blockTime || 0)
      })

      console.log('Fetched transactions:', sortedTransactions)
      setTransactions(sortedTransactions)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError('Failed to fetch transactions')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm dark:border-purple-900/20 dark:bg-gray-800">
            <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-700">
              <div className="flex animate-pulse items-center space-x-3">
                <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-900/20">
                  <div className="size-6 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div>
                  <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="mt-1 h-3 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="px-6 py-4">
                  <div className="flex animate-pulse items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-900/20">
                        <div className="size-5 rounded bg-gray-200 dark:bg-gray-700"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
                        <div className="h-2 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                      </div>
                    </div>
                    <div className="size-8 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-xl border border-red-100 bg-white p-6 shadow-sm dark:border-red-900/20 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <XCircle className="size-6 text-red-500" />
              <div>
                <h3 className="text-lg font-medium text-red-500">
                  Error Loading Transactions
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {error}
                </p>
              </div>
            </div>
            <button
              onClick={() => fetchTransactions()}
              className="mt-4 inline-flex items-center rounded-lg bg-red-500 px-4
                py-2 text-white transition-all duration-200 hover:bg-red-600
                focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
            >
              <RefreshCw className="mr-2 size-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Enhanced Header with Welcome Message */}
        <div className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm dark:border-purple-900/20 dark:bg-gray-800">
          <div className="px-6 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-3">
                <div className="rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 p-3 shadow-lg">
                  <Activity className="size-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Network Activity
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Real-time view of SOON transactions
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={fetchTransactions}
                  className="inline-flex items-center rounded-lg bg-gradient-to-r from-purple-500
                    to-blue-500 px-4 py-2 text-white
                    shadow-lg transition-all duration-200 hover:from-purple-600
                    hover:to-blue-600 hover:shadow-xl focus:outline-none focus:ring-2
                    focus:ring-purple-500 dark:focus:ring-purple-400"
                >
                  <RefreshCw className="mr-2 size-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Network Stats Grid */}
          <div className="grid grid-cols-1 gap-4 bg-gray-50 p-6 dark:bg-gray-900/50 sm:grid-cols-2 lg:grid-cols-4">
            {/* Success Rate Card */}
            <div className="rounded-xl border border-purple-100/50 bg-white p-4 shadow-sm dark:border-purple-900/20 dark:bg-gray-800">
              <div className="flex items-center">
                <div className="mr-3 rounded-lg bg-green-100 p-2 dark:bg-green-900/20">
                  <CheckCircle className="size-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Success Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {`${(
                      (transactions.filter((tx) => !tx.meta?.err).length /
                        transactions.length) *
                      100
                    ).toFixed(1)}%`}
                  </p>
                </div>
              </div>
            </div>

            {/* Average Fee Card */}
            <div className="rounded-xl border border-purple-100/50 bg-white p-4 shadow-sm dark:border-purple-900/20 dark:bg-gray-800">
              <div className="flex items-center">
                <div className="mr-3 rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
                  <Coins className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Average Fee
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {`${(
                      transactions.reduce(
                        (acc, tx) => acc + (Number(tx.meta?.fee) || 0),
                        0
                      ) / transactions.length || 0
                    ).toFixed(2)}`}
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      {' '}
                      lamports
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Speed Card */}
            <div className="rounded-xl border border-purple-100/50 bg-white p-4 shadow-sm dark:border-purple-900/20 dark:bg-gray-800">
              <div className="flex items-center">
                <div className="mr-3 rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
                  <Zap className="size-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Transaction Speed
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {`${transactions.length}`}
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      {' '}
                      per block
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Latest Block Card */}
            <div className="rounded-xl border border-purple-100/50 bg-white p-4 shadow-sm dark:border-purple-900/20 dark:bg-gray-800">
              <div className="flex items-center">
                <div className="mr-3 rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/20">
                  <Layers className="size-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Latest Block
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {transactions.length > 0
                      ? String(
                          Math.max(
                            ...transactions.map((tx) => Number(tx?.slot))
                          )
                        )
                      : '0'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Type Distribution */}
          <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="flex flex-wrap gap-3">
              {[
                {
                  type: 'Transfer',
                  icon: ArrowRightLeft,
                  color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/20'
                },
                {
                  type: 'Contract',
                  icon: Cpu,
                  color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/20'
                },
                {
                  type: 'Stake',
                  icon: Shield,
                  color: 'text-green-500 bg-green-100 dark:bg-green-900/20'
                },
                {
                  type: 'Vote',
                  icon: Users,
                  color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/20'
                }
              ].map(({ type, icon: Icon, color }) => {
                const count = transactions.filter(
                  (tx) => getTransactionType(tx).type === type
                ).length
                const percentage = (
                  (count / transactions.length) *
                  100
                ).toFixed(1)

                return (
                  <div
                    key={type}
                    className="flex items-center space-x-2 rounded-full border border-gray-200
                      bg-white px-3 py-1.5 dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div className={`rounded-full p-1 ${color}`}>
                      <Icon className="size-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {type}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {percentage}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Transaction Activity Chart */}
          <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="mb-4">
              <h3 className="flex items-center text-lg font-medium text-gray-900 dark:text-white">
                <BarChart2 className="mr-2 size-5 text-purple-500" />
                Transaction Activity
              </h3>
              <p className="text-sm text-gray-500">
                Transaction volume over time
              </p>
            </div>
            <div className="h-64 rounded-xl bg-white p-4 dark:bg-gray-800">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex animate-pulse flex-col items-center">
                    <div className="mb-2 size-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Loading chart data...
                    </div>
                  </div>
                </div>
              ) : (
                <Line
                  data={{
                    labels: ['24h', '20h', '16h', '12h', '8h', '4h', 'Now'],
                    datasets: [
                      {
                        label: 'Transactions',
                        data: getTransactionsByHour(transactions),
                        borderColor: 'rgb(147, 51, 234)',
                        backgroundColor: 'rgba(147, 51, 234, 0.1)',
                        tension: 0.4,
                        fill: true
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            return `${context.parsed.y} transactions`
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(147, 51, 234, 0.1)'
                        },
                        ticks: {
                          stepSize: 1,
                          precision: 0
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* Network Health */}
          <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="mb-4">
              <h3 className="flex items-center text-lg font-medium text-gray-900 dark:text-white">
                <Activity className="mr-2 size-5 text-purple-500" />
                Network Health
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    TPS
                  </span>
                  <span className="text-sm text-green-500">Healthy</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-2.5 rounded-full bg-green-500"
                    style={{ width: '70%' }}
                  ></div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Block Time
                  </span>
                  <span className="text-sm text-green-500">400ms</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-2.5 rounded-full bg-green-500"
                    style={{ width: '90%' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Notable Transactions */}
          <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="mb-4">
              <h3 className="flex items-center text-lg font-medium text-gray-900 dark:text-white">
                <Star className="mr-2 size-5 text-purple-500" />
                Notable Transactions
              </h3>
              <p className="text-sm text-gray-500">
                High-value or significant transactions
              </p>
            </div>
            <div className="space-y-3">
              {transactions
                .filter((tx) => Number(tx.meta?.fee) > 5000) // Example filter for high-fee transactions
                .slice(0, 3)
                .map((tx, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200
                      hover:border-purple-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-900/20">
                          <Star className="size-4 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            High Fee Transaction
                          </span>
                          <p className="text-xs text-gray-500">
                            Fee: {tx.meta?.fee} lamports
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/tx/${tx.signatures[0]}`}
                        className="text-purple-500 hover:text-purple-600"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Transaction List Header */}
        <div className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm dark:border-purple-900/20 dark:bg-gray-800">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <h3 className="flex items-center text-lg font-medium text-gray-900 dark:text-white">
              <FileText className="mr-2 size-5 text-purple-500" />
              Recent Transactions
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Latest confirmed transactions on the network
            </p>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
                  <Sparkles className="size-6 text-purple-500" />
                </div>
                <h3 className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                  No Transactions Yet
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Transactions will appear here as they are confirmed
                </p>
              </div>
            ) : (
              transactions.map((tx, index) => {
                const txType = getTransactionType(tx)
                const TypeIcon = txType.icon

                return (
                  <div
                    key={index}
                    className="group px-6 py-4 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Status Icon */}
                        <div
                          className={`shrink-0 rounded-xl p-2 ${
                            tx.meta?.err
                              ? 'bg-red-100 dark:bg-red-900/20'
                              : 'bg-green-100 dark:bg-green-900/20'
                          }`}
                        >
                          {tx.meta?.err ? (
                            <XCircle className="size-5 text-red-600 dark:text-red-400" />
                          ) : (
                            <CheckCircle className="size-5 text-green-600 dark:text-green-400" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          {/* Transaction Type & Signature */}
                          <div className="flex items-center space-x-2">
                            <div
                              className={`rounded-lg p-1.5 ${txType.color
                                .replace('text-', 'bg-')
                                .replace('500', '100')} dark:bg-opacity-20`}
                            >
                              <TypeIcon className={`size-4 ${txType.color}`} />
                            </div>
                            <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
                              {tx.signatures?.[0]
                                ? `${tx.signatures[0].substring(
                                    0,
                                    8
                                  )}...${tx.signatures[0].substring(
                                    tx.signatures[0].length - 8
                                  )}`
                                : 'Signature not available'}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                tx.meta?.err
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                  : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              }`}
                            >
                              {tx.meta?.err ? 'Failed' : 'Success'}
                            </span>
                          </div>

                          {/* Transaction Details */}
                          <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            {/* Slot */}
                            {tx.slot && (
                              <div className="flex items-center">
                                <Hash className="mr-1 size-3.5 text-gray-400" />
                                <span>Slot: {String(tx.slot)}</span>
                              </div>
                            )}

                            {/* Fee */}
                            {tx.meta?.fee !== undefined && (
                              <>
                                <span>•</span>
                                <div className="flex items-center">
                                  <Banknote className="mr-1 size-3.5 text-gray-400" />
                                  <span>{String(tx.meta.fee)} lamports</span>
                                </div>
                              </>
                            )}

                            {/* Time */}
                            {tx.blockTime && (
                              <>
                                <span>•</span>
                                <div className="flex items-center">
                                  <Clock className="mr-1 size-3.5 text-gray-400" />
                                  <span>{getTimeAgo(tx.blockTime)}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* View Details Link */}
                      {tx.signatures?.[0] && (
                        <Link
                          to={`/tx/${tx.signatures[0]}`}
                          className="flex items-center space-x-2 rounded-lg px-4 py-2
                            text-gray-500 transition-all duration-200 hover:text-purple-600
                            group-hover:bg-purple-50 dark:text-gray-400
                            dark:hover:text-purple-400 dark:group-hover:bg-purple-900/10"
                        >
                          <span className="hidden text-sm font-medium sm:block">
                            View Details
                          </span>
                          <ExternalLink className="size-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Link
              to="/blocks"
              className="flex items-center rounded-xl bg-purple-50 p-4
                transition-all duration-200 hover:bg-purple-100 dark:bg-purple-900/10 dark:hover:bg-purple-900/20"
            >
              <div className="mr-3 rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
                <Layers className="size-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium text-purple-900 dark:text-purple-100">
                  Explore Blocks
                </h3>
                <p className="text-sm text-purple-600 dark:text-purple-300">
                  View detailed block information
                </p>
              </div>
            </Link>

            <Link
              to="/validators"
              className="flex items-center rounded-xl bg-blue-50 p-4
                transition-all duration-200 hover:bg-blue-100 dark:bg-blue-900/10 dark:hover:bg-blue-900/20"
            >
              <div className="mr-3 rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
                <Shield className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100">
                  Validators
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  Check validator status
                </p>
              </div>
            </Link>

            <Link
              to="/tokens"
              className="flex items-center rounded-xl bg-green-50 p-4
                transition-all duration-200 hover:bg-green-100 dark:bg-green-900/10 dark:hover:bg-green-900/20"
            >
              <div className="mr-3 rounded-lg bg-green-100 p-2 dark:bg-green-900/20">
                <Coins className="size-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-medium text-green-900 dark:text-green-100">
                  Token Activity
                </h3>
                <p className="text-sm text-green-600 dark:text-green-300">
                  Monitor token transfers
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecentTransactionsPage
