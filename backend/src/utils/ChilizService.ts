import { ethers } from 'ethers';
import { supabase } from '../config/supabase';
import { CHILIZ_CONFIG, getFanTokenBySymbol } from '../config/ChilizConfig';

// ─── Chiliz Chain Configuration ───────────────────────────────────────
const RPC_URL = CHILIZ_CONFIG.RPC_URL;
const CHAIN_ID = CHILIZ_CONFIG.CHAIN_ID;

// Treasury wallet for distributing $CHZ rewards
const TREASURY_PRIVATE_KEY = process.env.CHILIZ_TREASURY_PRIVATE_KEY || '';

// Standard ERC-20 / CAP-20 ABI (only what we need)
const ERC20_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)'
];

// ─── Provider & Wallet Setup ──────────────────────────────────────────
let provider: ethers.JsonRpcProvider;
let treasuryWallet: ethers.Wallet | null = null;

function getProvider(): ethers.JsonRpcProvider {
    if (!provider) {
        provider = new ethers.JsonRpcProvider(RPC_URL, {
            name: CHAIN_ID === 88888 ? 'chiliz' : 'chiliz-spicy',
            chainId: CHAIN_ID
        });
        console.log(`[CHILIZ] Connected to ${CHAIN_ID === 88888 ? 'Mainnet' : 'Spicy Testnet'} via ${RPC_URL}`);
    }
    return provider;
}

function getTreasuryWallet(): ethers.Wallet | null {
    if (!treasuryWallet && TREASURY_PRIVATE_KEY) {
        treasuryWallet = new ethers.Wallet(TREASURY_PRIVATE_KEY, getProvider());
        console.log(`[CHILIZ] Treasury wallet: ${treasuryWallet.address}`);
    }
    return treasuryWallet;
}

// ─── Token Requirement Interface ──────────────────────────────────────
export interface TokenRequirement {
    tokenSymbol: string;
    minAmount: number;
    contractAddress?: string; // CAP-20 contract address on Chiliz Chain
}

// ─── Main Chiliz Service ──────────────────────────────────────────────
export class ChilizService {
    /**
     * Lenient address normalization:
     * - Fixes 0X prefix to lowercase 0x
     * - Converts to lowercase for standard processing
     */
    private static normalizeAddress(address: string | null | undefined): string {
        if (!address) return '';
        let normalized = address.trim();
        if (normalized.startsWith('0X')) {
            normalized = '0x' + normalized.slice(2);
        }
        return normalized.toLowerCase();
    }


    /**
     * Verifies if a user holds a specific Fan Token on the Chiliz Chain.
     * Reads the actual on-chain balance via RPC.
     */
    static async verifyFanTokenHold(telegramId: number, requirement: TokenRequirement): Promise<boolean> {
        console.log(`[CHILIZ] Verifying ${requirement.tokenSymbol} hold for user ${telegramId}`);

        try {
            // 1. Get user's Chiliz wallet address from DB
            const { data: user } = await supabase
                .from('users')
                .select('chiliz_wallet_address')
                .eq('telegram_id', telegramId)
                .single();

            if (!user?.chiliz_wallet_address) {
                console.warn(`[CHILIZ] User ${telegramId} has no Chiliz wallet linked.`);
                return false;
            }

            const walletAddress = user.chiliz_wallet_address;

            // 2. If a contract address is provided, check the specific token balance
            if (requirement.contractAddress) {
                const balance = await this.getTokenBalance(walletAddress, requirement.contractAddress);
                const hasEnough = balance >= requirement.minAmount;
                console.log(`[CHILIZ] ${walletAddress} holds ${balance} ${requirement.tokenSymbol} (need ${requirement.minAmount}) → ${hasEnough ? 'PASS' : 'FAIL'}`);
                return hasEnough;
            }

            // 3. Fallback: Check native $CHZ balance (if no specific token required)
            const chzBalance = await this.getCHZBalance(walletAddress);
            const hasEnough = chzBalance >= requirement.minAmount;
            console.log(`[CHILIZ] ${walletAddress} has ${chzBalance} $CHZ (need ${requirement.minAmount}) → ${hasEnough ? 'PASS' : 'FAIL'}`);
            return hasEnough;

        } catch (error) {
            console.error('[CHILIZ] Verification error:', error);
            // On RPC failure, we no longer fall back to DB check to ensure real-time accuracy
            return false;
        }
    }

    /**
     * Fetches balances for all configured Fan Tokens and native $CHZ.
     */
    static async getUserOnChainData(walletAddress: string): Promise<{ 
        chz: number; 
        fanTokens: Record<string, number>;
        anyFanToken: boolean;
    }> {
        try {
            const chz = await this.getCHZBalance(walletAddress);
            const fanTokens: Record<string, number> = {};
            let anyFanToken = false;

            for (const token of CHILIZ_CONFIG.FAN_TOKENS) {
                const balance = await this.getTokenBalance(walletAddress, token.address);
                fanTokens[token.symbol] = balance;
                if (balance > 0) anyFanToken = true;
            }

            return { chz, fanTokens, anyFanToken };
        } catch (error) {
            console.error(`[CHILIZ] Failed to get full on-chain data for ${walletAddress}:`, error);
            return { chz: 0, fanTokens: {}, anyFanToken: false };
        }
    }

