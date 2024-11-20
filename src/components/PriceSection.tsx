import React from 'react';
import { TrendingUp, DollarSign, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = Array.from({ length: 24 }, (_, i) => ({
  time: i,
  price: Math.sin(i / 3) * 10 + 50 + Math.random() * 5,
}));

export default function PriceSection() {
  const priceChange = 2.5;
  const isPriceUp = priceChange > 0;

  return (
    <div className="glass-card p-6 hover-card">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">SOON Price</h2>
              <div className="flex items-center space-x-2">
                <span className="stats-value">$49.23</span>
                <PriceChange value={priceChange} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-4">
          <MetricCard
            icon={<BarChart3 className="w-4 h-4" />}
            label="24h Volume"
            value="$23.5M"
          />
          <MetricCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Market Cap"
            value="$1.2B"
          />
        </div>
      </div>
      
      <div className="h-[200px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(220, 38, 38)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="rgb(220, 38, 38)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
            />
            <YAxis
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(255, 255, 255, 0.8)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#DC2626"
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function PriceChange({ value }: { value: number }) {
  const isPositive = value > 0;
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
  const colorClass = isPositive ? 'text-green-500' : 'text-red-500';

  return (
    <div className={`flex items-center space-x-1 ${colorClass} text-sm font-medium`}>
      <Icon className="w-4 h-4" />
      <span>{Math.abs(value)}%</span>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 font-mono font-medium">{value}</div>
    </div>
  );
}