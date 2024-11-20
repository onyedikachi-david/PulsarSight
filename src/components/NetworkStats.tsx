import React from 'react';
import { TrendingUp, Users, Database, Server, Clock, Activity } from 'lucide-react';
import { Tooltip } from './ui/Tooltip';

interface NetworkStatsProps {
  validators: number;
  totalStaked: string;
  blockTime: string;
  uptime: string;
  tps: number;
  activeValidators: number;
}

export default function NetworkStats({
  validators = 100,
  totalStaked = '1,234,567 SOON',
  blockTime = '6.5s',
  uptime = '99.99%',
  tps = 1234,
  activeValidators = 95,
}: NetworkStatsProps) {
  return (
    <div className="glass-card hover-card">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-500" />
            </div>
            <h2 className="text-xl font-semibold">Network Statistics</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Validators"
          value={validators.toLocaleString()}
          subValue={`${activeValidators} Active`}
          tooltip="Total number of validators in the network"
          trend={activeValidators / validators}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Total Staked"
          value={totalStaked}
          tooltip="Total amount of SOON tokens staked"
          highlight
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Block Time"
          value={blockTime}
          tooltip="Average time between blocks"
        />
        <StatCard
          icon={<Server className="w-5 h-5" />}
          label="Uptime"
          value={uptime}
          tooltip="Network uptime percentage"
          highlight={parseFloat(uptime) > 99.9}
        />
        <StatCard
          icon={<Activity className="w-5 h-5" />}
          label="TPS"
          value={`${tps.toLocaleString()} tx/s`}
          tooltip="Transactions per second"
          highlight={tps > 1000}
        />
        <StatCard
          icon={<Database className="w-5 h-5" />}
          label="Storage"
          value="1.23 TB"
          subValue="+2.3 GB/day"
          tooltip="Total blockchain storage size"
        />
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  tooltip: string;
  highlight?: boolean;
  trend?: number;
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
      <div className="flex flex-col p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-help">
        <div className={`flex items-center justify-center w-10 h-10 rounded-lg mb-3 ${
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
        {subValue && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {subValue}
          </div>
        )}
        {trend !== undefined && (
          <div className={`text-xs mt-1 ${
            trend >= 0.95 ? 'text-green-500' :
            trend >= 0.8 ? 'text-yellow-500' :
            'text-red-500'
          }`}>
            {(trend * 100).toFixed(1)}% participation
          </div>
        )}
      </div>
    </Tooltip>
  );
}