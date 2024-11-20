import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { LAMPORTS_PER_SOL, ParsedTransactionWithMeta } from '@solana/web3.js';
import { connection } from '../utils/rpc';
import { Loader2 } from 'lucide-react';

export const TransactionDetail: FC = () => {
    const router = useRouter();
    const { txid } = router.query;
    const [transactionDetail, setTransactionDetail] = useState<ParsedTransactionWithMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const search = Array.isArray(txid) ? txid[0] : txid;

    useEffect(() => {
        if (!router.isReady) return;
        if (search) {
            getTransaction(search);
        }
    }, [router.isReady, search]);

    async function getTransaction(txid: string) {
        try {
            setLoading(true);
            setError(null);
            const transactionDetails = await connection.getParsedTransaction(txid, {
                maxSupportedTransactionVersion: 0
            });
            setTransactionDetail(transactionDetails);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-red-600">
                Error: {error}
            </div>
        );
    }

    if (!transactionDetail) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-gray-500">
                No transaction details found
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="space-y-8">
                {/* Overview Section */}
                <section>
                    <h2 className="text-xl font-bold mb-4">Overview</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                <tr>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">Signature</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono">
                                        {transactionDetail.transaction.signatures[0]}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">Timestamp</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                        {new Date(transactionDetail.blockTime! * 1000).toLocaleString()}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">Status</td>
                                    <td className="px-6 py-4">
                                        {transactionDetail.meta.err ? (
                                            <span className="text-red-600 bg-red-100 dark:bg-red-900/20 px-2 py-1 rounded">Failed</span>
                                        ) : (
                                            <span className="text-green-600 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded">Success</span>
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Account Changes Section */}
                <section>
                    <h2 className="text-xl font-bold mb-4">Account Changes</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3">#</th>
                                    <th className="px-6 py-3">Address</th>
                                    <th className="px-6 py-3 text-right">Change</th>
                                    <th className="px-6 py-3 text-right">Post Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {transactionDetail.transaction.message.accountKeys.map((account, i) => {
                                    const preBalance = transactionDetail.meta.preBalances[i];
                                    const postBalance = transactionDetail.meta.postBalances[i];
                                    const change = (postBalance - preBalance) / LAMPORTS_PER_SOL;
                                    
                                    return (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-4">{i + 1}</td>
                                            <td className="px-6 py-4 font-mono">{account.pubkey.toString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                {change === 0 ? (
                                                    <span className="text-gray-400">-</span>
                                                ) : (
                                                    <span className={change > 0 ? 'text-green-600' : 'text-red-600'}>
                                                        {change > 0 ? '+' : ''}{change.toFixed(6)} SOO
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {(postBalance / LAMPORTS_PER_SOL).toFixed(6)} SOO
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Token Changes Section */}
                {transactionDetail.meta.preTokenBalances?.length > 0 && (
                    <section>
                        <h2 className="text-xl font-bold mb-4">Token Changes</h2>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3">#</th>
                                        <th className="px-6 py-3">Owner</th>
                                        <th className="px-6 py-3">Mint</th>
                                        <th className="px-6 py-3 text-right">Change</th>
                                        <th className="px-6 py-3 text-right">Post Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {transactionDetail.meta.preTokenBalances.map((preBalance, i) => {
                                        const postBalance = transactionDetail.meta.postTokenBalances[i];
                                        const change = postBalance.uiTokenAmount.uiAmount - preBalance.uiTokenAmount.uiAmount;
                                        
                                        return (
                                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="px-6 py-4">{i + 1}</td>
                                                <td className="px-6 py-4 font-mono">{preBalance.owner}</td>
                                                <td className="px-6 py-4 font-mono">{preBalance.mint}</td>
                                                <td className="px-6 py-4 text-right">
                                                    {change === 0 ? (
                                                        <span className="text-gray-400">-</span>
                                                    ) : (
                                                        <span className={change > 0 ? 'text-green-600' : 'text-red-600'}>
                                                            {change > 0 ? '+' : ''}{change.toFixed(2)}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {postBalance.uiTokenAmount.uiAmount?.toFixed(2) ?? '-'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* Programs Section */}
                <section>
                    <h2 className="text-xl font-bold mb-4">Programs</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3">#</th>
                                    <th className="px-6 py-3">Program ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {transactionDetail.transaction.message.instructions.map((instruction, i) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4">{i + 1}</td>
                                        <td className="px-6 py-4 font-mono">{instruction.programId.toString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
};
