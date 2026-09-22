import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useEffect } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function Kds({ auth, orders, tenantId }) {

    useEffect(() => {
        if (!tenantId || !window.Echo) return;

        const channel = window.Echo.private(`tenant.${tenantId}.orders`);

        channel.listen('OrderCreated', (e) => {
            // Play audio ping
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(e => console.log('Audio play failed:', e));
            
            router.reload({ only: ['orders'], preserveScroll: true });
        });

        channel.listen('OrderStatusUpdated', (e) => {
            router.reload({ only: ['orders'], preserveScroll: true });
        });

        return () => {
            if (window.Echo) {
                window.Echo.leave(`tenant.${tenantId}.orders`);
            }
        };
    }, [tenantId]);

    const updateStatus = (orderId, newStatus) => {
        router.patch(route('orders.status.update', orderId), { status: newStatus }, {
            preserveScroll: true
        });
    };

    const columns = [
        { id: 'Pending', label: 'New Orders', bgColor: 'bg-red-50', borderColor: 'border-red-200', headerColor: 'bg-red-100 text-red-800' },
        { id: 'Preparing', label: 'In Kitchen', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', headerColor: 'bg-yellow-100 text-yellow-800' },
        { id: 'Ready', label: 'Ready for Pickup/Delivery', bgColor: 'bg-green-50', borderColor: 'border-green-200', headerColor: 'bg-green-100 text-green-800' }
    ];

    const getOrderCards = (status) => {
        return orders.filter(o => o.status === status).map(order => (
            <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                            {order.order_number}
                        </span>
                        <div className="mt-1 text-xs text-gray-500">
                            {dayjs(order.created_at).fromNow()}
                        </div>
                    </div>
                    <div className="text-sm font-bold text-gray-900">Rs {order.total_amount}</div>
                </div>

                <div className="text-sm text-gray-800 font-medium">
                    {order.customer_name}
                    <div className="text-xs text-gray-500 font-normal">{order.customer_phone}</div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex gap-2 justify-end">
                    {status === 'Pending' && (
                        <button onClick={() => updateStatus(order.id, 'Preparing')} className="text-xs px-3 py-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition">
                            Start Preparing
                        </button>
                    )}
                    {status === 'Preparing' && (
                        <button onClick={() => updateStatus(order.id, 'Ready')} className="text-xs px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition">
                            Mark Ready
                        </button>
                    )}
                    {status === 'Ready' && (
                        <button onClick={() => updateStatus(order.id, 'Delivered')} className="text-xs px-3 py-1.5 bg-gray-800 text-white rounded hover:bg-gray-900 transition">
                            Complete Order
                        </button>
                    )}
                </div>
            </div>
        ));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Kitchen Display System</h2>}
        >
            <Head title="KDS" />

            <div className="py-8 h-[calc(100vh-130px)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col">
                    
                    <div className="flex-1 flex gap-6 overflow-hidden">
                        {columns.map(col => (
                            <div key={col.id} className={`flex-1 flex flex-col rounded-xl border ${col.borderColor} ${col.bgColor} overflow-hidden`}>
                                <div className={`px-4 py-3 border-b ${col.borderColor} ${col.headerColor} font-semibold flex justify-between items-center`}>
                                    {col.label}
                                    <span className="bg-white/50 text-xs px-2 py-0.5 rounded-full">
                                        {orders.filter(o => o.status === col.id).length}
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4">
                                    {getOrderCards(col.id)}
                                    {orders.filter(o => o.status === col.id).length === 0 && (
                                        <div className="text-center py-8 text-sm text-gray-400 italic">
                                            No {col.id.toLowerCase()} orders
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
