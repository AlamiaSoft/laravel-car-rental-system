import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Edit({ tenant, metrics, capabilities, capabilityDefinitions, businessTypes }) {
    const { flash, errors } = usePage().props;
    const [rate, setRate] = useState(tenant.billing_rate || 0);

    const [activeTab, setActiveTab] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('tab') || 'details';
    });

    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
        const url = new URL(window.location);
        url.searchParams.set('tab', tabName);
        window.history.pushState(null, '', url.toString());
    };

    return (
        <AdminLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Tenant Details: {tenant.name || tenant.id}</h2>}
        >
            <Head title={`Tenant: ${tenant.name || tenant.id}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {flash?.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                            {flash.error}
                        </div>
                    )}

                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button
                                onClick={() => handleTabChange('details')}
                                className={`${
                                    activeTab === 'details'
                                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                            >
                                Details & Billing
                            </button>
                            <button
                                onClick={() => handleTabChange('capabilities')}
                                className={`${
                                    activeTab === 'capabilities'
                                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                            >
                                Capabilities
                            </button>
                            <Link
                                href={route('admin.tenants.orders', tenant.id)}
                                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                            >
                                Orders Ledger
                            </Link>
                        </nav>
                    </div>

                    {activeTab === 'details' && (
                        <>
                            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Tenant Information</h3>
                                    <button 
                                        onClick={() => {
                                            if(confirm('Are you absolutely sure you want to delete this tenant and all its data? This cannot be undone.')) {
                                                router.delete(route('admin.tenants.destroy', tenant.id));
                                            }
                                        }}
                                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm font-medium"
                                    >
                                        Delete Tenant
                                    </button>
                                </div>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    router.put(route('admin.tenants.update', tenant.id), {
                                        name: e.target.name.value,
                                        is_active: e.target.is_active.checked,
                                        business_type: tenant.business_type,
                                    });
                                }}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Tenant Name</label>
                                            <input 
                                                name="name"
                                                type="text"
                                                defaultValue={tenant.name || ''} 
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                required
                                            />
                                        </div>
                                        <div className="flex flex-col justify-center pt-5">
                                            <label className="flex items-center">
                                                <input 
                                                    name="is_active"
                                                    type="checkbox" 
                                                    defaultChecked={tenant.is_active !== 0 && tenant.is_active !== false}
                                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                />
                                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active Account</span>
                                            </label>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Tenant ID</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">{tenant.id}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Domain</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">{tenant.domains?.length > 0 ? tenant.domains[0].domain : 'No domain configured'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Created At</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">{new Date(tenant.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition text-sm">
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Tenant Metrics</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-md">
                                        <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Total Orders Processed</p>
                                        <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-200">{metrics.total_orders}</p>
                                    </div>
                                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
                                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">Active Products</p>
                                        <p className="text-3xl font-bold text-green-900 dark:text-green-200">{metrics.active_products}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Billing Configuration</h3>
                                <form onSubmit={(e) => { e.preventDefault(); router.post(route('admin.tenants.billing.update', tenant.id), { billing_model: tenant.billing_model || 'fixed', billing_rate: rate, billing_frequency: tenant.billing_frequency || 'weekly' }) }} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Billing Model</label>
                                            <select defaultValue={tenant.billing_model || 'fixed'} onChange={(e) => tenant.billing_model = e.target.value} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                                                <option value="fixed">Fixed</option>
                                                <option value="commission">Commission (%)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Billing Rate</label>
                                            <input type="number" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Frequency</label>
                                            <select defaultValue={tenant.billing_frequency || 'weekly'} onChange={(e) => tenant.billing_frequency = e.target.value} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="monthly">Monthly</option>
                                                <option value="manual">Manual</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-4">Last Billed: {tenant.last_billed_at ? new Date(tenant.last_billed_at).toLocaleString() : 'Never'}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <button type="submit" className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700">
                                            Update Billing
                                        </button>
                                        <button type="button" onClick={() => router.post(route('admin.tenants.invoice.generate', tenant.id))} className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700">
                                            Generate Invoice Now
                                        </button>
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Commission Calculator</h4>
                                        <p className="text-xs text-gray-500 mb-4">Quickly compare fixed vs commission based on the tenant's all-time completed sales volume (Rs. {metrics.total_sales}).</p>
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-1 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">If Fixed at Current Rate</p>
                                                <p className="font-semibold text-gray-900 dark:text-white">Rs. {rate}</p>
                                            </div>
                                            <div className="flex-1 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded">
                                                <p className="text-xs text-indigo-500 dark:text-indigo-400">If {rate}% Commission</p>
                                                <p className="font-semibold text-indigo-900 dark:text-indigo-100">Rs. {((metrics.total_sales || 0) * ((rate || 0) / 100)).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
                                <h3 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Operations here can permanently affect the tenant's data or access.</p>
                                <button disabled className="bg-red-600 text-white px-4 py-2 rounded shadow opacity-50 cursor-not-allowed">Suspend Tenant</button>
                            </div>
                        </>
                    )}

                    {activeTab === 'capabilities' && (
                        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Capability & Experience Settings</h3>
                            
                            {/* Preset Selection */}
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Apply Business Preset</h4>
                                <p className="text-xs text-gray-500 mb-3">Applying a business preset will automatically seed default capabilities and reset the primary PWA experience.</p>
                                <div className="flex flex-wrap gap-2">
                                    {businessTypes.map((type) => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => {
                                                if (confirm(`Reset this business to ${type.label} capabilities and defaults?`)) {
                                                    router.put(route('admin.tenants.update', tenant.id), {
                                                        name: tenant.name,
                                                        is_active: tenant.is_active !== 0 && tenant.is_active !== false,
                                                        business_type: type.value,
                                                    }, {
                                                        onSuccess: () => handleTabChange('capabilities')
                                                    });
                                                }
                                            }}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                                tenant.business_type === type.value
                                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Capability Toggles */}
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Enabled Capabilities</h4>
                                {errors?.capabilities && (
                                    <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4">
                                        <p className="text-xs text-red-700">{errors.capabilities}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {capabilityDefinitions.map((cap) => {
                                        const isEnabled = capabilities.includes(cap.key);
                                        return (
                                            <div
                                                key={cap.key}
                                                className={`p-4 border rounded-xl flex flex-col justify-between transition ${
                                                    isEnabled
                                                        ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-900/10'
                                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                                }`}
                                            >
                                                <div className="mb-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-semibold text-sm text-gray-900 dark:text-white">{cap.name}</span>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                                            isEnabled
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                                        }`}>
                                                            {isEnabled ? 'Active' : 'Disabled'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{cap.description}</p>
                                                    {cap.dependencies.length > 0 && (
                                                        <div className="text-[10px] text-gray-400">
                                                            Requires: <span className="font-mono text-indigo-600 dark:text-indigo-400">{cap.dependencies.join(', ')}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        let nextCaps = [...capabilities];
                                                        if (isEnabled) {
                                                            nextCaps = nextCaps.filter((k) => k !== cap.key);
                                                        } else {
                                                            nextCaps.push(cap.key);
                                                        }
                                                        router.put(route('admin.tenants.update', tenant.id), {
                                                            name: tenant.name,
                                                            is_active: tenant.is_active !== 0 && tenant.is_active !== false,
                                                            business_type: tenant.business_type,
                                                            capabilities: nextCaps,
                                                        }, {
                                                            onSuccess: () => handleTabChange('capabilities')
                                                        });
                                                    }}
                                                    className={`w-full py-1.5 rounded-lg text-xs font-semibold transition ${
                                                        isEnabled
                                                            ? 'bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400'
                                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                                    }`}
                                                >
                                                    {isEnabled ? 'Disable' : 'Enable'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Primary Experience Override */}
                            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Primary WhatsApp CTA Experience</h4>
                                <p className="text-xs text-gray-500 mb-3">Sets which experience link is sent to customers in the WhatsApp Bot greeting. Note: only active capabilities offering a PWA interface are valid.</p>
                                
                                <div className="max-w-xs">
                                    <select
                                        value={tenant.primary_experience || ''}
                                        onChange={(e) => {
                                            router.put(route('admin.tenants.update', tenant.id), {
                                                name: tenant.name,
                                                is_active: tenant.is_active !== 0 && tenant.is_active !== false,
                                                business_type: tenant.business_type,
                                                primary_experience: e.target.value || '',
                                            }, {
                                                onSuccess: () => handleTabChange('capabilities')
                                            });
                                        }}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                                    >
                                        <option value="">Default (Registry Auto-Resolved)</option>
                                        {capabilityDefinitions
                                            .filter((c) => c.has_pwa_experience)
                                            .map((c) => {
                                                // The resolver maps 'ordering' to 'order', and 'booking' to 'book' PWA experiences
                                                const expKey = c.key === 'ordering' ? 'order' : (c.key === 'booking' ? 'book' : null);
                                                if (!expKey) return null;
                                                return (
                                                    <option key={expKey} value={expKey}>
                                                        {c.name} ({expKey})
                                                    </option>
                                                );
                                            })
                                        }
                                    </select>
                                    {errors?.primary_experience && (
                                        <p className="text-xs text-red-600 mt-1">{errors.primary_experience}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
