import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { rpcGraphQL } from '../../utils/rpc';
import { Blocks, ChevronLeft, FileText, XCircle, CheckCircle, Database, Link2, Inbox, Users, Shield, Lock, Unlock, ExternalLink, Copy, ChevronRight, ArrowRightLeft, Code2, Terminal, X, Users2, BarChart2, Clock, Zap, Activity } from 'lucide-react';

interface Block {
  blockhash: string;
  blockHeight: bigint;
  blockTime: bigint | null;
  parentSlot: bigint;
  previousBlockhash: string;
  transactions: Array<{
    signatures: string[];
    version: number;
    message: {
      accountKeys: Array<{
        pubkey: string;
        signer: boolean;
        writable: boolean;
      }>;
      instructions: Array<{
        programId: string;
        accounts: string[];
        data: string;
      }>;
      recentBlockhash: string;
    };
    slot: bigint;
    signature: string;
    meta: {
      err: any;
      computeUnitsConsumed: bigint;
      preBalances: bigint[];
      postBalances: bigint[];
      fee: bigint;
      logMessages: string[];
    };
  }>;
}

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Array<{
    pubkey: string;
    signer: boolean;
    writable: boolean;
  }>;
  preBalances: bigint[];
  postBalances: bigint[];
}

interface InstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructions: Array<{
    programId: string;
    accounts: string[];
    data: string;
  }>;
}

