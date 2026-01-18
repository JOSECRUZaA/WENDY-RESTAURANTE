import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tjeormsfarjvrkabxrrw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZW9ybXNmYXJqdnJrYWJ4cnJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0ODcwNTMsImV4cCI6MjA4MzA2MzA1M30.QLB2sFFrJrBNf4y2rMZNEJYVdMgF5OnstGGErels0fI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSimpleUser() {
    const timestamp = Date.now();
    const email = `simple_${timestamp}@wendys.com`;
    const password = 'password123';

    console.log(`Creating simple user: ${email}...`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password
        // No metadata
    });

    if (error) {
        console.error('Error creating user:', error.message);
    } else {
        console.log('User created successfully:', data.user?.id);
    }
}

createSimpleUser();
