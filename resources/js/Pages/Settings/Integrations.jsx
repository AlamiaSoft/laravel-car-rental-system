import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function Integrations({ whatsapp, evolution }) {
    const [activeTab, setActiveTab] = useState(evolution ? 'evolution' : 'evolution');
    const [evoStatus, setEvoStatus] = useState(evolution ? evolution.status : 'disconnected');
    const [evoQr, setEvoQr] = useState(evolution ? evolution.qrcode : null);
    const [evoNumber, setEvoNumber] = useState(evolution ? evolution.phone_number : '');
    const [connecting, setConnecting] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    
    const pollingInterval = useRef(null);

    // Meta Form
    const { data: metaData, setData: setMetaData, post: postMeta, errors: metaErrors, processing: metaProcessing, recentlySuccessful: metaSuccess } = useForm({
        access_token: whatsapp.access_token || '',
        phone_number_id: whatsapp.phone_number_id || '',
    });

    const submitMeta = (e) => {
        e.preventDefault();
        postMeta(route('settings.integrations'), {
            preserveScroll: true,
        });
    };

    // Evolution connection trigger
    const startEvolutionConnection = async () => {
        setConnecting(true);
        setErrorMsg(null);
        try {
            const response = await axios.post(route('settings.whatsapp.evolution.connect'));
            if (response.data.success) {
                setEvoStatus(response.data.status);
                setEvoQr(response.data.qrcode);
            } else {
                setErrorMsg(response.data.message || 'Failed to initialize WhatsApp connection.');
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Error communicating with Evolution API.');
        } finally {
            setConnecting(false);
        }
    };

    // Polling connection status
    useEffect(() => {
        if (evoStatus === 'connecting') {
            pollingInterval.current = setInterval(async () => {
                try {
                    const response = await axios.get(route('settings.whatsapp.evolution.state'));
                    if (response.data.status === 'open') {
                        clearInterval(pollingInterval.current);
                        setEvoStatus('open');
                        setEvoQr(null);
                        setEvoNumber(response.data.phone_number);
                        router.reload({ only: ['evolution'] });
                    } else if (response.data.qrcode !== evoQr) {
                        setEvoQr(response.data.qrcode);
                    }
                } catch (err) {
                    console.error('Error polling connection state:', err);
                }
            }, 5000);
        }

        return () => {
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
            }
        };
    }, [evoStatus, evoQr]);

    const disconnectEvolution = () => {
        if (confirm('Are you sure you want to disconnect this WhatsApp number? Your bot will stop responding.')) {
            router.post(route('settings.whatsapp.evolution.disconnect'), {}, {
                onSuccess: () => {
                    setEvoStatus('disconnected');
                    setEvoQr(null);
                    setEvoNumber('');
                }
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Integration Settings</h2>}
        >
            <Head title="Integrations" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="p-6 sm:p-8 bg-white shadow sm:rounded-lg">
                        
                        {/* Tab Selector */}
                        <div className="border-b border-gray-200 mb-8">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('evolution')}
                                    className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                                        activeTab === 'evolution'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Direct Connect (QR Code)
                                </button>
                                <button
                                    onClick={() => setActiveTab('meta')}
                                    className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                                        activeTab === 'meta'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Meta Cloud API (Official)
                                </button>
                            </nav>
                        </div>

                        {/* Evolution Baileys Connection */}
                        {activeTab === 'evolution' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <section className="max-w-xl">
                                    <header>
                                        <h2 className="text-lg font-medium text-gray-900">Scan & Connect</h2>
                                        <p className="mt-1 text-sm text-gray-600">
                                            Connect your standard WhatsApp personal or business number instantly by scanning a QR code, just like WhatsApp Web.
                                        </p>
                                    </header>

                                    {errorMsg && (
                                        <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-md border border-red-100 text-sm">
                                            {errorMsg}
                                        </div>
                                    )}

                                    <div className="mt-8 space-y-6">
                                        {evoStatus === 'disconnected' && (
                                            <div>
                                                <p className="text-sm text-gray-600 mb-4">
                                                    Click the button below to generate a secure connection QR Code. Once generated, scan it with your WhatsApp phone within 2 minutes.
                                                </p>
                                                <PrimaryButton 
                                                    onClick={startEvolutionConnection}
                                                    disabled={connecting}
                                                >
                                                    {connecting ? 'Generating QR Code...' : 'Connect WhatsApp Number'}
                                                </PrimaryButton>
                                            </div>
                                        )}

                                        {evoStatus === 'connecting' && (
                                            <div className="flex flex-col items-center p-6 bg-gray-50 border border-gray-200 rounded-lg">
                                                {evoQr && (evoQr.startsWith('data:') || evoQr.length > 100) ? (
                                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                                        <img 
                                                            src={evoQr.startsWith('data:') ? evoQr : `data:image/png;base64,${evoQr}`} 
                                                            alt="WhatsApp Connection QR Code" 
                                                            className="w-64 h-64"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-64 h-64 flex flex-col items-center justify-center bg-gray-100 rounded-lg p-4 text-center">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                                                        <span className="text-xs text-gray-500 font-medium">Generating QR Code...</span>
                                                    </div>
                                                )}
                                                <p className="mt-6 text-sm font-semibold text-gray-900 text-center animate-pulse">
                                                    Waiting for scan...
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500 text-center max-w-xs">
                                                    Open WhatsApp on your phone &gt; Settings &gt; Linked Devices &gt; Link a Device.
                                                </p>
                                                <button 
                                                    onClick={startEvolutionConnection}
                                                    className="mt-4 text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
                                                >
                                                    Refresh QR Code
                                                </button>
                                            </div>
                                        )}

                                        {evoStatus === 'open' && (
                                            <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <div className="bg-green-100 p-2 rounded-full text-green-600">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-green-900">WhatsApp Connected</h3>
                                                        <p className="text-sm text-green-700">
                                                            Active Number: <span className="font-mono">+{evoNumber}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-6 flex space-x-4">
                                                    <button
                                                        onClick={disconnectEvolution}
                                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-all"
                                                    >
                                                        Disconnect Phone
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section className="bg-gray-50 p-6 rounded-lg border border-gray-100 h-fit">
                                    <h3 className="text-md font-semibold text-gray-900 mb-4">Direct Connect Benefits</h3>
                                    <ul className="list-disc list-outside ml-4 space-y-3 text-sm text-gray-600">
                                        <li><strong>No Approval Required:</strong> You don't need a Meta Business verification.</li>
                                        <li><strong>Fast Setup:</strong> Scans instantly and starts accepting orders immediately.</li>
                                        <li><strong>Full Messaging:</strong> Supports rich interactive buttons and drop-down menu lists natively.</li>
                                        <li><strong>Keep Your Chat History:</strong> The bot uses your actual active phone number; you can still read customer conversations in your WhatsApp app.</li>
                                    </ul>
                                </section>
                            </div>
                        )}

                        {/* Meta API Connection */}
                        {activeTab === 'meta' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <section className="max-w-xl">
                                    <header>
                                        <h2 className="text-lg font-medium text-gray-900">WhatsApp Business API</h2>
                                        <p className="mt-1 text-sm text-gray-600">
                                            Connect your official Meta WhatsApp Business account. You need a permanent access token and the Phone Number ID from your Meta App Dashboard.
                                        </p>
                                    </header>

                                    <form onSubmit={submitMeta} className="mt-6 space-y-6">
                                        <div>
                                            <InputLabel htmlFor="phone_number_id" value="Meta Phone Number ID" />
                                            <TextInput
                                                id="phone_number_id"
                                                className="mt-1 block w-full"
                                                value={metaData.phone_number_id}
                                                onChange={(e) => setMetaData('phone_number_id', e.target.value)}
                                                placeholder="e.g. 10245353245"
                                                autoComplete="off"
                                                data-1p-ignore
                                            />
                                            <InputError className="mt-2" message={metaErrors.phone_number_id} />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="access_token" value="Permanent Access Token" />
                                            <TextInput
                                                id="access_token"
                                                className="mt-1 block w-full"
                                                value={metaData.access_token}
                                                onChange={(e) => setMetaData('access_token', e.target.value)}
                                                type="password"
                                                placeholder="EAAG..."
                                                autoComplete="new-password"
                                                data-1p-ignore
                                            />
                                            <InputError className="mt-2" message={metaErrors.access_token} />
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <PrimaryButton disabled={metaProcessing}>Save API Credentials</PrimaryButton>

                                            <Transition
                                                show={metaSuccess}
                                                enter="transition ease-in-out"
                                                enterFrom="opacity-0"
                                                leave="transition ease-in-out"
                                                leaveTo="opacity-0"
                                            >
                                                <p className="text-sm text-gray-600">Saved.</p>
                                            </Transition>
                                        </div>
                                    </form>
                                </section>

                                <section className="bg-gray-50 p-6 rounded-lg border border-gray-100 h-fit">
                                    <h3 className="text-md font-semibold text-gray-900 mb-4">How to get your credentials?</h3>
                                    <ol className="list-decimal list-outside ml-4 space-y-3 text-sm text-gray-600">
                                        <li>Go to the <a href="https://developers.facebook.com/apps/" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Meta App Dashboard</a> and select your app.</li>
                                        <li>In the left sidebar, navigate to <strong>WhatsApp &gt; API Setup</strong>.</li>
                                        <li>Copy the <strong>Phone Number ID</strong> and paste it here.</li>
                                        <li>To get a Permanent Access Token, you must create a System User in your Meta Business Settings and generate a new token.</li>
                                        <li>Assign the <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">whatsapp_business_messaging</code> and <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">whatsapp_business_management</code> permissions.</li>
                                    </ol>
                                </section>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
