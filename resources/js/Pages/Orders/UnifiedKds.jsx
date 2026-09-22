import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import dayjs from 'dayjs';

// Status colors based on the design
const STATUS_COLORS = {
    'Pending': 'bg-red-500', // Red for pending/needs action
    'Preparing': 'bg-amber-500', // Orange/Amber for in progress
    'Ready': 'bg-emerald-500', // Green for ready to go
};

// Order Type colors
const TYPE_COLORS = {
    'dinein': 'bg-cyan-600',
    'takeaway': 'bg-blue-600',
    'delivery': 'bg-indigo-600',
};

// Item Checkoff Component
const ItemCheckoff = () => {
    const [checked, setChecked] = useState(false);
    return (
        <div 
            onClick={() => setChecked(!checked)}
            className={`w-5 h-5 border-2 rounded-full cursor-pointer transition-all flex-shrink-0 ${checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 hover:border-emerald-500 hover:bg-emerald-50'}`}
        ></div>
    );
};

export default function UnifiedKds({ auth, orders: initialOrders, tenantId }) {
    const [orders, setOrders] = useState(initialOrders);
    const [filterType, setFilterType] = useState('All');
    
    useEffect(() => {
        setOrders(initialOrders);
    }, [initialOrders]);

    useEffect(() => {
        // Fallback auto-refresh poll every 5 seconds to guarantee update even if WebSocket drops
        const interval = setInterval(() => {
            router.reload({ only: ['orders'], preserveScroll: true, preserveState: true });
        }, 5000);

        if (!tenantId || !window.Echo) {
            return () => clearInterval(interval);
        }

        console.log("Listening for Echo events on KDS...", tenantId);
        const channel = window.Echo.private(`tenant.${tenantId}.orders`);
        
        channel.listen('OrderCreated', (e) => {
            console.log('OrderCreated', e);
            
            // Play audio ping
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(err => console.log('Audio play failed:', err));

            setOrders(prev => {
                if (prev.find(o => o.id === e.order.id)) return prev;
                return [...prev, e.order];
            });
        });

        channel.listen('OrderStatusUpdated', (e) => {
            console.log('OrderStatusUpdated', e);
            setOrders(prev => {
                if (e.order.status === 'Delivered') {
                    return prev.filter(o => o.id !== e.order.id);
                }
                return prev.map(o => o.id === e.order.id ? { ...o, status: e.order.status } : o);
            });
        });

        return () => {
            clearInterval(interval);
            if (window.Echo) {
                window.Echo.leave(`tenant.${tenantId}.orders`);
            }
        };
    }, [tenantId]);

    const handleStatusUpdate = (order, newStatus) => {
        // Optimistic UI update
        setOrders(prev => {
            if (newStatus === 'Delivered') {
                return prev.filter(o => o.id !== order.id);
            }
            return prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o);
        });

        router.patch(route('orders.status.update', order.id), { status: newStatus }, {
            preserveScroll: true,
            preserveState: true,
            onError: () => {
                // Revert on error
                setOrders(initialOrders);
            }
        });
    };

    const nextStatus = (current) => {
        if (current === 'Pending') return 'Preparing';
        if (current === 'Preparing') return 'Ready';
        if (current === 'Ready') return 'Delivered';
        return current;
    };

    const getOrderTypeClass = (type) => {
        return TYPE_COLORS[type?.toLowerCase()] || TYPE_COLORS['delivery'];
    };

    const formatTypeStrip = (order) => {
        const typeStr = order.type ? order.type.charAt(0).toUpperCase() + order.type.slice(1) : 'Delivery';
        if (order.type === 'dinein' && order.table_number) {
            return `Dine In - Table ${order.table_number}`;
        }
        if (order.type === 'delivery' && order.delivery_address) {
            return `Delivery - ${order.source === 'whatsapp' ? 'WA: ' : ''}${order.delivery_address.substring(0, 22)}...`;
        }
        return typeStr + (order.source === 'whatsapp' ? ' (WhatsApp)' : ' (POS)');
    };

    const filteredOrders = orders.filter(o => {
        if (filterType === 'All') return true;
        return o.type?.toLowerCase() === filterType.toLowerCase();
    });

    const columns = [
        {
            id: 'Pending',
            title: 'New Orders',
            subtitle: 'Awaiting Kitchen Action',
            badgeBg: 'bg-red-100 text-red-800 border-red-200',
            headerBg: 'bg-red-50 border-red-200 text-red-900',
            btnBg: 'bg-red-600 hover:bg-red-700 text-white',
            btnLabel: 'Start Preparing',
        },
        {
            id: 'Preparing',
            title: 'In Kitchen',
            subtitle: 'Actively Being Prepared',
            badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
            headerBg: 'bg-amber-50 border-amber-200 text-amber-900',
            btnBg: 'bg-amber-600 hover:bg-amber-700 text-white',
            btnLabel: 'Mark Ready',
        },
        {
            id: 'Ready',
            title: 'Ready for Delivery / Pickup',
            subtitle: 'Dispatch & Delivery Queue',
            badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            headerBg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
            btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
            btnLabel: 'Complete Order / Dispatch',
        },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="font-bold text-xl text-gray-900 leading-tight">Unified Kitchen Display System</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Real-time order workflow management</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <span className="font-black text-xs text-gray-600 uppercase tracking-wide">
                            {filteredOrders.length} Active Orders
                        </span>
                        <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
                            <button 
                                onClick={() => setFilterType('All')}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${filterType === 'All' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                All ({orders.length})
                            </button>
                            <button 
                                onClick={() => setFilterType('dinein')}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${filterType === 'dinein' ? 'bg-cyan-600 text-white shadow-sm' : 'text-gray-600 hover:text-cyan-800'}`}
                            >
                                Dine-In ({orders.filter(o => o.type?.toLowerCase() === 'dinein').length})
                            </button>
                            <button 
                                onClick={() => setFilterType('takeaway')}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${filterType === 'takeaway' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-blue-800'}`}
                            >
                                Takeaway ({orders.filter(o => o.type?.toLowerCase() === 'takeaway').length})
                            </button>
                            <button 
                                onClick={() => setFilterType('delivery')}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${filterType === 'delivery' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:text-indigo-800'}`}
                            >
                                Delivery ({orders.filter(o => o.type?.toLowerCase() === 'delivery').length})
                            </button>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Unified KDS" />

            <div className="py-6 min-h-[calc(100vh-140px)] bg-gray-100">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                    {/* 3 Kanban Workflow Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        {columns.map(col => {
                            const columnOrders = filteredOrders.filter(o => o.status === col.id);

                            return (
                                <div key={col.id} className="bg-gray-50 rounded-2xl border border-gray-200/80 overflow-hidden flex flex-col shadow-sm">
                                    {/* Column Header */}
                                    <div className={`p-4 border-b flex justify-between items-center ${col.headerBg}`}>
                                        <div>
                                            <h3 className="font-black text-sm uppercase tracking-wider">{col.title}</h3>
                                            <p className="text-[11px] opacity-75 font-medium">{col.subtitle}</p>
                                        </div>
                                        <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${col.badgeBg}`}>
                                            {columnOrders.length}
                                        </span>
                                    </div>

                                    {/* Orders List in Column */}
                                    <div className="p-3 space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
                                        {columnOrders.map(order => (
                                            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col transition-all hover:shadow-md">
                                                {/* Ticket Status & Time Header */}
                                                <div className={`${STATUS_COLORS[order.status] || 'bg-gray-500'} text-white px-3 py-2 flex justify-between items-center font-bold text-xs`}>
                                                    <span className="font-black tracking-wide">#{order.order_number}</span>
                                                    <span className="bg-black/20 px-2 py-0.5 rounded text-[10px]">
                                                        {dayjs(order.created_at).format('HH:mm')}
                                                    </span>
                                                </div>
                                                
                                                {/* Order Type Strip */}
                                                <div className={`${getOrderTypeClass(order.type)} text-white px-3 py-1.5 font-bold text-xs flex justify-between items-center`}>
                                                    <span>{formatTypeStrip(order)}</span>
                                                    <span className="font-black">Rs. {order.total_amount}</span>
                                                </div>

                                                {/* Items List */}
                                                <div className="p-3 flex-1 flex flex-col gap-2 bg-white">
                                                    {order.items?.map(item => (
                                                        <div key={item.id} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-b-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="bg-gray-100 text-gray-900 font-black text-xs px-2 py-0.5 rounded-md">
                                                                    {item.quantity}x
                                                                </span>
                                                                <span className="text-xs font-bold text-gray-800">
                                                                    {item.product?.name || 'Item'}
                                                                </span>
                                                            </div>
                                                            <ItemCheckoff />
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Customer details */}
                                                {order.customer_name && (
                                                    <div className="bg-amber-50/70 border-t border-amber-100 px-3 py-2 text-[11px] text-amber-900 font-semibold flex justify-between">
                                                        <span>Customer: <strong className="font-black">{order.customer_name}</strong></span>
                                                        {order.customer_phone && <span className="text-amber-700">{order.customer_phone}</span>}
                                                    </div>
                                                )}

                                                {/* Action Button */}
                                                <div className="p-2.5 bg-gray-50 border-t border-gray-100">
                                                    <button 
                                                        onClick={() => handleStatusUpdate(order, nextStatus(order.status))}
                                                        className={`w-full font-black text-xs py-2.5 px-3 rounded-lg transition-transform active:scale-[0.98] shadow-sm uppercase tracking-wider ${col.btnBg}`}
                                                    >
                                                        {col.btnLabel}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {columnOrders.length === 0 && (
                                            <div className="py-12 text-center text-gray-400 bg-white/60 rounded-xl border border-dashed border-gray-200">
                                                <p className="text-xs font-semibold">No orders in this stage</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
