import React from 'react';
import { ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const priceData = [
  { time: '10 AM', price: 16342 },
  { time: '11 AM', price: 45350 },
  { time: '12 PM', price: 42000 },
  { time: '1 PM', price: 39000 },
  { time: '2 PM', price: 36000 },
  { time: '3 PM', price: 38000 },
  { time: '4 PM', price: 41000 },
  { time: '5 PM', price: 45350 },
];

const PriceChart = React.memo(() => (
  <div className="h-64 w-full bg-white dark:bg-gray-800 rounded-lg p-4">
    <ResponsiveContainer>
      <AreaChart data={priceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="time" 
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          domain={['dataMin - 1000', 'dataMax + 1000']}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke="#EF4444"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorPrice)"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
));

PriceChart.displayName = 'PriceChart';

const TimePeriodButton = React.memo(({ period, isActive, onClick }: { 
  period: string; 
  isActive: boolean; 
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 rounded-full text-sm ${
      isActive
        ? 'bg-red-100 text-red-600'
        : 'text-gray-500 hover:bg-gray-100'
    }`}
  >
    {period}
  </button>
));

TimePeriodButton.displayName = 'TimePeriodButton';

export default function PriceSection() {
  const [activePeriod, setActivePeriod] = React.useState('D');
  const periods = ['D', 'W', 'M', 'Y'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Price</h2>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">$45,350</span>
            <div className="flex items-center text-red-500">
              <ArrowDownRight className="w-4 h-4" />
              <span>5.16% (24h)</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          {periods.map((period) => (
            <TimePeriodButton
              key={period}
              period={period}
              isActive={period === activePeriod}
              onClick={() => setActivePeriod(period)}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-500">Market cap</p>
          <p className="text-lg font-semibold">$2,260,890</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-500">Volume(24h)</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-lg font-semibold">$30,260,890,235,845</p>
            <p className="text-sm text-gray-500">235,845 BTC</p>
          </div>
        </div>
      </div>

      <PriceChart />
    </div>
  );
}