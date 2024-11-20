import React from 'react';
import { Clock, User, Box } from 'lucide-react';

interface Block {
  height: number;
  timestamp: string;
  proposer: string;
  txCount: number;
  hash: string;
}

const blocks: Block[] = [
  {
    height: 2260890,
    timestamp: '2024-02-28T12:00:00Z',
    proposer: '0x1234...5678',
    txCount: 156,
    hash: '0xabcd...ef01'
  },
  {
    height: 2260889,
    timestamp: '2024-02-28T11:59:45Z',
    proposer: '0x9876...4321',
    txCount: 142,
    hash: '0xfedc...ba98'
  },
  // Add more blocks as needed
];

export default function BlockList() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Latest Blocks</h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {blocks.map((block) => (
          <div key={block.height} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <Box className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      #{block.height}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {block.hash}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{block.timestamp}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{block.proposer}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-sm">
                <span className="px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full">
                  {block.txCount} txs
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}