import React from 'react';
import { ArrowLeftRight, Clock, DollarSign } from 'lucide-react';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: string;
  type: string;
}

const transactions: Transaction[] = [
  {
    hash: '0x1234...5678',
    from: '0xabcd...ef01',
    to: '0x9876...4321',
    value: '1,234.56 ZETA',
    timestamp: '2024-02-28T12:00:00Z',
    type: 'Transfer'
  },
  {
    hash: '0xfedc...ba98',
    from: '0x4567...8901',
    to: '0xcdef...2345',
    value: '567.89 ZETA',
    timestamp: '2024-02-28T11:59:45Z',
    type: 'Stake'
  },
  // Add more transactions as needed
];

export default function TransactionList() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Latest Transactions</h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {transactions.map((tx) => (
          <div key={tx.hash} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <ArrowLeftRight className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {tx.hash}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-sm">
                    <span className="text-gray-900 dark:text-white">
                      From: <span className="text-gray-500 dark:text-gray-400">{tx.from}</span>
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      To: <span className="text-gray-500 dark:text-gray-400">{tx.to}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-white font-medium">{tx.value}</span>
                </div>
                <div className="flex items-center justify-end space-x-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>{tx.timestamp}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}