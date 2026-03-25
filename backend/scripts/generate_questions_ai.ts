
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

/**
 * MASTER SCALING TOOL: Sport & Entertainment Question Generator
 * 
 * Use this script to generate thousands of questions via an LLM API (e.g. OpenAI/Gemini)
 * and save them into the 'backend/data/' directory for bulk import.
 * 
 * TO RUN: 
 * 1. Add your OPENAI_API_KEY to .env
 * 2. Configure the categories and target count.
 * 3. Run: npx ts-node scripts/generate_questions_ai.ts
 */

const CATEGORIES = [
    'football', 'motorsports', 'basketball', 'tennis', 
    'combat_sports', 'esports', 'movies_series', 'music', 'pop_culture'
];

async function generateBatch(category: string, count: number) {
    console.log(`[GEN] Requesting ${count} questions for category: ${category}...`);
    
    // TEMPLATE: Replace this with your actual LLM API call
    // Example Prompt: "Generate ${count} trivia questions for ${category} in JSON format: { category, text, options, correct_answer, difficulty }"
    
    const dummyQuestions = [
        { 
            category, 
            text: `Sample question for ${category} #${Math.floor(Math.random() * 1000)}`,
            options: ["A", "B", "C", "D"],
            correct_answer: "A",
            difficulty: "medium",
            source: "ai"
        }
    ];

    return dummyQuestions;
}

async function main() {
    const targetPerCategory = 1000; // Aiming for 10k total
    
    for (const cat of CATEGORIES) {
        const questions = await generateBatch(cat, 10); // Batching small to avoid timeouts
        const fileName = `growth_pack_ai_${cat}.json`;
        const filePath = path.join(__dirname, '../data', fileName);
        
        fs.writeFileSync(filePath, JSON.stringify(questions, null, 2));
        console.log(`[OK] Saved ${questions.length} questions to ${fileName}`);
    }
}

main().catch(console.error);
