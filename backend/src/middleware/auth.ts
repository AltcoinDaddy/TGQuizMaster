import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

/**
 * Telegram Mini App initData Validator
 * 
 * Validates the initData hash using HMAC-SHA256 with the bot token.
 * Reference: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 * 
 * Flow:
 * 1. Client sends `window.Telegram.WebApp.initData` in the `x-telegram-init-data` header
 * 2. Server parses the URL-encoded string, extracts the `hash`
 * 3. Builds a data-check-string from the remaining params (sorted, joined by \n)
 * 4. Computes HMAC-SHA256(secret_key, data-check-string) and compares to hash
 */

export interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
}

// Extend Express Request to include validated Telegram user
declare global {
    namespace Express {
        interface Request {
            telegramUser?: TelegramUser;
        }
    }
}

/**
 * Validates Telegram Mini App initData and extracts the authenticated user.
 * Returns null if validation fails, or the parsed user object if valid.
 */
export function validateInitData(initData: string, botToken: string): TelegramUser | null {
    try {
        const params = new URLSearchParams(initData);
        const hash = params.get('hash');

        if (!hash) return null;

        // Remove hash from params and sort remaining alphabetically
        params.delete('hash');
        const dataCheckString = Array.from(params.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');

        // Generate secret key: HMAC-SHA256("WebAppData", bot_token)
        const secretKey = crypto
            .createHmac('sha256', 'WebAppData')
            .update(botToken)
            .digest();

        // Compute signature: HMAC-SHA256(secret_key, data_check_string)
        const computedHash = crypto
            .createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');

        // Constant-time comparison to prevent timing attacks
        if (!crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(hash))) {
            return null;
        }

        // Check auth_date is not too old (allow 24 hours)
        const authDate = parseInt(params.get('auth_date') || '0');
        const now = Math.floor(Date.now() / 1000);
        if (now - authDate > 86400) {
            console.warn(`[AUTH] initData expired: auth_date=${authDate}, now=${now}`);
            return null;
        }

        // Extract user from the validated data
        const userParam = params.get('user');
        if (!userParam) return null;

        return JSON.parse(userParam) as TelegramUser;
    } catch (e) {
        console.error('[AUTH] initData validation error:', e);
        return null;
    }
}

/**
 * Express middleware that validates Telegram initData.
 * 
 * On success: sets `req.telegramUser` and calls next()
 * On failure: returns 401 Unauthorized
 * 
 * In development (no BOT_TOKEN), falls back to trusting x-telegram-id header.
 */
export function telegramAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const initData = req.headers['x-telegram-init-data'] as string | undefined;

    // If initData is provided and bot token exists, validate properly
    if (initData && botToken) {
        const user = validateInitData(initData, botToken);
        if (user) {
            req.telegramUser = user;
            next();
            return;
        }
        res.status(401).json({ error: 'Invalid or expired Telegram authentication' });
        return;
    }

    // Fallback for development: trust the telegramId from body/query
    // In production, initData should always be present
    const telegramId = req.body?.telegramId || req.query?.telegramId;
    if (telegramId) {
        req.telegramUser = {
            id: parseInt(telegramId),
            first_name: 'Dev_User'
        };
        console.warn(`[AUTH] Dev fallback: trusting telegramId=${telegramId} without initData`);
        next();
        return;
    }

    res.status(401).json({ error: 'Authentication required. Missing Telegram initData.' });
}

/**
 * Socket.IO middleware for validating Telegram initData on connection.
 */
export function socketAuthMiddleware(socket: any, next: (err?: Error) => void) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const initData = socket.handshake.auth?.initData;

    if (initData && botToken) {
        const user = validateInitData(initData, botToken);
        if (user) {
            socket.telegramUser = user;
            next();
            return;
        }
    }

    // Fallback for dev: allow connection without initData
    // The sync_profile handler will still require a telegramId
    console.warn(`[AUTH] Socket connected without initData: ${socket.id}`);
    next();
}
