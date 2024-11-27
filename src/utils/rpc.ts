/* eslint-disable @typescript-eslint/no-explicit-any */
import { Connection, Commitment } from '@solana/web3.js'
import { createSolanaRpc } from '@solana/rpc'
import { createSolanaRpcGraphQL } from '@solana/rpc-graphql'
// api.mainnet-beta.solana.com
// https://rpc.devnet.soo.network/rpc
// https://solana.drpc.org
// https://api.mainnet-beta.solana.com
// https://api.mainnet-beta.solana.com
// https://mainnet.helius-rpc.com/?api-key=96a0e515-066a-41aa-815d-a67bc962af8b
// https://solemn-fluent-glitter.solana-devnet.quiknode.pro/a4b0c2d7fa048c4818a5f20dd20018d16ebdc4d3
export const RPC_URL = 'https://rpc.devnet.soo.network/rpc'

// Create the regular connection for backward compatibility
const connection = new Connection(RPC_URL, 'confirmed' as Commitment)
export const getConnection = () => connection

// Create the RPC client for GraphQL
const rpc = createSolanaRpc(RPC_URL)

// Test RPC connection and blocks
;(async () => {
  try {
    // Test basic connection
    const blockHashResult = await rpc.getLatestBlockhash()
    console.log('RPC Connection Test:', await blockHashResult.send())

    const graphql = createSolanaRpcGraphQL(rpc)

    // First get a slot number using RPC
    const slotInfo = await rpc.getSlot().send()
    console.log('Current Slot:', slotInfo)

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
    `

    const blockResult = (await graphql.query(blockSource, {
      slot: slotInfo as any
    })) as {
      data?: {
        block?: {
          parentSlot: string
          blockhash: string
          blockTime: number
          transactions: {
            slot: number
            meta: { fee: number; logMessages: string[] }
          }[]
        }
      }
    }
    console.log('Block Test:', blockResult)

    // Test 2: Get previous block using parentSlot
    if (blockResult?.data?.block?.parentSlot) {
      const previousSlot = blockResult.data.block.parentSlot

      const previousBlockResult = await graphql.query(blockSource, {
        slot: previousSlot as any
      })
      console.log('Previous Block Test:', previousBlockResult)
    }
  } catch (error) {
    console.error('RPC/GraphQL Test Error:', error)
  }
})()

// Create the RPC-GraphQL client
export const rpcGraphQL = createSolanaRpcGraphQL(rpc)

export default rpcGraphQL
