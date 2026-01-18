
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tjeormsfarjvrkabxrrw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZW9ybXNmYXJqdnJrYWJ4cnJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0ODcwNTMsImV4cCI6MjA4MzA2MzA1M30.QLB2sFFrJrBNf4y2rMZNEJYVdMgF5OnstGGErels0fI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testUser(email, password) {
    console.log(`Probando acceso para: ${email}`);

    // 1. Intentar Loguearse
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (authError) {
        console.error(`❌ Error de Auth: ${authError.message}`);
        return;
    }

    console.log('✅ Login correcto.');

    // 2. Intentar leer su perfil
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

    if (profileError) {
        console.error(`❌ Error al leer perfil: ${profileError.message}`);
        console.log('Detalle técnico:', profileError);
    } else {
        console.log(`✅ Perfil cargado correctamente. Rol: ${profileData.rol}`);
    }
    console.log('---');
}

async function runTests() {
    await testUser('bar@wendys.com', 'Wendy123!');
    await testUser('cocina@wendys.com', 'Wendy123!');
}

runTests();
