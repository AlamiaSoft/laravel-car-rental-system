import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Car, Key, Users, MessageSquare, Wrench, DollarSign, Calendar, ArrowUpRight, Plus, ShieldCheck } from 'lucide-react';

export default function RentalDashboard({ kpis, recentBookings, pendingPickups }) {
    const { tenant } = usePage().props;

    const fmtCurrency = (val) => {
        return 'Rs ' + Number(val || 0).toLocaleString('en-PK');
    };

    const statusBadge = (status) => {
        const map = {
            pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300',
            active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300',
            completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300',
            cancelled: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-300',
        };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${map[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            Fleet & Rental Operations
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Real-time fleet utilization, driver dispatch, and WhatsApp auto-matching.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('rental.bookings.create')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md transition"
                        >
                            <Plus className="w-4 h-4" /> New Booking
                        </Link>
                        <Link
                            href={route('rental.requests.index')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-xl shadow-sm transition"
                        >
                            <MessageSquare className="w-4 h-4 text-emerald-500" /> WhatsApp Inbox
                            {kpis.open_requests > 0 && (
                                <span className="ml-1 bg-emerald-500 text-slate-950 font-black text-xs px-1.5 py-0.5 rounded-full">
                                    {kpis.open_requests}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Car Rental Dashboard" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                {/* ---------- KPI STATS GRID ---------- */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* Active Rentals */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Active Rentals</span>
                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400">
                                <Key className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-gray-900 dark:text-white">{kpis.active_rentals}</span>
                            <span className="text-xs font-medium text-gray-500">trips ongoing</span>
                        </div>
                    </div>

                    {/* Fleet Available */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Available Fleet</span>
                            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400">
                                <Car className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-gray-900 dark:text-white">{kpis.available_vehicles}</span>
                            <span className="text-xs font-medium text-gray-500">of {kpis.total_vehicles} vehicles</span>
                        </div>
                    </div>

                    {/* Available Drivers */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Free Drivers</span>
                            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-gray-900 dark:text-white">{kpis.free_drivers}</span>
                            <span className="text-xs font-medium text-gray-500">of {kpis.total_drivers} drivers</span>
                        </div>
                    </div>

                    {/* Monthly Completed Revenue */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Monthly Revenue</span>
                            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-600 dark:text-amber-400">
                                <DollarSign className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-gray-900 dark:text-white">{fmtCurrency(kpis.month_revenue)}</span>
                            <span className="text-xs font-medium text-emerald-500">completed</span>
                        </div>
                    </div>
                </div>

                {/* ---------- PENDING PICKUPS & RECENT BOOKINGS ---------- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Pending Handover Queue */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-amber-500" />
                                <h3 className="font-bold text-gray-900 dark:text-white">Upcoming Pickups</h3>
                            </div>
                            <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">
                                {pendingPickups.length} scheduled
                            </span>
                        </div>

                        {pendingPickups.length === 0 ? (
                            <p className="text-sm text-gray-400 py-6 text-center">No pending handovers right now.</p>
                        ) : (
                            <div className="space-y-3">
                                {pendingPickups.map((p) => (
                                    <div key={p.id} className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-900/40 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{p.client?.name || 'Customer'}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                {p.vehicle ? `${p.vehicle.model} (${p.vehicle.plate_number})` : 'Outside Supplier'}
                                            </p>
                                        </div>
                                        <Link
                                            href={route('rental.bookings.index')}
                                            className="text-xs font-bold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
                                        >
                                            Pickup
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Bookings Table */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 dark:text-white">Recent Rental Bookings</h3>
                            <Link
                                href={route('rental.bookings.index')}
                                className="text-xs font-bold text-emerald-600 hover:text-emerald-500 flex items-center gap-1"
                            >
                                View All Bookings <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {recentBookings.length === 0 ? (
                            <p className="text-sm text-gray-400 py-8 text-center">No bookings recorded yet. Click "New Booking" to get started.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs sm:text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-400 uppercase text-[10px] tracking-wider">
                                            <th className="pb-3">Booking</th>
                                            <th className="pb-3">Client</th>
                                            <th className="pb-3">Vehicle</th>
                                            <th className="pb-3">Pricing</th>
                                            <th className="pb-3 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                                        {recentBookings.map((b) => (
                                            <tr key={b.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
                                                <td className="py-3 font-semibold text-gray-900 dark:text-white">
                                                    {b.booking_number || `#${b.id}`}
                                                </td>
                                                <td className="py-3 text-gray-600 dark:text-gray-300">
                                                    {b.client?.name || 'N/A'}
                                                </td>
                                                <td className="py-3 text-gray-600 dark:text-gray-300">
                                                    {b.vehicle?.model || b.third_party_vendor?.vendor_name || 'Unassigned'}
                                                </td>
                                                <td className="py-3 capitalize text-gray-500">
                                                    {b.pricing_mode}
                                                </td>
                                                <td className="py-3 text-right">
                                                    {statusBadge(b.status)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
