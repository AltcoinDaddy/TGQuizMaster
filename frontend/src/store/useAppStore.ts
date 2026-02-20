import { create } from 'zustand';
import { API_URL } from '../config/api';

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
                stars: data.stars,
                tonBalance: data.ton,
                xp: data.xp,
                isPro: data.isPro ?? state.user.isPro,
                settings: data.settings ?? state.user.settings,
                wins: data.wins,
                totalGames: data.totalGames,
                walletConnected: data.walletConnected ?? state.user.walletConnected,
                walletAddress: data.walletAddress ?? state.user.walletAddress,
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
            await fetch(`${API_URL}/api/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegramId: state.user.telegramId,
                    settings: newSettings
                })
            });
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    }
}));
