import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { rpcGraphQL } from '../../utils/rpc';

// Define the transaction type with proper BigInt handling
interface Transaction {
  blockTime: bigint | null;
  slot: bigint;
  meta: {
    computeUnitsConsumed: bigint;
    logMessages: string[];
    err: any | null;
    fee: bigint;
  } | null;
  message: {
    instructions: Array<{
      programId: string;
      accounts?: string[];
      data?: string;
      lamports?: bigint;
      space?: bigint;
    }>;
  };
  data?: string;
}

const TransactionPage: React.FC = () => {
  const { txid } = useParams<{ txid: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!txid) {
        setError('Transaction ID not provided');
        setLoading(false);
        return;
      }

      try {
        const source = `
          query GetTransaction($signature: Signature!, $commitment: CommitmentWithoutProcessed) {
            transaction(signature: $signature, commitment: $commitment) {
              blockTime
              slot
              meta {
                computeUnitsConsumed
                logMessages
                err
                fee
              }
              message {
                instructions {
                  programId
                  ... on CreateAccountInstruction {
                    lamports
                    programId
                    space
                  }
                  ... on GenericInstruction {
                    accounts
                    data
                  }
                }
              }
              data(encoding: BASE_64)
            }
          }
        `;

        const result = await rpcGraphQL.query(source, {
          signature: txid as any,
          commitment: 'CONFIRMED'
        });

        if (!result?.data?.transaction) {
          setError('Transaction not found');
          setLoading(false);
          return;
        }

        setTransaction(result.data.transaction as Transaction);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching transaction:', err);
        setError('Failed to fetch transaction details');
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [txid]);

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

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error || 'Transaction not found'}</p>
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
            Transaction Details
          </h3>
          <div className="mt-5 border-t border-gray-200 dark:border-gray-700">
            <dl className="divide-y divide-gray-200 dark:divide-gray-700">
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Transaction ID
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0 font-mono break-all">
                  {txid}
                </dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Status
                </dt>
                <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${
                    transaction.meta?.err 
                      ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                      : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                  }`}>
                    {transaction.meta?.err ? 'Failed' : 'Success'}
                  </span>
                </dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Block
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0">
                  {transaction.slot.toString()}
                </dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Fee
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0">
                  {transaction.meta?.fee.toString()} lamports
                </dd>
              </div>
              {transaction.blockTime && (
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Timestamp
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0">
                    {new Date(Number(transaction.blockTime) * 1000).toLocaleString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionPage;
