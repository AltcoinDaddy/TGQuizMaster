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

import dotenv from 'dotenv';
dotenv.config({ override: true });

const IS_PROD = process.env.NODE_ENV === 'production';

export const CHILIZ_CONFIG = {
    // RPCs
    get RPC_URL() {
        return process.env.CHILIZ_RPC_URL || (process.env.NODE_ENV === 'production' ? 'https://rpc.chiliz.com' : 'https://spicy-rpc.chiliz.com');
    },
    get CHAIN_ID() {
        return process.env.NODE_ENV === 'production' ? 88888 : 88882;
    },

    // Configured Fan Tokens for gating and rewards
    FAN_TOKENS: [
        {
            symbol: 'BAR',
            name: 'FC Barcelona',
            get address() {
                return process.env.NODE_ENV === 'production'
                    ? '0xFD3C73b3B09D418841dd6Aff341b2d6e3abA433b' // Mainnet BAR
                    : '0xde371c35e668600742f534484a96d34b3587071f'; // Spicy BAR
            }
        },
        {
            symbol: 'PSG',
            name: 'Paris Saint-Germain',
            get address() {
                return process.env.NODE_ENV === 'production'
                    ? '0xc2661815C69c2B3924D3dd0C2C1358A1E38A3105' // Mainnet PSG
                    : '0xec510260464ce0727df62a7923706063857b420f'; // Spicy PSG
            }
        },
        {
            symbol: 'CITY',
            name: 'Manchester City',
            get address() {
                return process.env.NODE_ENV === 'production'
                    ? '0x6401b29F40a02578Ae44241560625232A01B3F79' // Mainnet CITY
                    : '0x53959da465f58e72a176988888882736c27582d'; // Spicy CITY
            }
        }
    ] as FanToken[],

    // Default token used if none specified (e.g. for generic gating)
    DEFAULT_FAN_TOKEN: 'BAR'
};

export function getFanTokenBySymbol(symbol: string): FanToken | undefined {
    return CHILIZ_CONFIG.FAN_TOKENS.find(t => t.symbol.toUpperCase() === symbol.toUpperCase());
}
