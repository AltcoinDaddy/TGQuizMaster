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
    RPC_URL: IS_PROD ? 'https://rpc.chiliz.com' : 'https://spicy-rpc.chiliz.com',
    CHAIN_ID: IS_PROD ? 88888 : 88882,

    // Configured Fan Tokens for gating and rewards
    FAN_TOKENS: [
        {
            symbol: 'BAR',
            name: 'FC Barcelona',
            address: IS_PROD 
                ? '0xec510260464cE0727Df62a7923706063857B420C' // Example Mainnet BAR
                : '0xdE371C35E668600742f534484A96d34b3587071F' // Spicy BAR
        },
        {
            symbol: 'PSG',
            name: 'Paris Saint-Germain',
            address: IS_PROD 
                ? '0xdE371C35E668600742f534484A96d34b3587071F' // Replace with real
                : '0xec510260464cE0727Df62a7923706063857B420F' // Spicy PSG
        },
        {
            symbol: 'CITY',
            name: 'Manchester City',
            address: IS_PROD
                ? '0x53959da465F58e72A1769888888882736C27582D' // Replace with real
                : '0x53959da465F58e72A1769888888882736C27582D' // Spicy CITY
        }
    ] as FanToken[],

    // Default token used if none specified (e.g. for generic gating)
    DEFAULT_FAN_TOKEN: 'BAR'
};

export function getFanTokenBySymbol(symbol: string): FanToken | undefined {
    return CHILIZ_CONFIG.FAN_TOKENS.find(t => t.symbol.toUpperCase() === symbol.toUpperCase());
}
