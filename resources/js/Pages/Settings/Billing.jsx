import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Billing({ invoices, paymentInstructions, billing_model, billing_rate, billing_frequency }) {
    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Billing & Invoices</h2>}>
            <Head title="Billing" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Your Billing Plan</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Model</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{billing_model}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Rate</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {billing_model === 'fixed' ? `Rs. ${billing_rate}` : `${billing_rate}%`}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Frequency</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{billing_frequency}</p>
                            </div>
                        </div>
                    </div>

                    {paymentInstructions && (
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
                            <h3 className="text-lg font-medium text-indigo-900 dark:text-indigo-100 mb-2">How to Pay</h3>
                            <p className="text-indigo-700 dark:text-indigo-300 whitespace-pre-line">{paymentInstructions}</p>
                        </div>
                    )}

                    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Invoices</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {invoices.data.map((invoice) => (
                                        <tr key={invoice.id} className={invoice.status === 'pending' ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">#{invoice.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                {new Date(invoice.billing_period_start).toLocaleDateString()} - {new Date(invoice.billing_period_end).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">Rs. {invoice.amount}</td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${invoice.status === 'pending' ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-500 dark:text-gray-300'}`}>{new Date(invoice.due_date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${invoice.status === 'pending' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' : 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'}`}>
                                                    {invoice.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <a href={route('settings.billing.invoices.show', invoice.id)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">View / Print</a>
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
            </div>
        </AuthenticatedLayout>
    );
}
