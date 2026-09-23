import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { MessageSquare, RefreshCw, CheckCircle, XCircle, Car, Users, Sparkles, Send, Phone } from 'lucide-react';

export default function RequestsIndex({ requests, availableVehicles, availableDrivers, vendors, stats }) {
    const [convertRequest, setConvertRequest] = useState(null);
    const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

    // Convert Form
    const convertForm = useForm({
        client_name: '',
        vehicle_id: '',
        driver_id: '',
        third_party_vendor_id: '',
        pricing_mode: 'daily',
        lumpsum_amount: '',
        daily_driver_rate: 6000,
        daily_lunch_rate: 500,
        start_date: new Date().toISOString().slice(0, 16),
        notes: '',
    });

    // Simulator Form
    const simulatorForm = useForm({
        from_phone: '+923001234567',
        from_name: 'Ahmed Khan',
        message_text: 'Hi, I need a car for 3 days to Islamabad starting tomorrow.',
    });

    const openConvertModal = (req) => {
        setConvertRequest(req);
        convertForm.setData({
            client_name: req.from_name || req.from_phone,
            vehicle_id: req.suggested_vehicle_id || (availableVehicles[0]?.id || ''),
            driver_id: req.suggested_driver_id || (availableDrivers[0]?.id || ''),
            third_party_vendor_id: '',
            pricing_mode: 'daily',
            lumpsum_amount: '',
            daily_driver_rate: 6000,
            daily_lunch_rate: 500,
            start_date: new Date().toISOString().slice(0, 16),
            notes: `Inquiry from WhatsApp: "${req.message_text}"`,
        });
    };

    const handleConvertSubmit = (e) => {
        e.preventDefault();
        convertForm.post(route('rental.requests.convert', convertRequest.id), {
            onSuccess: () => setConvertRequest(null),
        });
    };

    const handleRematch = (req) => {
        router.post(route('rental.requests.rematch', req.id));
    };

    const handleReject = (req) => {
        if (confirm('Reject this booking request?')) {
            router.post(route('rental.requests.reject', req.id));
        }
    };

    const handleSimulatorSubmit = (e) => {
        e.preventDefault();
        simulatorForm.post(route('rental.requests.simulate'), {
            onSuccess: () => setIsSimulatorOpen(false),
        });
    };

    const statusBadge = (status) => {
        const map = {
            matched: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-300',
            unmatched: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300',
            converted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300',
            rejected: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-300',
        };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${map[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            WhatsApp/App Request Inbox
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Incoming chat & App inquiries auto-matched to available fleet vehicles and drivers.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsSimulatorOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md transition"
                    >
                        <Sparkles className="w-4 h-4" /> Simulate WhatsApp Message
                    </button>
                </div>
            }
        >
            <Head title="WhatsApp/App Request Inbox" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Auto-Matched</span>
                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.matched}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Unmatched (Fleet Busy)</span>
                        <div className="text-2xl font-black text-amber-500 mt-1">{stats.unmatched}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Converted Bookings</span>
                        <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats.converted}</div>
                    </div>
                </div>

                {/* Inbox List */}
                {requests.data.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700 shadow-sm">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Inbound Requests</h3>
                        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                            When customers text your WhatsApp Business number, their inquiries will land here pre-matched with your available cars.
                        </p>
                        <button
                            onClick={() => setIsSimulatorOpen(true)}
                            className="mt-5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md transition"
                        >
                            Try WhatsApp Simulator
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.data.map((req) => (
                            <div
                                key={req.id}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white text-base">
                                            <Phone className="w-4 h-4 text-emerald-500" />
                                            {req.from_name ? `${req.from_name} (${req.from_phone})` : req.from_phone}
                                        </div>
                                        {statusBadge(req.status)}
                                        <span className="text-xs text-gray-400">
                                            {new Date(req.created_at).toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="p-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl text-sm text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700/60">
                                        "{req.message_text}"
                                    </div>

                                    {/* Auto-Match Suggestion Chips */}
                                    <div className="flex flex-wrap items-center gap-3 text-xs">
                                        <span className="font-semibold text-gray-500">Auto-Match:</span>
                                        {req.suggested_vehicle ? (
                                            <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 font-semibold">
                                                <Car className="w-3.5 h-3.5" />
                                                {req.suggested_vehicle.model} ({req.suggested_vehicle.plate_number})
                                            </span>
                                        ) : (
                                            <span className="text-amber-500 font-medium">No free vehicle in fleet</span>
                                        )}

                                        {req.suggested_driver ? (
                                            <span className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 font-semibold">
                                                <Users className="w-3.5 h-3.5" />
                                                Driver: {req.suggested_driver.name}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">No driver assigned</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                                    {req.status !== 'converted' && req.status !== 'rejected' && (
                                        <>
                                            <button
                                                onClick={() => handleRematch(req)}
                                                className="p-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition"
                                                title="Re-run Auto-Matcher"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() => openConvertModal(req)}
                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-sm transition"
                                            >
                                                1-Click Convert to Booking
                                            </button>

                                            <button
                                                onClick={() => handleReject(req)}
                                                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-700 rounded-xl transition"
                                                title="Reject Request"
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}

                                    {req.status === 'converted' && req.booking && (
                                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800">
                                            Booking #{req.booking.booking_number || req.booking.id}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ---------- 1-CLICK CONVERT MODAL ---------- */}
            <Modal show={!!convertRequest} onClose={() => setConvertRequest(null)}>
                <form onSubmit={handleConvertSubmit} className="p-6 space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Convert Request to Booking
                    </h3>
                    <p className="text-xs text-gray-500">
                        Upsert customer in CRM and confirm vehicle reservation in one action.
                    </p>

                    <div>
                        <InputLabel htmlFor="client_name" value="Customer Name *" />
                        <TextInput
                            id="client_name"
                            type="text"
                            className="mt-1 block w-full"
                            value={convertForm.data.client_name}
                            onChange={(e) => convertForm.setData('client_name', e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="convert_vehicle_id" value="Assigned Vehicle *" />
                        <select
                            id="convert_vehicle_id"
                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                            value={convertForm.data.vehicle_id}
                            onChange={(e) => convertForm.setData('vehicle_id', e.target.value)}
                        >
                            <option value="">-- No Owned Vehicle (Select Third-Party) --</option>
                            {availableVehicles.map((v) => (
                                <option key={v.id} value={v.id}>
                                    {v.model} ({v.plate_number})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <InputLabel htmlFor="convert_driver_id" value="Assigned Driver" />
                        <select
                            id="convert_driver_id"
                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                            value={convertForm.data.driver_id}
                            onChange={(e) => convertForm.setData('driver_id', e.target.value)}
                        >
                            <option value="">-- Self-Drive (No Driver) --</option>
                            {availableDrivers.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name} ({d.phone})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <InputLabel value="Pricing Mode" />
                            <select
                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm text-sm"
                                value={convertForm.data.pricing_mode}
                                onChange={(e) => convertForm.setData('pricing_mode', e.target.value)}
                            >
                                <option value="daily">Daily + Fuel Rule</option>
                                <option value="lumpsum">Fixed Lumpsum</option>
                            </select>
                        </div>
                        <div>
                            <InputLabel value="Departure Date" />
                            <TextInput
                                type="datetime-local"
                                className="mt-1 block w-full text-xs"
                                value={convertForm.data.start_date}
                                onChange={(e) => convertForm.setData('start_date', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <SecondaryButton onClick={() => setConvertRequest(null)}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={convertForm.processing} className="bg-emerald-600 hover:bg-emerald-500">
                            Confirm Booking & Lock Fleet
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* ---------- WHATSAPP SIMULATOR MODAL ---------- */}
            <Modal show={isSimulatorOpen} onClose={() => setIsSimulatorOpen(false)}>
                <form onSubmit={handleSimulatorSubmit} className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-xl text-emerald-600">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                WhatsApp Inquiry Simulator
                            </h3>
                            <p className="text-xs text-gray-500">
                                Feeds the exact same webhook and auto-matching pipeline as the Meta / Evolution API.
                            </p>
                        </div>
                    </div>

                    <div>
                        <InputLabel htmlFor="sim_phone" value="Customer Phone Number *" />
                        <TextInput
                            id="sim_phone"
                            type="text"
                            className="mt-1 block w-full"
                            value={simulatorForm.data.from_phone}
                            onChange={(e) => simulatorForm.setData('from_phone', e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="sim_name" value="Customer Name" />
                        <TextInput
                            id="sim_name"
                            type="text"
                            className="mt-1 block w-full"
                            value={simulatorForm.data.from_name}
                            onChange={(e) => simulatorForm.setData('from_name', e.target.value)}
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="sim_text" value="Inbound Message Text *" />
                        <textarea
                            id="sim_text"
                            rows={3}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                            value={simulatorForm.data.message_text}
                            onChange={(e) => simulatorForm.setData('message_text', e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <SecondaryButton onClick={() => setIsSimulatorOpen(false)}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={simulatorForm.processing} className="bg-emerald-600 hover:bg-emerald-500">
                            Send Simulated WhatsApp Message
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
