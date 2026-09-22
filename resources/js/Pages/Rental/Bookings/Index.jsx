import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Key, Plus, Fuel, Gauge, DollarSign, Calendar, CheckCircle, XCircle, ArrowRight, CreditCard, AlertCircle } from 'lucide-react';

export default function BookingsIndex({ bookings, statusFilter, availableVehicles, availableDrivers, clients, vendors }) {
    const [pickupBooking, setPickupBooking] = useState(null);
    const [dropoffBooking, setDropoffBooking] = useState(null);
    const [paymentBooking, setPaymentBooking] = useState(null);

    // Pickup Form
    const pickupForm = useForm({
        fuel_level_pickup: 100,
        mileage_pickup: 0,
    });

    // Dropoff Form
    const dropoffForm = useForm({
        fuel_level_dropoff: 100,
        mileage_dropoff: 0,
        fuel_settlement: 'charged_to_bill',
    });

    // Payment Form
    const paymentForm = useForm({
        booking_id: '',
        amount: '',
        method: 'cash',
        transaction_ref: '',
    });

    const openPickupModal = (b) => {
        setPickupBooking(b);
        pickupForm.setData({
            fuel_level_pickup: 100,
            mileage_pickup: b.vehicle?.mileage || 0,
        });
    };

    const handlePickupSubmit = (e) => {
        e.preventDefault();
        pickupForm.post(route('rental.bookings.pickup', pickupBooking.id), {
            onSuccess: () => setPickupBooking(null),
        });
    };

    const openDropoffModal = (b) => {
        setDropoffBooking(b);
        dropoffForm.setData({
            fuel_level_dropoff: b.fuel_level_pickup ?? 100,
            mileage_dropoff: (b.mileage_pickup || b.vehicle?.mileage || 0) + 100,
            fuel_settlement: 'charged_to_bill',
        });
    };

    const handleDropoffSubmit = (e) => {
        e.preventDefault();
        dropoffForm.post(route('rental.bookings.dropoff', dropoffBooking.id), {
            onSuccess: () => setDropoffBooking(null),
        });
    };

    const openPaymentModal = (b) => {
        setPaymentBooking(b);
        const alreadyPaid = (b.payments || []).reduce((acc, p) => p.status === 'paid' ? acc + Number(p.amount) : acc, 0);
        const remaining = Math.max(0, Number(b.total_cost || 0) - alreadyPaid);
        paymentForm.setData({
            booking_id: b.id,
            amount: remaining > 0 ? remaining : (b.total_cost || 6500),
            method: 'cash',
            transaction_ref: '',
        });
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        paymentForm.post(route('rental.payments.store'), {
            onSuccess: () => setPaymentBooking(null),
        });
    };

    const handleCancel = (b) => {
        if (confirm(`Cancel booking ${b.booking_number || b.id}? The vehicle and driver will be returned to Available.`)) {
            router.post(route('rental.bookings.cancel', b.id));
        }
    };

    const fmtCurrency = (val) => 'Rs ' + Number(val || 0).toLocaleString('en-PK');

    const statusBadge = (status) => {
        const map = {
            pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300',
            active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300',
            completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300',
            cancelled: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-300',
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
                            Rental Bookings
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Manage vehicle pickups, drop-offs, fuel shortfall settlements, and billing.
                        </p>
                    </div>
                    <Link
                        href={route('rental.bookings.create')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md transition"
                    >
                        <Plus className="w-4 h-4" /> Create Booking
                    </Link>
                </div>
            }
        >
            <Head title="Rental Bookings" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* ---------- STATUS TABS ---------- */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 space-x-4 overflow-x-auto pb-1 text-sm font-semibold">
                    {['all', 'pending', 'active', 'completed', 'cancelled'].map((tab) => (
                        <Link
                            key={tab}
                            href={route('rental.bookings.index', { status: tab })}
                            className={`pb-3 px-1 border-b-2 capitalize transition-colors ${
                                statusFilter === tab
                                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                        >
                            {tab}
                        </Link>
                    ))}
                </div>

                {bookings.data.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700 shadow-sm">
                        <Key className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Bookings Found</h3>
                        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                            There are currently no bookings under the "{statusFilter}" filter.
                        </p>
                        <Link
                            href={route('rental.bookings.create')}
                            className="inline-block mt-5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md transition"
                        >
                            Create First Booking
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 text-gray-400 uppercase text-[10px] tracking-wider">
                                        <th className="py-3.5 px-6">Booking Ref</th>
                                        <th className="py-3.5 px-6">Client</th>
                                        <th className="py-3.5 px-6">Vehicle & Driver</th>
                                        <th className="py-3.5 px-6">Pricing & Fuel</th>
                                        <th className="py-3.5 px-6">Status</th>
                                        <th className="py-3.5 px-6 text-right">Workflow Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                                    {bookings.data.map((b) => (
                                        <tr key={b.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition">
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-gray-900 dark:text-white">
                                                    {b.booking_number || `#${b.id}`}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(b.start_date).toLocaleDateString()}
                                                </div>
                                            </td>

                                            <td className="py-4 px-6">
                                                <div className="font-bold text-gray-900 dark:text-white">
                                                    {b.client?.name || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-500 font-mono">
                                                    {b.client?.phone}
                                                </div>
                                            </td>

                                            <td className="py-4 px-6">
                                                <div className="font-semibold text-gray-800 dark:text-gray-200">
                                                    {b.vehicle ? `${b.vehicle.model} (${b.vehicle.plate_number})` : (b.third_party_vendor?.vendor_name ? `Partner: ${b.third_party_vendor.vendor_name}` : 'No Vehicle')}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    {b.driver ? `Driver: ${b.driver.name}` : 'Self-Drive / No Driver'}
                                                </div>
                                            </td>

                                            <td className="py-4 px-6">
                                                <div className="font-bold text-gray-900 dark:text-white">
                                                    {fmtCurrency(b.total_cost > 0 ? b.total_cost : (b.pricing_mode === 'lumpsum' ? b.lumpsum_amount : b.daily_driver_rate))}
                                                </div>
                                                <div className="text-xs text-gray-500 capitalize">
                                                    {b.pricing_mode} {b.number_of_days ? `(${b.number_of_days} days)` : ''}
                                                </div>
                                                {b.fuel_shortfall_fee > 0 && (
                                                    <div className="text-[11px] text-amber-500 font-semibold mt-0.5">
                                                        Fuel fee: {fmtCurrency(b.fuel_shortfall_fee)}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="py-4 px-6">
                                                {statusBadge(b.status)}
                                            </td>

                                            <td className="py-4 px-6 text-right space-x-2">
                                                {b.status === 'pending' && (
                                                    <button
                                                        onClick={() => openPickupModal(b)}
                                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-sm transition"
                                                    >
                                                        Pickup Handover
                                                    </button>
                                                )}

                                                {b.status === 'active' && (
                                                    <button
                                                        onClick={() => openDropoffModal(b)}
                                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-sm transition"
                                                    >
                                                        Drop-off Return
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => openPaymentModal(b)}
                                                    className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-gray-700 rounded-lg transition"
                                                    title="Record Payment"
                                                >
                                                    <DollarSign className="w-4 h-4" />
                                                </button>

                                                {b.status !== 'completed' && b.status !== 'cancelled' && (
                                                    <button
                                                        onClick={() => handleCancel(b)}
                                                        className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-700 rounded-lg transition"
                                                        title="Cancel Booking"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* ---------- PICKUP / HANDOVER MODAL ---------- */}
            <Modal show={!!pickupBooking} onClose={() => setPickupBooking(null)}>
                <form onSubmit={handlePickupSubmit} className="p-6 space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Record Vehicle Handover / Pickup
                    </h3>
                    <p className="text-xs text-gray-500">
                        Record vehicle starting odometer and fuel level before client departs.
                    </p>

                    <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-gray-700 dark:text-gray-300">Fuel Level at Pickup</span>
                            <span className="text-emerald-600 font-mono">{pickupForm.data.fuel_level_pickup}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            className="w-full accent-emerald-600"
                            value={pickupForm.data.fuel_level_pickup}
                            onChange={(e) => pickupForm.setData('fuel_level_pickup', parseInt(e.target.value))}
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="mileage_pickup" value="Odometer Mileage at Pickup (km) *" />
                        <TextInput
                            id="mileage_pickup"
                            type="number"
                            className="mt-1 block w-full"
                            value={pickupForm.data.mileage_pickup}
                            onChange={(e) => pickupForm.setData('mileage_pickup', parseInt(e.target.value))}
                            required
                        />
                        <InputError message={pickupForm.errors.mileage_pickup} className="mt-1" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <SecondaryButton onClick={() => setPickupBooking(null)}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={pickupForm.processing} className="bg-emerald-600 hover:bg-emerald-500">
                            Confirm Pickup & Activate
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* ---------- DROPOFF / RETURN MODAL ---------- */}
            <Modal show={!!dropoffBooking} onClose={() => setDropoffBooking(null)}>
                <form onSubmit={handleDropoffSubmit} className="p-6 space-y-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Process Vehicle Return / Drop-Off
                    </h3>
                    <p className="text-xs text-gray-500">
                        Enforce fuel return policy and auto-flag vehicle for maintenance if threshold is exceeded.
                    </p>

                    <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-gray-700 dark:text-gray-300">Fuel Level at Return</span>
                            <span className="text-blue-600 font-mono">{dropoffForm.data.fuel_level_dropoff}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            className="w-full accent-blue-600"
                            value={dropoffForm.data.fuel_level_dropoff}
                            onChange={(e) => dropoffForm.setData('fuel_level_dropoff', parseInt(e.target.value))}
                        />
                        <div className="text-[11px] text-gray-500 mt-1">
                            Pickup was {dropoffBooking?.fuel_level_pickup || 100}%. Shortfall: {Math.max(0, (dropoffBooking?.fuel_level_pickup || 100) - dropoffForm.data.fuel_level_dropoff)}%
                        </div>
                    </div>

                    <div>
                        <InputLabel htmlFor="mileage_dropoff" value="Odometer Mileage at Return (km) *" />
                        <TextInput
                            id="mileage_dropoff"
                            type="number"
                            className="mt-1 block w-full"
                            value={dropoffForm.data.mileage_dropoff}
                            onChange={(e) => dropoffForm.setData('mileage_dropoff', parseInt(e.target.value))}
                            required
                        />
                        <InputError message={dropoffForm.errors.mileage_dropoff} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel value="Fuel Settlement Policy *" />
                        <div className="mt-2 space-y-2">
                            <label className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                                <input
                                    type="radio"
                                    name="fuel_settlement"
                                    value="charged_to_bill"
                                    checked={dropoffForm.data.fuel_settlement === 'charged_to_bill'}
                                    onChange={(e) => dropoffForm.setData('fuel_settlement', e.target.value)}
                                    className="text-emerald-600 focus:ring-emerald-500"
                                />
                                <div>
                                    <span className="font-bold">Charge Shortfall to Customer Bill</span>
                                    <span className="text-gray-400 block text-[11px]">Shortfall fee automatically calculated and added to invoice.</span>
                                </div>
                            </label>

                            <label className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                                <input
                                    type="radio"
                                    name="fuel_settlement"
                                    value="cash_to_driver"
                                    checked={dropoffForm.data.fuel_settlement === 'cash_to_driver'}
                                    onChange={(e) => dropoffForm.setData('fuel_settlement', e.target.value)}
                                    className="text-emerald-600 focus:ring-emerald-500"
                                />
                                <div>
                                    <span className="font-bold">Client Paid Cash to Driver</span>
                                    <span className="text-gray-400 block text-[11px]">Logged for reconciliation, not added to company bill.</span>
                                </div>
                            </label>

                            <label className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                                <input
                                    type="radio"
                                    name="fuel_settlement"
                                    value="refilled_by_client"
                                    checked={dropoffForm.data.fuel_settlement === 'refilled_by_client'}
                                    onChange={(e) => dropoffForm.setData('fuel_settlement', e.target.value)}
                                    className="text-emerald-600 focus:ring-emerald-500"
                                />
                                <div>
                                    <span className="font-bold">Refilled by Client (No Shortfall Charge)</span>
                                    <span className="text-gray-400 block text-[11px]">Client returned tank at pickup level.</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <SecondaryButton onClick={() => setDropoffBooking(null)}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={dropoffForm.processing} className="bg-blue-600 hover:bg-blue-500">
                            Finalize Drop-Off & Settle
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* ---------- PAYMENT MODAL ---------- */}
            <Modal show={!!paymentBooking} onClose={() => setPaymentBooking(null)}>
                <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Record Rental Payment</h3>

                    <div>
                        <InputLabel htmlFor="amount" value="Payment Amount (PKR) *" />
                        <TextInput
                            id="amount"
                            type="number"
                            className="mt-1 block w-full"
                            value={paymentForm.data.amount}
                            onChange={(e) => paymentForm.setData('amount', e.target.value)}
                            required
                        />
                        <InputError message={paymentForm.errors.amount} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="method" value="Payment Method *" />
                        <select
                            id="method"
                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                            value={paymentForm.data.method}
                            onChange={(e) => paymentForm.setData('method', e.target.value)}
                        >
                            <option value="cash">Cash in Hand</option>
                            <option value="jazzcash">JazzCash Mobile Account / QR</option>
                            <option value="easypaisa">EasyPaisa</option>
                            <option value="bank_transfer">Direct Bank Transfer</option>
                        </select>
                    </div>

                    <div>
                        <InputLabel htmlFor="transaction_ref" value="Transaction Reference / Note (Optional)" />
                        <TextInput
                            id="transaction_ref"
                            type="text"
                            placeholder="e.g. TID-982182"
                            className="mt-1 block w-full"
                            value={paymentForm.data.transaction_ref}
                            onChange={(e) => paymentForm.setData('transaction_ref', e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <SecondaryButton onClick={() => setPaymentBooking(null)}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={paymentForm.processing} className="bg-emerald-600 hover:bg-emerald-500">
                            Save Payment Record
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
