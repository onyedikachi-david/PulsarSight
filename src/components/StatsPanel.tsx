import React, { useEffect, useState } from 'react';
import { RPC_URL, rpcGraphQL } from '../utils/rpc';
import { createSolanaRpc } from '@solana/rpc';

interface StatsPanelProps {
  title: string;
  type: 'validators' | 'votingPower';
}

export default function StatsPanel({ title, type }: StatsPanelProps) {
  const [data, setData] = useState({
    current: 0,
    total: 0
  });

  const fetchStats = async () => {
    try {
      const rpc = createSolanaRpc(RPC_URL);
      
      if (type === 'validators') {
        const source = `
          query GetValidators {
            validators {
              votePubkey
              activatedStake
              lastVote
            }
          }
        `;

        const result = await rpcGraphQL.query(source);
        if (result?.data?.validators) {
          const activeValidators = result.data.validators.filter(
            (v: any) => v.activatedStake > 0
          ).length;

          setData({
            current: activeValidators,
            total: result.data.validators.length
          });
        }
      } else if (type === 'votingPower') {
        const supply = await rpc.getSupply().send();
        if (supply) {
          const total = Number(supply.value.total) / 1e9; // Convert to SOL
          const active = Number(supply.value.active) / 1e9;
          setData({
            current: active,
            total: total
          });
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [type]);

  const percentage = Math.round((data.current / data.total) * 100);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
      <h3 className="text-gray-900 dark:text-white font-medium mb-4">{title}</h3>
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200 dark:bg-purple-900/20">
              {percentage}%
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-gray-600 dark:text-gray-400">
              {type === 'votingPower' ? `${data.current.toFixed(2)}M` : data.current}
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200 dark:bg-purple-900/20">
          <div
            style={{ width: `${percentage}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
          ></div>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {type === 'votingPower' 
            ? `${data.current.toFixed(2)}M from ${data.total.toFixed(2)}M`
            : `${data.current} out of ${data.total}`}
        </div>
      </div>
    </div>
  );
}