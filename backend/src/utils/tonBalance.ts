import fetch from 'node-fetch';

const TON_API_BASE = 'https://toncenter.com/api/v2';

// Simple in-memory cache: { balance, timestamp }
const balanceCache = new Map<string, { balance: number; timestamp: number }>();
const CACHE_TTL_MS = 30_000; // 30 seconds

/**
 * Fetch the real on-chain TON balance for a wallet address.
 * Returns balance in TON (not nanotons). Returns 0 on any error.
 */
export async function getTonBalance(walletAddress: string): Promise<number> {
    if (!walletAddress) return 0;

    // Check cache first
    const cached = balanceCache.get(walletAddress);
    const now = Date.now();
    if (cached && (now - cached.timestamp) < CACHE_TTL_MS) {
        return cached.balance;
    }

    try {
        const url = `${TON_API_BASE}/getAddressBalance?address=${encodeURIComponent(walletAddress)}`;
        const response = await fetch(url, { timeout: 5000 });

        if (!response.ok) {
            console.warn(`[TON] API returned ${response.status} for ${walletAddress}`);
            return cached?.balance ?? 0; // Return stale cache if available
        }

        const data = await response.json() as any;

        if (!data.ok || data.result === undefined) {
            console.warn(`[TON] Unexpected response:`, data);
            return cached?.balance ?? 0;
        }

        // result is in nanotons (string), convert to TON
        const nanotons = BigInt(data.result);
        const balance = Number(nanotons) / 1e9;

        console.log(`[TON] Balance for ${walletAddress.substring(0, 10)}...: ${balance.toFixed(4)} TON`);

        // Update cache
        balanceCache.set(walletAddress, { balance, timestamp: now });

        return balance;
    } catch (error: any) {
        console.warn(`[TON] Failed to fetch balance: ${error.message}`);
        return cached?.balance ?? 0; // Graceful fallback
    }
}
