
import { createClient } from '@supabase/supabase-js';

// Hardcoded keys from .env for simplicity in this one-off script
const SUPABASE_URL = 'https://tjeormsfarjvrkabxrrw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZW9ybXNmYXJqdnJrYWJ4cnJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0ODcwNTMsImV4cCI6MjA4MzA2MzA1M30.QLB2sFFrJrBNf4y2rMZNEJYVdMgF5OnstGGErels0fI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createAdmin() {
    console.log('Creando usuario administrador de recuperación...');

    const email = 'admin_recuperacion@wendys.com';
    const password = 'Password123!';

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                nombre: 'Admin Recuperacion',
                rol: 'administrador',
                carnet: 'RECUP-' + Math.floor(Math.random() * 1000)
            }
        }
    });

    if (error) {
        console.error('Error al crear usuario:', error.message);
    } else {
        console.log('------------------------------------------------');
        console.log('¡Usuario creado exitosamente!');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log('------------------------------------------------');
        console.log('Intenta iniciar sesión con estas credenciales.');
        console.log('NOTA: Si tienes confirmación de email habilitada, deberás confirmarlo antes de entrar.');
        console.log('      Si no, puedes entrar directo.');
    }
}

createAdmin();
