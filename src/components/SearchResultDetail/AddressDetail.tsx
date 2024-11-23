/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Wallet,
  Database,
  Code,
  ExternalLink,
  HardDrive,
  Cpu,
  Info,
  Coins
} from 'lucide-react'
import { BaseAccount, SearchService } from '../../services/search'

interface AddressDetailProps {
  data: BaseAccount
}

const AddressDetail: React.FC<AddressDetailProps> = ({ data }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addressHistory, setAddressHistory] = useState<any>(null)

  useEffect(() => {
    const fetchAddressHistory = async () => {
      setLoading(true)
      setError(null)
      try {
        const history = await SearchService.getAddressHistory(data.address)
        console.log('history: ', history)
        setAddressHistory(history.data.account)
      } catch (err) {
        setError('Failed to load address history')
        console.error('Address history fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAddressHistory()
  }, [data.address])

  return (
    <div className="space-y-6">
      {/* Address Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/50">
            <Wallet className="size-6 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Account Overview
            </h3>
            <div className="flex items-center gap-2">
              <Link
                to={`/address/${data.address}`}
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                {data.address}
                <ExternalLink className="size-3" />
              </Link>
              <button
                onClick={() => navigator.clipboard.writeText(data.address)}
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Account Details Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            <Database className="size-4" />
            Balance
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              ◎
              {(Number(data.lamports) / 1e9).toLocaleString('en-US', {
                minimumFractionDigits: 9
              })}
            </span>
            <span className="text-sm text-gray-500">SOON</span>
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            <HardDrive className="size-4" />
            Allocated Data Size
          </div>
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {data.space || 0} byte(s)
          </span>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            <Code className="size-4" />
            Assigned Program
          </div>
          <Link
            to={`/address/${data?.ownerProgram?.address}`}
            className="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
          >
            {data?.ownerProgram?.address === '11111111111111111111111111111111'
              ? 'System Program'
              : `${data?.ownerProgram?.address.slice(
                  0,
                  4
                )}...${data?.ownerProgram?.address.slice(-4)}`}
            <ExternalLink className="size-3" />
          </Link>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            <Cpu className="size-4" />
            Executable
          </div>
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {data.executable ? 'Yes' : 'No'}
          </span>
        </div>
      </div>

      {/* Additional Info */}
      <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
          <Info className="size-4" />
          Additional Information
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Rent Epoch</span>
            <span className="text-gray-900 dark:text-gray-100">
              {data?.rentEpoch?.toString()}
            </span>
          </div>
          {/* Add more details as needed */}
        </div>
      </div>

      {/* Token Balances Section */}
      {addressHistory?.account?.tokenAmount && (
        <div className="space-y-4">
          <h4 className="text-md flex items-center gap-2 font-medium text-gray-900 dark:text-white">
            <Coins className="size-5 text-gray-500" />
            Token Balance
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <div className="mb-2 flex items-center justify-between">
                <Link
                  to={`/token/${addressHistory.account.mint.address}`}
                  className="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                >
                  {addressHistory.account.mint.symbol ||
                    addressHistory.account.mint.name ||
                    addressHistory.account.mint.address}
                  <ExternalLink className="size-3" />
                </Link>
                <span className="text-sm text-gray-500">
                  {addressHistory.account.tokenAmount.uiAmount.toLocaleString()}{' '}
                  tokens
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Program Accounts section */}
      {addressHistory?.programAccounts?.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-md flex items-center gap-2 font-medium text-gray-900 dark:text-white">
            <Code className="size-5 text-gray-500" />
            Program Accounts
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Balance (SOL)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Executable
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                {addressHistory.programAccounts.map((account: any) => (
                  <tr key={account.address}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <Link
                        to={`/address/${account.address}`}
                        className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {account.address}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {(Number(account.lamports) / 1e9).toFixed(9)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          account.executable
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200'
                        }`}
                      >
                        {account.executable ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddressDetail
