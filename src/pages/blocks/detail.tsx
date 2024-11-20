import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import connection from '../../utils/rpc';
import { VersionedBlockResponse } from '@solana/web3.js';
import { ChevronRight } from 'lucide-react';

interface BlockDetails {
  block: VersionedBlockResponse;
  blockTime: number | null;
  slotLeader: string;
}

const BlockDetailPage: React.FC = () => {
  const { slot } = useParams<{ slot: string }>();
  const [blockDetails, setBlockDetails] = useState<BlockDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlockDetails = async () => {
      if (!slot) {
        setError('Block slot not provided');
        setLoading(false);
        return;
      }

      try {
        const slotNumber = parseInt(slot);
        console.log("Fetching block details for slot:", slotNumber);

        const [block, blockTime, slotLeader] = await Promise.all([
          connection.getBlock(slotNumber),
          connection.getBlockTime(slotNumber),
          connection.getSlotLeader(slotNumber)
        ]);

        console.log("Block details:", { block, blockTime, slotLeader });

        if (!block) {
          setError('Block not found');
          setLoading(false);
          return;
        }

        setBlockDetails({
          block,
          blockTime,
          slotLeader
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching block:', err);
        setError('Failed to fetch block details');
        setLoading(false);
      }
    };

    fetchBlockDetails();
  }, [slot]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blockDetails) {
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

  const { block, blockTime, slotLeader } = blockDetails;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      {/* Breadcrumb */}
      <nav className="mb-4">
        <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <li>
            <Link to="/blocks" className="hover:text-red-600 dark:hover:text-red-400">
              Blocks
            </Link>
          </li>
          <li>
            <ChevronRight className="h-4 w-4" />
          </li>
          <li>Block {slot}</li>
        </ol>
      </nav>

      <div className="rounded-lg bg-white dark:bg-gray-800 shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
            Block Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Block Information
              </h4>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Slot</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">{slot}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Parent Slot</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">{block.parentSlot}</dd>
                </div>
                {blockTime && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Timestamp</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(blockTime * 1000).toLocaleString()}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Transactions</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">{block.transactions.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Slot Leader</dt>
                  <dd className="text-sm font-mono text-gray-900 dark:text-white">
                    {slotLeader.slice(0, 8)}...{slotLeader.slice(-8)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Block Metrics
              </h4>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Block Hash</dt>
                  <dd className="text-sm font-mono text-gray-900 dark:text-white">{block.blockhash}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Previous Block Hash</dt>
                  <dd className="text-sm font-mono text-gray-900 dark:text-white">{block.previousBlockhash}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Transactions List */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
              Transactions ({block.transactions.length})
            </h4>
            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Signature
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fee (lamports)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {block.transactions.map((tx, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link 
                          to={`/transactions/${tx.transaction.signatures[0]}`}
                          className="text-red-600 dark:text-red-400 hover:underline font-mono"
                        >
                          {tx.transaction.signatures[0].slice(0, 20)}...
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          tx.meta?.err
                            ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                            : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                        }`}>
                          {tx.meta?.err ? 'Failed' : 'Success'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono">
                        {tx.meta?.fee}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockDetailPage;
