/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { rpcGraphQL } from '../../utils/rpc'
import {
  Activity,
  XCircle,
  CheckCircle,
  Clock,
  Coins,
  Layers,
  Code,
  Terminal,
  AlertTriangle,
  Fingerprint,
  Gauge
} from 'lucide-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

// Define the transaction type with proper BigInt handling
interface Transaction {
  blockTime: bigint | null
  slot: bigint
  signatures: string[]
  meta: {
    computeUnitsConsumed: bigint
    logMessages: string[]
    err: any | null
    fee: bigint
    preTokenBalances: Array<{
      accountIndex: number
      mint: {
        address: string
        decimals: number
      }
      owner: {
        address: string
      }
      uiTokenAmount: {
        amount: string
        decimals: number
        uiAmountString: string
      }
    }>
    postTokenBalances: Array<{
      accountIndex: number
      mint: {
        address: string
        decimals: number
      }
      owner: {
        address: string
      }
      uiTokenAmount: {
        amount: string
        decimals: number
        uiAmountString: string
      }
    }>
    preBalances?: bigint[]
    postBalances?: bigint[]
  } | null
  message: {
    instructions: Array<{
      programId: string
      accounts?: string[]
      data?: string
      lamports?: bigint
      space?: bigint
    }>
    accountKeys: Array<{
      pubkey: string
      signer: boolean
      writable: boolean
      source: string
    }>
  }
  data?: string
}

