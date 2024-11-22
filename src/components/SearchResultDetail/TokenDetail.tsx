import React from 'react';
import { Link } from 'react-router-dom';
import {
  Coins, Users, ArrowRightLeft, TrendingUp,
  PieChart, BarChart2, History, ExternalLink
} from 'lucide-react';
import { TokenAccount } from '../../services/search';

interface TokenDetailProps {
  data: TokenAccount;
}

const TokenDetail: React.FC<TokenDetailProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Token Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg">
            <Coins className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {data.mint.name || 'Unknown Token'}
              {data.mint.symbol && <span className="ml-2 text-gray-500">({data.mint.symbol})</span>}
            </h3>
            <Link
              to={`/address/${data.mint.address}`}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              {data.mint.address}
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Token Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            <TrendingUp className="h-4 w-4" />
            Supply
          </div>
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {Number(data.mint.supply).toLocaleString()}
          </span>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            <Users className="h-4 w-4" />
            Holders
          </div>
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {data.mint.holders?.toLocaleString() || 'N/A'}
          </span>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            <ArrowRightLeft className="h-4 w-4" />
            Decimals
          </div>
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {data.mint.decimals}
          </span>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <PieChart className="h-5 w-5 text-gray-500" />
          Token Distribution
        </h4>
        <div className="h-64 w-full">
          {/* Add chart component here */}
          <div className="flex items-center justify-center h-full text-gray-500">
            Chart coming soon...
          </div>
        </div>
      </div>

      {/* Recent Transfers */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <History className="h-5 w-5 text-gray-500" />
          Recent Transfers
        </h4>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  From
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              <tr>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400" colSpan={4}>
                  Transfer history coming soon...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TokenDetail; 