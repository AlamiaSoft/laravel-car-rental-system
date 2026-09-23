import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Menu as MenuIcon, X, Car, Calendar, MessageSquare, Phone, Clock, FileText, Sparkles } from 'lucide-react';

function getContrastColor(hexColor) {
    if (!hexColor || typeof hexColor !== 'string' || !hexColor.startsWith('#')) return '#ffffff';
    let hex = hexColor.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 160 ? '#0f172a' : '#ffffff';
}

export default function PwaLayout({ children, tenantName, tenantId, primaryColor = '#f59e0b', previewMode = false, maxWidth = 'max-w-xl' }) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [recentOrders, setRecentOrders] = useState([]);
    const [savedPhone, setSavedPhone] = useState('');
    const contrastColor = getContrastColor(primaryColor);

    // Load recent orders and saved customer phone from localStorage
    useEffect(() => {
        if (!tenantId) return;
        try {
            const saved = localStorage.getItem(`pwa_recent_orders_${tenantId}`);
            if (saved) {
                setRecentOrders(JSON.parse(saved));
            } else {
                setRecentOrders([]);
            }
            const phone = localStorage.getItem(`pwa_client_phone_${tenantId}`);
            if (phone) {
                setSavedPhone(phone);
            }
        } catch (e) {
            console.error('Failed to load local PWA data', e);
        }
    }, [isDrawerOpen, tenantId]);

    const bookingsUrl = savedPhone 
        ? `/app/${tenantId}/bookings?phone=${encodeURIComponent(savedPhone)}` 
        : `/app/${tenantId}/bookings`;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-start text-gray-900 dark:text-gray-100 font-sans">
            <Head>
                {tenantId && <link rel="manifest" href={`/app/${tenantId}/manifest.json`} />}
                <meta name="theme-color" content={primaryColor} />
            </Head>

            {/* Mobile shell container */}
            <div className={`w-full ${maxWidth} min-h-screen bg-white dark:bg-gray-900 shadow-xl flex flex-col relative`}>
                
                {/* Header */}
                <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        {/* Hamburger button */}
                        <button 
                            onClick={() => setIsDrawerOpen(true)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 focus:outline-none transition"
                            aria-label="Open menu"
                        >
                            <MenuIcon className="w-5 h-5" />
                        </button>
                        
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-black shadow-sm text-sm" style={{ backgroundColor: primaryColor, color: contrastColor }}>
                            <Car className="w-4 h-4" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                                {tenantName || 'Car Rental Agency'}
                            </h1>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Fleet Dispatch Enabled
                            </span>
                        </div>
                    </div>

                    {previewMode ? (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                            Live Preview
                        </span>
                    ) : (
                        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase text-gray-500 dark:text-gray-400">
                            Secure Portal
                        </div>
                    )}
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
                            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
                            onClick={() => setIsDrawerOpen(false)}
                        ></div>

                        {/* Drawer content */}
                        <div className="relative w-72 max-w-[80vw] h-full bg-white dark:bg-gray-800 shadow-2xl flex flex-col p-5 space-y-6 animate-slide-in">
                            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm" style={{ backgroundColor: primaryColor, color: contrastColor }}>
                                        <Car className="w-4 h-4" />
                                    </div>
                                    <span className="font-extrabold text-sm text-gray-900 dark:text-white truncate max-w-[150px]">{tenantName}</span>
                                </div>
                                <button 
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 focus:outline-none transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Nav Links */}
                            <nav className="flex-1 space-y-1.5 overflow-y-auto">
                                <a 
                                    href={`/app/${tenantId}/rent`}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 transition"
                                    onClick={() => setIsDrawerOpen(false)}
                                >
                                    <Car className="w-4 h-4" style={{ color: primaryColor }} />
                                    Explore Rental Fleet
                                </a>

                                <a 
                                    href={bookingsUrl}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 transition"
                                    onClick={() => setIsDrawerOpen(false)}
                                >
                                    <Calendar className="w-4 h-4 text-emerald-500" />
                                    My Bookings & Inquiries
                                </a>

                                <a 
                                    href={`https://wa.me/?text=Hello%20${encodeURIComponent(tenantName)}%2C%20I%20have%20an%20inquiry%20regarding%20car%20rental.`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 transition"
                                    onClick={() => setIsDrawerOpen(false)}
                                >
                                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                                    Chat on WhatsApp
                                </a>

                                {/* Recent Orders Section (if applicable) */}
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
                            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3">
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span>Fleet Dispatch 24/7 Available</span>
                                </div>
                                <div className="text-[11px] text-gray-400">
                                    Ormeasy Car Rental OS
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
