import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Orders({ tenant, orders, filters, stats }) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const applyFilter = (e) => {
        e?.preventDefault();
        router.get(route('admin.tenants.orders', tenant.id), { start_date: startDate, end_date: endDate }, { preserveState: true });
    };

    const setQuickFilter = (days) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);
        
        const endStr = end.toISOString().split('T')[0];
        const startStr = start.toISOString().split('T')[0];
        
        setStartDate(startStr);
        setEndDate(endStr);
        
        router.get(route('admin.tenants.orders', tenant.id), { start_date: startStr, end_date: endStr }, { preserveState: true });
    };

    return (
        <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Tenant Orders: {tenant.name || tenant.id}</h2>}>
            <Head title={`Orders - ${tenant.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Navigation Tabs */}
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <Link
                                href={route('admin.tenants.edit', tenant.id) + '?tab=details'}
                                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                            >
                                Details & Billing
                            </Link>
                            <Link
                                href={route('admin.tenants.edit', tenant.id) + '?tab=capabilities'}
                                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                            >
                                Capabilities
                            </Link>
                            <Link
                                href={route('admin.tenants.orders', tenant.id)}
                                className="border-indigo-500 text-indigo-600 dark:text-indigo-400 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                                aria-current="page"
                            >
                                Orders Ledger
                            </Link>
                        </nav>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Filters Sidebar */}
                        <div className="md:col-span-1 space-y-6">
                            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Date Filters</h3>
                                
                                <div className="space-y-2 mb-6">
                                    <button onClick={() => setQuickFilter(0)} className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Today</button>
                                    <button onClick={() => setQuickFilter(7)} className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Last 7 Days</button>
                                    <button onClick={() => setQuickFilter(30)} className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Last 30 Days</button>
                                </div>

                                <form onSubmit={applyFilter} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white sm:text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white sm:text-sm" />
                                    </div>
                                    <button type="submit" className="w-full inline-flex justify-center items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700">
                                        Apply Custom Range
                                    </button>
                                </form>
                            </div>

                            {/* Commission Summary */}
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 shadow sm:rounded-lg p-6 text-white">
                                <h3 className="text-lg font-medium mb-4">Period Summary</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-indigo-100 text-sm">Completed Orders Total</p>
                                        <p className="text-2xl font-bold">Rs. {stats.total_completed_amount}</p>
                                    </div>
                                    <div>
                                        <p className="text-indigo-100 text-sm">
                                            Expected Commission ({stats.billing_model === 'commission' ? `${stats.billing_rate}%` : 'Fixed'})
                                        </p>
                                        <p className="text-2xl font-bold">Rs. {stats.expected_commission}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Orders Table */}
                        <div className="md:col-span-3">
                            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden">
                                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Orders ({orders.length})</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-900">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {orders.map((order) => (
                                                <tr key={order.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">#{order.id}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.customer_name || order.customer_phone}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">Rs. {order.total_amount}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span className={"px-2 inline-flex text-xs leading-5 font-semibold rounded-full "}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(order.created_at).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                            {orders.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">No orders found for this period.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}