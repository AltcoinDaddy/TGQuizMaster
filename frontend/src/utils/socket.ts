import { io } from 'socket.io-client';
import { API_URL } from '../config/api';

console.log('Socket connecting to:', API_URL);

export const socket = io(API_URL, {
    autoConnect: false,
    transports: ['websocket']
});
