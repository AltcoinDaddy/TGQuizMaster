import React from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

const manifestUrl = `${window.location.origin}/tonconnect-manifest.json`;

class TonErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error: Error) {
        console.warn('TonConnect failed to initialize:', error.message);
    }
    render() {
        if (this.state.hasError) return this.props.children;
        return this.props.children;
    }
}

export const TONProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <TonErrorBoundary>
            <TonConnectUIProvider manifestUrl={manifestUrl}>
                {children}
            </TonConnectUIProvider>
        </TonErrorBoundary>
    );
};
