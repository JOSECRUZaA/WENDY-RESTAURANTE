
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tjeormsfarjvrkabxrrw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZW9ybXNmYXJqdnJrYWJ4cnJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0ODcwNTMsImV4cCI6MjA4MzA2MzA1M30.QLB2sFFrJrBNf4y2rMZNEJYVdMgF5OnstGGErels0fI';

const supabase = createClient(supabaseUrl, supabaseKey);

const products = [
    // PLATO FUERTE (COCINA)
    { nombre: 'Silpancho Cochabambino', precio: 35.00, area: 'cocina', descripcion: 'Carne apanada gigante con arroz, papa y huevo' },
    { nombre: 'Pique Macho (2 Personas)', precio: 65.00, area: 'cocina', descripcion: 'Trozos de lomo, chorizo, papa frita, loco y tomate' },
    { nombre: 'Pique Macho (Familiar)', precio: 120.00, area: 'cocina', descripcion: 'Porción gigante para 4 personas' },
    { nombre: 'Milanesa de Pollo', precio: 28.00, area: 'cocina', descripcion: 'Con guarnición de arroz y ensalada' },
    { nombre: 'Lomo Montado', precio: 42.00, area: 'cocina', descripcion: 'Lomo jugoso con 2 huevos fritos encima' },
    { nombre: 'Chicharrón de Cerdo', precio: 50.00, area: 'cocina', descripcion: 'Con mote, papa y llajua' },
    { nombre: 'Fricase Paceño', precio: 45.00, area: 'cocina', descripcion: 'Picante de cerdo con chuño y mote' },
    { nombre: 'Sopa de Maní', precio: 15.00, area: 'cocina', descripcion: 'Tradicional con costilla y papas fritas' },
    { nombre: 'Chairo Paceño', precio: 18.00, area: 'cocina', descripcion: 'Sopa espesa con chuño y trigo' },
    { nombre: 'Ají de Fideo', precio: 22.00, area: 'cocina', descripcion: 'Picante con carne molida y papa' },

    // EXTRAS (COCINA)
    { nombre: 'Porción Arroz', precio: 8.00, area: 'cocina', descripcion: 'Arroz blanco graneado' },
    { nombre: 'Porción Papas Fritas', precio: 12.00, area: 'cocina', descripcion: 'Papas bastón crocantes' },
    { nombre: 'Ensalada Mixta', precio: 10.00, area: 'cocina', descripcion: 'Lechuga, tomate y cebolla' },

    // BEBIDAS (BAR)
    { nombre: 'Coca Cola 2L', precio: 25.00, area: 'bar', descripcion: 'Botella retornable' },
    { nombre: 'Coca Cola Personal', precio: 8.00, area: 'bar', descripcion: 'Botella vidrio 300ml' },
    { nombre: 'Fanta Naranja 2L', precio: 25.00, area: 'bar', descripcion: 'Botella retornable' },
    { nombre: 'Sprite 2L', precio: 25.00, area: 'bar', descripcion: 'Botella retornable' },
    { nombre: 'Cerveza Huari', precio: 22.00, area: 'bar', descripcion: 'Botella 620ml' },
    { nombre: 'Cerveza Paceña Macanuda', precio: 28.00, area: 'bar', descripcion: 'Botella 710ml' },
    { nombre: 'Jugo del Valle (Durazno)', precio: 15.00, area: 'bar', descripcion: 'Cartón 1L' },
    { nombre: 'Agua Vital (Sin Gas)', precio: 8.00, area: 'bar', descripcion: 'Botella 500ml' },
    { nombre: 'Agua Vital (Con Gas)', precio: 8.00, area: 'bar', descripcion: 'Botella 500ml' },

    // TRAGOS (BAR)
    { nombre: 'Fernet Branca (Vaso)', precio: 25.00, area: 'bar', descripcion: 'Preparado con Coca Cola' },
    { nombre: 'Chuflay Singani', precio: 20.00, area: 'bar', descripcion: 'Singani con Ginger Ale y Limón' },
];

async function seedProducts() {
    console.log('Starting product seeding...');

    // Login as Admin to bypass RLS
    const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin_recuperacion@wendys.com',
        password: 'Password123!'
    });

    if (authError || !session) {
        console.error('Auth Error:', authError?.message);
        return;
    }

    let successCount = 0;

    for (const p of products) {
        // Check if exists
        const { data: existing } = await supabase
            .from('products')
            .select('id')
            .eq('nombre', p.nombre)
            .maybeSingle();

        if (existing) {
            console.log(`Skipping existing: ${p.nombre}`);
            continue;
        }

        const { error } = await supabase.from('products').insert({
            ...p,
            stock_actual: 50,
            controla_stock: true,
            disponible: true
        });

        if (error) console.error(`Error inserting ${p.nombre}:`, error.message);
        else {
            console.log(`Inserted: ${p.nombre}`);
            successCount++;
        }
    }

    console.log(`Seeding complete. Added ${successCount} new products.`);
}

seedProducts();