const TransactionPage: React.FC = () => {
  const { txid } = useParams<{ txid: string }>()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!txid) {
        setError('Transaction ID not provided')
        setLoading(false)
        return
      }

      try {
        const source = `
          query GetTransaction($signature: Signature!) {
            transaction(signature: $signature) {
              blockTime
              slot
              meta {
                computeUnitsConsumed
                logMessages
                err
                fee
                preTokenBalances {
                  accountIndex
                  mint {
                    address
                    ... on MintAccount {
                      decimals
                    }
                  }
                  owner {
                    address
                  }
                  uiTokenAmount {
                    amount
                    decimals
                    uiAmountString
                  }
                }
                postTokenBalances {
                  accountIndex
                  mint {
                    address
                    ... on MintAccount {
                      decimals
                    }
                  }
                  owner {
                    address
                  }
                  uiTokenAmount {
                    amount
                    decimals
                    uiAmountString
                  }
                }
                preBalances
                postBalances
              }
              message {
                instructions {
                  programId
                  ... on GenericInstruction {
                    accounts
                    data
                  }
                }
                accountKeys {
                  pubkey
                  signer
                  writable
                  source
                }
              }
              signatures
            }
          }
        `

        const result = await rpcGraphQL.query(source, {
          signature: txid
        })

        console.log('Transaction result:', result)

        if (!result?.data?.transaction) {
          setError('Transaction not found')
          setLoading(false)
          return
        }

        setTransaction(result.data.transaction as Transaction)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching transaction:', err)
        setError('Failed to fetch transaction details')
        setLoading(false)
      }
    }

    fetchTransaction()
  }, [txid])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm dark:border-purple-900/20 dark:bg-gray-800">
            <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-700">
              <div className="flex animate-pulse items-center space-x-4">
                <div className="size-14 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                <div className="space-y-3">
                  <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-3 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </div>
            </div>
            <div className="px-6 py-5">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-lg bg-gray-50 p-4 dark:bg-gray-900/10"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="size-10 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                      <div className="space-y-2">
                        <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                        <div className="h-2 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-xl border border-red-100 bg-white shadow-sm dark:border-red-900/20 dark:bg-gray-800">
            <div className="flex items-center space-x-3 px-6 py-5">
              <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/20">
                <XCircle className="size-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Error Loading Transaction
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {error ||
                    'Transaction not found. It might not exist or there was an error loading it.'}
                </p>
                <div className="mt-4">
                  <Link
                    to="/transactions"
                    className="inline-flex items-center rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-4
                      py-2 text-sm font-medium text-white
                      hover:from-purple-600 hover:to-blue-600
                      focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                  >
                    View All Transactions
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Enhanced Transaction Header */}
        <div className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm dark:border-purple-900/20 dark:bg-gray-800">
          <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`rounded-xl p-3 shadow-lg ${
                    transaction.meta?.err
                      ? 'bg-gradient-to-br from-red-500 to-orange-500'
                      : 'bg-gradient-to-br from-green-500 to-emerald-500'
                  }`}
                >
                  {transaction.meta?.err ? (
                    <AlertTriangle className="size-8 text-white" />
                  ) : (
                    <CheckCircle className="size-8 text-white" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Transaction Details
                    </h1>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        transaction.meta?.err
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                      }`}
                    >
                      {transaction.meta?.err ? 'Failed' : 'Success'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {transaction.blockTime ? (
                      <span className="flex items-center space-x-1">
                        <Clock className="size-4" />
                        <span>
                          {new Date(
                            Number(transaction.blockTime) * 1000
                          ).toLocaleString()}
                        </span>
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
            {/* Block Info */}
            <div className="rounded-lg border border-purple-100 bg-purple-50 p-4 dark:border-purple-900/20 dark:bg-purple-900/10">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
                  <Layers className="size-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    Block
                  </p>
                  <p className="mt-1 text-xl font-semibold text-purple-700 dark:text-purple-300">
                    #{transaction.slot?.toString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Gas Used */}
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/20 dark:bg-blue-900/10">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
                  <Gauge className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Gas Used
                  </p>
                  <p className="mt-1 text-xl font-semibold text-blue-700 dark:text-blue-300">
                    {transaction.meta?.computeUnitsConsumed?.toString() || '0'}{' '}
                    units
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Fee */}
            <div className="rounded-lg border border-green-100 bg-green-50 p-4 dark:border-green-900/20 dark:bg-green-900/10">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/20">
                  <Coins className="size-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    Fee
                  </p>
                  <p className="mt-1 text-xl font-semibold text-green-700 dark:text-green-300">
                    {transaction.meta?.fee?.toString() || '0'} lamports
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Details Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Transaction Overview */}
          <div className="space-y-6 lg:col-span-2">
            {/* Transaction Hash */}
            <div className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm dark:border-purple-900/20 dark:bg-gray-800">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex min-w-0 flex-1 items-center space-x-3">
                    <div className="shrink-0 rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
                      <Fingerprint className="size-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Transaction Hash
                      </h3>
                      <div className="mt-1 flex items-center space-x-2">
                        <p className="truncate font-mono text-sm text-gray-500 dark:text-gray-400">
                          {transaction.signatures?.[0]}
                        </p>
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(
                              transaction.signatures?.[0] || ''
                            )
                          }
                          className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-all duration-200
                            hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700/50 dark:hover:text-gray-300"
                          title="Copy to clipboard"
                        >
                          <svg
                            className="size-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Program Interactions */}
            <div className="mt-6 overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm dark:border-purple-900/20 dark:bg-gray-800">
              <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
                    <Code className="size-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Program Interactions
                  </h3>
                </div>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {transaction.message?.instructions.map((instruction, index) => (
                  <div
                    key={index}
                    className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-900/20">
                        <Terminal className="size-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Program ID: {instruction.programId}
                        </p>
                        {instruction.data && (
                          <p className="mt-1 break-all font-mono text-xs text-gray-500 dark:text-gray-400">
                            Data: {instruction.data}
                          </p>
                        )}
                        {instruction.accounts && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              Accounts:
                            </p>
                            <div className="mt-1 space-y-1">
                              {instruction.accounts.map((account, idx) => (
                                <p
                                  key={idx}
                                  className="truncate font-mono text-xs text-gray-500 dark:text-gray-400"
                                >
                                  {account}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {transaction.meta?.preTokenBalances?.length &&
              transaction.meta?.preTokenBalances?.length > 0 && (
                <div className="mt-6 overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm dark:border-purple-900/20 dark:bg-gray-800">
                  <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
                        <Coins className="size-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Token Changes
                      </h3>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-xs uppercase dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3">#</th>
                          <th className="px-6 py-3">Owner</th>
                          <th className="px-6 py-3">Mint</th>
                          <th className="px-6 py-3 text-right">Change</th>
                          <th className="px-6 py-3 text-right">Post Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {transaction.meta.preTokenBalances.map(
                          (preBalance, i) => {
                            const postBalance =
                              transaction.meta?.postTokenBalances[i]
                            const change =
                              parseFloat(
                                postBalance?.uiTokenAmount?.uiAmountString ||
                                  '0'
                              ) -
                              parseFloat(
                                preBalance.uiTokenAmount.uiAmountString || '0'
                              )

                            return (
                              <tr
                                key={i}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              >
                                <td className="px-6 py-4">{i + 1}</td>
                                <td className="px-6 py-4 font-mono">
                                  {preBalance.owner.address}
                                </td>
                                <td className="px-6 py-4 font-mono">
                                  {preBalance.mint.address}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  {change === 0 ? (
                                    <span className="text-gray-400">-</span>
                                  ) : (
                                    <span
                                      className={
                                        change > 0
                                          ? 'text-green-600'
                                          : 'text-red-600'
                                      }
                                    >
                                      {change > 0 ? '+' : ''}
                                      {change.toFixed(
                                        preBalance.uiTokenAmount.decimals
                                      )}
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  {postBalance?.uiTokenAmount?.uiAmountString ??
                                    '-'}
                                </td>
                              </tr>
                            )
                          }
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            <div className="overflow-x-auto rounded-lg bg-white shadow-sm dark:bg-gray-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3">#</th>
                    <th className="px-6 py-3">Address</th>
                    <th className="px-6 py-3 text-right">Change</th>
                    <th className="px-6 py-3 text-right">Post Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {transaction.message.accountKeys.map((account, i) => {
                    const preBalance = transaction.meta?.preBalances?.[i]
                    const postBalance = transaction.meta?.postBalances?.[i]
                    const change =
                      postBalance && preBalance
                        ? Number(postBalance - preBalance) /
                          Number(LAMPORTS_PER_SOL)
                        : 0

                    return (
                      <tr
                        key={i}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-6 py-4">{i + 1}</td>
                        <td className="px-6 py-4 font-mono">
                          {account.pubkey}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {change === 0 ? (
                            <span className="text-gray-400">-</span>
                          ) : (
                            <span
                              className={
                                change > 0 ? 'text-green-600' : 'text-red-600'
                              }
                            >
                              {change > 0 ? '+' : ''}
                              {change.toFixed(6)} SOL
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {postBalance
                            ? (
                                Number(postBalance) / Number(LAMPORTS_PER_SOL)
                              ).toFixed(6)
                            : '-'}{' '}
                          SOL
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column - Status & Logs */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm dark:border-purple-900/20 dark:bg-gray-800">
              <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
                    <Activity className="size-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Transaction Status
                  </h3>
                </div>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div
                    className={`rounded-lg p-4 ${
                      transaction.meta?.err
                        ? 'border border-red-100 bg-red-50 dark:border-red-900/20 dark:bg-red-900/10'
                        : 'border border-green-100 bg-green-50 dark:border-green-900/20 dark:bg-green-900/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {transaction.meta?.err ? (
                        <XCircle className="size-5 text-red-600 dark:text-red-400" />
                      ) : (
                        <CheckCircle className="size-5 text-green-600 dark:text-green-400" />
                      )}
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            transaction.meta?.err
                              ? 'text-red-800 dark:text-red-200'
                              : 'text-green-800 dark:text-green-200'
                          }`}
                        >
                          {transaction.meta?.err
                            ? 'Transaction Failed'
                            : 'Transaction Successful'}
                        </p>
                        {transaction.meta?.err && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            Error: {JSON.stringify(transaction.meta.err)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="relative">
                    <div
                      className="absolute inset-0 flex items-center"
                      aria-hidden="true"
                    >
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-between">
                      <div>
                        <span className="bg-white px-2 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                          Submitted
                        </span>
                      </div>
                      <div>
                        <span className="bg-white px-2 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                          Confirmed
                        </span>
                      </div>
                      <div>
                        <span className="bg-white px-2 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                          Finalized
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Log Messages */}
            <div className="mt-6 overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm dark:border-purple-900/20 dark:bg-gray-800">
              <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
                    <Terminal className="size-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Log Messages
                  </h3>
                </div>
              </div>
              <div className="px-6 py-4">
                <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
                  {transaction.meta?.logMessages?.join('\n') ||
                    'No log messages available'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionPage
