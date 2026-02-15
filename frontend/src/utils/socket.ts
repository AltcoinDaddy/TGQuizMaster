import { io } from 'socket.io-client';

// Force localhost in dev mode to avoid production connection issues
const API_URL = import.meta.env.DEV
    ? 'http://localhost:3001'
    : (import.meta.env.VITE_API_URL || 'http://localhost:3001');

console.log('Socket connecting to:', API_URL);

export const socket = io(API_URL, {
    autoConnect: false,
    transports: ['websocket']
});
