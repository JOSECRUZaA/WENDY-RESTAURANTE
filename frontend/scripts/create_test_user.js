import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tjeormsfarjvrkabxrrw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZW9ybXNmYXJqdnJrYWJ4cnJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0ODcwNTMsImV4cCI6MjA4MzA2MzA1M30.QLB2sFFrJrBNf4y2rMZNEJYVdMgF5OnstGGErels0fI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
    const email = 'admin_prueba@wendys.com';
    const password = 'password123';
    const carnet = 'CI-ADMIN-TEST';

    console.log(`Creating user: ${email} with carnet ${carnet}...`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                nombre: 'Usuario Prueba Admin',
                carnet: carnet,
                rol: 'administrador'
            }
        }
    });

    if (error) {
        console.error('Error creating user:', JSON.stringify(error, null, 2));
    } else {
        console.log('User created successfully!');
        console.log('User ID:', data.user?.id);
        console.log('Please verify the email if required by your Supabase settings, or check the database.');
    }
}

createTestUser();
