import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import dayjs from 'dayjs';

export default function Index({ auth, customers }) {
    
    // Function to format phone number for wa.me link
    // Removes any non-numeric characters except +
    const formatPhoneForWhatsApp = (phone) => {
        if (!phone) return '';
        // Remove everything except numbers and plus
        let cleaned = phone.replace(/[^\d+]/g, '');
        // If it doesn't start with +, you might want to prepend country code, 
        // but for now we assume it has + or is valid local format
        return cleaned;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">CRM</h2>}
        >
            <Head title="CRM" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="mb-6 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">Your Customers</h3>
                        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded shadow-sm border border-gray-200">
                            Total Customers: <span className="font-bold text-indigo-600">{customers.total}</span>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Order</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {customers.data.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {customer.name || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {customer.phone || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                                                {customer.total_orders}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold text-green-600">
                                                Rs {customer.total_spent}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {customer.last_order_date ? dayjs(customer.last_order_date).format('MMM D, YYYY h:mm A') : 'Never'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {customer.phone && (
                                                    <a 
                                                        href={`https://wa.me/${formatPhoneForWhatsApp(customer.phone)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none transition"
                                                    >
                                                        <svg className="mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                                        Message
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {customers.data.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-500 italic">
                                                No customers found. Start receiving orders to build your CRM!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-sm text-gray-500">
                            <div>Showing {customers.from || 0} to {customers.to || 0} of {customers.total} results</div>
                            <div className="flex gap-2">
                                {customers.prev_page_url && (
                                    <Link href={customers.prev_page_url} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition">Previous</Link>
                                )}
                                {customers.next_page_url && (
                                    <Link href={customers.next_page_url} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition">Next</Link>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
