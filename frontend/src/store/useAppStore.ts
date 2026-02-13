import { create } from 'zustand';

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
}

interface AppStore {
    user: UserState;
    setUser: (user: Partial<UserState>) => void;
    setWalletConnected: (connected: boolean) => void;
    updateStars: (amount: number) => void;
    updateTON: (amount: number) => void;
    syncFromBackend: (data: any) => void;
}

export const useAppStore = create<AppStore>((set) => ({
    user: {
        telegramId: "123456789", // Default for dev
        username: "@Alex_Quiz",
        xp: 0,
        wins: 0,
        totalGames: 0,
        isPro: true,
        stars: 0,
        tonBalance: 0,
        inventory: [],
        walletConnected: false,
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
                wins: data.wins,
                totalGames: data.totalGames,
                walletConnected: data.walletConnected ?? state.user.walletConnected,
                walletAddress: data.walletAddress ?? state.user.walletAddress,
                referralCount: data.referralCount ?? state.user.referralCount,
                referralEarnings: data.referralEarnings ?? state.user.referralEarnings
            }
        })),
}));
