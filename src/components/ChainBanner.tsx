import React from 'react';
import { Activity, ChevronRight, Globe, Cpu } from 'lucide-react';

export default function ChainBanner() {
  return (
    <div className="glass-card p-6 hover-card overflow-hidden relative">
      <div className="grid-pattern absolute inset-0 opacity-50" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">SOON Network</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Mainnet</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <NetworkStatus />
            <ChainStats />
          </div>
        </div>
      </div>
    </div>
  );
}

function NetworkStatus() {
  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className="flex items-center space-x-1.5">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-green-600 dark:text-green-400">Network Active</span>
      </div>
      <span className="text-gray-400">•</span>
      <div className="flex items-center space-x-1.5">
        <Activity className="w-4 h-4 text-primary-500" />
        <span className="text-gray-600 dark:text-gray-400">6.2 TPS</span>
      </div>
    </div>
  );
}

function ChainStats() {
  return (
    <div className="flex items-center divide-x divide-gray-200 dark:divide-gray-700">
      <StatItem
        icon={<Cpu className="w-4 h-4" />}
        label="Block Height"
        value="12,345,678"
      />
      <StatItem
        icon={<Activity className="w-4 h-4" />}
        label="Block Time"
        value="6.5s"
      />
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="px-6 flex items-center space-x-2">
      <div className="text-gray-400 dark:text-gray-500">{icon}</div>
      <div>
        <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
        <div className="font-mono font-medium">{value}</div>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </div>
  );
}