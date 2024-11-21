import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RPC_URL, rpcGraphQL } from '../../utils/rpc';
import { Activity, ChevronRight, XCircle, CheckCircle, RefreshCw, Zap, Coins, ArrowRightLeft, Clock, BarChart2, Wallet, CircleDollarSign, Timer, TrendingUp, Layers, Cpu, Shield, Users, Star, ExternalLink, Hash, FileText, Sparkles, Banknote, ShieldCheck } from 'lucide-react';
import { createSolanaRpc } from '@solana/rpc';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type TransactionData = {
  signatures: string[];
  meta: {
    err: any | null;
    fee: string;
    logMessages: string[];
  } | null;
  slot: string;
  blockTime: number | null;
};

interface BlockResponse {
  data: {
    block: {
      parentSlot: string;
      transactions: TransactionData[];
    };
  };
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

const getTransactionType = (tx: TransactionData) => {
  const instructions = tx.meta?.logMessages || [];
  if (instructions.some(msg => msg.includes("Transfer"))) {
    return { type: "Transfer", icon: ArrowRightLeft, color: "text-blue-500" };
  } else if (instructions.some(msg => msg.includes("Stake"))) {
    return { type: "Stake", icon: Shield, color: "text-green-500" };
  } else if (instructions.some(msg => msg.includes("Vote"))) {
    return { type: "Vote", icon: Users, color: "text-indigo-500" };
  } else if (instructions.some(msg => msg.includes("Create"))) {
    return { type: "Create", icon: Layers, color: "text-purple-500" };
  }
  return { type: "Contract", icon: Cpu, color: "text-gray-500" };
};

const groupTransactionsByTime = (transactions: TransactionData[]) => {
  const now = Date.now() / 1000;
  return transactions.reduce((groups, tx) => {
    if (!tx.blockTime) return groups;
    const diff = now - Number(tx.blockTime);
    
    if (diff < 300) { // 5 minutes
      groups.recent = [...(groups.recent || []), tx];
    } else if (diff < 3600) { // 1 hour
      groups.hour = [...(groups.hour || []), tx];
    } else {
      groups.older = [...(groups.older || []), tx];
    }
    return groups;
  }, {} as Record<string, TransactionData[]>);
};

const getTransactionsByHour = (transactions: TransactionData[]) => {
  const now = Date.now() / 1000;
  const hourlyData = new Array(7).fill(0);
  
  transactions.forEach(tx => {
    if (tx.blockTime) {
      const hoursDiff = (now - tx.blockTime) / (60 * 60);
      if (hoursDiff <= 24) {
        const index = Math.min(6, Math.floor(hoursDiff / 4));
        hourlyData[6 - index]++;
      }
    }
  });
  
  console.log('Hourly transaction data:', hourlyData);
  return hourlyData;
};

const RecentTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const rpc = createSolanaRpc(RPC_URL);
      const latestSlot = await rpc.getSlot().send();
      console.log('Latest slot:', latestSlot);

      const source = `
        query GetRecentTransactions($slot: Slot!) {
          block(slot: $slot) {
            parentSlot
            transactions {
              signatures
              meta {
                err
                fee
                logMessages
              }
              slot
              blockTime
            }
          }
        }
      `;

      // Fetch transactions from last 10 blocks for more data
      const blocks = [];
      let currentSlot: bigint | undefined = BigInt(latestSlot);
      
      for (let i = 0; i < 10 && currentSlot; i++) {
        try {
          const result = await rpcGraphQL.query(source, {
            slot: currentSlot.toString()
          }) as BlockResponse;

          if (result?.data?.block?.transactions?.length > 0) {
            blocks.push(...result.data.block.transactions);
          }
          
          // Update currentSlot for next iteration
          currentSlot = result?.data?.block?.parentSlot 
            ? BigInt(result.data.block.parentSlot) 
            : undefined;

        } catch (err) {
          console.warn(`Failed to fetch block at slot ${currentSlot}:`, err);
          break;
        }
      }

      // Sort transactions by blockTime to ensure proper ordering
      const sortedTransactions = blocks.sort((a, b) => {
        return (b.blockTime || 0) - (a.blockTime || 0);
      });

