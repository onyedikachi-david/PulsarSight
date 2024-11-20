import React from 'react';
import { Clock, Percent, Wallet, ArrowLeftRight } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  trend?: number;
}

function StatCard({ icon, label, value, subValue, trend }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
          {(subValue || trend !== undefined) && (
            <div className="flex items-center space-x-2 mt-1">
              {subValue && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {subValue}
                </span>
              )}
              {trend !== undefined && (
                <span className={`text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {trend >= 0 ? '+' : ''}{trend}%
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NetworkStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Clock className="h-5 w-5 text-red-600" />}
        label="Block Time"
        value="10.65s"
        subValue="Latest block: 2,260,890"
      />
      <StatCard
        icon={<Percent className="h-5 w-5 text-red-600" />}
        label="APR"
        value="~15.16%"
        trend={-2.3}
      />
      <StatCard
        icon={<Wallet className="h-5 w-5 text-red-600" />}
        label="Total Wallets"
        value="920.5k"
        trend={5.96}
      />
      <StatCard
        icon={<ArrowLeftRight className="h-5 w-5 text-red-600" />}
        label="Total Transactions"
        value="842.2k"
        trend={6.92}
      />
    </div>
  );
}