import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ kpis }) {
    return (
        <AdminLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Global SaaS Dashboard</h2>}
        >
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900 dark:text-gray-100">
                                <h3 className="text-lg font-medium text-gray-500 mb-2">Total Registered Tenants</h3>
                                <p className="text-4xl font-bold">{kpis.totalTenants}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900 dark:text-gray-100">
                                <h3 className="text-lg font-medium text-gray-500 mb-2">Total User Accounts</h3>
                                <p className="text-4xl font-bold text-indigo-600">{kpis.totalUsers}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
