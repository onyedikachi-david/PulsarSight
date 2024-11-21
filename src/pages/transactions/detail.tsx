import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { rpcGraphQL } from '../../utils/rpc';
import { XCircle, CheckCircle, Info, AlertCircle, Code, Terminal, Link } from 'lucide-react';

// Define the transaction type with proper BigInt handling
interface Transaction {
  blockTime: bigint | null;
  slot: bigint;
  meta: {
    computeUnitsConsumed: bigint;
    logMessages: string[];
    err: any | null;
    fee: bigint;
  } | null;
  message: {
    instructions: Array<{
      programId: string;
      accounts?: string[];
      data?: string;
      lamports?: bigint;
      space?: bigint;
    }>;
  };
  data?: string;
}

const TransactionPage: React.FC = () => {
  const { txid } = useParams<{ txid: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!txid) {
        setError('Transaction ID not provided');
        setLoading(false);
        return;
      }

      try {
        const source = `
          query GetTransaction($signature: Signature!, $commitment: CommitmentWithoutProcessed) {
            transaction(signature: $signature, commitment: $commitment) {
              blockTime
              slot
              meta {
                computeUnitsConsumed
                logMessages
                err
                fee
              }
                message {
                  instructions {
                    programId
                    ... on CreateAccountInstruction {
                      lamports
                      programId
                      space
                    }
                    ... on GenericInstruction {
                      accounts
                      data
                    }
                  }
              }
              data(encoding: BASE_64)
            }
          }
        `;

        const result = await rpcGraphQL.query(source, {
          signature: txid as any,
          commitment: 'CONFIRMED'
        });

        if (!result?.data?.transaction) {
          setError('Transaction not found');
          setLoading(false);
          return;
        }

        setTransaction(result.data.transaction as Transaction);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching transaction:', err);
        setError('Failed to fetch transaction details');
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [txid]);

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
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-red-100 dark:border-red-900/20">
            <div className="px-6 py-5 flex items-center space-x-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Error Loading Transaction</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {error || 'Transaction not found. It might not exist or there was an error loading it.'}
                </p>
                <div className="mt-4">
                  <Link
                    to="/transactions"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg
                      text-white bg-gradient-to-r from-purple-500 to-blue-500
                      hover:from-purple-600 hover:to-blue-600
                      focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                  >
                    View All Transactions
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
        {/* Transaction Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-purple-100 dark:border-purple-900/20">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                transaction.meta?.err
                  ? 'bg-red-100 dark:bg-red-900/20'
                  : 'bg-green-100 dark:bg-green-900/20'
              }`}>
                {transaction.meta?.err ? (
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Transaction Details
                  </h1>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    transaction.meta?.err
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                      : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  }`}>
                    {transaction.meta?.err ? 'Failed' : 'Success'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {transaction.slot.toString() || 'Signature not available'}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Transaction Info */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900/10 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <Info className="w-5 h-5 text-gray-400" />
                <h3 className="font-medium text-gray-900 dark:text-white">Transaction Info</h3>
              </div>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Signature</dt>
                  <dd className="font-medium text-gray-900 dark:text-white font-mono break-all">
                    {transaction?.signatures?.[0] || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Slot</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {transaction?.slot?.toString() || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Fee</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {transaction?.meta?.fee ? `${transaction.meta.fee.toString()} lamports` : 'N/A'}
                  </dd>
                </div>
                {transaction?.blockTime && (
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">Timestamp</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">
                      {new Date(Number(transaction.blockTime) * 1000).toLocaleString()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Status Info */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900/10 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <AlertCircle className="w-5 h-5 text-gray-400" />
                <h3 className="font-medium text-gray-900 dark:text-white">Status Details</h3>
              </div>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Result</dt>
                  <dd className={`font-medium ${
                    transaction?.meta?.err
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {transaction?.meta?.err ? 'Failed' : 'Success'}
                  </dd>
                </div>
                {transaction?.meta?.err && (
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">Error</dt>
                    <dd className="font-medium text-red-600 dark:text-red-400">
                      {JSON.stringify(transaction.meta.err)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Instructions Info */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900/10 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <Code className="w-5 h-5 text-gray-400" />
                <h3 className="font-medium text-gray-900 dark:text-white">Instructions</h3>
              </div>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Count</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {transaction?.message?.instructions?.length || 0}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Log Messages */}
        {transaction?.meta?.logMessages && transaction.meta.logMessages.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-purple-100 dark:border-purple-900/20">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-gray-400" />
                <h2 className="font-medium text-gray-900 dark:text-white">Log Messages</h2>
              </div>
            </div>
            <div className="px-6 py-4">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {transaction.meta.logMessages.join('\n')}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionPage;
