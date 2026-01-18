import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';

type Product = Database['public']['Tables']['products']['Row'];
type ProductionArea = Product['area'];

interface ActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    product?: Product | null;
    onSave: () => void;
}

function ProductModal({ isOpen, onClose, product, onSave }: ActionModalProps) {
    const [formData, setFormData] = useState<Partial<Product>>({
        nombre: '',
        descripcion: '',
        precio: 0,
        area: 'cocina',
        controla_stock: false,
        stock_actual: 0,
        disponible: true,
        foto_url: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData(product);
        } else {
            setFormData({
                nombre: '',
                descripcion: '',
                precio: 0,
                area: 'cocina',
                controla_stock: false,
                stock_actual: 0,
                disponible: true,
                foto_url: ''
            });
        }
    }, [product, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (product?.id) {
                await supabase
                    .from('products')
                    .update(formData)
                    .eq('id', product.id);
            } else {
                await supabase
                    .from('products')
                    .insert(formData as any);
            }
            onSave();
            onClose();
        } catch (error) {
            alert('Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-lg w-full p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">{product ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nombre</label>
                        <input
                            className="w-full border rounded-lg p-2"
                            value={formData.nombre}
                            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Precio (Bs)</label>
                        <input
                            type="number"
                            step="0.50"
                            className="w-full border rounded-lg p-2"
                            value={formData.precio}
                            onChange={e => setFormData({ ...formData, precio: parseFloat(e.target.value) })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Link de Imagen</label>
                        <input
                            type="text" // URL input
                            placeholder="https://ejemplo.com/imagen.jpg"
                            className="w-full border rounded-lg p-2"
                            value={formData.foto_url || ''}
                            onChange={e => setFormData({ ...formData, foto_url: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-1">Pega aquí el enlace de la imagen del producto.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Área</label>
                            <select
                                className="w-full border rounded-lg p-2"
                                value={formData.area}
                                onChange={e => setFormData({ ...formData, area: e.target.value as ProductionArea })}
                            >
                                <option value="cocina">Cocina</option>
                                <option value="bar">Bar</option>
                                <option value="otro">Otro</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 mt-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.controla_stock}
                                    onChange={e => setFormData({ ...formData, controla_stock: e.target.checked })}
                                    className="w-4 h-4 text-red-600 rounded"
                                />
                                <span className="text-sm font-medium">Controlar Stock</span>
                            </label>
                        </div>
                    </div>

                    {formData.controla_stock && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Stock Actual</label>
                            <input
                                type="number"
                                className="w-full border rounded-lg p-2"
                                value={formData.stock_actual}
                                onChange={e => setFormData({ ...formData, stock_actual: parseInt(e.target.value) })}
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function ProductManagement() {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        const { data } = await supabase.from('products').select('*').order('nombre');
        setProducts(data || []);
    }

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;
        await supabase.from('products').delete().eq('id', id);
        fetchProducts();
    };

    const filteredProducts = products.filter(p =>
        p.nombre.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
                <button
                    onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700"
                >
                    <Plus size={20} /> Nuevo Producto
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-gray-700">Imagen</th>
                                <th className="px-6 py-3 font-semibold text-gray-700">Nombre</th>
                                <th className="px-6 py-3 font-semibold text-gray-700">Precio</th>
                                <th className="px-6 py-3 font-semibold text-gray-700">Área</th>
                                <th className="px-6 py-3 font-semibold text-gray-700">Orden</th>
                                <th className="px-6 py-3 font-semibold text-gray-700 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredProducts.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        {product.foto_url ? (
                                            <img src={product.foto_url} alt={product.nombre} className="w-10 h-10 object-cover rounded-lg" />
                                        ) : (
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">Sin img</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">{product.nombre}</td>
                                    <td className="px-6 py-4 font-bold">Bs {product.precio}</td>
                                    <td className="px-6 py-4 capitalize">{product.area}</td>
                                    <td className="px-6 py-4">
                                        {product.controla_stock ? (
                                            <span className={`px-2 py-1 rounded text-xs ${product.stock_actual > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {product.stock_actual} unids.
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-sm">N/A</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button
                                            onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={editingProduct}
                onSave={fetchProducts}
            />
        </div>
    );
}
