import { createPublicClient, http, formatEther } from 'viem';
import { mainnet } from 'viem/chains';

// Chiliz Chain Mainnet Definition
const chilizChain = {
    id: 88888,
    name: 'Chiliz Chain',
    network: 'chiliz-chain',
    nativeCurrency: {
        decimals: 18,
        name: 'CHZ',
        symbol: 'CHZ',
    },
    rpcUrls: {
        public: { http: ['https://rpc.chiliz.com'] },
        default: { http: ['https://rpc.chiliz.com'] },
    },
    blockExplorers: {
        default: { name: 'ChilizScan', url: 'https://chiliscan.com' },
    },
} as const;

const client = createPublicClient({
    chain: chilizChain,
    transport: http(),
});

// Simple in-memory cache: { balance, timestamp }
const balanceCache = new Map<string, { balance: number; timestamp: number }>();
const CACHE_TTL_MS = 30_000; // 30 seconds

/**
 * Fetch the real on-chain CHZ balance for a wallet address on Chiliz Chain.
 * Returns balance in CHZ. Returns 0 on any error.
 */
export async function getChilizBalance(walletAddress: string): Promise<number> {
    if (!walletAddress || !walletAddress.startsWith('0x')) return 0;

    // Check cache first
    const cached = balanceCache.get(walletAddress);
    const now = Date.now();
    if (cached && (now - cached.timestamp) < CACHE_TTL_MS) {
        return cached.balance;
    }

    try {
        const balanceBigInt = await client.getBalance({
            address: walletAddress as `0x${string}`,
        });

        const balance = parseFloat(formatEther(balanceBigInt));

        console.log(`[CHILIZ] Balance for ${walletAddress.substring(0, 10)}...: ${balance.toFixed(4)} CHZ`);

        // Update cache
        balanceCache.set(walletAddress, { balance, timestamp: now });

        return balance;
    } catch (error: any) {
        console.warn(`[CHILIZ] Failed to fetch balance for ${walletAddress}: ${error.message}`);
        return cached?.balance ?? 0; // Graceful fallback
    }
}
