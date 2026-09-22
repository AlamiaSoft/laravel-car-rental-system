import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import { useEffect } from 'react';

export default function Settings({ settings, flash }) {
    const { data, setData, post, processing } = useForm({
        app_name: settings.app_name || '',
        company_address: settings.company_address || '',
        company_phone: settings.company_phone || '',
        company_email: settings.company_email || '',
        footer_notes: settings.footer_notes || '',
        payment_instructions: settings.payment_instructions || '',
        invoice_notifications: settings.invoice_notifications || 'manual',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'));
    };

    const clearCache = () => {
        post(route('admin.settings.clear-cache'));
    };

    return (
        <AdminLayout header={
            <div className="flex justify-between items-center">
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Global Settings</h2>
                <button onClick={clearCache} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded text-sm shadow">
                    Clear Cache
                </button>
            </div>
        }>
            <Head title="Global Settings" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {flash?.success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">{flash.success}</div>
                    )}
                    
                    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
                        <form onSubmit={submit} className="space-y-8">
                            
                            {/* Branding & Company Info */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">SaaS Branding & Company Info</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <InputLabel htmlFor="app_name" value="Application Name (SaaS Name)" />
                                        <TextInput
                                            id="app_name"
                                            className="mt-1 block w-full"
                                            value={data.app_name}
                                            onChange={(e) => setData('app_name', e.target.value)}
                                            placeholder="e.g. Hotel Wala Bot"
                                        />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <InputLabel htmlFor="company_email" value="Company Email" />
                                        <TextInput
                                            id="company_email"
                                            type="email"
                                            className="mt-1 block w-full"
                                            value={data.company_email}
                                            onChange={(e) => setData('company_email', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <InputLabel htmlFor="company_phone" value="Company Phone" />
                                        <TextInput
                                            id="company_phone"
                                            className="mt-1 block w-full"
                                            value={data.company_phone}
                                            onChange={(e) => setData('company_phone', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <InputLabel htmlFor="company_address" value="Company Address" />
                                        <textarea
                                            id="company_address"
                                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                            rows="2"
                                            value={data.company_address}
                                            onChange={(e) => setData('company_address', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <InputLabel htmlFor="footer_notes" value="Invoice Footer Notes (Thank you message, Developer text)" />
                                        <textarea
                                            id="footer_notes"
                                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                            rows="2"
                                            value={data.footer_notes}
                                            onChange={(e) => setData('footer_notes', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-200 dark:border-gray-700" />

                            {/* Billing Settings */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">General Billing Settings</h3>
                                <div className="space-y-6">
                                    <div>
                                        <InputLabel htmlFor="payment_instructions" value="Global Payment Instructions (e.g. IBAN, Raast ID)" />
                                        <textarea
                                            id="payment_instructions"
                                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                            rows="4"
                                            value={data.payment_instructions}
                                            onChange={(e) => setData('payment_instructions', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="invoice_notifications" value="WhatsApp Invoice Notifications" />
                                        <select
                                            id="invoice_notifications"
                                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                            value={data.invoice_notifications}
                                            onChange={(e) => setData('invoice_notifications', e.target.value)}
                                        >
                                            <option value="manual">Manual (Triggered by Admin)</option>
                                            <option value="auto">Auto (Sent instantly on generation)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-200 dark:border-gray-700" />

                            <div className="flex items-center gap-4 pt-4">
                                <PrimaryButton disabled={processing}>Save Settings</PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
