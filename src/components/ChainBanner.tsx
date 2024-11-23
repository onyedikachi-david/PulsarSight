import React from 'react'
import { Activity, Wifi, WifiOff, Shield, Clock } from 'lucide-react'
import { Tooltip } from './ui/Tooltip'

interface ChainBannerProps {
  chainName: string
  blockHeight: number
  lastBlockTime: string
  networkStatus: 'online' | 'offline' | 'syncing'
  tps: number
  latency: string
}

const networkStatusConfig = {
  online: { icon: Wifi, className: 'text-green-500', label: 'Network Online' },
  offline: {
    icon: WifiOff,
    className: 'text-red-500',
    label: 'Network Offline'
  },
  syncing: {
    icon: Activity,
    className: 'text-yellow-500 animate-pulse',
    label: 'Syncing'
  }
}

export default function ChainBanner({
  chainName = 'SOON Network',
  blockHeight = 12345678,
  lastBlockTime = '6.5s ago',
  networkStatus = 'online',
  tps = 1234
}: ChainBannerProps) {
  const StatusIcon = networkStatusConfig[networkStatus].icon

  return (
    <div className="glass-card hover-card">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary-500/10">
              <Shield className="size-7 text-primary-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{chainName}</h1>
              <div className="mt-1 flex items-center space-x-2">
                <Tooltip content={networkStatusConfig[networkStatus].label}>
                  <StatusIcon
                    className={`size-4 ${networkStatusConfig[networkStatus].className}`}
                  />
                </Tooltip>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {networkStatusConfig[networkStatus].label}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8">
            <MetricCard
              icon={<Activity className="size-5" />}
              label="Block Height"
              value={blockHeight.toLocaleString()}
              tooltip="Current block height of the chain"
            />
            <MetricCard
              icon={<Clock className="size-5" />}
              label="Last Block"
              value={lastBlockTime}
              tooltip="Time since last block"
            />
            <MetricCard
              icon={<Activity className="size-5" />}
              label="TPS"
              value={`${tps.toLocaleString()} tx/s`}
              tooltip="Transactions per second"
              highlight={tps > 1000}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string
  tooltip: string
  highlight?: boolean
}

function MetricCard({
  icon,
  label,
  value,
  tooltip,
  highlight = false
}: MetricCardProps) {
  return (
    <Tooltip content={tooltip}>
      <div className="flex cursor-help flex-col items-center rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
        <div
          className={`mb-2 flex size-10 items-center justify-center rounded-lg ${
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
      </div>
    </Tooltip>
  )
}
