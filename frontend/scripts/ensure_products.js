import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tjeormsfarjvrkabxrrw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZW9ybXNmYXJqdnJrYWJ4cnJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0ODcwNTMsImV4cCI6MjA4MzA2MzA1M30.QLB2sFFrJrBNf4y2rMZNEJYVdMgF5OnstGGErels0fI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function ensureProducts() {
    // Ensure Kitchen Product
    const { data: kitchen } = await supabase.from('products').select('*').eq('nombre', 'Hamburguesa Clásica').single();
    if (!kitchen) {
        await supabase.from('products').insert({
            nombre: 'Hamburguesa Clásica',
            precio: 25.00,
            area: 'cocina',
            disponible: true
        });
        console.log('Created Kitchen Product');
    }

    // Ensure Bar Product
    const { data: bar } = await supabase.from('products').select('*').eq('nombre', 'Cerveza Artesanal').single();
    if (!bar) {
        await supabase.from('products').insert({
            nombre: 'Cerveza Artesanal',
            precio: 15.00,
            area: 'bar',
            disponible: true
        });
        console.log('Created Bar Product');
    }
}

ensureProducts();
