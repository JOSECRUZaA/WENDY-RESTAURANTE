
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tjeormsfarjvrkabxrrw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZW9ybXNmYXJqdnJrYWJ4cnJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0ODcwNTMsImV4cCI6MjA4MzA2MzA1M30.QLB2sFFrJrBNf4y2rMZNEJYVdMgF5OnstGGErels0fI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceRemoveServiceCharge() {
    console.log('Logging in as Bar Staff...');
    // 1. Login
    const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
        email: 'bar@wendys.com',
        password: 'Wendy123!'
    });

    if (authError || !session) {
        console.error('Error logging in:', authError);
        return;
    }
    console.log('Logged in.');

    // 2. Find ANY product looking like Servicio or Cubierto
    const { data: products1 } = await supabase.from('products').select('id, nombre').ilike('nombre', '%Servicio%');
    const { data: products2 } = await supabase.from('products').select('id, nombre').ilike('nombre', '%Cubierto%');

    const allProducts = [...(products1 || []), ...(products2 || [])];

    // Deduplicate manually without TS ! operator
    const seen = new Set();
    const uniqueProducts = allProducts.filter(p => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
    });

    if (uniqueProducts.length === 0) {
        console.log('No specific "Servicio" products found in DB query.');
    } else {
        console.log('Found suspicious products:', uniqueProducts.map(p => `${p.id}: ${p.nombre}`));

        const ids = uniqueProducts.map(p => p.id);

        // 3. Delete Items
        const { error: delItemsErr } = await supabase.from('order_items').delete().in('product_id', ids);
        if (delItemsErr) console.error('Error deleting items:', delItemsErr);
        else console.log('Deleted items for suspicious products.');

        // 4. Delete Products
        const { error: delProdErr } = await supabase.from('products').delete().in('id', ids);
        if (delProdErr) console.error('Error deleting products:', delProdErr);
        else console.log('Deleted suspicious products.');
    }
}

forceRemoveServiceCharge();
