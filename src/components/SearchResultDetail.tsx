/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Hash,
  Wallet,
  Clock,
  Key,
  Database,
  Users,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Loader
} from 'lucide-react'
import {
  SearchResult,
  isTransaction,
  isTokenAccount,
  isProgramAccount,
  isVoteAccount,
  isBaseAccount,
  SearchService
} from '../services/search'
import TokenDetail from './SearchResultDetail/TokenDetail'
import ProgramDetail from './SearchResultDetail/ProgramDetail'
import VoteDetail from './SearchResultDetail/VoteDetail'
import AddressDetail from './SearchResultDetail/AddressDetail'

interface SearchResultDetailProps {
  result: SearchResult
}

const SearchResultDetail: React.FC<SearchResultDetailProps> = ({ result }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [voteHistory, setVoteHistory] = useState<any>(null)
  const [validatorPerformance, setValidatorPerformance] = useState<any>(null)

  useEffect(() => {
    const fetchAdditionalData = async () => {
      if (isBaseAccount(result.data) && isVoteAccount(result.data)) {
        setLoading(true)
        setError(null)
        try {
          const [historyResult, performanceResult] = await Promise.all([
            SearchService.getVoteHistory(result.data.address),
            SearchService.getValidatorPerformance(result.data.address)
          ])

          setVoteHistory(historyResult?.data?.voteAccount)
          setValidatorPerformance(performanceResult?.data?.validator)
        } catch (err) {
          setError('Failed to load validator details')
          console.error('Validator data fetch error:', err)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchAdditionalData()
  }, [result])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4">
          <Loader className="size-8 animate-spin text-blue-500" />
          <p className="text-gray-500 dark:text-gray-400">Loading details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 dark:bg-red-900/50">
        <div className="flex items-center gap-3 text-red-700 dark:text-red-200">
          <AlertTriangle className="size-5" />
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      {result.type === 'transaction' && isTransaction(result.data) && (
        <div className="space-y-6">
          {/* Transaction Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/50">
                <Hash className="size-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Transaction Details
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {result.data.blockTime
                    ? new Date(
                        Number(result.data.blockTime) * 1000
                      ).toLocaleString()
                    : 'Unknown Time'}
                </p>
              </div>
            </div>
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium
              ${
                !result.data.meta?.err
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
              }`}
            >
              {!result.data.meta?.err ? (
                <CheckCircle className="size-4" />
              ) : (
                <XCircle className="size-4" />
              )}
              {!result.data.meta?.err ? 'Success' : 'Failed'}
            </div>
          </div>

          {/* Transaction Info Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                <Hash className="size-4" />
                Signature
              </div>
              <div className="break-all text-sm text-gray-900 dark:text-gray-100">
                {result.data.signatures[0]}
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                <Clock className="size-4" />
                Block
              </div>
              <Link
                to={`/block/${result.data.slot}`}
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                {result.data.slot.toLocaleString()}
              </Link>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                <Database className="size-4" />
                Fee
              </div>
              <span className="text-gray-900 dark:text-gray-100">
                {(Number(result.data.meta?.fee) || 0) / 1e9} SOON
              </span>
            </div>
          </div>

          {/* Account Keys Section */}
          <div className="space-y-4">
            <h4 className="text-md flex items-center gap-2 font-medium text-gray-900 dark:text-white">
              <Users className="size-5 text-gray-500" />
              Account Involvement
            </h4>

            <div className="space-y-2">
              {result.data.message.accountKeys.map((account, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-lg p-1.5
                      ${
                        account.signer
                          ? 'bg-purple-100 dark:bg-purple-900/50'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      {account.signer ? (
                        <Key className="size-4 text-purple-500" />
                      ) : (
                        <Wallet className="size-4 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <Link
                        to={`/address/${account.pubkey}`}
                        className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {account.pubkey}
                      </Link>
                      <div className="mt-1 flex items-center gap-2">
                        {account.signer && (
                          <span className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-900/50 dark:text-purple-200">
                            Signer
                          </span>
                        )}
                        {account.writable && (
                          <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/50 dark:text-blue-200">
                            Writable
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions Section */}
          <div className="space-y-4">
            <h4 className="text-md flex items-center gap-2 font-medium text-gray-900 dark:text-white">
              <Settings className="size-5 text-gray-500" />
              Instructions
            </h4>

            <div className="space-y-3">
              {result.data.message.instructions.map((instruction, index) => (
                <div
                  key={index}
                  className="space-y-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        #{index + 1}
                      </span>
                      <Link
                        to={`/address/${instruction.programId}`}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {instruction.programId}
                        <ExternalLink className="size-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {result.type === 'token' && isTokenAccount(result.data) && (
        <TokenDetail data={result.data} />
      )}

      {result.type === 'program' && isProgramAccount(result.data) && (
        <ProgramDetail data={result.data} />
      )}

      {result.type === 'address' &&
        isBaseAccount(result.data) &&
        isVoteAccount(result.data) && (
          <VoteDetail
            data={result.data}
            recentVotes={validatorPerformance?.recentVotes}
            performanceHistory={validatorPerformance?.epochPerformance}
            loading={loading}
          />
        )}

      {result.type === 'address' &&
        isBaseAccount(result.data) &&
        !isVoteAccount(result.data) && <AddressDetail data={result.data} />}
    </div>
  )
}

export default SearchResultDetail