      console.log('Fetched transactions:', sortedTransactions);
      setTransactions(sortedTransactions);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-red-100 dark:border-red-900/20 p-6">
            <div className="flex items-center space-x-3">
              <XCircle className="w-6 h-6 text-red-500" />
              <div>
                <h3 className="text-lg font-medium text-red-500">Error Loading Transactions</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
              </div>
            </div>
            <button
              onClick={() => fetchTransactions()}
              className="mt-4 inline-flex items-center px-4 py-2 rounded-lg
                text-white bg-red-500 hover:bg-red-600 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header with Welcome Message */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-purple-100 dark:border-purple-900/20">
          <div className="px-6 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Network Activity</h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Real-time view of SOON transactions
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={fetchTransactions}
                  className="inline-flex items-center px-4 py-2 rounded-lg
                    text-white bg-gradient-to-r from-purple-500 to-blue-500
                    hover:from-purple-600 hover:to-blue-600 transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400
                    shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Network Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-gray-50 dark:bg-gray-900/50">
            {/* Success Rate Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-purple-100/50 dark:border-purple-900/20">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg mr-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {`${((transactions.filter(tx => !tx.meta?.err).length / transactions.length) * 100).toFixed(1)}%`}
                  </p>
                </div>
              </div>
            </div>

            {/* Average Fee Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-purple-100/50 dark:border-purple-900/20">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg mr-3">
                  <Coins className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Average Fee</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {`${(transactions.reduce((acc, tx) => acc + (Number(tx.meta?.fee) || 0), 0) / transactions.length || 0).toFixed(2)}`}
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400"> lamports</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Speed Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-purple-100/50 dark:border-purple-900/20">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg mr-3">
                  <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Transaction Speed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {`${transactions.length}`}
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400"> per block</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Latest Block Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-purple-100/50 dark:border-purple-900/20">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg mr-3">
                  <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Latest Block</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {transactions.length > 0 
                      ? String(Math.max(...transactions.map(tx => Number(tx?.slot))))
                      : '0'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Type Distribution */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-3">
              {[
                { type: 'Transfer', icon: ArrowRightLeft, color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/20' },
                { type: 'Contract', icon: Cpu, color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/20' },
                { type: 'Stake', icon: Shield, color: 'text-green-500 bg-green-100 dark:bg-green-900/20' },
                { type: 'Vote', icon: Users, color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/20' },
              ].map(({ type, icon: Icon, color }) => {
                const count = transactions.filter(tx => 
                  getTransactionType(tx).type === type
                ).length;
                const percentage = ((count / transactions.length) * 100).toFixed(1);
                
                return (
                  <div key={type} 
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-full 
                      bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  >
                    <div className={`p-1 rounded-full ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {type}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transaction Activity Chart */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <BarChart2 className="w-5 h-5 mr-2 text-purple-500" />
                Transaction Activity
              </h3>
              <p className="text-sm text-gray-500">Transaction volume over time</p>
            </div>
            <div className="h-64 bg-white dark:bg-gray-800 rounded-xl p-4">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mb-2"></div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Loading chart data...</div>
                  </div>
                </div>
              ) : (
                <Line
                  data={{
                    labels: ['24h', '20h', '16h', '12h', '8h', '4h', 'Now'],
                    datasets: [
                      {
                        label: 'Transactions',
                        data: getTransactionsByHour(transactions),
                        borderColor: 'rgb(147, 51, 234)',
                        backgroundColor: 'rgba(147, 51, 234, 0.1)',
                        tension: 0.4,
                        fill: true,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `${context.parsed.y} transactions`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(147, 51, 234, 0.1)',
                        },
                        ticks: {
                          stepSize: 1,
                          precision: 0
                        }
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>

          {/* Network Health */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-purple-500" />
                Network Health
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">TPS</span>
                  <span className="text-sm text-green-500">Healthy</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Block Time</span>
                  <span className="text-sm text-green-500">400ms</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Notable Transactions */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <Star className="w-5 h-5 mr-2 text-purple-500" />
                Notable Transactions
              </h3>
              <p className="text-sm text-gray-500">High-value or significant transactions</p>
            </div>
            <div className="space-y-3">
              {transactions
                .filter(tx => Number(tx.meta?.fee) > 5000) // Example filter for high-fee transactions
                .slice(0, 3)
                .map((tx, index) => (
                  <div key={index} 
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700
                      hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                          <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            High Fee Transaction
                          </span>
                          <p className="text-xs text-gray-500">
                            Fee: {tx.meta?.fee} lamports
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/transactions/${tx.signatures[0]}`}
                        className="text-purple-500 hover:text-purple-600"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Transaction List Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-purple-100 dark:border-purple-900/20">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-500" />
              Recent Transactions
            </h3>
            <p className="mt-1 text-sm text-gray-500">Latest confirmed transactions on the network</p>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 mb-4">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">No Transactions Yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Transactions will appear here as they are confirmed
                </p>
              </div>
            ) : (
              transactions.map((tx, index) => {
                const txType = getTransactionType(tx);
                const TypeIcon = txType.icon;
                
                return (
                  <div key={index} className="group px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Status Icon */}
                        <div className={`flex-shrink-0 p-2 rounded-xl ${
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

                        <div className="min-w-0 flex-1">
                          {/* Transaction Type & Signature */}
                          <div className="flex items-center space-x-2">
                            <div className={`p-1.5 rounded-lg ${txType.color.replace('text-', 'bg-').replace('500', '100')} dark:bg-opacity-20`}>
                              <TypeIcon className={`w-4 h-4 ${txType.color}`} />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {tx.signatures?.[0] 
                                ? `${tx.signatures[0].slice(0, 4)}...${tx.signatures[0].slice(-4)}`
                                : 'Signature not available'
                              }
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              tx.meta?.err
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            }`}>
                              {tx.meta?.err ? 'Failed' : 'Success'}
                            </span>
                          </div>

                          {/* Transaction Details */}
                          <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            {/* Slot */}
                            {tx.slot && (
                              <div className="flex items-center">
                                <Hash className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                <span>Slot: {String(tx.slot)}</span>
                              </div>
                            )}
                            
                            {/* Fee */}
                            {tx.meta?.fee !== undefined && (
                              <>
                                <span>•</span>
                                <div className="flex items-center">
                                  <Banknote className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                  <span>{String(tx.meta.fee)} lamports</span>
                                </div>
                              </>
                            )}
                            
                            {/* Time */}
                            {tx.blockTime && (
                              <>
                                <span>•</span>
                                <div className="flex items-center">
                                  <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                  <span>{getTimeAgo(tx.blockTime)}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* View Details Link */}
                      {tx.signatures?.[0] && (
                        <Link
                          to={`/transactions/${tx.signatures[0]}`}
                          className="flex items-center space-x-2 px-4 py-2 rounded-lg
                            text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400
                            group-hover:bg-purple-50 dark:group-hover:bg-purple-900/10
                            transition-all duration-200"
                        >
                          <span className="text-sm font-medium hidden sm:block">View Details</span>
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/blocks"
              className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/10 
                rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-all duration-200"
            >
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg mr-3">
                <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium text-purple-900 dark:text-purple-100">Explore Blocks</h3>
                <p className="text-sm text-purple-600 dark:text-purple-300">View detailed block information</p>
              </div>
            </Link>

            <Link
              to="/validators"
              className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/10 
                rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all duration-200"
            >
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg mr-3">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100">Validators</h3>
                <p className="text-sm text-blue-600 dark:text-blue-300">Check validator status</p>
              </div>
            </Link>

            <Link
              to="/tokens"
              className="flex items-center p-4 bg-green-50 dark:bg-green-900/10 
                rounded-xl hover:bg-green-100 dark:hover:bg-green-900/20 transition-all duration-200"
            >
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg mr-3">
                <Coins className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-medium text-green-900 dark:text-green-100">Token Activity</h3>
                <p className="text-sm text-green-600 dark:text-green-300">Monitor token transfers</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentTransactionsPage;
