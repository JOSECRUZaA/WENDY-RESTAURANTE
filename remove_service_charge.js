
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, 'frontend', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // For admin tasks usually requires Service Role but let's try with Anon if RLS permits or ask user to run SQL. 
// Wait, RLS on products allows ALL for admin. Order items allow authenticated.
// The user is likely not authenticated in this script unless I sign in. 
// I will reuse the login logic from create_staff_users.js or just assume the user will run this via SQL editor.
// BETTER: Provide the SQL query for them to run in Supabase Dashboard SQL Editor, OR try to login as admin to run it.
// Let's try Node script first with admin login.

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeServiceCharge() {
    // 1. Login as admin to have permissions
    const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin_recuperacion@wendys.com', // Using the admin we created/know
        password: 'Password123!'
    });

    if (authError || !session) {
        console.error('Error logging in as admin:', authError);
        return;
    }

    console.log('Logged in as admin.');

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
        console.log('Product "Servicio/Cubierto" not found. It might have consistently been deleted.');
        return;
    }

    const productIds = products.map(p => p.id);
    console.log('Found product IDs to delete:', productIds);

    // 3. Delete order items first (Foreign Key constraint usually requires this, though cascade might handle it)
    // But let's be safe.
    const { error: deleteItemsError } = await supabase
        .from('order_items')
        .delete()
        .in('product_id', productIds);

    if (deleteItemsError) {
        console.error('Error deleting order items:', deleteItemsError);
    } else {
        console.log('Deleted associated order items.');
    }

    // 4. Delete the product
    const { error: deleteProductError } = await supabase
        .from('products')
        .delete()
        .in('id', productIds);

    if (deleteProductError) {
        console.error('Error deleting product:', deleteProductError);
    } else {
        console.log('Successfully deleted "Servicio/Cubierto" product.');
    }
}

removeServiceCharge();
