import React from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { WagmiProvider, type Config } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 1. Get projectId from env. Older local env files still use the WalletConnect name.
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
    throw new Error('VITE_REOWN_PROJECT_ID or VITE_WALLETCONNECT_PROJECT_ID is not defined in .env');
}

// 2. Define Chiliz Chain
const chilizChain = {
    id: 88888,
    name: 'Chiliz Chain',
    network: 'chiliz-chain',
    nativeCurrency: {
        decimals: 18,
        name: 'CHZ',
        symbol: 'CHZ',
    },
    rpcUrls: {
        public: { http: ['https://rpc.chiliz.com'] },
        default: { http: ['https://rpc.chiliz.com'] },
    },
    blockExplorers: {
        default: { name: 'ChilizScan', url: 'https://chiliscan.com' },
    },
} as any;

const queryClient = new QueryClient();

const networks: [any, ...any[]] = [chilizChain];

// 3. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
    networks,
    projectId,
    ssr: true
});

// 4. Create AppKit
createAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId,
    features: {
        analytics: true,
    },
});

export const ChilizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
};
