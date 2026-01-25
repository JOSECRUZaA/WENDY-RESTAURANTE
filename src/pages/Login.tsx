import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ChefHat } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { user, profile, loading: authLoading } = useAuth(); // Get auth state

    useEffect(() => {
        if (user && profile) {
            navigate('/');
        }
    }, [user, profile, navigate]);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
                    <p className="text-gray-500 font-medium">Verificando sesión...</p>
                </div>
            </div>
        );
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // AUTO-APPEND DOMAIN for simple usernames
            const emailInput = username.trim();
            const email = emailInput.includes('@')
                ? emailInput
                : `${emailInput.toUpperCase()}@wendys.system`;

            // CREATE A TIMEOUT PROMISE
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Tiempo de espera agotado. Revisa tu conexión.')), 10000);
            });

            // LOGIN REQUEST
            const loginPromise = supabase.auth.signInWithPassword({
                email,
                password,
            });

            const result = await Promise.race([loginPromise, timeoutPromise]);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: authData, error: authError } = result as any;

            if (authError) {
                throw authError; // Throw to catch block
            }

            if (authData.user) {
                // CHECK ACTIVE STATUS
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('activo')
                    .eq('id', authData.user.id)
                    .single();

                if (profileError) {
                    // If profile doesn't exist, we still allow login to let AuthContext handle the "Profile Error" screen
                    // taking user to the "Error de Perfil" page is better than blocking here.
                    console.warn('Profile check failed, proceeding anyway:', profileError);
                }

                if (profile && profile.activo === false) {
                    await supabase.auth.signOut();
                    throw new Error('Este usuario ha sido desactivado. Contacte al administrador.');
                }

                // Success - Navigation handled by useEffect or navigate
                navigate('/');
            }
        } catch (err) {
            console.error('Login error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido al iniciar sesión';
            setError(errorMessage);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4 text-white">
                        <ChefHat size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Wendy's Restaurante</h1>
                    <p className="text-gray-500">Inicia sesión para continuar</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all uppercase"
                            placeholder="Ej. JCRUZ"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 text-white font-semibold py-2.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Entrando...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
}
