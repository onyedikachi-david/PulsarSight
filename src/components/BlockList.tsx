import React, { useState, useEffect } from 'react';
import { Cuboid, ArrowRight, Blocks, Timer, Search, Filter } from 'lucide-react';
import { CopyToClipboard } from './ui/CopyToClipboard';
import { Tooltip } from './ui/Tooltip';
import { BlockSkeleton } from './ui/Skeleton';
import { RPC_URL, rpcGraphQL } from '../utils/rpc';
import { createSolanaRpc } from '@solana/rpc';

interface Block {
  slot: string;
  blockTime: number;
  transactions: any[];
  blockhash: string;
  parentSlot: string;
  blockHeight?: number;
}

export default function BlockList() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBlocks = async () => {
    try {
      setIsLoading(true);
      const rpc = createSolanaRpc(RPC_URL);
      const latestSlot = await rpc.getSlot().send();

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
      `;

      // Fetch last 5 blocks
      const recentBlocks = [];
      let currentSlot = BigInt(latestSlot);

      for (let i = 0; i < 5 && currentSlot; i++) {
        const result = await rpcGraphQL.query(source, {
          slot: currentSlot.toString()
        });

        if (result?.data?.block) {
          recentBlocks.push({
            ...result.data.block,
            slot: currentSlot.toString()
          });
          currentSlot = BigInt(result.data.block.parentSlot);
        }
      }

      setBlocks(recentBlocks);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching blocks:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
    const interval = setInterval(fetchBlocks, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  

  return (
    <div className="glass-card hover-card">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
              <Blocks className="w-5 h-5 text-primary-500" />
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
                  pl-9 pr-4 py-1.5 w-48
                  bg-gray-50 dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700
                  rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20
                  transition-all duration-200
                "
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <button
              onClick={fetchBlocks}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Filter className="w-4 h-4 text-gray-500" />
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
          blocks.map((block, index) => (
            <BlockItem key={block.slot} block={block} />
          ))
        )}
      </div>
    </div>
  );
}

function BlockItem({ block }: { block: Block }) {
  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-red-500" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-medium">#{block.slot}</span>
                <span className="text-xs text-gray-500">{block.blockTime ? getTimeAgo(Number(block.blockTime)) : ''}</span>
              </div>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-xs text-gray-500">Hash:</span>
                <Tooltip content="Copy Block Hash">
                  <CopyToClipboard
                    content={block.blockhash}
                    className="text-xs font-mono text-gray-600 truncate max-w-[120px]"
                  />
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">{block.transactions?.length || 0} txs</div>
          <div className="text-xs text-gray-500">{((block.transactions?.length || 0) * 0.265).toFixed(2)} SOL</div>
        </div>
      </div>
    </div>
  );
}

function MetricItem({ 
  icon, 
  label, 
  value, 
  tooltip 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
  tooltip: string;
}) {
  return (
    <Tooltip content={tooltip}>
      <div className="flex flex-col items-end cursor-help">
        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
          {icon}
          <span>{label}</span>
        </div>
        <span className="font-mono text-sm font-medium">{value}</span>
      </div>
    </Tooltip>
  );
}