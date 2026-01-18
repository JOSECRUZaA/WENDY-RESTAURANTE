
import { createClient } from '@supabase/supabase-js';

// Hardcoded keys from .env
const SUPABASE_URL = 'https://tjeormsfarjvrkabxrrw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZW9ybXNmYXJqdnJrYWJ4cnJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0ODcwNTMsImV4cCI6MjA4MzA2MzA1M30.QLB2sFFrJrBNf4y2rMZNEJYVdMgF5OnstGGErels0fI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createStaffUsers() {
    console.log('Iniciando creacion de usuarios de Staff...');

    const users = [
        {
            email: 'bar@wendys.com',
            password: 'Wendy123!',
            data: {
                nombre: 'Bar Staff',
                rol: 'bar', // Requiere que el ENUM 'user_role' tenga 'bar'
                carnet: 'BAR-001'
            }
        },
        {
            email: 'cocina@wendys.com',
            password: 'Wendy123!',
            data: {
                nombre: 'Cocina Staff',
                rol: 'cocina', // Requiere que el ENUM 'user_role' tenga 'cocina'
                carnet: 'COC-001'
            }
        }
    ];

    for (const u of users) {
        console.log(`Creando usuario: ${u.email}...`);
        const { error } = await supabase.auth.signUp({
            email: u.email,
            password: u.password,
            options: {
                data: u.data
            }
        });

        if (error) {
            console.error(`Error al crear ${u.email}:`, error.message);
        } else {
            console.log(`✅ Usuario ${u.email} creado con éxito.`);
        }
    }
}

createStaffUsers();