    /**
     * Get native $CHZ balance of an address on Chiliz Chain.
     */
    static async getCHZBalance(address: string): Promise<number> {
        const normalizedInput = this.normalizeAddress(address);
        if (!normalizedInput || !ethers.isAddress(normalizedInput)) return 0;
        try {
            const p = getProvider();
            // Use getAddress to ensure proper checksum and avoid ENS resolution attempts
            const target = ethers.getAddress(normalizedInput);
            const balance = await p.getBalance(target);
            return parseFloat(ethers.formatEther(balance));
        } catch (error) {
            console.error(`[CHILIZ] Failed to get CHZ balance for ${address}:`, error);
            return 0;
        }
    }

    /**
     * Get CAP-20 (ERC-20) token balance.
     * Fan Tokens on Chiliz use 0 decimals.
     */
    static async getTokenBalance(walletAddress: string, contractAddress: string): Promise<number> {
        const normalizedWallet = this.normalizeAddress(walletAddress);
        const normalizedContract = this.normalizeAddress(contractAddress);

        if (!normalizedWallet || !normalizedContract || !ethers.isAddress(normalizedWallet) || !ethers.isAddress(normalizedContract)) {
            return 0;
        }

        try {
            const p = getProvider();
            const targetWallet = ethers.getAddress(normalizedWallet);
            const targetContract = ethers.getAddress(normalizedContract);

            // Resiliency: Check if code exists at this address to avoid BAD_DATA (0x result)
            const code = await p.getCode(targetContract);
            if (code === '0x' || code === '0x0') {
                console.warn(`[CHILIZ] No contract code at ${targetContract} on current network.`);
                return 0;
            }
            
            const contract = new ethers.Contract(targetContract, ERC20_ABI, p);
            const balance = await contract.balanceOf(targetWallet);
            
            // CAP-20 Fan Tokens have 0 decimals, so balance is the raw integer
            const decimals = await contract.decimals().catch(() => 0);
            return Number(ethers.formatUnits(balance, decimals));
        } catch (error: any) {
            // Silence common expected errors like "could not decode result data" which happen on certain RPC nodes
            if (error.code === 'BAD_DATA') {
                console.warn(`[CHILIZ] Bad data returned from token contract at ${contractAddress}. Likely not a valid token on this chain.`);
            } else {
                console.error(`[CHILIZ] Failed to get token balance:`, error.message);
            }
            return 0;
        }
    }

    /**
     * Distributes real $CHZ rewards to a winner's Chiliz wallet.
     * Sends an on-chain transaction from the treasury wallet.
     */
    static async distributeCHZReward(telegramId: number, amount: number, reason: string) {
        if (amount <= 0) return;
        console.log(`[CHILIZ] Distributing ${amount} $CHZ to user ${telegramId} for: ${reason}`);

        try {
            // 1. Get user's Chiliz wallet address
            const { data: user } = await supabase
                .from('users')
                .select('chiliz_wallet_address, balance_chz')
                .eq('telegram_id', telegramId)
                .single();

            // 2. Log the reward in our DB regardless of on-chain success
            await supabase.from('transactions').insert({
                user_id: telegramId,
                type: 'SPORTFI_REWARD',
                amount: amount,
                currency: 'CHZ',
                metadata: { reason, status: 'PENDING' },
                status: 'COMPLETED'
            });

            // 3. Update internal balance
            const currentBalance = user?.balance_chz || 0;
            await supabase
                .from('users')
                .update({ balance_chz: currentBalance + amount })
                .eq('telegram_id', telegramId);

            // 4. Attempt real on-chain transfer if treasury is configured
            const wallet = getTreasuryWallet();
            if (wallet && user?.chiliz_wallet_address) {
                try {
                    const normalizedDestination = ethers.getAddress(this.normalizeAddress(user.chiliz_wallet_address));
                    const tx = await wallet.sendTransaction({
                        to: normalizedDestination,
                        value: ethers.parseEther(amount.toString())
                    });
                    console.log(`[CHILIZ] TX sent: ${tx.hash}`);

                    // Wait for confirmation
                    const receipt = await tx.wait(1);
                    console.log(`[CHILIZ] TX confirmed in block ${receipt?.blockNumber}`);

                    // Update transaction with TX hash
                    await supabase.from('transactions')
                        .update({ metadata: { reason, txHash: tx.hash, status: 'CONFIRMED' } })
                        .eq('user_id', telegramId)
                        .eq('type', 'SPORTFI_REWARD')
                        .order('created_at', { ascending: false })
                        .limit(1);

                } catch (txError) {
                    console.error(`[CHILIZ] On-chain transfer failed (reward still logged in DB):`, txError);
                    // The DB record remains — can be retried or claimed manually later
                }
            } else {
                console.log(`[CHILIZ] No treasury wallet or no user Chiliz address. Reward logged in DB only.`);
            }

            console.log(`[CHILIZ] Reward complete. New DB balance: ${currentBalance + amount} $CHZ`);

        } catch (error) {
            console.error('[CHILIZ] Reward distribution error:', error);
        }
    }

    /**
     * Internal balance sync — not used anymore for gating, but kept for DB consistency if needed.
     */
    static async syncInternalBalances(telegramId: number) {
        // ... implementation could go here to update users.balance_chz from on-chain if desired
    }

    /**
     * Validate that a string is a valid Chiliz/EVM wallet address.
     */
    static isValidAddress(address: string): boolean {
        return ethers.isAddress(this.normalizeAddress(address));
    }
}
