import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch'; // Force node-fetch

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    // Don't crash immediately in dev if envs aren't set, might be waiting for user input
}


export const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
    auth: {
        persistSession: false, // Required for backend to avoid loading/saving session from storage
        autoRefreshToken: false,
    },
    global: {
        fetch: fetch as any, // Cast to any to avoid type mismatch with native fetch
        headers: {
            'Connection': 'keep-alive'
        }
    }
});
