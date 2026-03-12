import { create } from 'zustand';
import { authPost } from '../utils/authFetch';

interface UserState {
    telegramId: string;
    username: string;
    firstName?: string;
    xp: number;
    wins: number;
    totalGames: number;
    isPro: boolean;
    stars: number;
    tonBalance: number;
    balanceQP: number;
    balanceCHZ: number;
    onChainCHZBalance: number;
    onChainFanTokenBalance: number;
    balanceShards: number;
    inventory: string[];
    inventoryPowerups: Record<string, number>;
    unlockedAvatars: string[];
    walletConnected: boolean;
    walletAddress?: string;
    chilizWalletConnected: boolean;
    chilizWalletAddress?: string;
    isAdmin: boolean;
    referralCount?: number;
    referralEarnings?: number;
    referralTier?: string;
    referrals?: any[]; // { username, date, earned }
    squadId?: string;
    squadName?: string;
    dailyGamesToday?: number;
    transactions?: any[]; // { id, title, date, amount, type }
    settings?: {
        soundEnabled: boolean;
        hapticsEnabled: boolean;
    };
    isSynced: boolean;
    lastLuckySpin?: string;
}

interface AppStore {
    user: UserState;
    isParamProcessed: boolean;
    setUser: (user: Partial<UserState>) => void;
    setWalletConnected: (connected: boolean) => void;
    updateStars: (amount: number) => void;
    updateTON: (amount: number) => void;
    syncFromBackend: (data: any) => void;
    setChilizWallet: (connected: boolean, address?: string) => void;
    updateSettings: (settings: { soundEnabled: boolean; hapticsEnabled: boolean }) => void;
    setParamProcessed: (val: boolean) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
    user: {
        telegramId: "",
        username: "",
        xp: 0,
        wins: 0,
        totalGames: 0,
        isPro: false,
        stars: 0,
        tonBalance: 0,
        balanceQP: 0,
        balanceCHZ: 0,
        onChainCHZBalance: 0,
        onChainFanTokenBalance: 0,
        balanceShards: 0,
        inventory: [],
        inventoryPowerups: {},
        unlockedAvatars: [],
        walletConnected: false,
        walletAddress: '',
        chilizWalletConnected: false,
        chilizWalletAddress: '',
        isAdmin: false,
        referralTier: 'NONE',
        referrals: [],
        dailyGamesToday: 0,
        transactions: [],
        settings: {
            soundEnabled: true,
            hapticsEnabled: true
        },
        isSynced: false,
        lastLuckySpin: undefined
    },
    isParamProcessed: false,
    setUser: (userData) =>
        set((state) => ({ user: { ...state.user, ...userData } })),
    setWalletConnected: (connected) =>
        set((state) => ({ user: { ...state.user, walletConnected: connected } })),
    updateStars: (amount) =>
        set((state) => ({ user: { ...state.user, stars: state.user.stars + amount } })),
    updateTON: (amount) =>
        set((state) => ({ user: { ...state.user, tonBalance: state.user.tonBalance + amount } })),
    syncFromBackend: (data) =>
        set((state) => ({
            user: {
                ...state.user,
                stars: data.stars ?? state.user.stars,
                tonBalance: data.ton ?? state.user.tonBalance,
                xp: data.xp ?? state.user.xp,
                isPro: data.isPro ?? state.user.isPro,
                settings: data.settings ?? state.user.settings,
                wins: data.wins ?? state.user.wins,
                totalGames: data.totalGames ?? state.user.totalGames,
                balanceQP: data.balanceQP ?? state.user.balanceQP,
                balanceCHZ: data.balanceCHZ ?? state.user.balanceCHZ,
                onChainCHZBalance: data.onChainCHZBalance ?? state.user.onChainCHZBalance,
                onChainFanTokenBalance: data.onChainFanTokenBalance ?? state.user.onChainFanTokenBalance,
                balanceShards: data.balanceShards ?? state.user.balanceShards,
                inventoryPowerups: data.inventoryPowerups ?? state.user.inventoryPowerups,
                unlockedAvatars: data.unlockedAvatars ?? state.user.unlockedAvatars,
                walletConnected: data.walletConnected ?? state.user.walletConnected,
                walletAddress: data.walletAddress ?? state.user.walletAddress,
                chilizWalletConnected: data.chilizWalletConnected ?? state.user.chilizWalletConnected,
                chilizWalletAddress: data.chilizWalletAddress ?? state.user.chilizWalletAddress,
                isAdmin: data.isAdmin ?? state.user.isAdmin,
                referralCount: data.referralCount ?? state.user.referralCount,
                referralEarnings: data.referralEarnings ?? state.user.referralEarnings,
                referralTier: data.referralTier ?? state.user.referralTier,
                referrals: data.recentReferrals ?? state.user.referrals,
                squadId: data.squadId ?? state.user.squadId,
                squadName: data.squadName ?? state.user.squadName,
                dailyGamesToday: data.dailyGamesToday ?? state.user.dailyGamesToday,
                transactions: data.recentTransactions ?? state.user.transactions,
                lastLuckySpin: data.lastLuckySpin ?? state.user.lastLuckySpin,
                isSynced: true
            }
        })),
    setChilizWallet: (connected, address) =>
        set((state) => ({ 
            user: { 
                ...state.user, 
                chilizWalletConnected: connected, 
                chilizWalletAddress: address || state.user.chilizWalletAddress 
            } 
        })),
    updateSettings: async (settings) => {
        const currentUser = get().user;
        const newSettings = { ...currentUser.settings, ...settings };

        // Optimistic update
        set((state) => ({ user: { ...state.user, settings: newSettings } }));

        // Sync with backend
        try {
            await authPost('/api/settings', {
                telegramId: currentUser.telegramId,
                settings: newSettings
            });
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    },
    setParamProcessed: (val) => set({ isParamProcessed: val })
}));
