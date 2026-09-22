import React, { useState, useEffect } from 'react';
import PwaLayout from '@/Layouts/PwaLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    Clock, 
    Utensils, 
    Truck, 
    CheckCircle2, 
    FileText, 
    Home, 
    ChevronRight,
    Repeat 
} from 'lucide-react';

export default function OrderTracking({ tenant, order }) {
    const [orderStatus, setOrderStatus] = useState(order.status);

    useEffect(() => {
        if (!window.Echo) {
            console.warn('Laravel Echo is not initialized.');
            return;
        }

        const channelName = `orders.${order.order_number}`;
        console.log(`Subscribing to public channel: ${channelName}`);

        const channel = window.Echo.channel(channelName);
        channel.listen('OrderStatusUpdated', (event) => {
            console.log('Order status update received:', event);
            if (event.order && event.order.status) {
                setOrderStatus(event.order.status);
            }
        });

        return () => {
            console.log(`Unsubscribing from channel: ${channelName}`);
            window.Echo.leave(channelName);
        };
    }, [order.order_number]);

    // Status map
    const statuses = ['Pending', 'Preparing', 'Ready', 'Delivered'];
    const currentStepIndex = statuses.indexOf(orderStatus);

    const stepLabels = {
        Pending: 'Order Received',
        Preparing: 'Preparing in Kitchen',
        Ready: 'Out for Delivery / Ready',
        Delivered: 'Completed & Delivered',
    };

    const stepIcons = {
        Pending: Clock,
        Preparing: Utensils,
        Ready: Truck,
        Delivered: CheckCircle2,
    };

    return (
        <PwaLayout tenantName={tenant.name} tenantId={tenant.id}>
            <Head title={`Track Order ${order.order_number}`} />

            <div className="flex-1 bg-white p-5 space-y-6 flex flex-col justify-between">
                <div className="space-y-6">
                    {/* Top Order Meta */}
                    <div className="bg-gray-50 border border-gray-150 rounded-xl p-4 text-center space-y-1.5 shadow-sm">
                        <span className="text-[9px] uppercase font-black tracking-widest text-gray-400">Order Reference</span>
                        <div className="flex items-center justify-center gap-1.5 text-gray-900">
                            <FileText className="w-4 h-4 text-indigo-500" />
                            <h2 className="text-base font-black tracking-wide">{order.order_number}</h2>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium">Estimated arrival in 30-40 minutes</p>
                    </div>

                    {/* Progress Track Stepper */}
                    <div className="relative pl-8 space-y-8 before:absolute before:inset-y-1 before:left-[11px] before:w-[2px] before:bg-gray-100">
                        {statuses.map((status, index) => {
                            const isCompleted = index < currentStepIndex;
                            const isActive = index === currentStepIndex;
                            const IconComponent = stepIcons[status];

                            return (
                                <div key={status} className="relative flex items-start gap-4">
                                    {/* Indicator Circle */}
                                    <div
                                        className={`absolute -left-[27px] w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                                            isCompleted
                                                ? 'bg-green-500 border-green-500 text-white'
                                                : isActive
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                                : 'bg-white border-gray-200 text-gray-400'
                                        }`}
                                    >
                                        <IconComponent className="w-3.5 h-3.5" />
                                    </div>

                                    {/* Label details */}
                                    <div>
                                        <h3
                                            className={`text-xs font-bold ${
                                                isActive ? 'text-gray-900 font-black' : 'text-gray-500'
                                            }`}
                                        >
                                            {stepLabels[status]}
                                        </h3>
                                        {isActive && (
                                            <p className="text-[11px] text-gray-400 mt-0.5 font-medium">
                                                Our team is actively processing your order.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Back to menu & Reorder buttons */}
                <div className="space-y-4">
                    <div className="border-t border-gray-100 pt-4 flex justify-between text-xs font-bold text-gray-500">
                        <span>Grand Total</span>
                        <span className="text-indigo-600 font-black">Rs. {order.total_amount}</span>
                    </div>

                    <div className="space-y-2.5">
                        <Link
                            href={route('pwa.menu', { tenant_slug: tenant.id })}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        >
                            <Repeat className="w-4 h-4" /> Reorder / Browse Menu
                        </Link>
                        <Link
                            href={route('pwa.menu', { tenant_slug: tenant.id })}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-700 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-gray-100 transition-colors"
                        >
                            <Home className="w-4 h-4 text-gray-500" /> Return to Home
                        </Link>
                    </div>
                </div>
            </div>
        </PwaLayout>
    );
}
