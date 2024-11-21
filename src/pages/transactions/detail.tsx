import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { rpcGraphQL } from '../../utils/rpc';
import { 
  Activity, ChevronRight, XCircle, CheckCircle, RefreshCw, Clock, 
  Zap, Coins, ArrowRightLeft, Shield, Wallet, Database, Server, 
  Cpu, Info, BarChart2, Users, Lock, Unlock, ExternalLink,
  Timer, Layers, ArrowDown, ArrowUp, Code, Terminal, AlertTriangle,
  Box, Network, Fingerprint, Hash, Key, Settings, Gauge
} from 'lucide-react';

// Define the transaction type with proper BigInt handling
interface Transaction {
  blockTime: bigint | null;
  slot: bigint;
  signatures: string[];
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
          query GetTransaction($signature: Signature!) {
            transaction(signature: $signature) {
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
                  ... on GenericInstruction {
                    accounts
                    data
                  }
                }
              }
              signatures
            }
          }
        `;

        const result = await rpcGraphQL.query(source, {
          signature: txid
        });

        console.log("Transaction result:", result);

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
        {/* Enhanced Transaction Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-purple-100 dark:border-purple-900/20">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl shadow-lg ${
                  transaction.meta?.err
                    ? 'bg-gradient-to-br from-red-500 to-orange-500'
                    : 'bg-gradient-to-br from-green-500 to-emerald-500'
                }`}>
                  {transaction.meta?.err ? (
                    <AlertTriangle className="w-8 h-8 text-white" />
                  ) : (
                    <CheckCircle className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Transaction Details
                    </h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      transaction.meta?.err
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                    }`}>
                      {transaction.meta?.err ? 'Failed' : 'Success'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {transaction.blockTime ? (
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(Number(transaction.blockTime) * 1000).toLocaleString()}</span>
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
            {/* Block Info */}
            <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-4 border border-purple-100 dark:border-purple-900/20">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Block</p>
                  <p className="mt-1 text-xl font-semibold text-purple-700 dark:text-purple-300">
                    #{transaction.slot?.toString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Gas Used */}
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 border border-blue-100 dark:border-blue-900/20">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Gauge className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Gas Used</p>
                  <p className="mt-1 text-xl font-semibold text-blue-700 dark:text-blue-300">
                    {transaction.meta?.computeUnitsConsumed?.toString() || '0'} units
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Fee */}
            <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4 border border-green-100 dark:border-green-900/20">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Coins className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Fee</p>
                  <p className="mt-1 text-xl font-semibold text-green-700 dark:text-green-300">
                    {transaction.meta?.fee?.toString() || '0'} lamports
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Transaction Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction Hash */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-purple-100 dark:border-purple-900/20">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="p-2 flex-shrink-0 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Fingerprint className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Transaction Hash
                      </h3>
                      <div className="mt-1 flex items-center space-x-2">
                        <p className="font-mono text-sm text-gray-500 dark:text-gray-400 truncate">
                          {transaction.signatures?.[0]}
                        </p>
                        <button
                          onClick={() => navigator.clipboard.writeText(transaction.signatures?.[0] || '')}
                          className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg
                            hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200"
                          title="Copy to clipboard"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Program Interactions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-purple-100 dark:border-purple-900/20 mt-6">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Code className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Program Interactions
                  </h3>
                </div>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {transaction.message?.instructions.map((instruction, index) => (
                  <div key={index} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-900/20 rounded-lg">
                        <Terminal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Program ID: {instruction.programId}
                        </p>
                        {instruction.data && (
                          <p className="mt-1 font-mono text-xs text-gray-500 dark:text-gray-400 break-all">
                            Data: {instruction.data}
                          </p>
                        )}
                        {instruction.accounts && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Accounts:</p>
                            <div className="mt-1 space-y-1">
                              {instruction.accounts.map((account, idx) => (
                                <p key={idx} className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate">
                                  {account}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Status & Logs */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-purple-100 dark:border-purple-900/20">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Transaction Status
                  </h3>
                </div>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${
                    transaction.meta?.err
                      ? 'bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20'
                      : 'bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20'
                  }`}>
                    <div className="flex items-center space-x-3">
                      {transaction.meta?.err ? (
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      )}
                      <div>
                        <p className={`text-sm font-medium ${
                          transaction.meta?.err
                            ? 'text-red-800 dark:text-red-200'
                            : 'text-green-800 dark:text-green-200'
                        }`}>
                          {transaction.meta?.err ? 'Transaction Failed' : 'Transaction Successful'}
                        </p>
                        {transaction.meta?.err && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            Error: {JSON.stringify(transaction.meta.err)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-between">
                      <div>
                        <span className="bg-white dark:bg-gray-800 px-2 text-sm text-gray-500 dark:text-gray-400">
                          Submitted
                        </span>
                      </div>
                      <div>
                        <span className="bg-white dark:bg-gray-800 px-2 text-sm text-gray-500 dark:text-gray-400">
                          Confirmed
                        </span>
                      </div>
                      <div>
                        <span className="bg-white dark:bg-gray-800 px-2 text-sm text-gray-500 dark:text-gray-400">
                          Finalized
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Log Messages */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-purple-100 dark:border-purple-900/20 mt-6">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Terminal className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Log Messages
                  </h3>
                </div>
              </div>
              <div className="px-6 py-4">
                <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 overflow-auto max-h-96">
                  {transaction.meta?.logMessages?.join('\n') || 'No log messages available'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionPage;
