import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';
import { Search, CheckCircle, Clock, Utensils, Beer, Bell } from 'lucide-react';
import { OrderProcessSteps } from '../../components/orders/OrderProcessSteps';
import { useToast, Toast } from '../../components/ui/Toast';

type OrderItem = Database['public']['Tables']['order_items']['Row'] & {
    products: Database['public']['Tables']['products']['Row'];
    orders: Database['public']['Tables']['orders']['Row'];
};

export default function WaiterOrderMonitor() {
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const { toast, showToast } = useToast();


    // NOTE: Audio and Global Notification logic moved to MainLayout.tsx

    useEffect(() => {
        fetchItems();

        const channel = supabase
            .channel('waiter_monitor')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'order_items' },
                () => {
                    fetchItems();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function fetchItems() {
        // Fetch active items (not fully delivered/cancelled)
        const { data } = await supabase
            .from('order_items')
            .select('*, products(*), orders(numero_mesa, garzon_id)')
            .in('estado', ['pendiente', 'en_preparacion', 'listo_para_servir']) // Waiter cares about these
            .order('created_at', { ascending: true }); // Oldest first

        if (data) {
            setItems(data as any);
        }
        setLoading(false);
    }

    const markAsDelivered = async (itemId: number) => {
        const { error } = await supabase
            .from('order_items')
            .update({ estado: 'entregado' })
            .eq('id', itemId);

        if (error) {
            showToast('Error al actualizar: ' + error.message, 'error');
        } else {
            showToast('¡Plato entregado!', 'success');
            fetchItems();
        }
    };

    const groupedItems = items.reduce((acc, item) => {
        const mesa = item.orders.numero_mesa;
        if (!acc[mesa]) acc[mesa] = [];
        acc[mesa].push(item);
        return acc;
    }, {} as Record<number, OrderItem[]>);

    if (loading) return <div className="p-8 animate-pulse text-gray-400">Cargando monitor...</div>;

    return (
        <div className="space-y-6 pb-20">
            <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => { }} />

            <div className="flex justify-between items-center bg-indigo-900 text-white p-6 rounded-2xl shadow-xl">
                <div>
                    <h1 className="text-2xl font-black italic tracking-tighter">MONITOR DE SALÓN</h1>
                    <p className="text-indigo-200 text-sm">Sigue el estado de tus pedidos en tiempo real</p>
                </div>
            </div>



            {/* Filter */}
            <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Filtrar por mesa o producto..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-none shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-500"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                />
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(groupedItems).map(([mesa, tableItems]) => {
                    // Filter logic
                    const filteredTableItems = tableItems.filter(i =>
                        i.products.nombre.toLowerCase().includes(filter.toLowerCase()) ||
                        mesa.toString().includes(filter)
                    );

                    if (filteredTableItems.length === 0) return null;

                    // Check if any is ready
                    const hasReadyItems = filteredTableItems.some(i => i.estado === 'listo_para_servir');

                    return (
                        <div key={mesa} className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden transition-all duration-300 ${hasReadyItems ? 'border-green-400 shadow-green-100 ring-4 ring-green-50' : 'border-gray-100'}`}>
                            {/* Header */}
                            <div className={`p-4 flex justify-between items-center ${hasReadyItems ? 'bg-green-50' : 'bg-gray-50'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="bg-white px-3 py-1 rounded-lg font-bold text-gray-800 shadow-sm border">
                                        MESA {mesa}
                                    </div>
                                    {hasReadyItems && (
                                        <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full animate-pulse">
                                            <Bell size={12} /> LISTO PARA SERVIR
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock size={12} />
                                    Hace {Math.floor((new Date().getTime() - new Date(tableItems[0].created_at).getTime()) / 60000)} min
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="p-4 space-y-6">
                                {filteredTableItems.map(item => {
                                    const isKitchen = item.products.area === 'cocina';
                                    const AreaIcon = isKitchen ? Utensils : Beer;
                                    const areaColorClass = isKitchen ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200';
                                    const textColorClass = isKitchen ? 'text-orange-900' : 'text-blue-900';
                                    const badgeColorClass = isKitchen ? 'bg-orange-200 text-orange-800' : 'bg-blue-200 text-blue-800';

                                    return (
                                        <div key={item.id} className={`relative p-3 rounded-xl border ${areaColorClass}`}>
                                            {/* Product Info */}
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex gap-3">
                                                    <span className={`${badgeColorClass} font-black px-2 rounded-lg text-lg min-w-[40px] text-center h-10 flex items-center justify-center shadow-sm`}>
                                                        {item.cantidad}
                                                    </span>
                                                    <div>
                                                        <h3 className={`font-bold leading-tight ${textColorClass} flex items-center gap-2`}>
                                                            {item.products.nombre}
                                                            <AreaIcon size={14} className="opacity-50" />
                                                        </h3>
                                                        {item.nota_especial && (
                                                            <p className="text-xs text-red-600 font-bold bg-white px-1 rounded border border-red-100 inline-block mt-1">
                                                                ⚠ {item.nota_especial}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Action Button for Ready Items */}
                                                {item.estado === 'listo_para_servir' && (
                                                    <button
                                                        onClick={() => markAsDelivered(item.id)}
                                                        className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 hover:scale-110 transition-all shadow-lg shadow-green-200 animate-bounce"
                                                        title="Marcar como Entregado"
                                                    >
                                                        <CheckCircle size={24} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* BPMN Visualizer */}
                                            <OrderProcessSteps status={item.estado} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {items.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border-dashed border-2">
                        <CheckCircle size={48} className="mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Todo Entregado</p>
                        <p className="text-sm">No hay pedidos pendientes en salón.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
