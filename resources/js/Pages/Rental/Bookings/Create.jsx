import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Car, Users, DollarSign, Calculator, Calendar } from 'lucide-react';

export default function BookingCreate({ vehicles, drivers, clients, vendors }) {
    const [fulfillmentType, setFulfillmentType] = useState('fleet'); // 'fleet' or 'vendor'
    const [estimatedDays, setEstimatedDays] = useState(2);

    const { data, setData, post, processing, errors } = useForm({
        client_id: clients[0]?.id || '',
        vehicle_id: vehicles[0]?.id || '',
        driver_id: drivers[0]?.id || '',
        third_party_vendor_id: vendors[0]?.id || '',
        pricing_mode: 'daily',
        lumpsum_amount: '',
        daily_driver_rate: 6000,
        daily_lunch_rate: 500,
        start_date: new Date().toISOString().slice(0, 16),
        notes: '',
    });

    const dailyRate = Number(data.daily_driver_rate || 0);
    const lunchRate = Number(data.daily_lunch_rate || 0);
    const estimatedDailyTotal = (dailyRate + lunchRate) * (Number(estimatedDays) || 1);

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...data,
            vehicle_id: fulfillmentType === 'fleet' ? data.vehicle_id : null,
            third_party_vendor_id: fulfillmentType === 'vendor' ? data.third_party_vendor_id : null,
        };
        post(route('rental.bookings.store'), { data: payload });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route('rental.bookings.index')}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            Reserve Rental Booking
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Assign fleet car or partner supplier, schedule driver, and configure pricing terms.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Create Booking" />

            <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8 space-y-6">
                    {/* Client Selection */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <InputLabel htmlFor="client_id" value="Renter / Client *" />
                            <Link href={route('rental.clients.index')} className="text-xs text-emerald-600 hover:text-emerald-500 font-semibold">
                                + Register New Client
                            </Link>
                        </div>
                        <select
                            id="client_id"
                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                            value={data.client_id}
                            onChange={(e) => setData('client_id', e.target.value)}
                            required
                        >
                            <option value="">-- Select Client --</option>
                            {clients.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name} ({c.phone})
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.client_id} className="mt-1" />
                    </div>

                    {/* Fulfillment Selection */}
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60">
                        <InputLabel value="Fulfillment Vehicle Source *" />
                        <div className="grid grid-cols-2 gap-3 mt-2">
                            <button
                                type="button"
                                onClick={() => setFulfillmentType('fleet')}
                                className={`p-4 rounded-xl border text-left transition flex items-center gap-3 ${
                                    fulfillmentType === 'fleet'
                                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300'
                                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                <Car className="w-5 h-5 text-emerald-600" />
                                <div>
                                    <p className="font-bold text-sm">Own Fleet Vehicle</p>
                                    <p className="text-xs text-gray-500">{vehicles.length} cars currently available</p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setFulfillmentType('vendor')}
                                className={`p-4 rounded-xl border text-left transition flex items-center gap-3 ${
                                    fulfillmentType === 'vendor'
                                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300'
                                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                <Users className="w-5 h-5 text-indigo-600" />
                                <div>
                                    <p className="font-bold text-sm">Third-Party Sourcing</p>
                                    <p className="text-xs text-gray-500">Outsourced when fleet is full</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Fleet Vehicle or Third-Party Select */}
                    {fulfillmentType === 'fleet' ? (
                        <div>
                            <InputLabel htmlFor="vehicle_id" value="Select Available Vehicle *" />
                            <select
                                id="vehicle_id"
                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                                value={data.vehicle_id}
                                onChange={(e) => setData('vehicle_id', e.target.value)}
                                required={fulfillmentType === 'fleet'}
                            >
                                <option value="">-- Choose Car --</option>
                                {vehicles.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.model} ({v.plate_number}) - Current: {v.mileage?.toLocaleString() || 0} km
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.vehicle_id} className="mt-1" />
                        </div>
                    ) : (
                        <div>
                            <InputLabel htmlFor="third_party_vendor_id" value="Select Sourcing Partner *" />
                            <select
                                id="third_party_vendor_id"
                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                                value={data.third_party_vendor_id}
                                onChange={(e) => setData('third_party_vendor_id', e.target.value)}
                                required={fulfillmentType === 'vendor'}
                            >
                                <option value="">-- Choose Supplier --</option>
                                {vendors.map((vn) => (
                                    <option key={vn.id} value={vn.id}>
                                        {vn.vendor_name} ({vn.contact || 'No contact'})
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.third_party_vendor_id} className="mt-1" />
                        </div>
                    )}

                    {/* Driver Selection */}
                    <div>
                        <InputLabel htmlFor="driver_id" value="Assigned Driver" />
                        <select
                            id="driver_id"
                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                            value={data.driver_id}
                            onChange={(e) => setData('driver_id', e.target.value)}
                        >
                            <option value="">-- No Driver (Self-Drive) --</option>
                            {drivers.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name} ({d.phone})
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.driver_id} className="mt-1" />
                    </div>

                    {/* Start Date */}
                    <div>
                        <InputLabel htmlFor="start_date" value="Rental Departure Date & Time *" />
                        <TextInput
                            id="start_date"
                            type="datetime-local"
                            className="mt-1 block w-full"
                            value={data.start_date}
                            onChange={(e) => setData('start_date', e.target.value)}
                            required
                        />
                        <InputError message={errors.start_date} className="mt-1" />
                    </div>

                    {/* Pricing Mode Toggle */}
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60">
                        <InputLabel value="Rental Pricing Mode *" />
                        <div className="flex gap-4 mt-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200 cursor-pointer">
                                <input
                                    type="radio"
                                    name="pricing_mode"
                                    value="daily"
                                    checked={data.pricing_mode === 'daily'}
                                    onChange={(e) => setData('pricing_mode', e.target.value)}
                                    className="text-emerald-600 focus:ring-emerald-500"
                                />
                                <span>Daily Rate + Fuel Return Rule</span>
                            </label>

                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200 cursor-pointer">
                                <input
                                    type="radio"
                                    name="pricing_mode"
                                    value="lumpsum"
                                    checked={data.pricing_mode === 'lumpsum'}
                                    onChange={(e) => setData('pricing_mode', e.target.value)}
                                    className="text-emerald-600 focus:ring-emerald-500"
                                />
                                <span>Fixed Lumpsum Quote</span>
                            </label>
                        </div>
                    </div>

                    {/* Pricing Input Fields */}
                    {data.pricing_mode === 'daily' ? (
                        <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl space-y-4 border border-gray-100 dark:border-gray-700">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <InputLabel htmlFor="daily_driver_rate" value="Daily Driver Rate (PKR)" />
                                    <TextInput
                                        id="daily_driver_rate"
                                        type="number"
                                        className="mt-1 block w-full"
                                        value={data.daily_driver_rate}
                                        onChange={(e) => setData('daily_driver_rate', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="daily_lunch_rate" value="Daily Lunch Allowance (PKR)" />
                                    <TextInput
                                        id="daily_lunch_rate"
                                        type="number"
                                        className="mt-1 block w-full"
                                        value={data.daily_lunch_rate}
                                        onChange={(e) => setData('daily_lunch_rate', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="estimated_days" value="Estimated Duration (Days)" />
                                    <TextInput
                                        id="estimated_days"
                                        type="number"
                                        min="1"
                                        className="mt-1 block w-full"
                                        value={estimatedDays}
                                        onChange={(e) => setEstimatedDays(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-xs font-bold pt-2 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                                <span>Estimated Base Total (Excl. Fuel Shortfall):</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                                    Rs {estimatedDailyTotal.toLocaleString('en-PK')}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <InputLabel htmlFor="lumpsum_amount" value="Negotiated Lumpsum Total (PKR) *" />
                            <TextInput
                                id="lumpsum_amount"
                                type="number"
                                placeholder="e.g. 25000"
                                className="mt-1 block w-full"
                                value={data.lumpsum_amount}
                                onChange={(e) => setData('lumpsum_amount', e.target.value)}
                                required={data.pricing_mode === 'lumpsum'}
                            />
                            <InputError message={errors.lumpsum_amount} className="mt-1" />
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <InputLabel htmlFor="notes" value="Booking Instructions / Notes" />
                        <textarea
                            id="notes"
                            rows={3}
                            placeholder="Destination, luggage requirements, client preferences..."
                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <Link
                            href={route('rental.bookings.index')}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            Cancel
                        </Link>
                        <PrimaryButton disabled={processing} className="bg-emerald-600 hover:bg-emerald-500">
                            Confirm & Reserve Booking
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
