import React from 'react'
import { Link } from 'react-router-dom'
import {
  Coins,
  Users,
  ArrowRightLeft,
  TrendingUp,
  PieChart,
  History,
  ExternalLink
} from 'lucide-react'
import { TokenAccount } from '../../services/search'

interface TokenDetailProps {
  data: TokenAccount
}

const TokenDetail: React.FC<TokenDetailProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Token Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-yellow-50 p-2 dark:bg-yellow-900/50">
            <Coins className="size-6 text-yellow-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {data.mint.name || 'Unknown Token'}
              {data.mint.symbol && (
                <span className="ml-2 text-gray-500">({data.mint.symbol})</span>
              )}
            </h3>
            <Link
              to={`/address/${data.mint.address}`}
              className="flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              {data.mint.address}
              <ExternalLink className="size-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Token Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            <TrendingUp className="size-4" />
            Supply
          </div>
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {Number(data.mint.supply).toLocaleString()}
          </span>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            <Users className="size-4" />
            Holders
          </div>
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {data.mint.holders?.toLocaleString() || 'N/A'}
          </span>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            <ArrowRightLeft className="size-4" />
            Decimals
          </div>
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {data.mint.decimals}
          </span>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
        <h4 className="text-md mb-4 flex items-center gap-2 font-medium text-gray-900 dark:text-white">
          <PieChart className="size-5 text-gray-500" />
          Token Distribution
        </h4>
        <div className="h-64 w-full">
          {/* Add chart component here */}
          <div className="flex h-full items-center justify-center text-gray-500">
            Chart coming soon...
          </div>
        </div>
      </div>

      {/* Recent Transfers */}
      <div className="space-y-4">
        <h4 className="text-md flex items-center gap-2 font-medium text-gray-900 dark:text-white">
          <History className="size-5 text-gray-500" />
          Recent Transfers
        </h4>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  From
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
              <tr>
                <td
                  className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400"
                  colSpan={4}
                >
                  Transfer history coming soon...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default TokenDetail
