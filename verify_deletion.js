
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tjeormsfarjvrkabxrrw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZW9ybXNmYXJqdnJrYWJ4cnJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0ODcwNTMsImV4cCI6MjA4MzA2MzA1M30.QLB2sFFrJrBNf4y2rMZNEJYVdMgF5OnstGGErels0fI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('Verifying...');
    // Login as admin/bar
    await supabase.auth.signInWithPassword({
        email: 'bar@wendys.com',
        password: 'Wendy123!'
    });

    const { count, error } = await supabase
        .from('order_items')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', 5);

    if (error) console.error(error);
    else console.log('Remaining Service Items (ID 5):', count);

    const { data, error: pError } = await supabase
        .from('products')
        .select('*')
        .eq('id', 5);

    if (pError) console.error(pError);
    else console.log('Product 5 exists?', data.length > 0);
}

verify();
