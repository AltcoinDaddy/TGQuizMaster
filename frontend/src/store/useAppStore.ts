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
    inventory: string[];
    walletConnected: boolean;
    walletAddress?: string;
    isAdmin: boolean;
    referralCount?: number;
    referralEarnings?: number;
    referrals?: any[]; // { username, date, earned }
    transactions?: any[]; // { id, title, date, amount, type }
    settings?: {
        soundEnabled: boolean;
        hapticsEnabled: boolean;
    };
}

interface AppStore {
    user: UserState;
    setUser: (user: Partial<UserState>) => void;
    setWalletConnected: (connected: boolean) => void;
    updateStars: (amount: number) => void;
    updateTON: (amount: number) => void;
    syncFromBackend: (data: any) => void;
    updateSettings: (settings: { soundEnabled: boolean; hapticsEnabled: boolean }) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
    user: {
        telegramId: "123456789", // Default for dev
        username: "@Alex_Quiz",
        xp: 0,
        wins: 0,
        totalGames: 0,
        isPro: false,
        stars: 0,
        tonBalance: 0,
        inventory: [],
        walletConnected: false,
        isAdmin: false,
        referrals: [],
        transactions: [],
        settings: {
            soundEnabled: true,
            hapticsEnabled: true
        }
    },
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
                walletConnected: data.walletConnected ?? state.user.walletConnected,
                walletAddress: data.walletAddress ?? state.user.walletAddress,
                isAdmin: data.isAdmin ?? state.user.isAdmin,
                referralCount: data.referralCount ?? state.user.referralCount,
                referralEarnings: data.referralEarnings ?? state.user.referralEarnings,
                referrals: data.recentReferrals ?? state.user.referrals,
                transactions: data.recentTransactions ?? state.user.transactions
            }
        })),
    updateSettings: async (settings) => {
        const state = get();
        const newSettings = { ...state.user.settings, ...settings };

        // Optimistic update
        set((state) => ({ user: { ...state.user, settings: newSettings } }));

        // Sync with backend
        try {
            await authPost('/api/settings', {
                telegramId: state.user.telegramId,
                settings: newSettings
            });
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    }
}));
