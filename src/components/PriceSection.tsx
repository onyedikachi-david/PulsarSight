import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Tooltip } from './ui/Tooltip';

interface PriceSectionProps {
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  circulatingSupply: number;
  totalSupply: number;
}

export default function PriceSection({
  price = 123.45,
  priceChange24h = 5.67,
  volume24h = 45678901,
  marketCap = 1234567890,
  circulatingSupply = 100000000,
  totalSupply = 150000000,
}: PriceSectionProps) {
  const isPriceUp = priceChange24h > 0;
  const TrendIcon = isPriceUp ? TrendingUp : TrendingDown;
  const formattedPrice = price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  const formattedPriceChange = Math.abs(priceChange24h).toFixed(2) + '%';

  return (
    <div className="glass-card hover-card">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary-500" />
            </div>
            <h2 className="text-xl font-semibold">SOON Price</h2>
          </div>
          <Tooltip content="View Price Chart">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <BarChart3 className="w-5 h-5 text-gray-500" />
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-3xl font-mono font-bold">{formattedPrice}</div>
            <div className={`flex items-center space-x-2 mt-2 ${
              isPriceUp ? 'text-green-500' : 'text-red-500'
            }`}>
              <TrendIcon className="w-4 h-4" />
              <span className="font-medium">{formattedPriceChange}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">24h</span>
            </div>
          </div>
          <div className="w-32 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {/* Placeholder for mini price chart */}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <PriceMetric
            icon={<Wallet className="w-5 h-5" />}
            label="24h Volume"
            value={formatCurrency(volume24h)}
            tooltip="Trading volume in the last 24 hours"
          />
          <PriceMetric
            icon={<BarChart3 className="w-5 h-5" />}
            label="Market Cap"
            value={formatCurrency(marketCap)}
            tooltip="Total market capitalization"
          />
          <PriceMetric
            icon={<ArrowUpRight className="w-5 h-5" />}
            label="Circulating Supply"
            value={formatNumber(circulatingSupply)}
            subValue={`${((circulatingSupply / totalSupply) * 100).toFixed(1)}%`}
            tooltip="Number of tokens in circulation"
          />
          <PriceMetric
            icon={<ArrowDownRight className="w-5 h-5" />}
            label="Total Supply"
            value={formatNumber(totalSupply)}
            tooltip="Maximum number of tokens"
          />
        </div>
      </div>
    </div>
  );
}

interface PriceMetricProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  tooltip: string;
}

function PriceMetric({ icon, label, value, subValue, tooltip }: PriceMetricProps) {
  return (
    <Tooltip content={tooltip}>
      <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-help">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <div className="text-gray-500">{icon}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
          <div className="font-mono font-medium">{value}</div>
          {subValue && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {subValue}
            </div>
          )}
        </div>
      </div>
    </Tooltip>
  );
}

function formatCurrency(value: number): string {
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  }
  if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

function formatNumber(value: number): string {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`;
  }
  return value.toLocaleString();
}