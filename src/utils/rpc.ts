import { Connection, Commitment } from '@solana/web3.js';
import { createSolanaRpc } from '@solana/rpc';
import { createSolanaRpcGraphQL } from '@solana/rpc-graphql';

const RPC_URL = 'https://rpc.devnet.soo.network/rpc';

// Create the regular connection for backward compatibility
const connection = new Connection(RPC_URL, 'confirmed' as Commitment);
export const getConnection = () => connection;

// Create the RPC client for GraphQL
const rpc = createSolanaRpc(RPC_URL);

// Test RPC connection and specific transaction
(async () => {
  try {
    // Test connection
    const blockHashResult = await rpc.getLatestBlockhash();
    console.log('RPC Connection Test:', await (blockHashResult.send()));

    // Test specific transaction
    const testTxSignature = '3hijAG46JpNLpNjgKZMrMP7AB7vNAWw9qKM8K6THdRuyTQZv6LLAB9TTecq7hpQgURFHxm18ecGmj5yiw9iamhNS';
    
    // Make RPC call and send it
    const txRequest = rpc.getTransaction(testTxSignature as any, {
      maxSupportedTransactionVersion: 0,
      encoding: 'jsonParsed'
    });
    const txResult = await txRequest.send();
    console.log('Direct RPC Transaction Result:', txResult);

    // Try GraphQL with corrected query based on docs
    const graphql = createSolanaRpcGraphQL(rpc);
    
    const source = `
      query GetTransaction($signature: Signature!, $commitment: CommitmentWithoutProcessed) {
        transaction(signature: $signature, commitment: $commitment) {
          blockTime
          slot
          meta {
            computeUnitsConsumed
            logMessages
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

    const result = await graphql.query(source, {
      signature: testTxSignature as any,
      commitment: 'CONFIRMED'
    });

    console.log('GraphQL Transaction Result:', result);
    
    // Try a single block query with correct Slot type
    const blockSource = `
      query GetBlock($slot: Slot!) {
        block(slot: $slot) {
          blockhash
          blockHeight
          blockTime
          parentSlot
          transactions {
            slot
            meta {
              fee
            }
          }
        }
      }
    `;
    
    // Use a recent slot from the transaction result
    if (txResult?.slot) {
      const blockResult = await graphql.query(blockSource, {
        slot: txResult.slot as any
      });
      console.log('GraphQL Block Test:', blockResult);
    }

  } catch (error) {
    console.error('RPC/GraphQL Test Error:', error);
  }
})();

// Create the RPC-GraphQL client
export const rpcGraphQL = createSolanaRpcGraphQL(rpc);

export default rpcGraphQL;
