import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { rpcGraphQL } from '../../utils/rpc';

interface Transaction {
  signature: string;
  blockTime: number | null;
  slot: number;
  meta: {
    fee: number;
    err: any | null;
  } | null;
}

interface Block {
  slot: number;
  blockTime: number | null;
  transactions: Transaction[];
}

const RecentTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      try {
        // Query recent blocks and their transactions
        const source = `
          query RecentBlocks {
            blocks(limit: 5) {
              slot
              blockTime
              transactions {
                signature
                blockTime
                slot
                meta {
                  fee
                  err
                }
              }
            }
          }
        `;

        const result = await rpcGraphQL.query(source);

        if (!result?.data?.blocks) {
          setError('Failed to fetch recent transactions');
          setLoading(false);
          return;
        }

        // Flatten transactions from all blocks and sort by blockTime
        const allTransactions = (result.data.blocks as Block[])
          .flatMap(block => block.transactions)
          .sort((a, b) => {
            if (!a.blockTime || !b.blockTime) return 0;
            return b.blockTime - a.blockTime;
          });

        setTransactions(allTransactions);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recent transactions:', err);
        setError('Failed to fetch recent transactions');
        setLoading(false);
      }
    };

    fetchRecentTransactions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="space-y-4">
        {transactions.map((tx) => (
          <Link
            key={tx.signature}
            to={`/transactions/${tx.signature}`}
            className="block bg-white dark:bg-gray-800 shadow rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-mono text-gray-600 dark:text-gray-400 break-all">
                  {tx.signature}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Slot: {tx.slot}
                </p>
              </div>
              <div className="flex items-center">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    tx.meta?.err
                      ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                      : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                  }`}
                >
                  {tx.meta?.err ? 'Failed' : 'Success'}
                </span>
              </div>
            </div>
            {tx.blockTime && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                {new Date(tx.blockTime * 1000).toLocaleString()}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactionsPage;
