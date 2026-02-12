import React from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

const manifestUrl = `${window.location.origin}/tonconnect-manifest.json`;

export const TONProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <TonConnectUIProvider manifestUrl={manifestUrl}>
            {children}
        </TonConnectUIProvider>
    );
};
