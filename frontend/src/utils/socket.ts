import { io } from 'socket.io-client';
import { API_URL } from '../config/api';

console.log('Socket connecting to:', API_URL);

/**
 * Get Telegram initData for authentication.
 * Returns the signed initData string from Telegram WebApp, or empty string in dev.
 */
export const getInitData = (): string => {
    return (window as any).Telegram?.WebApp?.initData || '';
};

export const socket = io(API_URL, {
    autoConnect: false,
    transports: ['websocket'],
    auth: {
        initData: getInitData()
    }
});
