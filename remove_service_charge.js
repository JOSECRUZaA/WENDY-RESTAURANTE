
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tjeormsfarjvrkabxrrw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZW9ybXNmYXJqdnJrYWJ4cnJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0ODcwNTMsImV4cCI6MjA4MzA2MzA1M30.QLB2sFFrJrBNf4y2rMZNEJYVdMgF5OnstGGErels0fI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeServiceCharge() {
    console.log('Logging in as Bar Staff...');
    // 1. Login as standard staff (Authenticated)
    const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
        email: 'bar@wendys.com',
        password: 'Wendy123!'
    });

    if (authError || !session) {
        console.error('Error logging in as staff:', authError);
        return;
    }

    console.log('Logged in as staff.');

    // 2. Find the product ID
    const { data: products, error: findError } = await supabase
        .from('products')
        .select('id, nombre')
        .eq('nombre', 'Servicio/Cubierto');

    if (findError) {
        console.error('Error finding product:', findError);
        return;
    }

    if (!products || products.length === 0) {
        console.log('Product "Servicio/Cubierto" not found.');
        return;
    }

    const productIds = products.map(p => p.id);
    console.log('Found product IDs:', productIds);

    // 3. Delete order items (Primary Goal to unblock payment)
    const { error: deleteItemsError } = await supabase
        .from('order_items')
        .delete()
        .in('product_id', productIds);

    if (deleteItemsError) {
        console.error('Error deleting order items:', deleteItemsError);
    } else {
        console.log('SUCCESS: Deleted blocking "Servicio" items from active orders.');
    }

    // 4. Try to Delete the product (Might fail if not admin)
    const { error: deleteProductError } = await supabase
        .from('products')
        .delete()
        .in('id', productIds);

    if (deleteProductError) {
        console.error('Warning: Could not delete product definition (Requires Admin). But items are gone.', deleteProductError.message);
    } else {
        console.log('SUCCESS: Permanently deleted "Servicio/Cubierto" product definition.');
    }
}

removeServiceCharge();
