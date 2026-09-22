import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Index({ invoices, flash }) {
    const markAsPaid = (id) => {
        if (confirm('Are you sure you want to mark this invoice as paid?')) {
            router.post(route('admin.invoices.paid', id));
        }
    };

    const sendReminder = (id) => {
        router.post(route('admin.invoices.reminder', id));
    };

    return (
        <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Invoices Directory</h2>}>
            <Head title="Invoices Directory" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">{flash.success}</div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">{flash.error}</div>
                    )}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {invoices.data.map((invoice) => (
                                    <tr key={invoice.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">#{invoice.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{invoice.tenant?.name || invoice.tenant_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Rs. {invoice.amount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={"px-2 inline-flex text-xs leading-5 font-semibold rounded-full "}>
                                                {invoice.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(invoice.due_date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <a href={route('admin.invoices.show', invoice.id)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">View/Print</a>
                                            {invoice.status !== 'paid' && (
                                                <>
                                                    <button onClick={() => markAsPaid(invoice.id)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Mark Paid</button>
                                                    <button onClick={() => sendReminder(invoice.id)} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">Send Reminder</button>
                                                    <button onClick={() => { if (confirm('Are you sure you want to delete this invoice?')) { router.delete(route('admin.invoices.destroy', invoice.id)); } }} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {invoices.data.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">No invoices found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
