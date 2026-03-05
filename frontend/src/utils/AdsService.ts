/**
 * AdsGram Service for Rewarded Video Ads
 * Integration for Telegram Mini Apps
 */

export interface AdsGramController {
    show(): Promise<AdsGramResult>;
}

export interface AdsGramResult {
    done: boolean;      // true if the user watched the ad to the end
    description: string; // result status description
    state: 'load' | 'render' | 'playing' | 'destroy';
    error: boolean;
}

// Your AdsGram Block ID (Replace with your actual ID from dashboard)
const SQUAD_APP_BLOCK_ID = "24406"; // UnitID from AdsGram dashboard

class AdsService {
    private controller: AdsGramController | null = null;
    private initialized = false;

    init() {
        if (typeof window === 'undefined') return;

        // The AdsGram SDK exposes window.Adsgram
        const adsgram = (window as any).Adsgram;

        if (!adsgram) {
            console.warn('AdsGram SDK not found. Make sure https://sad.adsgram.ai/js/sad.min.js is included in index.html');
            return;
        }

        if (this.initialized) return;

        try {
            // Initialize with the provided UnitID
            this.controller = adsgram.init({ blockId: SQUAD_APP_BLOCK_ID });
            this.initialized = true;
            console.log(`[ADS] AdsGram initialized with blockId: ${SQUAD_APP_BLOCK_ID}`);
        } catch (e) {
            console.error('[ADS] Failed to initialize AdsGram:', e);
        }
    }

    /**
     * Shows a rewarded video ad
     * @returns Promise<boolean> true if watched till the end
     */
    async showRewardedVideo(): Promise<boolean> {
        if (!this.initialized) this.init();

        if (!this.controller) {
            console.error('[ADS] Controller not available');
            return false;
        }

        try {
            const result = await this.controller.show();
            console.log('[ADS] Ad result:', result);
            return result.done;
        } catch (e: any) {
            // Handle common errors like ad block, no fill, etc.
            console.error('[ADS] Ad failed or was skipped:', e);

            const tg = (window as any).Telegram?.WebApp;
            if (e?.description === 'User skip' || e?.description === 'Skipped') {
                if (tg?.showAlert) tg.showAlert('You must watch the full video to get the reward! 📺');
            } else if (e?.description === 'No fill') {
                if (tg?.showAlert) tg.showAlert('No ads available right now. Try again later!');
            }

            return false;
        }
    }
}

export const adsService = new AdsService();
