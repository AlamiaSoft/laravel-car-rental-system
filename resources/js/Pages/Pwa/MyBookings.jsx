import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import PwaLayout from '@/Layouts/PwaLayout';
import { 
    Calendar, 
    Car, 
    Clock, 
    Search, 
    CheckCircle, 
    AlertCircle, 
    MessageSquare, 
    User, 
    ArrowLeft, 
    Fuel, 
    ChevronRight,
    RefreshCw,
    ShieldCheck
} from 'lucide-react';

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

export default function MyBookings({ tenant, phone = '', requests = [], bookings = [], settings, previewMode = false }) {
    const branding = settings?.branding || {};
    const primaryColor = branding.primary_color || '#f59e0b';
    const contrastColor = getContrastColor(primaryColor);

    const [searchPhone, setSearchPhone] = useState(phone || '');
    const [isSearching, setIsSearching] = useState(false);

    // If phone wasn't passed in props or URL, check localStorage once on mount
    useEffect(() => {
        if (!phone && tenant?.id) {
            try {
                const storedPhone = localStorage.getItem(`pwa_client_phone_${tenant.id}`);
                if (storedPhone) {
                    setSearchPhone(storedPhone);
                    router.get(`/app/${tenant.id}/bookings`, { phone: storedPhone }, {
                        preserveState: true,
                        replace: true,
                    });
                }
            } catch (e) {
                // ignore
            }
        }
    }, [phone, tenant?.id]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchPhone.trim()) return;
        setIsSearching(true);

        try {
            localStorage.setItem(`pwa_client_phone_${tenant.id}`, searchPhone.trim());
        } catch (e) {}

        router.get(`/app/${tenant.id}/bookings`, { phone: searchPhone.trim() }, {
            preserveScroll: true,
            onFinish: () => setIsSearching(false),
        });
    };

    // Separate requests into open vs history
    const openRequests = requests.filter(r => r.status === 'matched' || r.status === 'unmatched');
    const pastRequests = requests.filter(r => r.status === 'converted' || r.status === 'rejected');

    // Separate bookings into active/pending vs completed/cancelled
    const activeBookings = bookings.filter(b => b.status === 'active' || b.status === 'pending');
    const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

    const totalActiveCount = activeBookings.length + openRequests.length;

    const requestStatusBadge = (status) => {
        if (status === 'matched') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle className="w-3 h-3" /> Auto-Matched to Fleet
                </span>
            );
        }
        if (status === 'unmatched') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    <Clock className="w-3 h-3" /> In Dispatch Queue
                </span>
            );
        }
        if (status === 'converted') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <CheckCircle className="w-3 h-3" /> Booking Created
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {status}
            </span>
        );
    };

    const bookingStatusBadge = (status) => {
        const map = {
            active: {
                label: 'Active on Trip',
                class: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300',
            },
            pending: {
                label: 'Confirmed (Pickup Pending)',
                class: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300',
            },
            completed: {
                label: 'Completed',
                class: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300',
            },
            cancelled: {
                label: 'Cancelled',
                class: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300',
            },
        };
        const current = map[status] || { label: status, class: 'bg-gray-100 text-gray-800' };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${current.class}`}>
                {current.label}
            </span>
        );
    };

    return (
        <PwaLayout tenantName={tenant.name} tenantId={tenant.id} primaryColor={primaryColor} previewMode={previewMode} maxWidth="max-w-xl">
            <Head>
                <title>{`My Bookings - ${tenant.name}`}</title>
            </Head>

            <div className="flex-1 w-full p-4 space-y-6">
                {/* Header Navigation CTA */}
                <div className="flex items-center justify-between">
                    <a
                        href={`/app/${tenant.id}/rent`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Fleet
                    </a>

                    <div className="text-right">
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full">
                            {totalActiveCount} Active
                        </span>
                    </div>
                </div>

                {/* Hero Title */}
                <div 
                    className="rounded-2xl p-5 text-white shadow-md relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, #0f172a)` }}
                >
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black">My Bookings & Inquiries</h2>
                            <p className="text-xs text-white/80 mt-0.5">
                                Track your live car rental requests, dispatch status, and active bookings.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Phone Lookup Form */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                    <form onSubmit={handleSearch} className="flex gap-2 items-center">
                        <div className="relative flex-1">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Search className="w-4 h-4" />
                            </span>
                            <input
                                type="tel"
                                required
                                value={searchPhone}
                                onChange={(e) => setSearchPhone(e.target.value)}
                                placeholder="Enter phone number (e.g. 03001234567)"
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:outline-none dark:text-white"
                                style={{ '--tw-ring-color': primaryColor }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSearching}
                            className="px-4 py-2 font-bold text-xs rounded-xl shadow-sm transition hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
                            style={{ backgroundColor: primaryColor, color: contrastColor }}
                        >
                            {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Find Bookings'}
                        </button>
                    </form>
                    {phone && (
                        <p className="text-[11px] text-gray-400 mt-2 pl-1">
                            Showing records for <span className="font-semibold text-gray-700 dark:text-gray-300 font-mono">{phone}</span>
                        </p>
                    )}
                </div>

                {/* Content Sections */}
                {!phone && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
                        <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                            <Search className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">Lookup Your Bookings</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                            Enter the phone number you used when submitting your rental inquiry to view live status and vehicle dispatch.
                        </p>
                    </div>
                )}

                {phone && requests.length === 0 && bookings.length === 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-full flex items-center justify-center mx-auto">
                            <Car className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">No Bookings Found</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                            We couldn't find any inquiries or confirmed bookings for <span className="font-mono">{phone}</span>.
                        </p>
                        <div className="pt-2">
                            <a
                                href={`/app/${tenant.id}/rent`}
                                className="inline-flex items-center gap-2 px-5 py-2.5 font-bold text-xs rounded-xl shadow-sm transition hover:opacity-90"
                                style={{ backgroundColor: primaryColor, color: contrastColor }}
                            >
                                <Car className="w-4 h-4" /> Explore Available Fleet
                            </a>
                        </div>
                    </div>
                )}

                {/* Section 1: Active & Confirmed Bookings */}
                {activeBookings.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Confirmed Bookings</h3>
                        </div>

                        <div className="space-y-3">
                            {activeBookings.map((b) => (
                                <div 
                                    key={b.id} 
                                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 space-y-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 font-mono block">
                                                {b.booking_number || `#${b.id}`}
                                            </span>
                                            <h4 className="text-sm font-extrabold text-gray-900 dark:text-white mt-0.5">
                                                {b.vehicle?.model || 'Assigned Vehicle'}
                                            </h4>
                                            {b.vehicle?.plate_number && (
                                                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                                    {b.vehicle.plate_number}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            {bookingStatusBadge(b.status)}
                                            {b.total_cost && (
                                                <div className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                                                    Rs. {Number(b.total_cost).toLocaleString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Dates & Driver details */}
                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/60 text-xs">
                                        <div>
                                            <span className="text-[10px] font-semibold text-gray-400 block">Dates</span>
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                {b.start_date ? new Date(b.start_date).toLocaleDateString() : 'N/A'} 
                                                {b.end_date ? ` → ${new Date(b.end_date).toLocaleDateString()}` : ''}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-semibold text-gray-400 block">Driver</span>
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                {b.driver ? b.driver.name : 'Self-Drive / Unassigned'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Section 2: Live Inquiries in Dispatch Queue */}
                {openRequests.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-500" />
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Inbound Inquiries & Requests</h3>
                        </div>

                        <div className="space-y-3">
                            {openRequests.map((r) => (
                                <div 
                                    key={r.id} 
                                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 space-y-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono text-gray-400">REQ-{r.id}</span>
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(r.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                                                {r.suggested_vehicle?.model ? `${r.suggested_vehicle.model} (${r.suggested_vehicle.plate_number})` : 'Vehicle Inquiry'}
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                {r.message_text}
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            {requestStatusBadge(r.status)}
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                                        <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                            <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                                            WhatsApp Confirmation Pending
                                        </span>

                                        <a
                                            href={`https://wa.me/?text=Hello%20${encodeURIComponent(tenant.name)}%2C%20following%20up%20on%20my%20rental%20request%20REQ-${r.id}.`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] rounded-lg border border-emerald-200 dark:border-emerald-800 transition"
                                        >
                                            Chat on WhatsApp
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Section 3: Past History */}
                {(pastBookings.length > 0 || pastRequests.length > 0) && (
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <h3 className="font-bold text-sm text-gray-500 dark:text-gray-400">Past Rental History</h3>
                        </div>

                        <div className="space-y-2 opacity-85">
                            {pastBookings.map((b) => (
                                <div key={b.id} className="bg-white/70 dark:bg-gray-800/70 rounded-xl border border-gray-100 dark:border-gray-700/60 p-3 flex items-center justify-between text-xs">
                                    <div>
                                        <span className="font-bold text-gray-800 dark:text-gray-200">
                                            {b.vehicle?.model || 'Rental Booking'} ({b.booking_number || `#${b.id}`})
                                        </span>
                                        <span className="text-[10px] text-gray-400 block">
                                            {b.start_date ? new Date(b.start_date).toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                    <div>
                                        {bookingStatusBadge(b.status)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="py-6 text-center text-xs text-gray-400">
                Powered by Ormeasy Car Rental OS
            </footer>
        </PwaLayout>
    );
}