const getTimeAgo = (timestamp: number) => {
  const seconds = Math.floor((Date.now() / 1000) - timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, accounts, preBalances, postBalances }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Accounts Involved ({accounts.length})
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-4">
              {accounts.map((account, idx) => {
                const preBalance = preBalances[idx];
                const postBalance = postBalances[idx];
                const change = postBalance - preBalance;
                const changePercent = preBalance === 0n ? 100 : Number((change * 100n) / preBalance);

                return (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-900/70 transition-colors">
                    <div className="flex items-start justify-between">
                      {/* Left side - Account Info */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-2">
                            {account.signer && (
                              <div className="p-1 bg-blue-100 dark:bg-blue-900/20 rounded" title="Signer">
                                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </div>
                            )}
                            {account.writable ? (
                              <div className="p-1 bg-green-100 dark:bg-green-900/20 rounded" title="Writable">
                                <Unlock className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </div>
                            ) : (
                              <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded" title="Read-only">
                                <Lock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="font-mono text-sm text-gray-900 dark:text-white">
                            {account.pubkey.slice(0, 4)}...{account.pubkey.slice(-4)}
                          </div>
                          <button
                            onClick={() => navigator.clipboard.writeText(account.pubkey)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                            title="Copy address"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <a
                            href={`https://explorer.solana.com/address/${account.pubkey}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                            title="View in Explorer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>

                        {/* Balance Change */}
                        <div className="flex items-center space-x-3">
                          <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                          <div className="flex items-baseline space-x-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {(Number(preBalance) / 1e9).toFixed(4)} SOL
                            </span>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900 dark:text-white font-medium">
                              {(Number(postBalance) / 1e9).toFixed(4)} SOL
                            </span>
                            <span className={`text-sm font-medium ${
                              change > 0n ? 'text-green-600' : change < 0n ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              ({change > 0n ? '+' : ''}{changePercent.toFixed(2)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-sm font-medium rounded-lg
                text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800
                border border-gray-300 dark:border-gray-600
                hover:bg-gray-50 dark:hover:bg-gray-700
                focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InstructionModal: React.FC<InstructionModalProps> = ({ isOpen, onClose, instructions }) => {
  if (!isOpen) return null;

  const hasInstructions = instructions && Array.isArray(instructions) && instructions.length > 0;
  console.log(instructions);
  console.log(hasInstructions);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                  <Code2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Program Instructions ({hasInstructions ? instructions.length : 0})
                </h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content with better error handling */}
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-4">
              {hasInstructions ? (
                instructions.map((instruction, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                    <div className="space-y-3">
                      {/* Program ID */}
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-violet-100 dark:bg-violet-900/20 rounded">
                          <Terminal className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Program {idx + 1}
                        </span>
                        <div className="flex-1 border-t border-dashed border-gray-200 dark:border-gray-700" />
                      </div>

                      {/* Program Details */}
                      <div className="ml-8 space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">ID:</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs text-gray-900 dark:text-white">
                              {instruction.programId}
                            </span>
                            <button
                              onClick={() => navigator.clipboard.writeText(instruction.programId)}
                              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Accounts Used */}
                        <div className="space-y-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Accounts Used:</span>
                          <div className="grid grid-cols-1 gap-1">
                            {instruction.accounts?.map((account, accIdx) => (
                              <div key={accIdx} className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-lg">
                                <Users2 className="w-4 h-4 text-gray-400" />
                                <span className="font-mono text-xs text-gray-900 dark:text-white">
                                  {account}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Data Visualization */}
                        <div className="space-y-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Data:</span>
                          <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-2 font-mono text-xs overflow-x-auto">
                            {instruction.data}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 mb-4">
                    <Code2 className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">No Instructions</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    This transaction doesn't contain any instructions.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <button onClick={onClose} className="w-full px-4 py-2 text-sm font-medium rounded-lg
              text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800
              border border-gray-300 dark:border-gray-600
              hover:bg-gray-50 dark:hover:bg-gray-700
              focus:outline-none focus:ring-2 focus:ring-purple-500">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BlockStats: React.FC<{ block: Block }> = ({ block }) => {
  const totalFees = block.transactions.reduce((sum, tx) => sum + tx.meta.fee, 0n);
  const totalCompute = block.transactions.reduce((sum, tx) => sum + tx.meta.computeUnitsConsumed, 0n);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-purple-100 dark:border-purple-900/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Transactions</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {block.transactions.length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-purple-100 dark:border-purple-900/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Fees</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {(Number(totalFees) / 1e9).toFixed(4)} SOL
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-purple-100 dark:border-purple-900/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
            <BarChart2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Compute Units</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {totalCompute.toString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-purple-100 dark:border-purple-900/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Block Time</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {block.blockTime ? getTimeAgo(Number(block.blockTime)) : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const TransactionSuccessRate: React.FC<{ block: Block }> = ({ block }) => {
  const successCount = block.transactions.filter(tx => !tx.meta.err).length;
  const totalCount = block.transactions.length;
  const successRate = (successCount / totalCount) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-purple-100 dark:border-purple-900/20 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Transaction Success Rate
      </h3>
      <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="absolute h-full bg-gradient-to-r from-green-500 to-emerald-500"
          style={{ width: `${successRate}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          {successCount} Successful
        </span>
        <span className="text-gray-900 dark:text-white font-medium">
          {successRate.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

const ProgramInvocations: React.FC<{ block: Block }> = ({ block }) => {
  const programCounts = block.transactions.reduce((acc, tx) => {
    tx.message.instructions.forEach(inst => {
      acc[inst.programId] = (acc[inst.programId] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const sortedPrograms = Object.entries(programCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-purple-100 dark:border-purple-900/20 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Top Program Invocations
      </h3>
      <div className="space-y-3">
        {sortedPrograms.map(([programId, count], idx) => (
          <div key={programId} className="relative">
            <div className="flex items-center justify-between mb-1">
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
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {count} calls
              </span>
            </div>
            <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-gradient-to-r from-purple-500 to-blue-500"
                style={{
                  width: `${(count / sortedPrograms[0][1]) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BlockDetailPage: React.FC = () => {
  const { height = '' } = useParams<{ height: string }>();
  const [block, setBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Block['transactions'][0] | null>(null);
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);

  useEffect(() => {
    const fetchBlock = async () => {
      if (!height) {
        setError('Block height not provided');
        setLoading(false);
        return;
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
        `;

        const result = await rpcGraphQL.query(blockSource, {
          slot: BigInt(height) as any
        });

        console.log("Block result", result);

        if (!result?.data?.block) {
          setError('Block not found');
          setLoading(false);
          return;
        }

        setBlock(result.data.block as Block);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching block:', err);
        setError('Failed to fetch block details');
        setLoading(false);
      }
    };

    fetchBlock();
  }, [height]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-purple-100 dark:border-purple-900/20">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <div className="animate-pulse flex items-center space-x-4">
                <div className="rounded-xl bg-gray-200 dark:bg-gray-700 h-14 w-14"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                </div>
              </div>
            </div>
            <div className="px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse p-4 bg-gray-50 dark:bg-gray-900/10 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-purple-100 dark:border-purple-900/20">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <div className="animate-pulse flex items-center space-x-3">
                <div className="rounded-lg bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="px-6 py-4">
                  <div className="animate-pulse flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-gray-200 dark:bg-gray-700 h-8 w-8"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !block) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-red-100 dark:border-red-900/20">
            <div className="px-6 py-5 flex items-center space-x-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Error Loading Block</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {error || 'Block not found. It might not exist or there was an error loading it.'}
                </p>
                <div className="mt-4">
                  <Link
                    to="/blocks"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg
                      text-white bg-gradient-to-r from-purple-500 to-blue-500
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Block Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-purple-100 dark:border-purple-900/20">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg">
                  <Blocks className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-baseline space-x-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Block #{block.blockHeight?.toString()}</h1>
                    <span className="px-2.5 py-0.5 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200">
                      Latest Block
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Created {block.blockTime ? new Date(Number(block.blockTime) * 1000).toLocaleString() : 'Timestamp not available'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Link
                  to={height ? `/block/${(BigInt(height) - 1n).toString()}` : '/blocks'}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg
                    text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800
                    border border-gray-300 dark:border-gray-600
                    hover:bg-gray-50 dark:hover:bg-gray-700
                    focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous Block
                </Link>
                <Link
                  to={height ? `/block/${(BigInt(height) + 1n).toString()}` : '/blocks'}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg
                    text-white bg-gradient-to-r from-purple-500 to-blue-500
                    hover:from-purple-600 hover:to-blue-600
                    focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                >
                  Next Block
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>

          {/* Block Overview Cards */}
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900/20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-purple-600 dark:text-purple-400">Block Hash</div>
                    <div className="mt-1 font-mono text-sm break-all text-gray-900 dark:text-gray-100">
                      {block.blockhash}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Link2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Previous Block Hash</div>
                    <div className="mt-1 font-mono text-sm break-all text-gray-900 dark:text-gray-100">
                      {block.previousBlockhash}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-green-600 dark:text-green-400">Parent Slot</div>
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-purple-100 dark:border-purple-900/20">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
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
            {block.transactions?.map((tx, index) => (
              <div key={index} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200">
                <div className="flex flex-col space-y-4">
                  {/* Transaction Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        tx.meta?.err
                          ? 'bg-red-100 dark:bg-red-900/20'
                          : 'bg-green-100 dark:bg-green-900/20'
                      }`}>
                        {tx.meta?.err ? (
                          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Transaction #{index + 1}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            tx.meta?.err
                              ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                              : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                          }`}>
                            {tx.meta?.err ? 'Failed' : 'Success'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/transactions/${tx.signatures[0]}`}
                      className="group p-2 text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
                    >
                      <div className="p-2 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/20 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </Link>
                  </div>

                  {/* Transaction Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">
                    {/* Left Column */}
                    <div className="space-y-2">
                      {/* Signature */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Signature:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs text-gray-900 dark:text-white truncate max-w-[200px]">
                            {tx.signatures[0]}
                          </span>
                          <button 
                            onClick={() => navigator.clipboard.writeText(tx.signatures[0])}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg
                              hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200"
                            title="Copy signature"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Slot & Version */}
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Slot:</span>
                          <span className="text-sm text-gray-900 dark:text-white">{tx.slot?.toString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Version:</span>
                          <span className="text-sm text-gray-900 dark:text-white">{tx.version}</span>
                        </div>
                      </div>

                      {/* Recent Blockhash */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Recent Blockhash:</span>
                        <span className="font-mono text-xs text-gray-900 dark:text-white truncate max-w-[200px]">
                          {tx.message.recentBlockhash}
                        </span>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-2">
                      {/* Fee & Compute Units */}
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Fee:</span>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {tx.meta.fee.toString()} lamports
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Compute Units:</span>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {tx.meta.computeUnitsConsumed.toString()}
                          </span>
                        </div>
                      </div>

                      {/* Instructions Count */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Instructions:</span>
                        <button
                          onClick={() => {
                            setSelectedTransaction(tx);
                            setIsInstructionModalOpen(true);
                          }}
                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                        >
                          View {tx.message.instructions.length} Instructions
                        </button>
                      </div>

                      {/* Account Keys Count */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Accounts Involved:</span>
                        <button
                          onClick={() => {
                            setSelectedTransaction(tx);
                            setIsAccountModalOpen(true);
                          }}
                          className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                        >
                          View {tx.message.accountKeys.length} Accounts
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Balance Changes */}
                  {tx.meta.preBalances.length > 0 && (
                    <div className="pl-10 space-y-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Balance Changes:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {tx.message.accountKeys.map((account: { pubkey: string }, idx: number) => {
                          const preBalance = BigInt(tx.meta.preBalances[idx]);
                          const postBalance = BigInt(tx.meta.postBalances[idx]);
                          const change = postBalance - preBalance;
                          if (change === 0n) return null;
                          
                          return (
                            <div key={idx} className="flex items-center space-x-2 text-sm">
                              <span className="font-mono text-xs truncate max-w-[100px]">{account.pubkey}</span>
                              <span className={change > 0n ? 'text-green-600' : 'text-red-600'}>
                                {change > 0n ? '+' : ''}{change.toString()} lamports
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Empty State */}
            {(!block.transactions || block.transactions.length === 0) && (
              <div className="px-6 py-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 mb-4">
                  <Inbox className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">No Transactions</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  This block doesn't contain any transactions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedTransaction && (
        <AccountModal
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          accounts={selectedTransaction.message.accountKeys}
          preBalances={selectedTransaction.meta.preBalances}
          postBalances={selectedTransaction.meta.postBalances}
        />
      )}

      {selectedTransaction && selectedTransaction.message?.instructions ? (
        <InstructionModal
          isOpen={isInstructionModalOpen}
          onClose={() => setIsInstructionModalOpen(false)}
          instructions={selectedTransaction.message.instructions}
        />
      ) : null}

      {block && <TransactionSuccessRate block={block} />}
      {block && <ProgramInvocations block={block} />}
    </div>
  );
};

export default BlockDetailPage;
