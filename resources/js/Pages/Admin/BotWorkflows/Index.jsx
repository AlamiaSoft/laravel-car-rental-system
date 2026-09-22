import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ workflows, tenants }) {
    const handleToggleActive = (id) => {
        router.post(route('admin.bot-workflows.toggle-active', id), {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this bot workflow?')) {
            router.delete(route('admin.bot-workflows.destroy', id));
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        WhatsApp Bot Workflows
                    </h2>
                    <Link
                        href={route('admin.bot-workflows.create')}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 transition"
                    >
                        + Create New Workflow
                    </Link>
                </div>
            }
        >
            <Head title="Bot Workflows - SaaS Admin" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <h3 className="text-lg font-medium mb-4">Configured Bot Workflows</h3>

                            {workflows.length === 0 ? (
                                <div className="rounded-md bg-gray-50 dark:bg-gray-900 p-8 text-center text-gray-500">
                                    <p className="mb-4">No custom bot workflows created yet.</p>
                                    <Link
                                        href={route('admin.bot-workflows.create')}
                                        className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-500"
                                    >
                                        Create Default Workflow Template
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                    Workflow Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                    Scope / Tenant
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                    Nodes Count
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                            {workflows.map((wf) => (
                                                <tr key={wf.id}>
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <div className="font-semibold text-gray-900 dark:text-white">
                                                            {wf.name}
                                                        </div>
                                                        {wf.description && (
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {wf.description}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                                        {wf.tenant ? (
                                                            <span className="rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-200">
                                                                {wf.tenant.name}
                                                            </span>
                                                        ) : (
                                                            <span className="rounded-full bg-purple-100 dark:bg-purple-900 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:text-purple-200">
                                                                Global SaaS Template
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                        <button
                                                            onClick={() => handleToggleActive(wf.id)}
                                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                                wf.is_active
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                            }`}
                                                        >
                                                            {wf.is_active ? '🟢 Active' : '⚪ Inactive'}
                                                        </button>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                                        {wf.nodes_schema ? wf.nodes_schema.length : 0} nodes
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium space-x-3">
                                                        <Link
                                                            href={route('admin.bot-workflows.edit', wf.id)}
                                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200"
                                                        >
                                                            Edit Flow
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(wf.id)}
                                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                                                        >
                                                            Delete
                                                        </button>
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
            </div>
        </AdminLayout>
    );
}
