import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Point to the .env file in the backend root
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTournaments() {
    console.log('--- Searching Tournaments Table ---');
    const { data: tournaments, error } = await supabase
        .from('tournaments')
        .select('*')
        .ilike('title', '%grand prix%')
        .order('start_time', { ascending: false });

    if (error) {
        console.error('Error fetching tournaments:', error.message);
        return;
    }

    if (!tournaments || tournaments.length === 0) {
        console.log('No individual tournaments with "Grand Prix" in title found.');
        return;
    }

    tournaments.forEach((t: any) => {
        console.log(`--- Tournament ---`);
        console.log(`ID: ${t.id}`);
        console.log(`Title: ${t.title}`);
        console.log(`Status: ${t.status}`);
        console.log(`Start Time: ${t.start_time}`);
        // Tournaments don't have an explicit end_time in schema, but they have a status
    });
}

checkTournaments();
