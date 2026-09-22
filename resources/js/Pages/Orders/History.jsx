import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import dayjs from 'dayjs';

export default function History({ auth, orders }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Order History</h2>}
        >
            <Head title="Order History" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium">Completed Orders</h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer / Table</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {orders.data.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {order.order_number}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {dayjs(order.created_at).format('MMM D, YYYY h:mm A')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div>{order.customer_name || 'N/A'}</div>
                                                    <div className="text-xs text-gray-400">{order.customer_phone}</div>
                                                    {order.table_number && <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 mt-1">{order.table_number}</span>}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                                        {order.order_type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium text-right">
                                                    Rs {order.total_amount}
                                                </td>
                                            </tr>
                                        ))}
                                        {orders.data.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500 italic">
                                                    No completed orders found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Simple Pagination */}
                            <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
                                <div>Showing {orders.from || 0} to {orders.to || 0} of {orders.total} results</div>
                                <div className="flex gap-2">
                                    {orders.prev_page_url && (
                                        <Link href={orders.prev_page_url} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">Previous</Link>
                                    )}
                                    {orders.next_page_url && (
                                        <Link href={orders.next_page_url} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">Next</Link>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
