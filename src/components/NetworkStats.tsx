import React from 'react'
import {
  TrendingUp,
  Users,
  Database,
  Server,
  Clock,
  Activity
} from 'lucide-react'
import { Tooltip } from './ui/Tooltip'

interface NetworkStatsProps {
  validators: number
  totalStaked: string
  blockTime: string
  uptime: string
  tps: number
  activeValidators: number
}

export default function NetworkStats({
  validators = 100,
  totalStaked = '1,234,567 SOON',
  blockTime = '6.5s',
  uptime = '99.99%',
  tps = 1234,
  activeValidators = 95
}: NetworkStatsProps) {
  return (
    <div className="glass-card hover-card">
      <div className="border-b border-gray-200 p-6 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary-500/10">
              <Activity className="size-5 text-primary-500" />
            </div>
            <h2 className="text-xl font-semibold">Network Statistics</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 p-6 md:grid-cols-3">
        <StatCard
          icon={<Users className="size-5" />}
          label="Validators"
          value={validators.toLocaleString()}
          subValue={`${activeValidators} Active`}
          tooltip="Total number of validators in the network"
          trend={activeValidators / validators}
        />
        <StatCard
          icon={<TrendingUp className="size-5" />}
          label="Total Staked"
          value={totalStaked}
          tooltip="Total amount of SOON tokens staked"
          highlight
        />
        <StatCard
          icon={<Clock className="size-5" />}
          label="Block Time"
          value={blockTime}
          tooltip="Average time between blocks"
        />
        <StatCard
          icon={<Server className="size-5" />}
          label="Uptime"
          value={uptime}
          tooltip="Network uptime percentage"
          highlight={parseFloat(uptime) > 99.9}
        />
        <StatCard
          icon={<Activity className="size-5" />}
          label="TPS"
          value={`${tps.toLocaleString()} tx/s`}
          tooltip="Transactions per second"
          highlight={tps > 1000}
        />
        <StatCard
          icon={<Database className="size-5" />}
          label="Storage"
          value="1.23 TB"
          subValue="+2.3 GB/day"
          tooltip="Total blockchain storage size"
        />
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  subValue?: string
  tooltip: string
  highlight?: boolean
  trend?: number
}

function StatCard({
  icon,
  label,
  value,
  subValue,
  tooltip,
  highlight = false,
  trend
}: StatCardProps) {
  return (
    <Tooltip content={tooltip}>
      <div className="flex cursor-help flex-col rounded-lg p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
        <div
          className={`mb-3 flex size-10 items-center justify-center rounded-lg ${
            highlight ? 'bg-primary-500/10' : 'bg-gray-100 dark:bg-gray-800'
          }`}
        >
          <div className={highlight ? 'text-primary-500' : 'text-gray-500'}>
            {icon}
          </div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
        <div
          className={`font-mono text-lg font-medium ${
            highlight ? 'text-primary-600 dark:text-primary-400' : ''
          }`}
        >
          {value}
        </div>
        {subValue && (
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {subValue}
          </div>
        )}
        {trend !== undefined && (
          <div
            className={`mt-1 text-xs ${
              trend >= 0.95
                ? 'text-green-500'
                : trend >= 0.8
                  ? 'text-yellow-500'
                  : 'text-red-500'
            }`}
          >
            {(trend * 100).toFixed(1)}% participation
          </div>
        )}
      </div>
    </Tooltip>
  )
}
