import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

async function check() {
    try {
        const { data, error } = await supabase.from('users').select('*').limit(1);
        if (error) {
            console.error('Error fetching users:', error);
            process.exit(1);
        }
        if (data && data.length > 0) {
            console.log('Columns in users table:', Object.keys(data[0]));
        } else {
            console.log('No users found in the table.');
        }
    } catch (e) {
        console.error('Exception:', e);
        process.exit(1);
    }
}

check();
