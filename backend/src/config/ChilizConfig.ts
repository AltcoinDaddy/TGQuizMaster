/**
 * Chiliz Fan Token Contract Addresses
 * 
 * Mainnet: https://chiliscan.com
 * Spicy Testnet: https://spicy-explorer.chiliz.com
 */

export interface FanToken {
    symbol: string;
    name: string;
    address: string;
}

const IS_PROD = process.env.NODE_ENV === 'production';

export const CHILIZ_CONFIG = {
    // RPCs
    RPC_URL: process.env.CHILIZ_RPC_URL || (IS_PROD ? 'https://rpc.chiliz.com' : 'https://spicy-rpc.chiliz.com'),
    CHAIN_ID: IS_PROD ? 88888 : 88882,

    // Configured Fan Tokens for gating and rewards
    FAN_TOKENS: [
        {
            symbol: 'BAR',
            name: 'FC Barcelona',
            address: IS_PROD 
                ? '0xec510260464ce0727df62a7923706063857b420c' // Example Mainnet BAR
                : '0xde371c35e668600742f534484a96d34b3587071f' // Spicy BAR
        },
        {
            symbol: 'PSG',
            name: 'Paris Saint-Germain',
            address: IS_PROD 
                ? '0xde371c35e668600742f534484a96d34b3587071f' // Replace with real
                : '0xec510260464ce0727df62a7923706063857b420f' // Spicy PSG
        },
        {
            symbol: 'CITY',
            name: 'Manchester City',
            address: IS_PROD
                ? '0x53959da465f58e72a176988888882736c27582d' // Replace with real
                : '0x53959da465f58e72a176988888882736c27582d' // Spicy CITY
        }
    ] as FanToken[],

    // Default token used if none specified (e.g. for generic gating)
    DEFAULT_FAN_TOKEN: 'BAR'
};

export function getFanTokenBySymbol(symbol: string): FanToken | undefined {
    return CHILIZ_CONFIG.FAN_TOKENS.find(t => t.symbol.toUpperCase() === symbol.toUpperCase());
}
