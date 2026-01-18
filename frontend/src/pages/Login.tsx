import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChefHat } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // AUTO-APPEND DOMAIN for simple usernames
        const email = username.includes('@')
            ? username
            : `${username.toUpperCase().trim()}@wendys.system`;

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        if (authData.user) {
            // CHECK ACTIVE STATUS
            const { data: profile } = await supabase
                .from('profiles')
                .select('activo')
                .eq('id', authData.user.id)
                .single();

            if (profile && profile.activo === false) {
                await supabase.auth.signOut();
                setError('Este usuario ha sido desactivado. Contacte al administrador.');
                setLoading(false);
            } else {
                navigate('/');
            }
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
