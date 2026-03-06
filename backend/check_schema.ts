
import { supabase } from './src/config/supabase';

const checkSchema = async () => {
    try {
        const { data, error } = await supabase.from('users').select('*').limit(1);
        if (error) {
            console.error('Error fetching user:', error);
            return;
        }
        if (data && data.length > 0) {
            console.log('Columns in users table:', JSON.stringify(Object.keys(data[0]), null, 2));
        } else {
            console.log('No users found to check columns.');
        }
    } catch (e) {
        console.error('Failed to check schema:', e);
    }
};

checkSchema();
