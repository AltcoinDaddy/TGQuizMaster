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
    private requestQueue: number[] = [];
    private isProcessingQueue = false;
    private lastRequestTime = 0;

    private readonly refillThreshold = 15;
    private readonly batchSize = 30;
    private readonly minGlobalInterval = 6000; // 6 seconds between ANY request

    private readonly CATEGORY_IDS = [9, 11, 15, 18, 21];

    constructor() {
        // Queue initial refills sequentially
        this.CATEGORY_IDS.forEach(id => this.queueRefill(id));
    }

    async getQuestions(count: number, categoryId: number): Promise<CachedQuestion[]> {
        const id = categoryId;
        const pool = this.pools.get(id) || [];

        // If pool is getting low, queue a refill
        if (pool.length < this.refillThreshold + count) {
            this.queueRefill(id);
        }

        if (pool.length >= count) {
            const questions = pool.splice(0, count);
            this.pools.set(id, pool);
            return questions;
        }

        // Emergency fallback: fetch directly but still obey global limit
        console.log(`[CACHE] Pool empty for category ${id}, fetching directly...`);
        // For direct fetches, we need to ensure they also respect the global interval.
        // The simplest way is to queue them as well, or make fetchFromAPI handle the wait.
        // The instruction implies fetchFromAPI will handle the timing, so we'll just call it.
        // However, the `processQueue` is designed to handle the timing for `batchSize` refills.
        // For a direct fetch, we need to ensure it waits if necessary.
        // Let's modify fetchFromAPI to include the wait logic.
        return this.fetchFromAPI(count, id);
    }

    private queueRefill(categoryId: number) {
        // Only add to queue if not already present
        if (!this.requestQueue.includes(categoryId)) {
            this.requestQueue.push(categoryId);
        }
        this.processQueue();
    }

    private async processQueue() {
        if (this.isProcessingQueue || this.requestQueue.length === 0) return;

        this.isProcessingQueue = true;

        while (this.requestQueue.length > 0) {
            const now = Date.now();
            const timeSinceLast = now - this.lastRequestTime;

            if (timeSinceLast < this.minGlobalInterval) {
                const wait = this.minGlobalInterval - timeSinceLast;
                await new Promise(r => setTimeout(r, wait));
            }

            const categoryId = this.requestQueue.shift();
            if (categoryId !== undefined) {
                try {
                    // This call to fetchFromAPI will update lastRequestTime
                    const questions = await this.fetchFromAPI(this.batchSize, categoryId);
                    if (questions.length > 0) {
                        const currentPool = this.pools.get(categoryId) || [];
                        this.pools.set(categoryId, [...currentPool, ...questions]);
                        console.log(`[CACHE] Refilled category ${categoryId} (+${questions.length}), pool size: ${this.getPoolSize(categoryId)}`);
                    }
                } catch (e) {
                    console.error(`[CACHE] Refill failed for ${categoryId}:`, e);
                }
            }
        }

        this.isProcessingQueue = false;
    }

    private async fetchFromAPI(amount: number, categoryId: number): Promise<CachedQuestion[]> {
        // Ensure this direct API call also respects the global interval
        const now = Date.now();
        const timeSinceLast = now - this.lastRequestTime;
        if (timeSinceLast < this.minGlobalInterval) {
            const wait = this.minGlobalInterval - timeSinceLast;
            await new Promise(r => setTimeout(r, wait));
        }

        this.lastRequestTime = Date.now(); // Update last request time immediately before making the call
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

    private getPoolSize(categoryId: number) {
        return this.pools.get(categoryId)?.length || 0;
    }

    get size() {
        let total = 0;
        this.pools.forEach(p => total += p.length);
        return total;
    }
}

// Singleton instance
export const questionCache = new QuestionCache();
