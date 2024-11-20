import React from 'react';

interface StatsPanelProps {
  title: string;
  value: string;
  subValue?: string;
  percentage: number;
}

export default function StatsPanel({ title, value, subValue, percentage }: StatsPanelProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
      <h3 className="text-gray-900 dark:text-white font-medium mb-4">{title}</h3>
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-red-600 bg-red-200">
              {percentage}%
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-gray-600">
              {subValue}
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-red-200">
          <div
            style={{ width: `${percentage}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
          ></div>
        </div>
        <div className="text-sm text-gray-600">{value}</div>
      </div>
    </div>
  );
}