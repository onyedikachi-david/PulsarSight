import React from 'react'
import { Link } from 'react-router-dom'
import {
  Vote,
  History,
  TrendingUp,
  Shield,
  ExternalLink,
  Award,
  Percent,
  Clock,
  Loader
} from 'lucide-react'
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import { VoteAccount, ValidatorVote } from '../../services/search'

interface VoteDetailProps {
  data: VoteAccount
  recentVotes?: ValidatorVote[]
  performanceHistory?: Array<{
    epoch: number
    credits: number
    previousCredits: number
    timestamp: number
  }>
  loading?: boolean
}

const VoteDetail: React.FC<VoteDetailProps> = ({
  data,
  recentVotes = [],
  performanceHistory = [],
  loading = false
}) => {
  // Calculate performance metrics
  const voteSuccessRate =
    recentVotes.length > 0
      ? (
          (recentVotes.filter((v) => v.success).length / recentVotes.length) *
          100
        ).toFixed(1)
      : 'N/A'

  const averageConfirmations =
    recentVotes.length > 0
      ? (
          recentVotes.reduce((acc, v) => acc + v.confirmationCount, 0) /
          recentVotes.length
        ).toFixed(1)
      : 'N/A'

  return (
    <div className="space-y-6">
      {/* Validator Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-900/50">
            <Vote className="size-6 text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Validator Details
            </h3>
            <Link
              to={`/address/${data.address}`}
              className="flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              {data.address}
              <ExternalLink className="size-3" />
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Percent className="size-4" />
            Commission: {data.commission}%
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Shield className="size-4" />
            Node: {data.node.address.slice(0, 4)}...
            {data.node.address.slice(-4)}
          </div>
        </div>
      </div>

      {/* Performance Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            <Award className="size-4" />
            Vote Success Rate
          </div>
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {voteSuccessRate}%
          </span>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            <Clock className="size-4" />
            Avg. Confirmations
          </div>
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {averageConfirmations}
          </span>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            <TrendingUp className="size-4" />
            Credits (Current Epoch)
          </div>
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {data.epochCredits[
              data.epochCredits.length - 1
            ]?.credits.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
        <h4 className="text-md mb-4 flex items-center gap-2 font-medium text-gray-900 dark:text-white">
          <TrendingUp className="size-5 text-gray-500" />
          Validator Performance
        </h4>
        <div className="h-64 w-full">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader className="size-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceHistory}>
                <XAxis
                  dataKey="epoch"
                  tickFormatter={(epoch) => `Epoch ${epoch}`}
                />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Epoch {data.epoch}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Credits: {data.credits.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(data.timestamp * 1000).toLocaleString()}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="credits"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Votes */}
      <div className="space-y-4">
        <h4 className="text-md flex items-center gap-2 font-medium text-gray-900 dark:text-white">
          <History className="size-5 text-gray-500" />
          Recent Votes
        </h4>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Slot
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Confirmations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
              {recentVotes.map((vote, index) => (
                <tr key={`${vote.slot}-${index}`}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {vote.slot.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(vote.timestamp * 1000).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {vote.confirmationCount}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        vote.success
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                      }`}
                    >
                      {vote.success ? 'Confirmed' : 'Failed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default VoteDetail
