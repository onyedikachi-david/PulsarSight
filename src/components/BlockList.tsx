import React, { useState, useEffect } from 'react'
import { Blocks, Search, Filter } from 'lucide-react'
import { CopyToClipboard } from './ui/CopyToClipboard'
import { Tooltip } from './ui/Tooltip'
import { BlockSkeleton } from './ui/Skeleton'
import { RPC_URL, rpcGraphQL } from '../utils/rpc'
import { createSolanaRpc } from '@solana/rpc'

interface Block {
  slot: string
  blockTime: number
  transactions: unknown[]
  blockhash: string
  parentSlot: string
  blockHeight?: number
}

export default function BlockList() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchBlocks = async () => {
    try {
      setIsLoading(true)
      const rpc = createSolanaRpc(RPC_URL)
      const latestSlot = await rpc.getSlot().send()

      const source = `
        query GetRecentBlocks($slot: Slot!) {
          block(slot: $slot) {
            blockhash
            blockTime
            parentSlot
            transactions {
              signatures
            }
          }
        }
      `

      // Fetch last 5 blocks
      const recentBlocks = []
      let currentSlot = BigInt(latestSlot)

      for (let i = 0; i < 5 && currentSlot; i++) {
        const result = (await rpcGraphQL.query(source, {
          slot: currentSlot.toString()
        })) as {
          data?: {
            block?: {
              parentSlot: string
              blockhash: string
              blockTime: number
              transactions: { signatures: string[] }[]
            }
          }
        }

        if (result?.data?.block) {
          recentBlocks.push({
            ...result.data.block,
            slot: currentSlot.toString()
          })
          currentSlot = BigInt(result.data.block.parentSlot)
        }
      }

      setBlocks(recentBlocks)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching blocks:', error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBlocks()
    const interval = setInterval(fetchBlocks, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="glass-card hover-card">
      <div className="border-b border-gray-200 p-6 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary-500/10">
              <Blocks className="size-5 text-primary-500" />
            </div>
            <h2 className="text-xl font-semibold">Latest Blocks</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search blocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                  w-48 rounded-lg border border-gray-200
                  bg-gray-50 py-1.5
                  pl-9 pr-4 text-sm
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20
                  dark:border-gray-700 dark:bg-gray-800
                "
              />
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            </div>
            <button
              onClick={fetchBlocks}
              className="rounded-lg p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Filter className="size-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {isLoading ? (
          <>
            <BlockSkeleton />
            <BlockSkeleton />
            <BlockSkeleton />
          </>
        ) : (
          blocks.map((block) => <BlockItem key={block.slot} block={block} />)
        )}
      </div>
    </div>
  )
}

function BlockItem({ block }: { block: Block }) {
  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  return (
    <div className="group p-4 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="flex size-6 items-center justify-center rounded-full bg-red-500/10">
              <div className="size-2 rounded-full bg-red-500" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-medium">
                  #{block.slot}
                </span>
                <span className="text-xs text-gray-500">
                  {block.blockTime ? getTimeAgo(Number(block.blockTime)) : ''}
                </span>
              </div>
              <div className="mt-0.5 flex items-center space-x-2">
                <span className="text-xs text-gray-500">Hash:</span>
                <Tooltip content="Copy Block Hash">
                  <CopyToClipboard
                    content={block.blockhash}
                    className="max-w-[120px] truncate font-mono text-xs text-gray-600"
                  />
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">
            {block.transactions?.length || 0} txs
          </div>
          <div className="text-xs text-gray-500">
            {((block.transactions?.length || 0) * 0.265).toFixed(2)} SOL
          </div>
        </div>
      </div>
    </div>
  )
}
