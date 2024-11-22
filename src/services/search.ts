import { rpcGraphQL } from '../utils/rpc';
import { ExecutionResult, GraphQLError } from 'graphql';

export interface SearchFilters {
  types: string[];
  timeRange: string;
  status?: string;
}

// Base account types
export interface BaseAccount {
  address: string;
  lamports: bigint;
  executable: boolean;
  rentEpoch: bigint;
  ownerProgram: {
    address: string;
    executable: boolean;
    lamports: bigint;
  };
  space: number;
}

export interface TokenAccount extends BaseAccount {
  mint: {
    address: string;
    decimals: number;
    supply: string;
    name?: string;
    symbol?: string;
    holders?: number;
  };
  tokenAmount: {
    amount: string;
    decimals: number;
    uiAmount: number;
    uiAmountString: string;
  };
  state: string;
}

export interface MintAccount extends BaseAccount {
  mintAuthority: {
    address: string;
  };
  supply: string;
  decimals: number;
  isInitialized: boolean;
  freezeAuthority?: {
    address: string;
  };
}

export interface VoteAccount extends BaseAccount {
  votes: Array<{
    slot: number;
    confirmationCount: number;
  }>;
  node: {
    address: string;
  };
  authorizedVoters: Array<{
    epoch: number;
    authorizedVoter: {
      address: string;
    };
  }>;
  authorizedWithdrawer: {
    address: string;
  };
  lastTimestamp: {
    slot: number;
    timestamp: number;
  };
  epochCredits: Array<{
    epoch: number;
    credits: number;
    previousCredits: number;
  }>;
  commission: number;
}

// Add ProgramAccount interface
export interface ProgramAccount extends BaseAccount {
  programData: {
    slot: number;
    data: string;  // Base64 encoded program data
  };
  authority?: {
    address: string;
  };
}

// Transaction type
export interface Transaction {
  signatures: string[];
  blockTime: number;
  slot: number;
  meta: {
    err: any;
    fee: number;
    status: {
      __typename: 'TransactionStatusOk' | 'TransactionStatusErr';
      // Will be populated based on __typename
    };
  };
  message: {
    accountKeys: {
      pubkey: string;
      signer: boolean;
      writable: boolean;
      source?: string;
    }[];
    instructions: {
      programId: string;
      // accounts and data are only available in GenericInstruction
    }[];
  };
}

// Add these interfaces
export interface TokenTransfer {
  signature: string;
  timestamp: number;
  from: {
    address: string;
    label?: string;
  };
  to: {
    address: string;
    label?: string;
  };
  amount: string;
  decimals: number;
}

export interface ProgramInvocation {
  signature: string;
  timestamp: number;
  caller: {
    address: string;
    label?: string;
  };
  success: boolean;
  computeUnits: number;
}

export interface ValidatorVote {
  slot: number;
  timestamp: number;
  confirmationCount: number;
  success: boolean;
}

// Union type for search result data
export type SearchResultData = BaseAccount | TokenAccount | MintAccount | VoteAccount | ProgramAccount | Transaction;

// Search result with discriminated union
export interface SearchResult {
  type: 'transaction' | 'address' | 'token' | 'program';
  data: SearchResultData;
  expanded?: boolean;
}

// Type guards
export const isTransaction = (data: SearchResultData): data is Transaction => {
  return 'signatures' in data && 'blockTime' in data;
};

export const isTokenAccount = (data: SearchResultData): data is TokenAccount => {
  return 'mint' in data && 'tokenAmount' in data;
};

export const isProgramAccount = (data: SearchResultData): data is ProgramAccount => {
  return 'executable' in data && data.executable === true;
};

export const isMintAccount = (data: SearchResultData): data is MintAccount => {
  return 'mintAuthority' in data && 'supply' in data;
};

// Add to the exports
export const isBaseAccount = (data: SearchResultData): data is BaseAccount => {
  return 'address' in data && 'lamports' in data;
};

// Add this with other type guards
export const isVoteAccount = (data: SearchResultData): data is VoteAccount => {
  return 'votes' in data && 'node' in data && 'commission' in data;
};

// Update the TransactionResponse interface to match GraphQL execution result
interface TransactionQueryResult {
  transaction?: Transaction;
}

type TransactionResponse = ExecutionResult<TransactionQueryResult>;

