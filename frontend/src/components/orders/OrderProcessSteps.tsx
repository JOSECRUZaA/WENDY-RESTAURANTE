import { CheckCircle, ChefHat, ClipboardList, Utensils } from 'lucide-react';
import type { Database } from '../../types/database.types';

type ItemStatus = Database['public']['Tables']['order_items']['Row']['estado'];

export function OrderProcessSteps({ status }: { status: ItemStatus }) {

    // Status Logic mapping
    // 1: Pendiente
    // 2: En Preparación
    // 3: Listo para Servir
    // 4: Entregado

    const getStep = (current: ItemStatus) => {
        switch (current) {
            case 'pendiente': return 1;
            case 'en_preparacion': return 2;
            case 'listo_para_servir': return 3;
            case 'entregado': return 4;
            case 'cancelado': return -1;
            default: return 0;
        }
    };

    const currentStep = getStep(status);

    if (currentStep === -1) {
        return (
            <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold text-center">
                CANCELADO
            </div>
        );
    }

    const steps = [
        { id: 1, label: 'Pendiente', icon: ClipboardList },
        { id: 2, label: 'Cocina', icon: ChefHat },
        { id: 3, label: 'Listo', icon: Utensils },
        { id: 4, label: 'Entregado', icon: CheckCircle },
    ];

    return (
        <div className="relative flex items-center justify-between w-full mt-2">
            {/* Connecting Line - Background */}
            <div className="absolute top-[30%] left-0 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>

            {/* Connecting Line - Progress */}
            <div
                className="absolute top-[30%] left-0 h-1 bg-green-500 -z-10 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            ></div>

            {steps.map((step) => {
                const isActive = currentStep >= step.id;
                const isCurrent = currentStep === step.id;

                return (
                    <div key={step.id} className="flex flex-col items-center gap-1 bg-white px-1">
                        <div
                            className={`
                                w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                ${isActive ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-400'}
                                ${isCurrent ? 'ring-4 ring-green-100 scale-110 shadow-lg' : ''}
                            `}
                        >
                            <step.icon size={14} strokeWidth={3} />
                        </div>
                        <span className={`text-[10px] font-bold uppercase transition-colors ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
