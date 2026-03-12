import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
);

async function runMigration() {
    console.log('--- Running Migration 014: Survival Mode ---');
    
    const migrationPath = path.join(__dirname, '../migrations/014_survival_mode.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Split SQL by statements (basic split)
    const statements = sql.split(';').filter(s => s.trim().length > 0);

    for (const statement of statements) {
        try {
            const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
            if (error) {
                // If rpc fails, try direct query (if supported/available)
                console.error(`Error executing statement:`, error.message);
                console.log('Statement:', statement);
            } else {
                console.log('Successfully executed statement.');
            }
        } catch (err: any) {
            console.error('Migration failed:', err.message);
        }
    }

    console.log('--- Migration 014 Complete ---');
}

runMigration();
