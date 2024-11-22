import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Terminal, History, Activity,
  Shield, Users, Cpu, ExternalLink,
  ArrowUpRight, Clock
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { ProgramAccount, ProgramInvocation } from '../../services/search';

interface ProgramDetailProps {
  data: ProgramAccount;
  recentInvocations?: ProgramInvocation[];
}

const ProgramDetail: React.FC<ProgramDetailProps> = ({ data, recentInvocations = [] }) => {
  return (
    <div className="space-y-6">
      {/* Program Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg">
            <FileText className="h-6 w-6 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Program Details
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
        {data.authority && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Shield className="h-4 w-4" />
            Authority: {data.authority.address}
          </div>
        )}
      </div>

      {/* Program Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            <Terminal className="h-4 w-4" />
            Program Size
          </div>
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {(data.programData?.data.length || 0).toLocaleString()} bytes
          </span>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            <Clock className="h-4 w-4" />
            Last Update
          </div>
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Slot {data.programData?.slot.toLocaleString() || 'N/A'}
          </span>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            <Cpu className="h-4 w-4" />
            Recent Invocations
          </div>
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {recentInvocations.length.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Usage Chart */}
      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-gray-500" />
          Program Usage
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={recentInvocations}>
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(timestamp) => new Date(timestamp * 1000).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ProgramInvocation;
                    return (
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(data.timestamp * 1000).toLocaleString()}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {data.computeUnits.toLocaleString()} CU
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Caller: {data.caller.label || data.caller.address}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="computeUnits"
                stroke="#818cf8"
                fill="#818cf8"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Invocations */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <History className="h-5 w-5 text-gray-500" />
          Recent Invocations
        </h4>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Caller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Compute Units
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {recentInvocations.map((invocation, index) => (
                <tr key={invocation.signature}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(invocation.timestamp * 1000).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/address/${invocation.caller.address}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {invocation.caller.label || invocation.caller.address}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {invocation.computeUnits.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      invocation.success
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                    }`}>
                      {invocation.success ? 'Success' : 'Failed'}
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

export default ProgramDetail; 