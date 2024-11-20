import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getConnection } from '../../utils/rpc';

const RecentTransactionsPage: React.FC = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecentTransactions = async () => {
            try {
                const connection = getConnection();
                const signatures = await connection.getSignaturesForAddress(
                    connection.genesisHash,
                    { limit: 20 }
                );
                setTransactions(signatures);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch recent transactions');
                setLoading(false);
            }
        };

        fetchRecentTransactions();
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
                        Recent Transactions
                    </h3>
                    <div className="mt-5">
                        <div className="flow-root">
                            <ul role="list" className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                                {transactions.map((tx) => (
                                    <li key={tx.signature} className="py-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                                    {tx.signature}
                                                </p>
                                                <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                                                    Slot: {tx.slot}
                                                </p>
                                            </div>
                                            <div>
                                                <Link
                                                    to={`/transactions/${tx.signature}`}
                                                    className="inline-flex items-center rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2.5 py-0.5 text-sm font-medium leading-5 text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
                                                >
                                                    View
                                                </Link>
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

export default RecentTransactionsPage;
