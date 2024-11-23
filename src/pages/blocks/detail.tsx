/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { rpcGraphQL } from '../../utils/rpc'
import {
  Blocks,
  ChevronLeft,
  FileText,
  XCircle,
  CheckCircle,
  Database,
  Link2,
  Inbox,
  Users,
  Shield,
  Lock,
  Unlock,
  ExternalLink,
  Copy,
  ChevronRight,
  ArrowRightLeft,
  Code2,
  Terminal,
  X,
  Users2,
  BarChart2,
  Clock,
  Zap,
  Activity,
  ChevronDown
} from 'lucide-react'

interface Block {
  blockhash: string
  blockHeight: bigint
  blockTime: bigint | null
  parentSlot: bigint
  previousBlockhash: string
  transactions: Array<{
    signatures: string[]
    version: number
    message: {
      accountKeys: Array<{
        pubkey: string
        signer: boolean
        writable: boolean
      }>
      instructions: Array<{
        programId: string
        accounts: string[]
        data: string
      }>
      recentBlockhash: string
    }
    slot: bigint
    signature: string
    meta: {
      err: any
      computeUnitsConsumed: bigint
      preBalances: bigint[]
      postBalances: bigint[]
      fee: bigint
      logMessages: string[]
    }
  }>
}

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
  accounts: Array<{
    pubkey: string
    signer: boolean
    writable: boolean
  }>
  preBalances: bigint[]
  postBalances: bigint[]
}

interface InstructionModalProps {
  isOpen: boolean
  onClose: () => void
  instructions: Array<{
    programId: string
    accounts: string[]
    data: string
  }>
}

