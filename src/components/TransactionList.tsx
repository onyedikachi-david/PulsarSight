import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, Clock, XCircle, Search, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CopyToClipboard } from './ui/CopyToClipboard';
import { Tooltip } from './ui/Tooltip';
import { TransactionSkeleton } from './ui/Skeleton';
import { RPC_URL, rpcGraphQL } from '../utils/rpc';
import { createSolanaRpc } from '@solana/rpc';
interface Transaction {
  signatures: string[];
  meta: {
    err: any | null;
    fee: string;
    logMessages: string[];
  } | null;
  slot: string;
  blockTime: number | null;
}

export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const rpc = createSolanaRpc(RPC_URL);
      const latestSlot = await rpc.getSlot().send();

      const source = `
        query GetRecentTransactions($slot: Slot!) {
          block(slot: $slot) {
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

      const result = await rpcGraphQL.query(source, {
        slot: latestSlot.toString()
      });
      console.log(result);

      if (result?.data?.block?.transactions) {
        setTransactions(result.data.block.transactions);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setIsLoading(false);
    }
  };
  

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-primary-500" />
            </div>
            <h2 className="text-xl font-semibold">Latest Transactions</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search transactions..."
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
            <Tooltip content="Filter transactions">
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
      
      <div className="max-h-[400px] overflow-y-auto">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {isLoading ? (
            <>
              <TransactionSkeleton />
              <TransactionSkeleton />
              <TransactionSkeleton />
            </>
          ) : transactions.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No transactions found
            </div>
          ) : (
            transactions.map((tx, index) => (
              <TransactionItem key={index} transaction={tx} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  // Determine transaction type based on log messages
  const getTransactionType = (tx: Transaction) => {
    const instructions = tx.meta?.logMessages || [];
    if (instructions.some(msg => msg.includes("Transfer"))) {
      return { type: "Transfer", icon: ArrowUpRight, color: "text-blue-500" };
    } else if (instructions.some(msg => msg.includes("Vote"))) {
      return { type: "Vote", icon: CheckCircle2, color: "text-green-500" };
    }
    return { type: "Contract", icon: Clock, color: "text-gray-500" };
  };

  const txType = getTransactionType(transaction);
  const TypeIcon = txType.icon;

  const formatSignature = (signature: string) => {
    if (!signature) return 'Signature not available';
    return `${signature.slice(0, 4)}...${signature.slice(-4)}`;
  };

  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            transaction.meta?.err 
              ? 'bg-red-100 dark:bg-red-900/20' 
              : 'bg-green-100 dark:bg-green-900/20'
          }`}>
            {transaction.meta?.err ? (
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Tooltip content={transaction.signatures[0]}>
              <CopyToClipboard
                  content={transaction.signatures[0]}
                  className="font-mono text-sm"
                  displayText={formatSignature(transaction.signatures[0])}
                />
              </Tooltip>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {transaction.blockTime ? getTimeAgo(transaction.blockTime) : 'Pending'}
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-1 text-sm">
              <span className="text-gray-500">Slot:</span>
              <span className="font-mono text-gray-600 dark:text-gray-400">
                {transaction.slot}
              </span>
              {transaction.meta?.fee && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    Fee: {transaction.meta.fee} lamports
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2">
            <TypeIcon className={`w-4 h-4 ${txType.color}`} />
            <span className="text-sm font-medium">{txType.type}</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {transaction.meta?.logMessages?.length || 0} instructions
          </div>
        </div>
      </div>
    </div>
  );
}