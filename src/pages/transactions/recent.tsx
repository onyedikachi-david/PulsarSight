import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RPC_URL, rpcGraphQL } from '../../utils/rpc';
import { Activity, ChevronRight, XCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { createSolanaRpc } from '@solana/rpc';

interface Transaction {
  signatures: string[];
  blockTime: bigint | null;
  slot: bigint;
  meta: {
    fee: bigint;
    err: any | null;
  } | null;
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

const RecentTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      // First get the latest slot
      const rpc = createSolanaRpc(RPC_URL);
      const latestSlot = await rpc.getSlot().send();
      console.log('Latest slot:', latestSlot);

      // Then query the block at that slot with correct field name
      const source = `
        query GetRecentTransactions($slot: Slot!) {
          block(slot: $slot) {
            transactions {
              signatures
              blockTime
              slot
              meta {
                fee
                err
                logMessages
              }
            }
          }
        }
      `;

      const result = await rpcGraphQL.query(source, {
        slot: latestSlot as any
      });

      console.log('Result:', result);

      if (!result?.data?.block) {
        throw new Error('Failed to fetch transactions');
      }

      setTransactions(result.data.block.transactions as Transaction[]);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to fetch transactions');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-purple-100 dark:border-purple-900/20">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <div className="animate-pulse flex items-center space-x-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-900/20 rounded-lg">
                  <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
                <div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                  <div className="mt-1 h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="px-6 py-4">
                  <div className="animate-pulse flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-900/20 rounded-lg">
                        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-purple-100 dark:border-purple-900/20">
          <div className="px-6 py-5 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Transactions</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Latest transactions on the network
                </p>
              </div>
            </div>
            <button
              onClick={fetchTransactions}
              className="p-2 text-gray-400 hover:text-purple-500 dark:hover:text-purple-400
                rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-purple-100 dark:border-purple-900/20">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((tx, index) => (
              <div key={index} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      tx.meta?.err 
                        ? 'bg-red-100 dark:bg-red-900/20' 
                        : 'bg-green-100 dark:bg-green-900/20'
                    }`}>
                      {tx.meta?.err ? (
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        {tx.signatures?.[0] ? (
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {`${tx.signatures[0].substring(0, 8)}...${tx.signatures[0].substring(tx.signatures[0].length - 8)}`}
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Signature not available
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          tx.meta?.err
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        }`}>
                          {tx.meta?.err ? 'Failed' : 'Success'}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        {tx.slot && <span>Slot: {tx.slot.toString()}</span>}
                        {tx.meta?.fee !== undefined && (
                          <>
                            <span>•</span>
                            <span>Fee: {tx.meta.fee.toString()} lamports</span>
                          </>
                        )}
                        {tx.blockTime && (
                          <>
                            <span>•</span>
                            <span>{getTimeAgo(Number(tx.blockTime))}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {tx.signatures?.[0] && (
                    <Link
                      to={`/transactions/${tx.signatures[0]}`}
                      className="group p-2 text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
                    >
                      <div className="p-2 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/20 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentTransactionsPage;
