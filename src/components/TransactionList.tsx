import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Clock, XCircle, Search, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CopyToClipboard } from './ui/CopyToClipboard';
import { Tooltip } from './ui/Tooltip';
import { TransactionSkeleton } from './ui/Skeleton';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  status: 'success' | 'failed' | 'pending';
  timestamp: string;
  type: 'send' | 'receive' | 'contract';
}

const transactions: Transaction[] = [
  {
    hash: '0x1234...5678',
    from: '0xabcd...efgh',
    to: '0xijkl...mnop',
    value: '123.45 SOON',
    status: 'success',
    timestamp: '2 mins ago',
    type: 'send',
  },
  {
    hash: '0x8765...4321',
    from: '0xqrst...uvwx',
    to: '0xyza...bcde',
    value: '45.67 SOON',
    status: 'pending',
    timestamp: '5 mins ago',
    type: 'contract',
  },
  {
    hash: '0x9876...5432',
    from: '0xfghi...jklm',
    to: '0xnopq...rstu',
    value: '89.01 SOON',
    status: 'failed',
    timestamp: '10 mins ago',
    type: 'receive',
  },
];

const statusConfig = {
  success: { icon: CheckCircle2, className: 'text-green-500', label: 'Success' },
  failed: { icon: XCircle, className: 'text-red-500', label: 'Failed' },
  pending: { icon: Clock, className: 'text-yellow-500 animate-pulse', label: 'Pending' },
};

export default function TransactionList() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="glass-card hover-card">
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
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {isLoading ? (
          <>
            <TransactionSkeleton />
            <TransactionSkeleton />
            <TransactionSkeleton />
          </>
        ) : (
          transactions.map((tx, index) => (
            <TransactionItem key={index} transaction={tx} />
          ))
        )}
      </div>
    </div>
  );
}

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const StatusIcon = statusConfig[transaction.status].icon;
  const TransactionIcon = transaction.type === 'send' ? ArrowUpRight : 
                         transaction.type === 'receive' ? ArrowDownRight : 
                         Clock;

  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Tooltip content={statusConfig[transaction.status].label}>
            <StatusIcon className={`w-5 h-5 ${statusConfig[transaction.status].className}`} />
          </Tooltip>
          <div>
            <div className="flex items-center space-x-2">
              <Tooltip content="Transaction Hash">
                <CopyToClipboard
                  content={transaction.hash}
                  className="font-mono text-sm"
                />
              </Tooltip>
              <span className="text-xs text-gray-500 dark:text-gray-400">{transaction.timestamp}</span>
            </div>
            <div className="flex items-center space-x-2 mt-1 text-sm">
              <Tooltip content="From Address">
                <CopyToClipboard
                  content={transaction.from}
                  className="font-mono text-gray-600 dark:text-gray-400"
                />
              </Tooltip>
              <ArrowRight className="w-3 h-3 text-gray-400" />
              <Tooltip content="To Address">
                <CopyToClipboard
                  content={transaction.to}
                  className="font-mono text-gray-600 dark:text-gray-400"
                />
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="text-right">
          <Tooltip content="Transaction Value">
            <div className="font-mono font-medium flex items-center justify-end space-x-2">
              <TransactionIcon className={`w-4 h-4 ${
                transaction.type === 'send' ? 'text-red-500' :
                transaction.type === 'receive' ? 'text-green-500' :
                'text-blue-500'
              }`} />
              <span>{transaction.value}</span>
            </div>
          </Tooltip>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
          </div>
        </div>
      </div>
    </div>
  );
}