import React from 'react';
import { Activity, Wifi, WifiOff, Shield, Clock } from 'lucide-react';
import { Tooltip } from './ui/Tooltip';

interface ChainBannerProps {
  chainName: string;
  blockHeight: number;
  lastBlockTime: string;
  networkStatus: 'online' | 'offline' | 'syncing';
  tps: number;
  latency: string;
}

const networkStatusConfig = {
  online: { icon: Wifi, className: 'text-green-500', label: 'Network Online' },
  offline: { icon: WifiOff, className: 'text-red-500', label: 'Network Offline' },
  syncing: { icon: Activity, className: 'text-yellow-500 animate-pulse', label: 'Syncing' },
};

export default function ChainBanner({
  chainName = 'SOON Network',
  blockHeight = 12345678,
  lastBlockTime = '6.5s ago',
  networkStatus = 'online',
  tps = 1234,
  latency = '45ms',
}: ChainBannerProps) {
  const StatusIcon = networkStatusConfig[networkStatus].icon;

  return (
    <div className="glass-card hover-card">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
              <Shield className="w-7 h-7 text-primary-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{chainName}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <Tooltip content={networkStatusConfig[networkStatus].label}>
                  <StatusIcon className={`w-4 h-4 ${networkStatusConfig[networkStatus].className}`} />
                </Tooltip>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {networkStatusConfig[networkStatus].label}
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-8">
            <MetricCard
              icon={<Activity className="w-5 h-5" />}
              label="Block Height"
              value={blockHeight.toLocaleString()}
              tooltip="Current block height of the chain"
            />
            <MetricCard
              icon={<Clock className="w-5 h-5" />}
              label="Last Block"
              value={lastBlockTime}
              tooltip="Time since last block"
            />
            <MetricCard
              icon={<Activity className="w-5 h-5" />}
              label="TPS"
              value={`${tps.toLocaleString()} tx/s`}
              tooltip="Transactions per second"
              highlight={tps > 1000}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  tooltip: string;
  highlight?: boolean;
}

function MetricCard({ icon, label, value, tooltip, highlight = false }: MetricCardProps) {
  return (
    <Tooltip content={tooltip}>
      <div className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-help">
        <div className={`flex items-center justify-center w-10 h-10 rounded-lg mb-2 ${
          highlight ? 'bg-primary-500/10' : 'bg-gray-100 dark:bg-gray-800'
        }`}>
          <div className={highlight ? 'text-primary-500' : 'text-gray-500'}>
            {icon}
          </div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
        <div className={`font-mono font-medium text-lg ${
          highlight ? 'text-primary-600 dark:text-primary-400' : ''
        }`}>
          {value}
        </div>
      </div>
    </Tooltip>
  );
}