const getTimeAgo = (timestamp: number) => {
  const seconds = Math.floor(Date.now() / 1000 - timestamp)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  accounts,
  preBalances,
  postBalances
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
                  <Users className="size-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Accounts Involved ({accounts.length})
                </h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg
                  className="size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {accounts.map((account, idx) => {
                const preBalance = preBalances[idx]
                const postBalance = postBalances[idx]
                const change = postBalance - preBalance
                const changePercent =
                  preBalance === 0n ? 100 : Number((change * 100n) / preBalance)

                return (
                  <div
                    key={idx}
                    className="rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:bg-gray-900/50 dark:hover:bg-gray-900/70"
                  >
                    <div className="flex items-start justify-between">
                      {/* Left side - Account Info */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-2">
                            {account.signer && (
                              <div
                                className="rounded bg-blue-100 p-1 dark:bg-blue-900/20"
                                title="Signer"
                              >
                                <Shield className="size-4 text-blue-600 dark:text-blue-400" />
                              </div>
                            )}
                            {account.writable ? (
                              <div
                                className="rounded bg-green-100 p-1 dark:bg-green-900/20"
                                title="Writable"
                              >
                                <Unlock className="size-4 text-green-600 dark:text-green-400" />
                              </div>
                            ) : (
                              <div
                                className="rounded bg-gray-100 p-1 dark:bg-gray-700"
                                title="Read-only"
                              >
                                <Lock className="size-4 text-gray-600 dark:text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="font-mono text-sm text-gray-900 dark:text-white">
                            {account.pubkey.slice(0, 4)}...
                            {account.pubkey.slice(-4)}
                          </div>
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(account.pubkey)
                            }
                            className="rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="Copy address"
                          >
                            <Copy className="size-4" />
                          </button>
                          <a
                            href={`https://explorer.solana.com/address/${account.pubkey}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="View in Explorer"
                          >
                            <ExternalLink className="size-4" />
                          </a>
                        </div>

                        {/* Balance Change */}
                        <div className="flex items-center space-x-3">
                          <ArrowRightLeft className="size-4 text-gray-400" />
                          <div className="flex items-baseline space-x-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {(Number(preBalance) / 1e9).toFixed(4)} SOL
                            </span>
                            <ChevronRight className="size-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {(Number(postBalance) / 1e9).toFixed(4)} SOL
                            </span>
                            <span
                              className={`text-sm font-medium ${
                                change > 0n
                                  ? 'text-green-600'
                                  : change < 0n
                                    ? 'text-red-600'
                                    : 'text-gray-600'
                              }`}
                            >
                              ({change > 0n ? '+' : ''}
                              {changePercent.toFixed(2)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50">
            <button
              onClick={onClose}
              className="w-full rounded-lg border border-gray-300 bg-white px-4
                py-2 text-sm font-medium text-gray-700
                hover:bg-gray-50 focus:outline-none focus:ring-2
                focus:ring-purple-500 dark:border-gray-600
                dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-purple-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const InstructionModal: React.FC<InstructionModalProps> = ({
  isOpen,
  onClose,
  instructions
}) => {
  if (!isOpen) return null

  const hasInstructions =
    instructions && Array.isArray(instructions) && instructions.length > 0
  console.log(instructions)
  console.log(hasInstructions)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/20">
                  <Code2 className="size-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Program Instructions (
                  {hasInstructions ? instructions.length : 0})
                </h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Content with better error handling */}
          <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {hasInstructions ? (
                instructions.map((instruction, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900/50"
                  >
                    <div className="space-y-3">
                      {/* Program ID */}
                      <div className="flex items-center space-x-2">
                        <div className="rounded bg-violet-100 p-1.5 dark:bg-violet-900/20">
                          <Terminal className="size-4 text-violet-600 dark:text-violet-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Program {idx + 1}
                        </span>
                        <div className="flex-1 border-t border-dashed border-gray-200 dark:border-gray-700" />
                      </div>

                      {/* Program Details */}
                      <div className="ml-8 space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ID:
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs text-gray-900 dark:text-white">
                              {instruction.programId}
                            </span>
                            <button
                              onClick={() =>
                                navigator.clipboard.writeText(
                                  instruction.programId
                                )
                              }
                              className="rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <Copy className="size-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Accounts Used */}
                        <div className="space-y-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Accounts Used:
                          </span>
                          <div className="grid grid-cols-1 gap-1">
                            {instruction.accounts?.map((account, accIdx) => (
                              <div
                                key={accIdx}
                                className="flex items-center space-x-2 rounded-lg bg-white p-2 dark:bg-gray-800"
                              >
                                <Users2 className="size-4 text-gray-400" />
                                <span className="font-mono text-xs text-gray-900 dark:text-white">
                                  {account}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Data Visualization */}
                        <div className="space-y-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Data:
                          </span>
                          <div className="overflow-x-auto rounded-lg bg-gray-100 p-2 font-mono text-xs dark:bg-gray-800/50">
                            {instruction.data}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                    <Code2 className="size-6 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    No Instructions
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    This transaction doesn&apos;t contain any instructions.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50">
            <button
              onClick={onClose}
              className="w-full rounded-lg border border-gray-300 bg-white px-4
              py-2 text-sm font-medium text-gray-700
              hover:bg-gray-50 focus:outline-none focus:ring-2
              focus:ring-purple-500 dark:border-gray-600
              dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const BlockStats: React.FC<{ block: Block }> = ({ block }) => {
  const totalFees = block.transactions.reduce(
    (sum, tx) => sum + tx.meta.fee,
    0n
  )
  const totalCompute = block.transactions.reduce(
    (sum, tx) => sum + tx.meta.computeUnitsConsumed,
    0n
  )

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-purple-100 bg-white p-4 dark:border-purple-900/20 dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
            <Activity className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Transactions
            </p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {block.transactions.length}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-purple-100 bg-white p-4 dark:border-purple-900/20 dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/20">
            <Zap className="size-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Fees
            </p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {(Number(totalFees) / 1e9).toFixed(4)} SOL
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-purple-100 bg-white p-4 dark:border-purple-900/20 dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/20">
            <BarChart2 className="size-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Compute Units
            </p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {totalCompute.toString()}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-purple-100 bg-white p-4 dark:border-purple-900/20 dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
            <Clock className="size-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Block Time
            </p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {block.blockTime ? getTimeAgo(Number(block.blockTime)) : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const TransactionSuccessRate: React.FC<{ block: Block }> = ({ block }) => {
  const successCount = block.transactions.filter((tx) => !tx.meta.err).length
  const totalCount = block.transactions.length
  const successRate = (successCount / totalCount) * 100

  return (
    <div className="mb-6 rounded-xl border border-purple-100 bg-white p-6 dark:border-purple-900/20 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Transaction Success Rate
      </h3>
      <div className="relative h-4 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="absolute h-full bg-gradient-to-r from-green-500 to-emerald-500"
          style={{ width: `${successRate}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          {successCount} Successful
        </span>
        <span className="font-medium text-gray-900 dark:text-white">
          {successRate.toFixed(1)}%
        </span>
      </div>
    </div>
  )
}

const ProgramInvocations: React.FC<{ block: Block }> = ({ block }) => {
  const programCounts = block.transactions.reduce(
    (acc, tx) => {
      tx.message.instructions.forEach((inst) => {
        acc[inst.programId] = (acc[inst.programId] || 0) + 1
      })
      return acc
    },
    {} as Record<string, number>
  )

  const sortedPrograms = Object.entries(programCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="mb-6 rounded-xl border border-purple-100 bg-white p-6 dark:border-purple-900/20 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Top Program Invocations
      </h3>
      <div className="space-y-3">
        {sortedPrograms.map(([programId, count], idx) => (
          <div key={programId} className="relative">
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {programId.slice(0, 4)}...{programId.slice(-4)}
                </span>
                <a
                  href={`https://explorer.solana.com/address/${programId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-500 hover:text-purple-600"
                >
                  <ExternalLink className="size-3" />
                </a>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {count} calls
              </span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="absolute h-full bg-gradient-to-r from-purple-500 to-blue-500"
                style={{
                  width: `${(count / sortedPrograms[0][1]) * 100}%`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const TransactionItem: React.FC<{
  tx: Block['transactions'][0]
  index: number
  onViewAccounts: () => void
  onViewInstructions: () => void
}> = ({ tx, index, onViewAccounts, onViewInstructions }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const accountKeysLength = tx.message?.accountKeys?.length ?? 0
  const instructionsLength = tx.message?.instructions?.length ?? 0

  return (
    <div className="border-b border-gray-200 last:border-0 dark:border-gray-700">
      {/* Transaction Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
      >
        <div className="flex items-center space-x-3">
          <div
            className={`rounded-lg p-2 ${
              tx.meta?.err
                ? 'bg-red-100 dark:bg-red-900/20'
                : 'bg-green-100 dark:bg-green-900/20'
            }`}
          >
            {tx.meta?.err ? (
              <XCircle className="size-5 text-red-600 dark:text-red-400" />
            ) : (
              <CheckCircle className="size-5 text-green-600 dark:text-green-400" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2 text-left">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Transaction #{index + 1}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  tx.meta?.err
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                }`}
              >
                {tx.meta?.err ? 'Failed' : 'Success'}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {tx.signatures[0].slice(0, 8)}...{tx.signatures[0].slice(-8)}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`size-5 text-gray-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Collapsible Content */}
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-4 px-6 pb-4">
          {/* Transaction Details */}
          <div className="grid grid-cols-1 gap-4 pl-10 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-2">
              {/* Signature */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Signature:
                </span>
                <div className="flex items-center space-x-2">
                  <span className="max-w-[200px] truncate font-mono text-xs text-gray-900 dark:text-white">
                    {tx.signatures[0]}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigator.clipboard.writeText(tx.signatures[0])
                    }}
                    className="rounded-lg p-1 text-gray-400 transition-all duration-200
                      hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700/50 dark:hover:text-gray-300"
                    title="Copy signature"
                  >
                    <Copy className="size-4" />
                  </button>
                </div>
              </div>

              {/* Slot & Version */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Slot:
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {tx.slot?.toString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Version:
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {tx.version}
                  </span>
                </div>
              </div>

              {/* Recent Blockhash */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Recent Blockhash:
                </span>
                <span className="max-w-[200px] truncate font-mono text-xs text-gray-900 dark:text-white">
                  {tx.message.recentBlockhash}
                </span>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-2">
              {/* Fee & Compute Units */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Fee:
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {(Number(tx.meta.fee) / 1e9).toFixed(6)} SOL
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Compute Units:
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {tx.meta.computeUnitsConsumed.toString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewInstructions()
                  }}
                  className={`inline-flex items-center rounded-lg ${
                    instructionsLength > 0
                      ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/40'
                      : 'cursor-not-allowed bg-gray-50 text-gray-400 dark:bg-gray-900/20'
                  } px-3 py-1.5 text-sm font-medium transition-colors`}
                  disabled={instructionsLength === 0}
                >
                  <Code2 className="mr-1.5 size-4" />
                  {instructionsLength} Instructions
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewAccounts()
                  }}
                  className={`inline-flex items-center rounded-lg ${
                    accountKeysLength > 0
                      ? 'bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/40'
                      : 'cursor-not-allowed bg-gray-50 text-gray-400 dark:bg-gray-900/20'
                  } px-3 py-1.5 text-sm font-medium transition-colors`}
                  disabled={accountKeysLength === 0}
                >
                  <Users className="mr-1.5 size-4" />
                  {accountKeysLength} Accounts
                </button>
              </div>
            </div>
          </div>

          {/* Balance Changes */}
          {tx.meta.preBalances.length > 0 && (
            <div className="space-y-2 pl-10">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Balance Changes:
              </span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {tx.message?.accountKeys?.map((account, idx) => {
                  const preBalance = BigInt(tx.meta?.preBalances[idx])
                  const postBalance = BigInt(tx.meta?.postBalances[idx])
                  const change = postBalance - preBalance
                  if (change === 0n) return null

                  return (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 rounded-lg bg-gray-50 p-2 text-sm dark:bg-gray-900/30"
                    >
                      <span className="max-w-[100px] truncate font-mono text-xs">
                        {account.pubkey.slice(0, 4)}...
                        {account.pubkey.slice(-4)}
                      </span>
                      <span
                        className={
                          change > 0n ? 'text-green-600' : 'text-red-600'
                        }
                      >
                        {change > 0n ? '+' : ''}
                        {(Number(change) / 1e9).toFixed(6)} SOL
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const BlockDetailPage: React.FC = () => {
  const { slot = '' } = useParams<{ slot: string }>()
  const [block, setBlock] = useState<Block | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<
    Block['transactions'][0] | null
  >(null)
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false)

  useEffect(() => {
    const fetchBlock = async () => {
      if (!slot) {
        setError('Block slot not provided')
        setLoading(false)
        return
      }

      try {
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
                signatures
                meta {
                  fee
                  logMessages
                  postBalances
                  preBalances
                  computeUnitsConsumed
                  err
                }
                message {
                  accountKeys {
                    pubkey
                    signer
                    writable
                  }
                  instructions {
                    programId
                    ... on GenericInstruction {
                      accounts
                      data
                    }
                  }
                  recentBlockhash
                }
                version
              }
            }
          }
        `

        const result = await rpcGraphQL.query(blockSource, {
          slot: BigInt(slot) as any
        })

        console.log('Block result: ', result)

        if (!result?.data?.block) {
          setError('Block not found')
          setLoading(false)
          return
        }

        setBlock(result.data.block as Block)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching block:', err)
        setError('Failed to fetch block details')
        setLoading(false)
      }
    }

    fetchBlock()
  }, [slot])

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

          <div className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm dark:border-purple-900/20 dark:bg-gray-800">
            <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-700">
              <div className="flex animate-pulse items-center space-x-3">
                <div className="size-10 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                <div className="space-y-2">
                  <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="px-6 py-4">
                  <div className="flex animate-pulse items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="size-10 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                      <div className="space-y-2">
                        <div className="h-3 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
                        <div className="h-2 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                      </div>
                    </div>
                    <div className="size-8 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !block) {
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
                  Error Loading Block
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {error ||
                    'Block not found. It might not exist or there was an error loading it.'}
                </p>
                <div className="mt-4">
                  <Link
                    to="/blocks"
                    className="inline-flex items-center rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-4
                      py-2 text-sm font-medium text-white
                      hover:from-purple-600 hover:to-blue-600
                      focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                  >
                    View All Blocks
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
        {/* Enhanced Block Header */}
        <div className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm dark:border-purple-900/20 dark:bg-gray-800">
          <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-700">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4">
                <div className="rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 p-3 shadow-lg">
                  <Blocks className="size-8 text-white" />
                </div>
                <div>
                  <div className="flex items-baseline space-x-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Block #{block.blockHeight?.toString()}
                    </h1>
                    <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-sm font-medium text-purple-800 dark:bg-purple-900/20 dark:text-purple-200">
                      Latest Block
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Created{' '}
                    {block.blockTime
                      ? new Date(
                          Number(block.blockTime) * 1000
                        ).toLocaleString()
                      : 'Timestamp not available'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Link
                  to={
                    slot
                      ? `/block/${(BigInt(slot) - 1n).toString()}`
                      : '/blocks'
                  }
                  className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4
                    py-2 text-sm font-medium text-gray-700
                    hover:bg-gray-50 focus:outline-none focus:ring-2
                    focus:ring-purple-500 dark:border-gray-600
                    dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-purple-400"
                >
                  <ChevronLeft className="mr-1 size-4" />
                  Previous Block
                </Link>
                <Link
                  to={
                    slot
                      ? `/block/${(BigInt(slot) + 1n).toString()}`
                      : '/blocks'
                  }
                  className="inline-flex items-center rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-4
                    py-2 text-sm font-medium text-white
                    hover:from-purple-600 hover:to-blue-600
                    focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                >
                  Next Block
                  <ChevronRight className="ml-1 size-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Block Overview Cards */}
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-purple-100 bg-purple-50 p-4 dark:border-purple-900/20 dark:bg-purple-900/10">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
                    <Database className="size-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      Block Hash
                    </div>
                    <div className="mt-1 break-all font-mono text-sm text-gray-900 dark:text-gray-100">
                      {block.blockhash}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/20 dark:bg-blue-900/10">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
                    <Link2 className="size-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      Previous Block Hash
                    </div>
                    <div className="mt-1 break-all font-mono text-sm text-gray-900 dark:text-gray-100">
                      {block.previousBlockhash}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-green-100 bg-green-50 p-4 dark:border-green-900/20 dark:bg-green-900/10">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/20">
                    <FileText className="size-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-green-600 dark:text-green-400">
                      Parent Slot
                    </div>
                    <div className="mt-1 font-mono text-sm text-gray-900 dark:text-gray-100">
                      {block.parentSlot?.toString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm dark:border-purple-900/20 dark:bg-gray-800">
          <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 p-2">
                  <FileText className="size-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Block Transactions
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {block.transactions?.length || 0} transactions in this block
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {block.transactions.map((tx, index) => (
              <TransactionItem
                key={tx.signatures[0]}
                tx={tx}
                index={index}
                onViewAccounts={() => {
                  setSelectedTransaction(tx)
                  setIsAccountModalOpen(true)
                }}
                onViewInstructions={() => {
                  setSelectedTransaction(tx)
                  setIsInstructionModalOpen(true)
                }}
              />
            ))}

            {/* Empty State */}
            {(!block.transactions || block.transactions.length === 0) && (
              <div className="px-6 py-8 text-center">
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                  <Inbox className="size-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  No Transactions
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  This block doesn&apos;t contain any transactions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedTransaction && selectedTransaction.message?.accountKeys && (
        <AccountModal
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          accounts={selectedTransaction.message.accountKeys}
          preBalances={selectedTransaction.meta?.preBalances ?? []}
          postBalances={selectedTransaction.meta?.postBalances ?? []}
        />
      )}

      {selectedTransaction && selectedTransaction.message?.instructions && (
        <InstructionModal
          isOpen={isInstructionModalOpen}
          onClose={() => setIsInstructionModalOpen(false)}
          instructions={selectedTransaction.message.instructions}
        />
      )}

      {block && <TransactionSuccessRate block={block} />}
      {block && <ProgramInvocations block={block} />}
    </div>
  )
}

export default BlockDetailPage
