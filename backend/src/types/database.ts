export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    telegram_id: number; // BigInt (as number in JS if < 2^53, but string mostly recommended for Telegram IDs)
                    username: string | null;
                    first_name: string | null;
                    is_pro: boolean;
                    balance_stars: number;
                    stats_total_games: number;
                    stats_wins: number;
                    stats_streak: number;
                    stats_level: number;
                    stats_xp: number;
                    inventory: string[];
                    balance_chz: number;
                    chiliz_wallet_address: string | null;
                    created_at: string;
                };
                Insert: {
                    telegram_id: number | string;
                    username?: string | null;
                    first_name?: string | null;
                    is_pro?: boolean;
                    balance_stars?: number;
                    // ... other optional fields
                };
                Update: {
                    // ...
                }
            };
            tournaments: {
                Row: {
                    id: string; // UUID
                    title: string;
                    status: 'upcoming' | 'live' | 'finished';
                    prize_pool: number;
                    currency: 'STARS' | 'CHZ';
                    entry_fee: number;
                    start_time: string;
                    winners: any[]; // JSON
                };
            };
            transactions: {
                Row: {
                    id: string;
                    user_id: number;
                    type: 'DEPOSIT' | 'WITHDRAWAL' | 'ENTRY_FEE' | 'PRIZE' | 'SHOP_PURCHASE';
                    amount: number;
                    currency: 'STARS' | 'CHZ';
                    metadata: any;
                    status: string;
                    created_at: string;
                };
            }
        };
    };
}

// User Helper Interface for application code
export interface User {
    telegramId: string;
    username: string;
    firstName?: string;
    isPro: boolean;
    balance: {
        stars: number;
        chz: number;
    };
    stats: {
        totalGames: number;
        wins: number;
        streak: number;
        level: number;
        xp: number;
    };
    inventory: string[];
}
