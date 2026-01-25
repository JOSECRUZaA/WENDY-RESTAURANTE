/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Toast, useToast } from '../../components/ui/Toast';
import type { Database } from '../../types/database.types';
import {
    Lock,
    Unlock,
    Calculator,
    Wallet,
    TrendingUp,
    CreditCard,
    AlertTriangle,
    CheckCircle,
    Banknote
} from 'lucide-react';

type CashSession = Database['public']['Tables']['cash_sessions']['Row'];

export default function CashSession() {
    const { profile } = useAuth();
    const [session, setSession] = useState<CashSession | null>(null);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(true);

    const { toast, showToast, hideToast } = useToast();

    // Closing metrics
    const [metrics, setMetrics] = useState({
        totalSales: 0,
        cashSales: 0,
        digitalSales: 0,
        count: 0
    });

    async function fetchCurrentSession() {
        if (!profile) return;
        const { data } = await supabase
            .from('cash_sessions')
            .select('*')
            .eq('cajero_id', profile.id)
            .eq('estado', 'abierta')
            .maybeSingle();

        setSession(data);
        setLoading(false);
    }

    async function fetchClosingMetrics(currentSession: CashSession) {
        const { data: sales } = await supabase
            .from('orders')
            .select('total, metodo_pago')
            .eq('cajero_id', currentSession.cajero_id)
            .eq('estado', 'pagado')
            .gte('updated_at', currentSession.opened_at);

        if (sales) {
            const cash = sales
                .filter(o => o.metodo_pago === 'efectivo')
                .reduce((acc, o) => acc + o.total, 0);

            const digital = sales
                .filter(o => ['tarjeta', 'qr', 'transferencia'].includes(o.metodo_pago || ''))
                .reduce((acc, o) => acc + o.total, 0);

            setMetrics({
                totalSales: cash + digital,
                cashSales: cash,
                digitalSales: digital,
                count: sales.length
            });
        }
    }

    useEffect(() => {
        if (profile) fetchCurrentSession();
    }, [profile]);

    // When session is active, fetch metrics for closing preview
    useEffect(() => {
        if (session && session.estado === 'abierta') {
            fetchClosingMetrics(session);
        }
    }, [session]);

    const handleOpenSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        setLoading(true);

        const { data, error } = await supabase
            .from('cash_sessions')
            .insert({
                cajero_id: profile.id,
                monto_apertura: parseFloat(amount),
                estado: 'abierta' as const
            })
            .select()
            .single();

        if (error) {
            showToast('Error al abrir caja: ' + error.message, 'error');
        } else {
            setSession(data);
            setAmount('');
            showToast('Caja abierta correctamente', 'success');
        }
        setLoading(false);
    };

    const handleCloseSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) return;
        setLoading(true);

        // SECURITY CHECK: Ensure all tables are closed before closing cash
        const { count } = await supabase
            .from('mesas')
            .select('*', { count: 'exact', head: true })
            .neq('estado', 'libre');

        if (count && count > 0) {
            showToast(`⛔ NO SE PUEDE CERRAR CAJA. Hay ${count} mesas ocupadas via modal.`, 'error');
            // We might want to use a modal here later, but Toast is better than alert for now.
            // Actually, for "Blocked", a Toast error is fine.
            setLoading(false);
            return;
        }

        const expectedCash = session.monto_apertura + metrics.cashSales;

        const { data, error } = await supabase
            .from('cash_sessions')
            .update({
                monto_cierre: parseFloat(amount),
                monto_sistema: expectedCash,
                estado: 'cerrada' as const,
                closed_at: new Date().toISOString()
            })
            .eq('id', session.id)
            .select()
            .single();

        if (error) {
            showToast('Error al cerrar caja: ' + error.message, 'error');
        } else {
            setSession(null);
            const diff = data.diferencia || 0;
            const diffMsg = diff === 0
                ? 'Caja cuadrada perfectamente.'
                : diff > 0
                    ? `Sobrante de Bs ${diff.toFixed(2)}.`
                    : `Faltante de Bs ${Math.abs(diff).toFixed(2)}.`;

            // Use 'info' for difference, 'success' for perfect match
            const type = diff === 0 ? 'success' : 'info';
            showToast(`Caja cerrada. ${diffMsg}`, type);
        }
        setLoading(false);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
    );

    const expectedTotal = session ? session.monto_apertura + metrics.cashSales : 0;
    const currentDiff = amount ? parseFloat(amount) - expectedTotal : -expectedTotal;

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
                        <Wallet className="text-gray-900" size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Gestión de Caja</h1>
                        <p className="text-gray-500 font-medium">Control de turno y arqueo de efectivo</p>
                    </div>
                </div>

                {!session ? (
                    // OPEN SESSION FORM
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden max-w-lg mx-auto transform transition-all hover:scale-[1.01] duration-300">
                        <div className="bg-gray-900 p-8 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Unlock size={120} className="text-white transform rotate-12" />
                            </div>
                            <div className="relative z-10">
                                <span className="inline-flex items-center justify-center p-4 bg-green-500 rounded-2xl mb-6 shadow-lg shadow-green-900/50">
                                    <Unlock size={32} className="text-white" />
                                </span>
                                <h2 className="text-3xl font-black text-white mb-2">Apertura de Caja</h2>
                                <p className="text-gray-400">Inicia tu turno registrando el monto base de efectivo.</p>
                            </div>
                        </div>

                        <form onSubmit={handleOpenSession} className="p-8 space-y-8">
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Monto Inicial en Efectivo</label>
                                <div className="relative group">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-2xl group-focus-within:text-gray-900 transition-colors">Bs</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        className="w-full pl-16 pr-6 py-6 text-4xl font-black rounded-2xl border-2 border-gray-100 focus:border-gray-900 focus:ring-0 outline-none transition-all bg-gray-50 focus:bg-white placeholder-gray-300"
                                        placeholder="0.00"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !amount}
                                className="w-full bg-gray-900 text-white font-bold py-5 rounded-2xl text-lg shadow-xl hover:bg-black hover:transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
                            >
                                <TrendingUp size={24} />
                                Abrir Caja y Comenzar Turno
                            </button>
                        </form>
                    </div>
                ) : (
                    // CLOSE SESSION FORM
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* LEFT: INFO & METRICS */}
                        <div className="space-y-6">
                            {/* Session Info Card */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Turno Activo</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-gray-500 font-medium text-sm mb-1">Iniciado a las</p>
                                        <p className="text-2xl font-black text-gray-900">
                                            {new Date(session.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-500 font-medium text-sm mb-1">Monto Apertura</p>
                                        <p className="text-xl font-bold text-gray-900">Bs {session.monto_apertura.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 hover:border-blue-300 transition-colors group">
                                    <div className="flex items-center gap-3 mb-2 text-gray-500 group-hover:text-blue-600 transition-colors">
                                        <Banknote size={20} />
                                        <span className="font-bold text-xs uppercase">Ventas Efectivo</span>
                                    </div>
                                    <p className="text-3xl font-black text-gray-800">Bs {metrics.cashSales.toFixed(2)}</p>
                                </div>

                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 hover:border-purple-300 transition-colors group">
                                    <div className="flex items-center gap-3 mb-2 text-gray-500 group-hover:text-purple-600 transition-colors">
                                        <CreditCard size={20} />
                                        <span className="font-bold text-xs uppercase">Digital / QR</span>
                                    </div>
                                    <p className="text-3xl font-black text-gray-800">Bs {metrics.digitalSales.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Total Expected Card */}
                            <div className="bg-gray-900 p-8 rounded-3xl shadow-xl relative overflow-hidden text-white">
                                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                                    <Wallet size={200} />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-2">Total Esperado en Caja</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black tracking-tight">Bs {expectedTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-2 text-sm text-gray-400">
                                        <Calculator size={16} />
                                        <span>Sumatoria de Apertura + Ventas en Efectivo</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: CLOSING FORM */}
                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 h-fit">
                            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
                                <div className="p-4 bg-red-50 text-red-600 rounded-2xl">
                                    <Lock size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">Arqueo y Cierre</h2>
                                    <p className="text-gray-500">Cuenta el dinero físico e ingrésalo.</p>
                                </div>
                            </div>

                            <form onSubmit={handleCloseSession} className="space-y-8">
                                <div>
                                    <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Efectivo Contado (Físico)</label>
                                    <div className="relative group">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-2xl group-focus-within:text-gray-900 transition-colors">Bs</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            required
                                            value={amount}
                                            onChange={e => setAmount(e.target.value)}
                                            className="w-full pl-16 pr-6 py-6 text-4xl font-black rounded-2xl border-2 border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all bg-gray-50 focus:bg-white text-right"
                                            placeholder="0.00"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {/* LIVE DIFFERENCE INDICATOR */}
                                <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${amount === '' ? 'bg-gray-50 border-gray-100 opacity-50' :
                                    Math.abs(currentDiff) < 0.5
                                        ? 'bg-green-50 border-green-200 text-green-900'
                                        : currentDiff > 0
                                            ? 'bg-blue-50 border-blue-200 text-blue-900'
                                            : 'bg-red-50 border-red-200 text-red-900'
                                    }`}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold uppercase text-xs tracking-widest opacity-70">
                                            {Math.abs(currentDiff) < 0.5 ? 'Estado' : 'Diferencia'}
                                        </span>
                                        {amount !== '' && (
                                            Math.abs(currentDiff) < 0.5
                                                ? <CheckCircle size={24} className="text-green-600" />
                                                : <AlertTriangle size={24} className={currentDiff > 0 ? "text-blue-600" : "text-red-600"} />
                                        )}
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-lg font-bold">
                                            {amount === '' ? 'Esperando conteo...' :
                                                Math.abs(currentDiff) < 0.5 ? 'BALANCE CORRECTO' :
                                                    currentDiff > 0 ? 'SOBRA DINERO' : 'FALTA DINERO'}
                                        </span>
                                        {amount !== '' && Math.abs(currentDiff) >= 0.5 && (
                                            <span className="text-3xl font-black tracking-tight">
                                                {currentDiff > 0 ? '+' : ''}{currentDiff.toFixed(2)} <span className="text-lg font-bold opacity-50">Bs</span>
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || amount === ''}
                                    className="w-full bg-red-600 text-white font-bold py-5 rounded-2xl text-xl shadow-xl shadow-red-100 hover:shadow-2xl hover:bg-black hover:-translate-y-1 active:translate-y-0 active:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all flex items-center justify-center gap-3"
                                >
                                    <Lock size={24} />
                                    Confirmar Cierre Final
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
