import { X } from 'lucide-react';

interface PromptModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    value: string;
    onChange: (value: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
    inputType?: 'text' | 'password' | 'email' | 'number';
    placeholder?: string;
}

export default function PromptModal({
    isOpen,
    title,
    message,
    value,
    onChange,
    onConfirm,
    onCancel,
    inputType = 'text',
    placeholder = ''
}: PromptModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60] animate-in fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <p className="text-gray-600 mb-4">{message}</p>

                <input
                    type={inputType}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all mb-6"
                    placeholder={placeholder}
                    autoFocus
                />

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-md"
                    >
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
}
