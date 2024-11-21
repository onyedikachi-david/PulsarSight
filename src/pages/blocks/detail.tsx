import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { rpcGraphQL } from '../../utils/rpc';
import { Blocks, ChevronLeft, ChevronRight, FileText, XCircle, CheckCircle, Database, Link2, Inbox } from 'lucide-react';

interface Block {
  blockhash: string;
  blockHeight: bigint;
  blockTime: bigint | null;
  parentSlot: bigint;
  previousBlockhash: string;
  transactions: Array<{
    slot: bigint;
    signature: string;
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-purple-100 dark:border-purple-900/20">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <div className="animate-pulse flex items-center space-x-4">
                <div className="rounded-xl bg-gray-200 dark:bg-gray-700 h-14 w-14"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                </div>
              </div>
            </div>
            <div className="px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse p-4 bg-gray-50 dark:bg-gray-900/10 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-purple-100 dark:border-purple-900/20">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <div className="animate-pulse flex items-center space-x-3">
                <div className="rounded-lg bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="px-6 py-4">
                  <div className="animate-pulse flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-gray-200 dark:bg-gray-700 h-8 w-8"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !block) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-red-100 dark:border-red-900/20">
            <div className="px-6 py-5 flex items-center space-x-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Error Loading Block</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {error || 'Block not found. It might not exist or there was an error loading it.'}
                </p>
                <div className="mt-4">
                  <Link
                    to="/blocks"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg
                      text-white bg-gradient-to-r from-purple-500 to-blue-500
                      hover:from-purple-600 hover:to-blue-600
                      focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                  >
                    View All Blocks
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Block Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-purple-100 dark:border-purple-900/20">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg">
                  <Blocks className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-baseline space-x-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Block #{block.blockHeight?.toString()}</h1>
                    <span className="px-2.5 py-0.5 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200">
                      Latest Block
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Created {block.blockTime ? new Date(Number(block.blockTime) * 1000).toLocaleString() : 'Timestamp not available'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Link
                  to={`/block/${(BigInt(height) - 1n).toString()}`}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg
                    text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800
                    border border-gray-300 dark:border-gray-600
                    hover:bg-gray-50 dark:hover:bg-gray-700
                    focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous Block
                </Link>
                <Link
                  to={`/block/${(BigInt(height) + 1n).toString()}`}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg
                    text-white bg-gradient-to-r from-purple-500 to-blue-500
                    hover:from-purple-600 hover:to-blue-600
                    focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                >
                  Next Block
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>

          {/* Block Overview Cards */}
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900/20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-purple-600 dark:text-purple-400">Block Hash</div>
                    <div className="mt-1 font-mono text-sm break-all text-gray-900 dark:text-gray-100">
                      {block.blockhash}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Link2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Previous Block Hash</div>
                    <div className="mt-1 font-mono text-sm break-all text-gray-900 dark:text-gray-100">
                      {block.previousBlockhash}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-green-600 dark:text-green-400">Parent Slot</div>
                    <div className="mt-1 font-mono text-sm text-gray-900 dark:text-gray-100">
                      {block.parentSlot?.toString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-purple-100 dark:border-purple-900/20">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Block Transactions
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {block.transactions?.length || 0} transactions in this block
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {block.transactions?.map((tx, index) => (
              <div key={index} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        tx.meta?.logMessages?.some(msg => msg.includes("Error"))
                          ? 'bg-red-100 dark:bg-red-900/20'
                          : 'bg-green-100 dark:bg-green-900/20'
                      }`}>
                        {tx.meta?.logMessages?.some(msg => msg.includes("Error")) ? (
                          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Transaction #{index + 1}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            tx.meta?.logMessages?.some(msg => msg.includes("Error"))
                              ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                              : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                          }`}>
                            {tx.meta?.logMessages?.some(msg => msg.includes("Error")) ? 'Failed' : 'Success'}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          {tx.slot && (
                            <>
                              <span>Slot: {tx.slot.toString()}</span>
                              <span>•</span>
                            </>
                          )}
                          <span>Fee: {tx.meta?.fee ? `${tx.meta.fee} lamports` : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/transactions/${tx.slot ? tx.slot.toString() : ''}`}
                    className="group p-2 text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
                  >
                    <div className="p-2 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/20 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </Link>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {(!block.transactions || block.transactions.length === 0) && (
              <div className="px-6 py-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 mb-4">
                  <Inbox className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">No Transactions</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  This block doesn't contain any transactions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockDetailPage;
