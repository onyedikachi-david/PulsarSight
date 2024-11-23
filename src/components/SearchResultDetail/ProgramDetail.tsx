/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Terminal,
  History,
  Activity,
  Shield,
  Cpu,
  ExternalLink,
  Clock
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { ProgramAccount, ProgramInvocation } from '../../services/search'

interface ProgramDetailProps {
  data: ProgramAccount
  recentInvocations?: ProgramInvocation[]
}

const ProgramDetail: React.FC<ProgramDetailProps> = ({
  data,
  recentInvocations = []
}) => {
  return (
    <div className="space-y-6">
      {/* Program Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-50 p-2 dark:bg-indigo-900/50">
            <FileText className="size-6 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Program Details
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
        {data.authority && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Shield className="size-4" />
            Authority: {data.authority.address}
          </div>
        )}
      </div>

      {/* Program Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            <Terminal className="size-4" />
            Program Size
          </div>
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {(data.programData?.data.length || 0).toLocaleString()} bytes
          </span>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            <Clock className="size-4" />
            Last Update
          </div>
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Slot {data.programData?.slot.toLocaleString() || 'N/A'}
          </span>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            <Cpu className="size-4" />
            Recent Invocations
          </div>
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {recentInvocations.length.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Usage Chart */}
      <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
        <h4 className="text-md mb-4 flex items-center gap-2 font-medium text-gray-900 dark:text-white">
          <Activity className="size-5 text-gray-500" />
          Program Usage
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={recentInvocations}>
              <XAxis
                dataKey="timestamp"
                tickFormatter={(timestamp) =>
                  new Date(timestamp * 1000).toLocaleDateString()
                }
              />
              <YAxis />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ProgramInvocation
                    return (
                      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
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
                    )
                  }
                  return null
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
        <h4 className="text-md flex items-center gap-2 font-medium text-gray-900 dark:text-white">
          <History className="size-5 text-gray-500" />
          Recent Invocations
        </h4>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Caller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Compute Units
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
              {recentInvocations.map((invocation, index) => (
                <tr key={invocation.signature}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(invocation.timestamp * 1000).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Link
                      to={`/address/${invocation.caller.address}`}
                      className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {invocation.caller.label || invocation.caller.address}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {invocation.computeUnits.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        invocation.success
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                      }`}
                    >
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
  )
}

export default ProgramDetail
