import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Editor({ workflow, tenants, defaultSchema }) {
    const isEditing = Boolean(workflow);

    const initialNodes = workflow?.nodes_schema || defaultSchema?.nodes || [
        {
            key: 'root_trigger',
            type: 'trigger',
            title: 'Trigger Entry',
            config: { keywords: ['hi', 'hello', 'menu', 'start'] },
        },
        {
            key: 'welcome_msg',
            type: 'message',
            title: 'Welcome Message',
            config: {
                body: "Welcome to {{tenant.name}}!\n\nHow would you like to place your order today?\n\n1. 📜 Order directly in WhatsApp Chat\n2. 📱 Open PWA App",
                buttons: [
                    { id: 'action_view_menu', title: '📜 Order in WhatsApp' },
                ],
            },
        },
        {
            key: 'catalog_node',
            type: 'catalog_menu',
            title: 'Interactive Catalog',
            config: {},
        },
        {
            key: 'pwa_link_node',
            type: 'pwa_link',
            title: 'PWA App Link',
            config: {},
        },
    ];

    const { data, setData, post, put, processing, errors } = useForm({
        tenant_id: workflow?.tenant_id || '',
        name: workflow?.name || (isEditing ? '' : 'Default Restaurant WhatsApp Flow'),
        description: workflow?.description || '',
        is_active: workflow?.is_active ?? true,
        trigger_keywords: workflow?.trigger_keywords || ['hi', 'hello', 'menu', 'start'],
        nodes_schema: initialNodes,
        edges_schema: workflow?.edges_schema || [],
    });

    const [activeNodeKey, setActiveNodeKey] = useState(initialNodes[0]?.key || '');

    const handleAddNode = (type) => {
        const key = `node_${Date.now()}`;
        const newNode = {
            key,
            type,
            title: type === 'message' ? 'Text Reply Node' : type === 'catalog_menu' ? 'Catalog Menu Node' : type === 'pwa_link' ? 'PWA Link Node' : 'System Action Node',
            config: type === 'message' ? { body: 'Reply text goes here...', buttons: [] } : type === 'system_action' ? { action: 'menu' } : {},
        };

        setData('nodes_schema', [...data.nodes_schema, newNode]);
        setActiveNodeKey(key);
    };

    const handleRemoveNode = (key) => {
        if (data.nodes_schema.length <= 1) {
            alert('A workflow must have at least 1 node.');
            return;
        }
        const updated = data.nodes_schema.filter((n) => n.key !== key);
        setData('nodes_schema', updated);
        if (activeNodeKey === key) {
            setActiveNodeKey(updated[0]?.key || '');
        }
    };

    const handleNodeChange = (key, field, value) => {
        const updated = data.nodes_schema.map((node) => {
            if (node.key === key) {
                return { ...node, [field]: value };
            }
            return node;
        });
        setData('nodes_schema', updated);
    };

    const handleConfigChange = (key, configField, value) => {
        const updated = data.nodes_schema.map((node) => {
            if (node.key === key) {
                return {
                    ...node,
                    config: { ...node.config, [configField]: value },
                };
            }
            return node;
        });
        setData('nodes_schema', updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('admin.bot-workflows.update', workflow.id));
        } else {
            post(route('admin.bot-workflows.store'));
        }
    };

    const activeNode = data.nodes_schema.find((n) => n.key === activeNodeKey) || data.nodes_schema[0];

    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        {isEditing ? `Edit Workflow: ${workflow.name}` : 'Create WhatsApp Bot Workflow'}
                    </h2>
                    <Link
                        href={route('admin.bot-workflows.index')}
                        className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-gray-500"
                    >
                        Back to Workflows
                    </Link>
                </div>
            }
        >
            <Head title={isEditing ? 'Edit Bot Workflow' : 'Create Bot Workflow'} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Settings Card */}
                        <div className="bg-white dark:bg-gray-800 p-6 shadow sm:rounded-lg space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">
                                1. Workflow Metadata & Scope
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Workflow Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                        required
                                    />
                                    {errors.name && <div className="text-xs text-red-500 mt-1">{errors.name}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Tenant Scope
                                    </label>
                                    <select
                                        value={data.tenant_id}
                                        onChange={(e) => setData('tenant_id', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    >
                                        <option value="">Global SaaS Template (All Tenants)</option>
                                        {tenants.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name} (ID: {t.id})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                        placeholder="Describe the purpose of this bot workflow..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Trigger Keywords (comma separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.trigger_keywords.join(', ')}
                                        onChange={(e) =>
                                            setData(
                                                'trigger_keywords',
                                                e.target.value.split(',').map((s) => s.trim())
                                            )
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    />
                                </div>

                                <div className="flex items-center pt-6">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            Activate as Primary Bot Workflow
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Node Visual Builder */}
                        <div className="bg-white dark:bg-gray-800 p-6 shadow sm:rounded-lg space-y-4">
                            <div className="flex items-center justify-between border-b pb-2 dark:border-gray-700">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    2. Workflow Node Topology
                                </h3>

                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => handleAddNode('message')}
                                        className="rounded bg-indigo-50 dark:bg-indigo-900/50 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-100"
                                    >
                                        + Message Node
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleAddNode('catalog_menu')}
                                        className="rounded bg-emerald-50 dark:bg-emerald-900/50 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-100"
                                    >
                                        + Catalog Menu Node
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleAddNode('pwa_link')}
                                        className="rounded bg-purple-50 dark:bg-purple-900/50 px-3 py-1.5 text-xs font-semibold text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-700 hover:bg-purple-100"
                                    >
                                        + PWA Link Node
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Nodes List Sidebar */}
                                <div className="space-y-2 border-r pr-4 dark:border-gray-700">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                                        Flow Steps ({data.nodes_schema.length})
                                    </span>
                                    {data.nodes_schema.map((node, index) => {
                                        const isActive = node.key === activeNodeKey;
                                        return (
                                            <div
                                                key={node.key}
                                                onClick={() => setActiveNodeKey(node.key)}
                                                className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                                                    isActive
                                                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/30'
                                                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                }`}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300">
                                                        {index + 1}
                                                    </span>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {node.title || node.key}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                            Type: {node.type}
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveNode(node.key);
                                                    }}
                                                    className="text-gray-400 hover:text-red-500 text-xs"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Active Node Inspector & Live Preview */}
                                <div className="md:col-span-2 space-y-4">
                                    {activeNode && (
                                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border dark:border-gray-700 space-y-4">
                                            <div className="flex items-center justify-between border-b pb-2 dark:border-gray-800">
                                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                                    Step Inspector: {activeNode.title} ({activeNode.key})
                                                </h4>
                                                <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-mono">
                                                    {activeNode.type}
                                                </span>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                    Step Title
                                                </label>
                                                <input
                                                    type="text"
                                                    value={activeNode.title || ''}
                                                    onChange={(e) => handleNodeChange(activeNode.key, 'title', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm text-sm"
                                                />
                                            </div>

                                            {activeNode.type === 'message' && (
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                        WhatsApp Text Copy (Supports {'{{tenant.name}}'}, {'{{pwa.url}}'})
                                                    </label>
                                                    <textarea
                                                        rows={4}
                                                        value={activeNode.config?.body || ''}
                                                        onChange={(e) => handleConfigChange(activeNode.key, 'body', e.target.value)}
                                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm text-sm font-mono"
                                                    />
                                                </div>
                                            )}

                                            {activeNode.type === 'catalog_menu' && (
                                                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200">
                                                    💡 <b>Dynamic Node:</b> Automatically fetches active categories & items from the tenant database dynamically on user execution.
                                                </div>
                                            )}

                                            {activeNode.type === 'pwa_link' && (
                                                <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded border border-purple-200 dark:border-purple-800 text-xs text-purple-800 dark:text-purple-200">
                                                    ⚡ <b>PWA Link Generator:</b> Generates a signed, 16-character short PWA entry link for the customer.
                                                </div>
                                            )}

                                            {/* Live WhatsApp Bubble Preview */}
                                            <div className="mt-4 pt-4 border-t dark:border-gray-800">
                                                <span className="text-xs font-semibold text-gray-500 uppercase block mb-2">
                                                    📱 Live WhatsApp Preview
                                                </span>
                                                <div className="bg-[#efeae2] dark:bg-gray-950 p-4 rounded-lg border max-w-sm font-sans shadow-inner">
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm text-xs space-y-2 dark:text-white whitespace-pre-wrap">
                                                        {activeNode.type === 'message'
                                                            ? activeNode.config?.body || 'Welcome!'
                                                            : activeNode.type === 'catalog_menu'
                                                            ? "📋 Menu Categories\n\n1️⃣ Burgers\n2️⃣ Pizzas\n3️⃣ Drinks\n\nReply with a number (e.g. 1) to choose."
                                                            : activeNode.type === 'pwa_link'
                                                            ? "📱 Mobile App:\nhttps://waorder.alamiaai.com/t/sample_token"
                                                            : "System action executed."}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="flex justify-end space-x-3">
                            <Link
                                href={route('admin.bot-workflows.index')}
                                className="rounded-md bg-white dark:bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : isEditing ? 'Update Workflow' : 'Save Workflow'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