export class SearchService {
  static async searchAccounts(query: string): Promise<any> {
    // If query looks like an address, search directly
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(query)) {
      const source = `
        query SearchAccount($address: Address!) {
          account(address: $address) {
            address
            lamports
            executable
            rentEpoch
            ownerProgram {
              address
              executable
              lamports
            }
            ... on TokenAccount {
              mint {
                address
                ... on MintAccount {
                  decimals
                  supply
                  mintAuthority {
                    address
                  }
                  freezeAuthority {
                    address
                  }
                }
              }
              tokenAmount {
                amount
                decimals
                uiAmount
                uiAmountString
              }
              state
            }
            ... on MintAccount {
              decimals
              supply
              mintAuthority {
                address
              }
              freezeAuthority {
                address
              }
            }
            ... on VoteAccount {
              votes {
                slot
                confirmationCount
              }
              node {
                address
              }
              authorizedVoters {
                epoch
                authorizedVoter {
                  address
                }
              }
              authorizedWithdrawer {
                address
              }
              lastTimestamp {
                slot
                timestamp
              }
              epochCredits {
                epoch
                credits
                previousCredits
              }
              commission
            }
          }
        }
      `;

      return await rpcGraphQL.query(source, { address: query });
    }

    // For token searches
    const tokenSource = `
      query SearchTokens($query: String!) {
        tokens(query: $query) {
          address
          lamports
          executable
          rentEpoch
          ... on TokenAccount {
            mint {
              address
              ... on MintAccount {
                decimals
                supply
              }
            }
            amount
            state
          }
        }
      }
    `;

    // Execute token search
    const tokenResults = await rpcGraphQL.query(tokenSource, { query });

    return {
      data: {
        tokens: tokenResults?.data?.tokens || []
      }
    };
  }

  static async searchTransactions(query: string, filters: SearchFilters): Promise<TransactionResponse> {
    // Add signature validation before making the query
    if (!this.isValidTransactionSignature(query)) {
      // Create a proper GraphQLError
      const error = new GraphQLError(
        "Invalid transaction signature format",
        {
          extensions: {
            code: 'INVALID_SIGNATURE',
            argumentName: 'signature'
          }
        }
      );

      return {
        data: null,
        errors: [error]
      } as TransactionResponse;
    }

    const source = `
      query SearchTransactions($signature: Signature!) {
        transaction(signature: $signature) {
          signatures
          blockTime
          slot
          meta {
            err
            fee
            status {
              __typename
              ... on TransactionStatusOk {
                Ok
              }
              ... on TransactionStatusErr {
                Err
              }
            }
          }
          message {
            accountKeys {
              pubkey
              signer
              writable
              source
            }
            instructions {
              programId
              ... on GenericInstruction {
                accounts
                data
              }
            }
          }
        }
      }
    `;

    const response = await rpcGraphQL.query(source, { 
      signature: query
    });

    return response as TransactionResponse;
  }

  // Add helper method to validate transaction signatures
  private static isValidTransactionSignature(signature: string): boolean {
    // Basic validation for Solana transaction signatures
    return /^[1-9A-HJ-NP-Za-km-z]{87,88}$/.test(signature);
  }

  static async validateAddress(address: string): Promise<boolean> {
    try {
      const source = `
        query ValidateAddress($address: String!) {
          account(address: $address) {
            address
          }
        }
      `;

      const response = await rpcGraphQL.query(source, { address });
      return !!response?.data?.account;
    } catch {
      return false;
    }
  }

  static async getVoteHistory(address: string): Promise<any> {
    const source = `
      query GetVoteHistory($address: Address!) {
        voteAccount(address: $address) {
          votes {
            slot
            confirmationCount
          }
          epochCredits {
            epoch
            credits
            previousCredits
          }
          lastTimestamp {
            slot
            timestamp
          }
        }
      }
    `;

    return await rpcGraphQL.query(source, { address });
  }

  static async getValidatorPerformance(address: string): Promise<any> {
    const source = `
      query GetValidatorPerformance($address: Address!) {
        validator(address: $address) {
          epochPerformance {
            epoch
            credits
            previousCredits
            timestamp
          }
          recentVotes {
            slot
            timestamp
            confirmationCount
            success
          }
        }
      }
    `;

    return await rpcGraphQL.query(source, { address });
  }

  static async getAddressHistory(address: string): Promise<any> {
    const source = `
      query GetAddressHistory($address: Address!) {
        account(address: $address) {
          address
          lamports
          executable
          rentEpoch
          ownerProgram {
            address
            executable
            lamports
          }
          ... on TokenAccount {
            mint {
              address
              ... on MintAccount {
                decimals
                supply
                mintAuthority {
                  address
                }
                freezeAuthority {
                  address
                }
              }
            }
            tokenAmount {
              amount
              decimals
              uiAmount
              uiAmountString
            }
          }
        }
        # Get program accounts owned by this address
        programAccounts(programAddress: $address) {
          address
          lamports
          executable
          rentEpoch
          ownerProgram {
            address
            executable
            lamports
          }
        }
      }
    `;
  
    return await rpcGraphQL.query(source, { address });
  }
}
