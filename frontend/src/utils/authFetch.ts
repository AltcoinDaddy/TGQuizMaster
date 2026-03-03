import { API_URL } from '../config/api';
import { getInitData } from './socket';

/**
 * Authenticated fetch wrapper.
 * Automatically includes Telegram initData in the request headers
 * so the backend can verify the caller's identity.
 */
export async function authFetch(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {
    const initData = getInitData();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    // Add Telegram auth header if available
    if (initData) {
        headers['x-telegram-init-data'] = initData;
    }

    return fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });
}

/**
 * Authenticated POST request.
 */
export async function authPost(endpoint: string, body: any): Promise<Response> {
    return authFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

/**
 * Authenticated GET request with optional query params.
 */
export async function authGet(endpoint: string, params?: Record<string, string>): Promise<Response> {
    const url = params
        ? `${endpoint}?${new URLSearchParams(params).toString()}`
        : endpoint;
    return authFetch(url);
}
