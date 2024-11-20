import { Connection, Commitment } from '@solana/web3.js';
import { createSolanaRpc } from '@solana/rpc';
import { createSolanaRpcGraphQL } from '@solana/rpc-graphql';

export const RPC_URL = 'https://rpc.devnet.soo.network/rpc';

// Create the regular connection for backward compatibility
const connection = new Connection(RPC_URL, 'confirmed' as Commitment);
export const getConnection = () => connection;

// Create the RPC client for GraphQL
const rpc = createSolanaRpc(RPC_URL);

// Test RPC connection and blocks
(async () => {
  try {
    // Test basic connection
    const blockHashResult = await rpc.getLatestBlockhash();
    console.log('RPC Connection Test:', await (blockHashResult.send()));

    const graphql = createSolanaRpcGraphQL(rpc);

    // First get a slot number using RPC
    const slotInfo = await rpc.getSlot().send();
    console.log('Current Slot:', slotInfo);

    // Test 1: Get block using the current slot
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
            meta {
              fee
              logMessages
            }
          }
        }
      }
    `;

    const blockResult = await graphql.query(blockSource, {
      slot: slotInfo as any
    });
    console.log('Block Test:', blockResult);

    // Test 2: Get previous block using parentSlot
    if (blockResult?.data?.block?.parentSlot) {
      const previousSlot = blockResult.data.block.parentSlot;
      
      const previousBlockResult = await graphql.query(blockSource, {
        slot: previousSlot as any
      });
      console.log('Previous Block Test:', previousBlockResult);
    }

  } catch (error) {
    console.error('RPC/GraphQL Test Error:', error);
  }
})();

// Create the RPC-GraphQL client
export const rpcGraphQL = createSolanaRpcGraphQL(rpc);

export default rpcGraphQL;
