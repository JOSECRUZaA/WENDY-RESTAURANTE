import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
    const { profile } = useAuth();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">
                Bienvenido, {profile?.nombre_completo.split(' ')[0]} 👋
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Rol Actual</h3>
                    <p className="text-2xl font-bold text-gray-800 capitalize mt-2">{profile?.rol}</p>
                </div>

                {/* Placeholder stats */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Estado del Sistema</h3>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                        <p className="text-xl font-semibold text-gray-800">En Línea</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
