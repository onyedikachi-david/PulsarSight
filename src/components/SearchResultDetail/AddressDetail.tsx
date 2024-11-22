import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet, Database, Code, FileText,
  ExternalLink, HardDrive, Cpu, Info
} from 'lucide-react';
import { BaseAccount } from '../../services/search';

interface AddressDetailProps {
  data: BaseAccount;
}

const AddressDetail: React.FC<AddressDetailProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Address Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
            <Wallet className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Account Overview
            </h3>
            <div className="flex items-center gap-2">
              <Link
                to={`/address/${data.address}`}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                {data.address}
                <ExternalLink className="h-3 w-3" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            <Database className="h-4 w-4" />
            Balance
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              ◎{(Number(data.lamports) / 1e9).toLocaleString('en-US', { minimumFractionDigits: 9 })}
            </span>
            <span className="text-sm text-gray-500">
              SOON
            </span>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            <HardDrive className="h-4 w-4" />
            Allocated Data Size
          </div>
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {data.space || 0} byte(s)
          </span>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            <Code className="h-4 w-4" />
            Assigned Program
          </div>
          <Link
            to={`/address/${data?.ownerProgram?.address}`}
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            {data?.ownerProgram?.address === '11111111111111111111111111111111' 
              ? 'System Program' 
              : `${data?.ownerProgram?.address.slice(0, 4)}...${data?.ownerProgram?.address.slice(-4)}`}
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            <Cpu className="h-4 w-4" />
            Executable
          </div>
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {data.executable ? 'Yes' : 'No'}
          </span>
        </div>
      </div>

      {/* Additional Info */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 mb-4">
          <Info className="h-4 w-4" />
          Additional Information
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Rent Epoch</span>
            <span className="text-gray-900 dark:text-gray-100">{data?.rentEpoch?.toString()}</span>
          </div>
          {/* Add more details as needed */}
        </div>
      </div>

      {/* Recent Activity Section could be added here */}
    </div>
  );
};

export default AddressDetail; 