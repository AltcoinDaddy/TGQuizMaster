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
    private pools: Map<number, CachedQuestion[]> = new Map();
    private readonly refillThreshold = 15;
    private readonly batchSize = 30; // Reduced batch size for faster category rotation
    private isRefilling = false;
    private lastRefill = 0;
    private readonly minRefillInterval = 5500; // OpenTDB allows 1 request per 5 seconds

    private readonly CATEGORY_IDS = [9, 11, 15, 18, 21]; // General, Movies, Gaming, Computers, Sports

    constructor() {
        // Initial pre-fill for General
        this.refill(9);
    }

    /**
     * Get N questions from a specific category pool.
     */
    async getQuestions(count: number, categoryId: number = 9): Promise<CachedQuestion[]> {
        const id = categoryId || 9;
        let pool = this.pools.get(id) || [];

        // Trigger background refill for this specific category if low
        if (pool.length < this.refillThreshold + count) {
            this.refill(id); // non-blocking
        }

        if (pool.length >= count) {
            const questions = pool.splice(0, count);
            this.pools.set(id, pool);
            return questions;
        }

        // Cache empty — fetch directly (fallback)
        console.log(`[CACHE] Pool empty for category ${id}, fetching directly`);
        return this.fetchFromAPI(count, id);
    }

    /**
     * Background refill — fetches a batch from OpenTDB and adds to target pool.
     */
    private async refill(categoryId: number): Promise<void> {
        if (this.isRefilling) return;

        const now = Date.now();
        if (now - this.lastRefill < this.minRefillInterval) return;

        this.isRefilling = true;
        this.lastRefill = now;

        try {
            const questions = await this.fetchFromAPI(this.batchSize, categoryId);
            const currentPool = this.pools.get(categoryId) || [];
            this.pools.set(categoryId, [...currentPool, ...questions]);
            console.log(`[CACHE] Refilled category ${categoryId} (+${questions.length}), pool size: ${this.pools.get(categoryId)?.length}`);
        } catch (e) {
            console.error(`[CACHE] Refill failed for category ${categoryId}:`, e);
        } finally {
            this.isRefilling = false;
        }
    }

    private async fetchFromAPI(amount: number, categoryId: number = 9): Promise<CachedQuestion[]> {
        try {
            const url = categoryId && categoryId !== 9
                ? `https://opentdb.com/api.php?amount=${amount}&category=${categoryId}&type=multiple`
                : `https://opentdb.com/api.php?amount=${amount}&type=multiple`;

            const resp = await axios.get(url);

            if (resp.data.response_code === 0 && resp.data.results) {
                return resp.data.results.map((q: any, i: number) => ({
                    id: `q_${Date.now()}_${categoryId}_${i}`,
                    text: decode(q.question),
                    options: [...q.incorrect_answers.map((a: any) => decode(a)), decode(q.correct_answer)].sort(() => Math.random() - 0.5),
                    correctAnswer: decode(q.correct_answer)
                }));
            } else {
                console.warn(`[CACHE] API returned code ${resp.data.response_code} for category ${categoryId}`);
                return [];
            }
        } catch (e: any) {
            console.error(`[CACHE] API fetch failed for category ${categoryId}:`, e.message);
            return [];
        }
    }

    get size() {
        let total = 0;
        this.pools.forEach(p => total += p.length);
        return total;
    }

    getPoolSize(categoryId: number) {
        return this.pools.get(categoryId)?.length || 0;
    }
}

// Singleton instance
export const questionCache = new QuestionCache();
