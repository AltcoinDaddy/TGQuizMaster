import { ethers } from 'ethers';
import { supabase } from '../config/supabase';

// ─── Chiliz Chain Configuration ───────────────────────────────────────
const CHILIZ_MAINNET_RPC = process.env.CHILIZ_RPC_URL || 'https://rpc.chiliz.com';
const CHILIZ_TESTNET_RPC = 'https://spicy-rpc.chiliz.com';

// Use testnet by default during development, mainnet in production
const RPC_URL = process.env.NODE_ENV === 'production' ? CHILIZ_MAINNET_RPC : CHILIZ_TESTNET_RPC;
const CHAIN_ID = process.env.NODE_ENV === 'production' ? 88888 : 88882;

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
            // On RPC failure, fall back to DB check (graceful degradation)
            return this.fallbackVerification(telegramId);
        }
    }

    /**
     * Get native $CHZ balance of an address on Chiliz Chain.
     */
    static async getCHZBalance(address: string): Promise<number> {
        try {
            const p = getProvider();
            const balance = await p.getBalance(address);
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
        try {
            const p = getProvider();
            const contract = new ethers.Contract(contractAddress, ERC20_ABI, p);
            const balance = await contract.balanceOf(walletAddress);
            // CAP-20 Fan Tokens have 0 decimals, so balance is the raw integer
            const decimals = await contract.decimals().catch(() => 0);
            return Number(ethers.formatUnits(balance, decimals));
        } catch (error) {
            console.error(`[CHILIZ] Failed to get token balance:`, error);
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
                    const tx = await wallet.sendTransaction({
                        to: user.chiliz_wallet_address,
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
     * Fallback: If RPC is down, check if user has a Chiliz wallet linked at all.
     * This is a graceful degradation — better to let users play than block everyone.
     */
    private static async fallbackVerification(telegramId: number): Promise<boolean> {
        console.warn(`[CHILIZ] Using fallback verification for ${telegramId} (RPC may be down)`);
        const { data: user } = await supabase
            .from('users')
            .select('chiliz_wallet_address')
            .eq('telegram_id', telegramId)
            .single();

        return !!user?.chiliz_wallet_address;
    }

    /**
     * Validate that a string is a valid Chiliz/EVM wallet address.
     */
    static isValidAddress(address: string): boolean {
        return ethers.isAddress(address);
    }
}
