import React, { useEffect, useState } from 'react';
import { rpcGraphQL } from '../../utils/rpc';

interface Block {
  blockhash: string;
  blockHeight: bigint;
  blockTime: bigint | null;
  parentSlot: bigint;
  previousBlockhash: string;
  transactions: Array<{
    slot: bigint;
    meta: {
      fee: bigint;
    };
  }>;
}

const BlocksPage: React.FC = () => {
  const [block, setBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestBlock = async () => {
      try {
        // First get the latest block slot from a transaction
        const txSource = `
          query GetRecentTransaction($signature: Signature!, $commitment: CommitmentWithoutProcessed) {
            transaction(signature: $signature, commitment: $commitment) {
              slot
            }
          }
        `;

        const txResult = await rpcGraphQL.query(txSource, {
          signature: '3hijAG46JpNLpNjgKZMrMP7AB7vNAWw9qKM8K6THdRuyTQZv6LLAB9TTecq7hpQgURFHxm18ecGmj5yiw9iamhNS' as any,
          commitment: 'CONFIRMED'
        });

        if (!txResult?.data?.transaction?.slot) {
          throw new Error('Could not get latest slot');
        }

        // Now fetch the block using that slot
        const blockSource = `
          query GetBlock($slot: Slot!) {
            block(slot: $slot) {
              blockhash
              blockHeight
              blockTime
              parentSlot
              previousBlockhash
              transactions {
                slot
                meta {
                  fee
                }
              }
            }
          }
        `;

        const blockResult = await rpcGraphQL.query(blockSource, {
          slot: txResult.data.transaction.slot as any
        });

        if (!blockResult?.data?.block) {
          throw new Error('Block not found');
        }

        setBlock(blockResult.data.block as Block);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching block:', err);
        setError('Failed to fetch block details');
        setLoading(false);
      }
    };

    fetchLatestBlock();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !block) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error || 'Block not found'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="rounded-lg bg-white dark:bg-gray-800 shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
            Block Details
          </h3>
          <div className="mt-5 border-t border-gray-200 dark:border-gray-700">
            <dl className="divide-y divide-gray-200 dark:divide-gray-700">
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Block Hash
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0 font-mono">
                  {block.blockhash}
                </dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Block Height
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0">
                  {block.blockHeight.toString()}
                </dd>
              </div>
              {block.blockTime && (
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Timestamp
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0">
                    {new Date(Number(block.blockTime) * 1000).toLocaleString()}
                  </dd>
                </div>
              )}
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Transactions
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0">
                  {block.transactions.length.toString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlocksPage;
