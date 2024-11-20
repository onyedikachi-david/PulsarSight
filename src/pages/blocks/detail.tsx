import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { rpcGraphQL } from '../../utils/rpc';

interface Block {
  blockhash: string;
  blockHeight: bigint;
  blockTime: bigint | null;
  parentSlot: bigint;
  previousBlockhash: string;
  transactions: Array<{
    slot: bigint;
    meta: {
      fee: bigint;
      logMessages: string[];
    };
  }>;
}

const getTimeAgo = (timestamp: number) => {
  const seconds = Math.floor((Date.now() / 1000) - timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const BlockDetailPage: React.FC = () => {
  const { height } = useParams<{ height: string }>();
  const [block, setBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlock = async () => {
      if (!height) {
        setError('Block height not provided');
        setLoading(false);
        return;
      }

      try {
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
        `;

        const result = await rpcGraphQL.query(blockSource, {
          slot: BigInt(height) as any
        });

        if (!result?.data?.block) {
          setError('Block not found');
          setLoading(false);
          return;
        }

        setBlock(result.data.block as Block);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching block:', err);
        setError('Failed to fetch block details');
        setLoading(false);
      }
    };

    fetchBlock();
  }, [height]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !block) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error || 'Block not found'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Block Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Block #{block.blockHeight.toString()}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {block.blockTime ? getTimeAgo(Number(block.blockTime)) : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link
                to={`/block/${(block.blockHeight - 1n).toString()}`}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Previous Block
              </Link>
              <Link
                to={`/block/${(block.blockHeight + 1n).toString()}`}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Next Block
              </Link>
            </div>
          </div>

          {/* Block Details */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Block Hash</h3>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="font-mono text-sm text-gray-900 dark:text-white">{block.blockhash}</span>
                    <button 
                      onClick={() => navigator.clipboard.writeText(block.blockhash)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Previous Block Hash</h3>
                  <div className="mt-1 flex items-center space-x-2">
                    <Link 
                      to={`/block/${(block.blockHeight - 1n).toString()}`}
                      className="font-mono text-sm text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      {block.previousBlockhash}
                    </Link>
                    <button 
                      onClick={() => navigator.clipboard.writeText(block.previousBlockhash)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Transactions</h3>
                  <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    {block.transactions.length}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Fees</h3>
                  <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    {block.transactions.reduce((acc, tx) => acc + tx.meta.fee, 0n).toString()} lamports
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
      Transactions ({block.transactions.length})
    </h2>
  </div>
  <div className="divide-y divide-gray-200 dark:divide-gray-700">
    {block.transactions.map((tx, index) => (
      <div key={index} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">#{index}</span>
            {tx.slot ? (
              <Link
                to={`/transactions/${tx.slot.toString()}`}
                className="font-mono text-sm text-purple-600 dark:text-purple-400 hover:underline"
              >
                {tx.slot.toString()}
              </Link>
            ) : (
              <span className="font-mono text-sm text-gray-500 dark:text-gray-400">N/A</span>
            )}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Fee: {tx.meta?.fee?.toString() || '0'} lamports
          </span>
        </div>
      </div>
    ))}
  </div>
</div>
      </div>
    </div>
  );
};

export default BlockDetailPage;
