import React, { useState, useEffect } from 'react';
import { Menu as MenuIcon, X, UtensilsCrossed, Search, MapPin, Phone, Clock, FileText } from 'lucide-react';

export default function PwaLayout({ children, tenantName, tenantId }) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [recentOrders, setRecentOrders] = useState([]);

    // Load recent orders from localStorage for easy customer tracking
    useEffect(() => {
        if (!tenantId) return;
        try {
            const saved = localStorage.getItem(`pwa_recent_orders_${tenantId}`);
            if (saved) {
                setRecentOrders(JSON.parse(saved));
            } else {
                setRecentOrders([]);
            }
        } catch (e) {
            console.error('Failed to load recent orders', e);
        }
    }, [isDrawerOpen, tenantId]); // Reload when drawer opens or tenant changes

    return (
        <div className="min-h-screen bg-gray-150 flex flex-col items-center justify-start text-gray-900">
            {/* Mobile shell container */}
            <div className="w-full max-w-md min-h-screen bg-white shadow-xl flex flex-col relative pb-20">
                
                {/* Header */}
                <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Hamburger button */}
                        <button 
                            onClick={() => setIsDrawerOpen(true)}
                            className="p-1 hover:bg-gray-50 rounded-lg text-gray-600 focus:outline-none"
                            aria-label="Open menu"
                        >
                            <MenuIcon className="w-6 h-6" />
                        </button>
                        
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black shadow-sm text-sm">
                            {tenantName ? tenantName.charAt(0).toUpperCase() : 'R'}
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-gray-900 leading-tight">
                                {tenantName || 'Restaurant OS'}
                            </h1>
                            <span className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                Live Ordering Enabled
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase text-gray-500">
                        Secure Connection
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 flex flex-col">
                    {children}
                </main>

                {/* Side Drawer Menu */}
                {isDrawerOpen && (
                    <div className="fixed inset-0 z-50 flex justify-start">
                        {/* Backdrop */}
                        <div 
                            className="absolute inset-0 bg-black/55 transition-opacity"
                            onClick={() => setIsDrawerOpen(false)}
                        ></div>

                        {/* Drawer content */}
                        <div className="relative w-72 max-w-[80vw] h-full bg-white shadow-2xl flex flex-col p-5 space-y-6 animate-slide-in">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm">
                                        {tenantName ? tenantName.charAt(0).toUpperCase() : 'R'}
                                    </div>
                                    <span className="font-extrabold text-sm text-gray-900">{tenantName}</span>
                                </div>
                                <button 
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="p-1 hover:bg-gray-100 rounded-full text-gray-500 focus:outline-none"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Nav Links */}
                            <nav className="flex-1 space-y-1.5 overflow-y-auto">
                                <a 
                                    href={`/order/${tenantId}`}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50"
                                    onClick={() => setIsDrawerOpen(false)}
                                >
                                    <UtensilsCrossed className="w-4 h-4 text-gray-500" />
                                    Explore Menu
                                </a>

                                {/* Recent Orders Section */}
                                {recentOrders.length > 0 && (
                                    <div className="pt-4 space-y-2">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-3">
                                            Track Recent Orders
                                        </span>
                                        <div className="space-y-1">
                                            {recentOrders.map((ordNum) => (
                                                <a 
                                                    key={ordNum}
                                                    href={`/order/${tenantId}/track/${ordNum}`}
                                                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-indigo-600 hover:bg-indigo-50/50 font-bold"
                                                    onClick={() => setIsDrawerOpen(false)}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-3.5 h-3.5 text-indigo-500" />
                                                        <span>{ordNum}</span>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-medium">Track ➔</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </nav>

                            {/* Contact Footer */}
                            <div className="border-t border-gray-100 pt-4 space-y-3">
                                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span>Open: 12:00 PM - 11:00 PM</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span>Call Business</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
