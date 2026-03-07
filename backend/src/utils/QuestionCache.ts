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
    private isRefilling: Map<number, boolean> = new Map();
    private lastRefill: Map<number, number> = new Map();

    private readonly refillThreshold = 10;
    private readonly batchSize = 25;
    private readonly minRefillInterval = 5000; // 5 seconds per category

    private readonly CATEGORY_IDS = [9, 11, 15, 18, 21];

    constructor() {
        // Pre-fill categories in background
        this.CATEGORY_IDS.forEach(id => this.refill(id));
    }

    async getQuestions(count: number, categoryId: number): Promise<CachedQuestion[]> {
        const id = categoryId;
        const pool = this.pools.get(id) || [];

        // Check if we need to refill in background
        if (pool.length < this.refillThreshold + count) {
            this.refill(id);
        }

        if (pool.length >= count) {
            const questions = pool.splice(0, count);
            this.pools.set(id, pool);
            return questions;
        }

        // Fallback: Fetch directly if cache empty
        console.log(`[CACHE] Pool empty for category ${id}, fetching directly...`);
        return this.fetchFromAPI(count, id);
    }

    private async refill(categoryId: number): Promise<void> {
        if (this.isRefilling.get(categoryId)) return;

        const now = Date.now();
        const last = this.lastRefill.get(categoryId) || 0;
        if (now - last < this.minRefillInterval) return;

        this.isRefilling.set(categoryId, true);
        this.lastRefill.set(categoryId, now);

        try {
            const questions = await this.fetchFromAPI(this.batchSize, categoryId);
            if (questions.length > 0) {
                const currentPool = this.pools.get(categoryId) || [];
                this.pools.set(categoryId, [...currentPool, ...questions]);
                console.log(`[CACHE] Refilled category ${categoryId} (+${questions.length}), pool size: ${this.pools.get(categoryId)?.length}`);
            }
        } catch (e) {
            console.error(`[CACHE] Refill failed for ${categoryId}:`, e);
        } finally {
            this.isRefilling.set(categoryId, false);
        }
    }

    private async fetchFromAPI(amount: number, categoryId: number): Promise<CachedQuestion[]> {
        try {
            // STRICT category enforcement
            const url = `https://opentdb.com/api.php?amount=${amount}&category=${categoryId}&type=multiple`;

            const resp = await axios.get(url);

            if (resp.data.response_code === 0 && resp.data.results) {
                return resp.data.results.map((q: any, i: number) => ({
                    id: `q_${Date.now()}_${categoryId}_${i}`,
                    text: decode(q.question),
                    options: [...q.incorrect_answers.map((a: any) => decode(a)), decode(q.correct_answer)].sort(() => Math.random() - 0.5),
                    correctAnswer: decode(q.correct_answer)
                }));
            } else {
                console.warn(`[CACHE] API error ${resp.data.response_code} for cat ${categoryId}`);
                return [];
            }
        } catch (e: any) {
            console.error(`[CACHE] API fetch failed for cat ${categoryId}:`, e.message);
            return [];
        }
    }

    get size() {
        let total = 0;
        this.pools.forEach(p => total += p.length);
        return total;
    }
}

// Singleton instance
export const questionCache = new QuestionCache();
