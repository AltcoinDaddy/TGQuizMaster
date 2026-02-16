
import { supabase } from './config/supabase';

async function testConnection() {
    console.log('Testing Supabase connection...');
    const start = Date.now();
    try {
        const { data, error } = await supabase.from('users').select('*').limit(1);
        const duration = Date.now() - start;
        if (error) {
            console.error('Connection failed:', error.message);
        } else {
            console.log(`Connection successful! Took ${duration}ms`);
            console.log('Data found:', data?.length);
        }
    } catch (e: any) {
        console.error('Exception during connection:', e.message || e);
    }
}

testConnection();
