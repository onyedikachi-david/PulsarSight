import React, { useEffect, useState } from 'react';
import { getConnection } from '../../utils/rpc';
import { VersionedBlockResponse } from '@solana/web3.js';

const BlocksPage: React.FC = () => {
    const [blocks, setBlocks] = useState<(VersionedBlockResponse | null)[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecentBlocks = async () => {
            try {
                const connection = getConnection();
                const slot = await connection.getSlot();
                const promises = [];

                // Fetch last 20 blocks
                for (let i = 0; i < 20; i++) {
                    if (slot - i >= 0) {
                        promises.push(
                            connection.getBlock(slot - i, {
                                maxSupportedTransactionVersion: 0,
                            })
                        );
                    }
                }

                const fetchedBlocks = await Promise.all(promises);
                setBlocks(fetchedBlocks);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch recent blocks');
                setLoading(false);
            }
        };

        fetchRecentBlocks();
        
        // Set up interval to fetch blocks
        const interval = setInterval(fetchRecentBlocks, 6000); // Refresh every 6 seconds

        return () => clearInterval(interval);
    }, []);

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

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                Error
                            </h3>
                            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                <p>{error}</p>
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
                        Recent Blocks
                    </h3>
                    <div className="mt-5">
                        <div className="flow-root">
                            <ul role="list" className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                                {blocks.filter((block): block is VersionedBlockResponse => block !== null)
                                    .map((block) => (
                                    <li key={block.parentSlot} className="py-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                                    Block {block.parentSlot + 1}
                                                </p>
                                                <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                                                    Transactions: {block.transactions.length}
                                                </p>
                                                <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                                                    Block Time: {new Date(block.blockTime! * 1000).toLocaleString()}
                                                </p>
                                            </div>
                                            <div>
                                                <a
                                                    href={`/blocks/${block.parentSlot + 1}`}
                                                    className="inline-flex items-center rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2.5 py-0.5 text-sm font-medium leading-5 text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
                                                >
                                                    View
                                                </a>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlocksPage;
