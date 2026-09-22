import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    Palette,
    Settings,
    CreditCard,
    MessageSquare,
    Eye,
    Send,
    Save,
    Upload,
    Image,
    Trash2,
    Loader2
} from 'lucide-react';

export default function MiniApp({ settings, tenantId }) {
    // Current tab selection
    const [activeSection, setActiveSection] = useState('branding');
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);

    // Load initial settings with fallbacks
    const [form, setForm] = useState({
        branding: {
            business_name: settings.branding?.business_name || '',
            logo: settings.branding?.logo || '',
            favicon: settings.branding?.favicon || '',
            primary_color: settings.branding?.primary_color || '#ef4444',
            tagline: settings.branding?.tagline || 'Premium cars one call away!',
        },
        ordering: {
            type: settings.ordering?.type || 'both',
            min_order: settings.ordering?.min_order || 0,
            delivery_fee: settings.ordering?.delivery_fee || 150,
            free_delivery_threshold: settings.ordering?.free_delivery_threshold || 1500,
            prep_time_mins: settings.ordering?.prep_time_mins || 35,
            marketplace_commission_rate: settings.ordering?.marketplace_commission_rate || 25,
        },
        payments: {
            cod_enabled: settings.payments?.cod_enabled !== false,
            bank_transfer_enabled: !!settings.payments?.bank_transfer_enabled,
            bank_instructions: settings.payments?.bank_instructions || '',
        },
        whatsapp: {
            order_received: settings.whatsapp?.order_received || 'Order {order_number} received!',
            order_preparing: settings.whatsapp?.order_preparing || 'Order {order_number} is now preparing in the kitchen.',
            order_ready: settings.whatsapp?.order_ready || 'Order {order_number} is ready!',
            order_delivered: settings.whatsapp?.order_delivered || 'Order {order_number} has been delivered!',
        },
        crm: {
            auto_tag: settings.crm?.auto_tag || 'lead',
        }
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);

    const [isChecklistHidden, setIsChecklistHidden] = useState(() => {
        try {
            return localStorage.getItem('hide_onboarding_checklist') === 'true';
        } catch (e) {
            return false;
        }
    });

    const toggleChecklistPreference = () => {
        const nextState = !isChecklistHidden;
        setIsChecklistHidden(nextState);
        try {
            if (nextState) {
                localStorage.setItem('hide_onboarding_checklist', 'true');
            } else {
                localStorage.removeItem('hide_onboarding_checklist');
                router.visit(route('dashboard'));
            }
        } catch (e) {
            // ignore localStorage error
        }
    };

    // Deep merge helper for nested state updates
    const updateField = (group, key, value) => {
        setForm(prev => ({
            ...prev,
            [group]: {
                ...prev[group],
                [key]: value
            }
        }));
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingLogo(true);
        const formData = new FormData();
        formData.append('logo', file);

        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const response = await fetch(route('settings.miniapp.logo'), {
                method: 'POST',
                headers: {
                    ...(token ? { 'X-CSRF-TOKEN': token } : {}),
                },
                body: formData,
            });
            const data = await response.json();
            if (data.success && data.url) {
                updateField('branding', 'logo', data.url);
                setStatusMessage({ type: 'success', text: 'Logo uploaded successfully.' });
            } else {
                setStatusMessage({ type: 'error', text: data.message || 'Failed to upload logo.' });
            }
        } catch (err) {
            setStatusMessage({ type: 'error', text: 'Network error uploading logo.' });
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const handleSaveDraft = (e) => {
        e.preventDefault();
        setIsSaving(true);
        setStatusMessage(null);

        router.post(route('settings.miniapp.save'), form, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSaving(false);
                setStatusMessage({ type: 'success', text: 'Draft settings saved successfully.' });
            },
            onError: () => {
                setIsSaving(false);
                setStatusMessage({ type: 'error', text: 'Failed to save draft settings.' });
            }
        });
    };

    const handlePublish = (e) => {
        e.preventDefault();
        setIsPublishing(true);
        setStatusMessage(null);

        router.post(route('settings.miniapp.publish'), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setIsPublishing(false);
                setStatusMessage({ type: 'success', text: 'Settings published to live PWA successfully.' });
            },
            onError: () => {
                setIsPublishing(false);
                setStatusMessage({ type: 'error', text: 'Failed to publish settings.' });
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Mini-App Configuration</h2>}
        >
            <Head title="Mini-App Settings" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">
                    {/* Status Alert */}
                    {statusMessage && (
                        <div className={`p-4 rounded-lg text-sm font-semibold shadow-sm ${statusMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                            {statusMessage.text}
                        </div>
                    )}

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 flex flex-col md:flex-row gap-6">
                        {/* Sidebar Sections */}
                        <div className="w-full md:w-48 flex flex-col gap-1 border-r border-gray-100 dark:border-gray-750 pr-4">
                            {[
                                { id: 'branding', label: 'Branding', icon: Palette },
                                { id: 'ordering', label: 'Ordering Rules', icon: Settings },
                                { id: 'payments', label: 'Payments', icon: CreditCard },
                                { id: 'whatsapp', label: 'Notifications', icon: MessageSquare },
                            ].map(section => {
                                const IconComponent = section.icon;
                                return (
                                    <button
                                        key={section.id}
                                        type="button"
                                        onClick={() => setActiveSection(section.id)}
                                        className={`flex items-center gap-2.5 text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeSection === section.id
                                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                                                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-750'
                                            }`}
                                    >
                                        <IconComponent className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                        {section.label}
                                    </button>
                                );
                            })}

                            <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-750 flex flex-col gap-2">
                                <a
                                    href={route('pwa.menu', { tenant_slug: tenantId, preview: 'true' })}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-750 dark:hover:bg-gray-700 dark:text-gray-200 flex items-center justify-center gap-1.5 font-bold py-2 rounded-lg text-xs"
                                >
                                    <Eye className="w-3.5 h-3.5" /> Preview Draft
                                </a>
                                <button
                                    type="button"
                                    onClick={handlePublish}
                                    disabled={isPublishing}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-1.5 font-bold py-2 rounded-lg text-xs disabled:bg-gray-400"
                                >
                                    <Send className="w-3.5 h-3.5" /> {isPublishing ? 'Publishing...' : 'Publish Live'}
                                </button>
                            </div>
                        </div>

                        {/* Settings Form content */}
                        <form onSubmit={handleSaveDraft} className="flex-1 space-y-6">
                            {activeSection === 'branding' && (
                                <div className="space-y-5">
                                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">Mini-App Branding</h3>

                                    {/* Store Logo Upload & Preview Card */}
                                    <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-150 dark:border-gray-750">
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                            Store Logo & Avatar
                                        </label>
                                        <div className="flex items-center gap-4">
                                            {form.branding.logo ? (
                                                <div className="relative group w-16 h-16 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 overflow-hidden bg-white shadow-sm flex items-center justify-center">
                                                    <img src={form.branding.logo} alt="Logo" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => updateField('branding', 'logo', '')}
                                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 text-white flex items-center justify-center transition"
                                                        title="Remove logo"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-400" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-750 bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400">
                                                    <Image className="w-6 h-6" />
                                                </div>
                                            )}

                                            <div className="space-y-1.5 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 transition">
                                                        {isUploadingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                                        <span>{isUploadingLogo ? 'Uploading...' : 'Upload Image'}</span>
                                                        <input
                                                            type="file"
                                                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                                            className="hidden"
                                                            onChange={handleLogoUpload}
                                                            disabled={isUploadingLogo}
                                                        />
                                                    </label>
                                                    {form.branding.logo && (
                                                        <button
                                                            type="button"
                                                            onClick={() => updateField('branding', 'logo', '')}
                                                            className="text-xs text-red-600 dark:text-red-400 hover:underline font-semibold"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                    PNG, JPG, WebP or SVG (Recommended: 400x400 square, max 3MB).
                                                </p>
                                            </div>
                                        </div>

                                        {/* Direct Logo URL fallback */}
                                        <div className="pt-2 border-t border-gray-150 dark:border-gray-800">
                                            <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                                                Or Direct Image URL
                                            </label>
                                            <input
                                                type="url"
                                                className="w-full bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                                value={form.branding.logo}
                                                onChange={(e) => updateField('branding', 'logo', e.target.value)}
                                                placeholder="https://example.com/logo.png"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Theme Color (Primary)</label>
                                        <div className="flex gap-3 items-center">
                                            <input
                                                type="color"
                                                className="w-10 h-10 border border-gray-200 rounded-lg p-0.5"
                                                value={form.branding.primary_color}
                                                onChange={(e) => updateField('branding', 'primary_color', e.target.value)}
                                            />
                                            <span className="text-xs font-mono text-gray-500">{form.branding.primary_color}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Business Display Name</label>
                                        <input
                                            type="text"
                                            className="w-full bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                            value={form.branding.business_name}
                                            onChange={(e) => updateField('branding', 'business_name', e.target.value)}
                                            placeholder="Your restaurant or cafe name"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Tagline / Headline</label>
                                        <input
                                            type="text"
                                            className="w-full bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                            value={form.branding.tagline}
                                            onChange={(e) => updateField('branding', 'tagline', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {activeSection === 'ordering' && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">Ordering & Delivery Settings</h3>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Minimum Order Amount (Rs.)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                            value={form.ordering.min_order}
                                            onChange={(e) => updateField('ordering', 'min_order', parseInt(e.target.value) || 0)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Delivery Fee (Rs.)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                                value={form.ordering.delivery_fee}
                                                onChange={(e) => updateField('ordering', 'delivery_fee', parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Free Delivery Over (Rs.)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                                value={form.ordering.free_delivery_threshold}
                                                onChange={(e) => updateField('ordering', 'free_delivery_threshold', parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1 pt-2 border-t border-gray-100 dark:border-gray-700">
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                            Marketplace Commission Benchmark (%)
                                        </label>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                            Typical commission take-rate charged by 3rd-party aggregators (e.g. Foodpanda / UberEats). Used on your dashboard to transparently calculate your direct savings.
                                        </p>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.5"
                                            className="w-full bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                            value={form.ordering.marketplace_commission_rate}
                                            onChange={(e) => updateField('ordering', 'marketplace_commission_rate', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-gray-150 dark:border-gray-700 space-y-2">
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Dashboard 10-Minute Launch Checklist</label>
                                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                            <div>
                                                <div className="text-xs font-bold text-gray-800 dark:text-gray-200">Launch Checklist Preference</div>
                                                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                                    {isChecklistHidden ? 'Currently hidden from your main dashboard.' : 'Currently visible on your main dashboard.'}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={toggleChecklistPreference}
                                                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${isChecklistHidden
                                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                                                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300'
                                                    }`}
                                            >
                                                {isChecklistHidden ? 'Restore to Dashboard' : 'Hide from Dashboard'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'payments' && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">Payment Options</h3>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="cod"
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            checked={form.payments.cod_enabled}
                                            onChange={(e) => updateField('payments', 'cod_enabled', e.target.checked)}
                                        />
                                        <label htmlFor="cod" className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                            Enable Cash on Delivery (COD)
                                        </label>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'whatsapp' && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">Custom Notification Alerts</h3>
                                    <p className="text-[10px] text-gray-400">Use <code>&#123;order_number&#125;</code> inside templates to dynamically show order IDs.</p>

                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Kitchen Preparing Alert</label>
                                            <textarea
                                                className="w-full bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                                rows="2"
                                                value={form.whatsapp.order_preparing}
                                                onChange={(e) => updateField('whatsapp', 'order_preparing', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Ready / Out for Delivery Alert</label>
                                            <textarea
                                                className="w-full bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                                rows="2"
                                                value={form.whatsapp.order_ready}
                                                onChange={(e) => updateField('whatsapp', 'order_ready', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Delivered Alert</label>
                                            <textarea
                                                className="w-full bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                                rows="2"
                                                value={form.whatsapp.order_delivered}
                                                onChange={(e) => updateField('whatsapp', 'order_delivered', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Sticky footer action button */}
                            <div className="border-t border-gray-100 dark:border-gray-750 pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 font-bold py-2.5 px-6 rounded-lg text-xs disabled:bg-gray-400"
                                >
                                    <Save className="w-3.5 h-3.5" /> {isSaving ? 'Saving Draft...' : 'Save Draft'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
