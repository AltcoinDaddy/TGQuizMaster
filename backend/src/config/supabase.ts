import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    // Don't crash immediately in dev if envs aren't set, might be waiting for user input
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');
