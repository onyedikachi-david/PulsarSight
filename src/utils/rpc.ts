import { Connection, Commitment } from '@solana/web3.js';

const RPC_URL = 'https://rpc.devnet.soo.network/rpc';

export const connection = new Connection(RPC_URL, 'confirmed' as Commitment);

export const getConnection = () => connection;
