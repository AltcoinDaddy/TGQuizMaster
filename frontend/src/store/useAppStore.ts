import { create } from 'zustand';

interface UserState {
    telegramId: string;
    username: string;
    firstName?: string;
    level: number;
    isPro: boolean;
    stars: number;
    tonBalance: number;
    inventory: string[];
    walletConnected: boolean;
}

interface AppStore {
    user: UserState;
    setUser: (user: Partial<UserState>) => void;
    setWalletConnected: (connected: boolean) => void;
    updateStars: (amount: number) => void;
    updateTON: (amount: number) => void;
}

export const useAppStore = create<AppStore>((set) => ({
    user: {
        telegramId: "123456789", // Default for dev
        username: "@Alex_Quiz",
        level: 5,
        isPro: true,
        stars: 1240,
        tonBalance: 5.50,
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
}));
