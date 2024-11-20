import React, { useState } from 'react';
import { Cuboid, ArrowRight, Blocks, Timer, Search, Filter } from 'lucide-react';
import { CopyToClipboard } from './ui/CopyToClipboard';
import { Tooltip } from './ui/Tooltip';
import { BlockSkeleton } from './ui/Skeleton';

interface Block {
  height: number;
  timestamp: string;
  transactions: number;
  proposer: string;
  size: string;
  time: string;
}

const blocks: Block[] = [
  {
    height: 12345678,
    timestamp: '2 mins ago',
    transactions: 156,
    proposer: '0xabcd...efgh',
    size: '1.2 MB',
    time: '6.5s',
  },
  {
    height: 12345677,
    timestamp: '5 mins ago',
    transactions: 98,
    proposer: '0xijkl...mnop',
    size: '0.8 MB',
    time: '6.2s',
  },
  {
    height: 12345676,
    timestamp: '8 mins ago',
    transactions: 203,
    proposer: '0xqrst...uvwx',
    size: '1.5 MB',
    time: '6.8s',
  },
];

export default function BlockList() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
            <Tooltip content="Filter blocks">
              <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Filter className="w-4 h-4 text-gray-500" />
              </button>
            </Tooltip>
            <button className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">
              View All
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
            <BlockItem key={index} block={block} />
          ))
        )}
      </div>
    </div>
  );
}

function BlockItem({ block }: { block: Block }) {
  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Cuboid className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Tooltip content="Block Height">
                <span className="font-mono font-medium">#{block.height}</span>
              </Tooltip>
              <span className="text-xs text-gray-500 dark:text-gray-400">{block.timestamp}</span>
            </div>
            <div className="flex items-center space-x-2 mt-1 text-sm">
              <span className="text-gray-600 dark:text-gray-400">By</span>
              <Tooltip content="Block Proposer">
                <CopyToClipboard
                  content={block.proposer}
                  className="text-gray-600 dark:text-gray-400"
                />
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-right">
          <MetricItem
            icon={<Timer className="w-4 h-4" />}
            label="Block Time"
            value={block.time}
            tooltip="Time taken to produce this block"
          />
          <MetricItem
            icon={<ArrowRight className="w-4 h-4" />}
            label="Txns"
            value={block.transactions.toString()}
            tooltip="Number of transactions in this block"
          />
          <MetricItem
            icon={<Blocks className="w-4 h-4" />}
            label="Size"
            value={block.size}
            tooltip="Total size of the block"
          />
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