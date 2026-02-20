
// Centralized API Configuration
// This file ensures consistent API URL usage across the app

export const getApiUrl = () => {
    // 1. Check for explicit environment variable (Vite injects this at build time)
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // 2. If in development mode, default to localhost
    if (import.meta.env.DEV) {
        return 'http://localhost:3001';
    }

    // 3. Fallback for production if variable is missing
    // In many setups, the frontend is served from the same origin as the API,
    // so an empty string (relative path) or just location.origin might work.
    // However, if they are separate, this MUST be set via ENV.
    console.warn('VITE_API_URL is not set! Defaulting to relative path.');
    return '';
};

export const API_URL = getApiUrl();
