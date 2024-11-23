/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react'
import { RPC_URL, rpcGraphQL } from '../../utils/rpc'
import { createSolanaRpc } from '@solana/rpc'
import { Link } from 'react-router-dom'
import {
  Layers,
  RefreshCw,
  Database,
  BarChart2,
  Activity,
  Zap,
  ExternalLink
} from 'lucide-react'

interface Block {
  blockhash: string
  blockHeight: bigint
  blockTime: bigint | null
  parentSlot: bigint
  previousBlockhash: string
  slot: bigint
  transactions: Array<{
    slot: bigint
    meta: {
      fee: bigint
      logMessages: string[]
    }
  }>
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

// Calculate block statistics
const getBlockStats = (blocks: Block[]) => {
  const totalTransactions = blocks.reduce(
    (sum, block) => sum + block.transactions?.length,
    0
  )
  const avgTransactionsPerBlock =
    blocks.length > 0 ? totalTransactions / blocks.length : 0
  const totalFees = blocks.reduce((sum, block) => {
    const blockFees = block.transactions.reduce((blockSum, tx) => {
      return blockSum + (tx.meta?.fee || 0n)
    }, 0n)
    return sum + blockFees
  }, 0n)

  return {
    totalTransactions,
    avgTransactionsPerBlock,
    totalFees
  }
}

// Add this function for copy feedback
const copyToClipboard = async (text: string, event: React.MouseEvent) => {
  const button = event.currentTarget as HTMLButtonElement
  try {
    await navigator.clipboard.writeText(text)

    // Show success state
    button.classList.add('text-green-500', 'dark:text-green-400')
    button.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    `

    // Reset after 2 seconds
    setTimeout(() => {
      button.classList.remove('text-green-500', 'dark:text-green-400')
      button.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      `
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const BlocksPage: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSlot, setCurrentSlot] = useState<bigint | null>(null)
  const [firstVisibleSlot, setFirstVisibleSlot] = useState<bigint | null>(null)
  const [hasNext, setHasNext] = useState(true)
  const [hasPrevious, setHasPrevious] = useState(false)
  const [totalBlocks, setTotalBlocks] = useState<bigint | null>(null)
  const [blocksPerPage, setBlocksPerPage] = useState(10)

  const fetchBlocks = async (
    startSlot?: bigint,
    direction: 'next' | 'previous' = 'next'
  ) => {
    try {
      setLoading(true)

      if (!startSlot) {
        const rpc = createSolanaRpc(RPC_URL)
        startSlot = await rpc.getSlot().send()
      }

      const blockSource = `
        query GetBlock($slot: Slot!) {
          block(slot: $slot) {
            blockhash
            blockHeight
            blockTime
            parentSlot
            previousBlockhash
            transactions {
              slot
              meta {
                fee
                logMessages
              }
            }
          }
        }
      `

      const newBlocks: Block[] = []
      let slot = startSlot

      for (let i = 0; i < blocksPerPage && slot; i++) {
        const result = await rpcGraphQL.query(blockSource, {
          slot: slot as unknown
        })
        console.log('Block result', result)

        if (result?.data?.block) {
          const block = result.data.block as Block
          if (direction === 'next') {
            newBlocks.push(block)
            slot = block.parentSlot
          } else {
            newBlocks.unshift(block)
            slot = slot + 1n
          }
        } else {
          break
        }
      }

      setBlocks(newBlocks)
      setCurrentSlot(startSlot)
      setFirstVisibleSlot(newBlocks[0]?.slot || null)
      setHasNext(newBlocks.length === blocksPerPage)
      setHasPrevious(!!startSlot && startSlot > 0n)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching blocks:', err)
      setError('Failed to fetch block details')
      setLoading(false)
    }
  }

  const fetchTotalBlocks = async () => {
    try {
      const rpc = createSolanaRpc(RPC_URL)
      const slot = await rpc.getSlot().send()
      setTotalBlocks(slot)
    } catch (err) {
      console.error('Error fetching total blocks:', err)
    }
  }

  useEffect(() => {
    fetchBlocks()
    fetchTotalBlocks()
  }, [])

  const handleNext = () => {
    if (blocks.length > 0) {
      const lastBlock = blocks[blocks.length - 1]
      fetchBlocks(lastBlock.parentSlot, 'next')
    }
  }

  const handlePrevious = () => {
    if (firstVisibleSlot) {
      fetchBlocks(firstVisibleSlot + BigInt(blocksPerPage), 'previous')
    }
  }

  const handleRowsPerPageChange = (newValue: number) => {
    setBlocksPerPage(newValue)
    fetchBlocks(currentSlot || undefined)
  }

  // Calculate stats for display
  const stats = getBlockStats(blocks)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Enhanced Header with Stats */}
        <div className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm dark:border-purple-900/20 dark:bg-gray-800">
          <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-700">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-3">
                <div className="rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 p-3 shadow-lg">
                  <Layers className="size-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Recent Blocks
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Latest blocks on the network
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => fetchBlocks()}
                  className="inline-flex items-center rounded-lg bg-gradient-to-r from-purple-500
                    to-blue-500 px-4 py-2 text-white
                    transition-all duration-200 hover:from-purple-600 hover:to-blue-600
                    focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                >
                  <RefreshCw className="mr-2 size-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Block Stats */}
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
            {/* Total Transactions Card */}
            <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/10">
              <div className="flex items-center">
                <div className="mr-3 rounded-lg bg-purple-100 p-2.5 dark:bg-purple-900/20">
                  <Activity className="size-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    Total Transactions
                  </p>
                  <p className="mt-1 text-xl font-semibold text-purple-700 dark:text-purple-300">
                    {stats.totalTransactions.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Average Transactions Card */}
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/10">
              <div className="flex items-center">
                <div className="mr-3 rounded-lg bg-blue-100 p-2.5 dark:bg-blue-900/20">
                  <BarChart2 className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Avg. Tx/Block
                  </p>
                  <p className="mt-1 text-xl font-semibold text-blue-700 dark:text-blue-300">
                    {stats.avgTransactionsPerBlock.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Fees Card */}
            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/10">
              <div className="flex items-center">
                <div className="mr-3 rounded-lg bg-green-100 p-2.5 dark:bg-green-900/20">
                  <Zap className="size-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    Total Fees
                  </p>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-xl font-semibold text-green-700 dark:text-green-300">
                      {stats.totalFees.toString()}
                    </p>
                    <p className="ml-1 text-sm text-green-600 dark:text-green-400">
                      lamports
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Blocks List */}
        <div className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm dark:border-purple-900/20 dark:bg-gray-800">
          {/* Table Header */}
          <div className="hidden gap-4 bg-gray-50 px-6 py-3 text-sm font-medium text-gray-500 dark:bg-gray-900/50 dark:text-gray-400 sm:grid sm:grid-cols-6">
            <div>Height</div>
            <div>Hash</div>
            <div>Time</div>
            <div>Txn Count</div>
            <div>Total Fees</div>
            <div className="text-right">Actions</div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {[...Array(blocksPerPage)].map((_, i) => (
                <div key={i} className="animate-pulse px-6 py-4">
                  <div className="grid grid-cols-6 gap-4">
                    <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-4 w-16 justify-self-end rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Blocks List */}
          {!loading && blocks.length > 0 && (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {blocks.map((block) => {
                const totalFees = block.transactions.reduce(
                  (sum, tx) => sum + (tx.meta?.fee || 0n),
                  0n
                )

                return (
                  <div
                    key={block.blockhash}
                    className="transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <div className="grid grid-cols-6 gap-4 px-6 py-4">
                      {/* Block Height */}
                      <div className="flex items-center">
                        <Link
                          to={`/block/${block.blockHeight.toString()}`}
                          className="font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                        >
                          #{block.blockHeight.toString()}
                        </Link>
                      </div>

                      {/* Block Hash */}
                      <div className="group flex items-center">
                        <Link
                          to={`/tx/${block.blockhash}`}
                          className="group flex items-center space-x-2"
                        >
                          <div
                            className="font-mono text-sm text-purple-600 group-hover:text-purple-700
                            dark:text-purple-400 dark:group-hover:text-purple-300"
                          >
                            {`${block.blockhash.slice(
                              0,
                              6
                            )}...${block.blockhash.slice(-6)}`}
                          </div>
                          <div
                            className="rounded-lg bg-purple-100 p-1.5 opacity-0
                            transition-all duration-200 group-hover:opacity-100 dark:bg-purple-900/20"
                          >
                            <ExternalLink className="size-3 text-purple-600 dark:text-purple-400" />
                          </div>
                        </Link>
                        <button
                          onClick={(e) => copyToClipboard(block.blockhash, e)}
                          className="ml-2 rounded-lg p-1.5 text-gray-400 opacity-0
                            transition-all duration-200 hover:bg-gray-100
                            hover:text-gray-600 group-hover:opacity-100 dark:hover:bg-gray-700/50 dark:hover:text-gray-300"
                          title="Copy full hash"
                        >
                          <svg
                            className="size-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Block Time */}
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        {block.blockTime
                          ? getTimeAgo(Number(block.blockTime))
                          : 'N/A'}
                      </div>

                      {/* Transaction Count */}
                      <div className="flex items-center">
                        <span
                          className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs
                          font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
                        >
                          {block.transactions.length}
                        </span>
                      </div>

                      {/* Total Fees */}
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        {totalFees.toString()} lamports
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end">
                        <Link
                          to={`/block/${block.blockHeight.toString()}`}
                          className="group p-2 text-gray-400 transition-colors hover:text-purple-500 dark:hover:text-purple-400"
                        >
                          <div className="rounded-lg p-2 transition-colors group-hover:bg-purple-100 dark:group-hover:bg-purple-900/20">
                            <ExternalLink className="size-5 transition-transform group-hover:scale-110" />
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && blocks.length === 0 && (
            <div className="px-6 py-8 text-center">
              <div className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <Database className="size-8 text-gray-400" />
              </div>
              <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">
                No blocks found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search or filter to find what you&apos;re
                looking for.
              </p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Show:
            </span>
            <select
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
              value={blocksPerPage}
              onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
            >
              <option value="5">5 blocks</option>
              <option value="10">10 blocks</option>
              <option value="20">20 blocks</option>
              <option value="50">50 blocks</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handlePrevious}
              disabled={!hasPrevious || loading}
              className={`rounded-lg px-3 py-2 ${
                hasPrevious && !loading
                  ? 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                  : 'cursor-not-allowed text-gray-400 dark:text-gray-600'
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={!hasNext || loading}
              className={`rounded-lg px-3 py-2 ${
                hasNext && !loading
                  ? 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                  : 'cursor-not-allowed text-gray-400 dark:text-gray-600'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlocksPage
