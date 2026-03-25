import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY!; 
const supabase = createClient(supabaseUrl, supabaseKey);

interface Question {
    category: string;
    text: string;
    options: string[];
    correct_answer: string;
    difficulty: 'easy' | 'medium' | 'hard';
    source: string;
}

async function importQuestions(filePath: string) {
    console.log(`[IMPORT] Starting import from: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
        console.error(`[ERROR] File not found: ${filePath}`);
        return;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const questions: Question[] = JSON.parse(fileContent);

    console.log(`[IMPORT] Found ${questions.length} questions. Inserting in batches...`);

    const batchSize = 100;
    for (let i = 0; i < questions.length; i += batchSize) {
        const batch = questions.slice(i, i + batchSize);
        
        const { error } = await supabase
            .from('questions')
            .insert(batch);

        if (error) {
            console.error(`[ERROR] Failed to insert batch ${i / batchSize + 1}:`, error);
        } else {
            console.log(`[IMPORT] Successfully inserted batch ${i / batchSize + 1} (${batch.length} questions)`);
        }
    }

    console.log('[IMPORT] Finished importing questions!');
}

// Run the import
const dataDir = path.join(__dirname, '../data');

async function runBulkImport() {
    console.log(`[IMPORT] Scanning directory: ${dataDir}`);
    
    if (!fs.existsSync(dataDir)) {
        console.error(`[ERROR] Directory not found: ${dataDir}`);
        return;
    }

    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
    console.log(`[IMPORT] Found ${files.length} JSON files to process.`);

    for (const file of files) {
        const filePath = path.join(dataDir, file);
        await importQuestions(filePath);
    }

    console.log('[IMPORT] ALL FILES PROCESSED SUCCESSFULLY!');
}

runBulkImport().catch(err => {
    console.error('[FATAL] Bulk import failed:', err);
});
