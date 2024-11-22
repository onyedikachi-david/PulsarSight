import React from 'react';
import { Link } from 'react-router-dom';
import {
  Vote, History, TrendingUp, PieChart,
  Shield, Users, Cpu, ExternalLink,
  Award, Percent, Clock, Loader
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, LineChart, Line,
  PieChart as RePieChart, Pie, Cell
} from 'recharts';
import { VoteAccount, ValidatorVote } from '../../services/search';

interface VoteDetailProps {
  data: VoteAccount;
  recentVotes?: ValidatorVote[];
  performanceHistory?: Array<{
    epoch: number;
    credits: number;
    previousCredits: number;
    timestamp: number;
  }>;
  loading?: boolean;
}

const VoteDetail: React.FC<VoteDetailProps> = ({ 
  data, 
  recentVotes = [], 
  performanceHistory = [], 
  loading = false 
}) => {
  // Calculate performance metrics
  const voteSuccessRate = recentVotes.length > 0
    ? (recentVotes.filter(v => v.success).length / recentVotes.length * 100).toFixed(1)
    : 'N/A';

  const averageConfirmations = recentVotes.length > 0
    ? (recentVotes.reduce((acc, v) => acc + v.confirmationCount, 0) / recentVotes.length).toFixed(1)
    : 'N/A';

  return (
    <div className="space-y-6">
      {/* Validator Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 dark:bg-purple-900/50 rounded-lg">
            <Vote className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Validator Details
            </h3>
            <Link
              to={`/address/${data.address}`}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              {data.address}
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Percent className="h-4 w-4" />
            Commission: {data.commission}%
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Shield className="h-4 w-4" />
            Node: {data.node.address.slice(0, 4)}...{data.node.address.slice(-4)}
          </div>
        </div>
      </div>

      {/* Performance Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            <Award className="h-4 w-4" />
            Vote Success Rate
          </div>
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {voteSuccessRate}%
          </span>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            <Clock className="h-4 w-4" />
            Avg. Confirmations
          </div>
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {averageConfirmations}
          </span>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            <TrendingUp className="h-4 w-4" />
            Credits (Current Epoch)
          </div>
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {data.epochCredits[data.epochCredits.length - 1]?.credits.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-gray-500" />
          Validator Performance
        </h4>
        <div className="h-64 w-full">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader className="h-8 w-8 animate-spin text-gray-400" />
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
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
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
                      );
                    }
                    return null;
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
        <h4 className="text-md font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <History className="h-5 w-5 text-gray-500" />
          Recent Votes
        </h4>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Slot
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Confirmations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {recentVotes.map((vote, index) => (
                <tr key={`${vote.slot}-${index}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {vote.slot.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(vote.timestamp * 1000).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {vote.confirmationCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      vote.success
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                    }`}>
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
  );
};

export default VoteDetail; 