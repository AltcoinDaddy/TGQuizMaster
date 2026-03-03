import axios from 'axios';
import { decode } from 'html-entities';

export interface CachedQuestion {
    id: string;
    text: string;
    options: string[];
    correctAnswer: string;
}

/**
 * Pre-fetches and caches trivia questions from OpenTDB to avoid
 * hitting the API on every game start. Refills automatically
 * when the pool drops below a threshold.
 */
class QuestionCache {
    private pool: CachedQuestion[] = [];
    private readonly refillThreshold = 20;
    private readonly batchSize = 50; // OpenTDB max per request
    private isRefilling = false;
    private lastRefill = 0;
    private readonly minRefillInterval = 5000; // 5 seconds between API calls

    constructor() {
        // Pre-fill on startup
        this.refill();
    }

    /**
     * Get N questions from the cache. Falls back to API if cache is empty.
     */
    async getQuestions(count: number): Promise<CachedQuestion[]> {
        // Trigger background refill if running low
        if (this.pool.length < this.refillThreshold + count) {
            this.refill(); // non-blocking
        }

        if (this.pool.length >= count) {
            // Splice from the pool (removes them so no duplicates across games)
            return this.pool.splice(0, count);
        }

        // Cache empty — fetch directly (fallback)
        console.log(`[CACHE] Pool empty (${this.pool.length}), fetching directly`);
        return this.fetchFromAPI(count);
    }

    /**
     * Background refill — fetches a batch from OpenTDB and adds to pool.
     */
    private async refill(): Promise<void> {
        if (this.isRefilling) return;

        const now = Date.now();
        if (now - this.lastRefill < this.minRefillInterval) return;

        this.isRefilling = true;
        this.lastRefill = now;

        try {
            const questions = await this.fetchFromAPI(this.batchSize);
            this.pool.push(...questions);
            console.log(`[CACHE] Refilled +${questions.length}, pool size: ${this.pool.length}`);
        } catch (e) {
            console.error('[CACHE] Refill failed:', e);
        } finally {
            this.isRefilling = false;
        }
    }

    private async fetchFromAPI(amount: number): Promise<CachedQuestion[]> {
        try {
            const resp = await axios.get(`https://opentdb.com/api.php?amount=${amount}&type=multiple`);
            return resp.data.results.map((q: any, i: number) => ({
                id: `q_${Date.now()}_${i}`,
                text: decode(q.question),
                options: [...q.incorrect_answers.map((a: any) => decode(a)), decode(q.correct_answer)].sort(() => Math.random() - 0.5),
                correctAnswer: decode(q.correct_answer)
            }));
        } catch (e) {
            console.error('[CACHE] API fetch failed:', e);
            return [];
        }
    }

    get size() {
        return this.pool.length;
    }
}

// Singleton instance
export const questionCache = new QuestionCache();
