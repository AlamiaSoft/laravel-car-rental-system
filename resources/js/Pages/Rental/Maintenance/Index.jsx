import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Wrench, Plus, AlertTriangle, CheckCircle2, Gauge, Calendar, DollarSign, RefreshCw } from 'lucide-react';

export default function MaintenanceIndex({ logs, flaggedVehicles, vehicles }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        vehicle_id: vehicles[0]?.id || '',
        type: 'oil_change',
        mileage_at_service: '',
        service_interval_km: 5000,
        cost: '',
        notes: '',
        service_date: new Date().toISOString().slice(0, 10),
    });

    const openCreateModal = (vehicleId = null) => {
        reset();
        clearErrors();
        if (vehicleId) {
            const v = vehicles.find((item) => item.id === vehicleId);
            setData({
                vehicle_id: vehicleId,
                type: 'oil_change',
                mileage_at_service: v?.mileage || '',
                service_interval_km: 5000,
                cost: '',
                notes: '',
                service_date: new Date().toISOString().slice(0, 10),
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('rental.maintenance.store'), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
        });
    };

    const handleScan = () => {
        router.post(route('rental.maintenance.scan'));
    };

    const fmtCurrency = (val) => 'Rs ' + Number(val || 0).toLocaleString('en-PK');

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            Fleet Maintenance
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Track oil changes, tuning, brake services, and automatic odometer service flags.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleScan}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl shadow-sm transition"
                        >
                            <RefreshCw className="w-4 h-4 text-emerald-500" /> Run Odometer Scan
                        </button>
                        <button
                            onClick={() => openCreateModal()}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md transition"
                        >
                            <Plus className="w-4 h-4" /> Log Service
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Fleet Maintenance" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Overdue Alert Queue */}
                {flaggedVehicles.length > 0 && (
                    <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-5 shadow-sm space-y-3">
                        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold">
                            <AlertTriangle className="w-5 h-5 shrink-0" />
                            <span>Attention: {flaggedVehicles.length} Vehicle(s) Currently Due for Service</span>
                        </div>
                        <p className="text-xs text-rose-600 dark:text-rose-300">
                            These vehicles have reached their service mileage threshold and are removed from the available rental pool until a service log is recorded.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                            {flaggedVehicles.map((v) => (
                                <div key={v.id} className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/40 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-sm text-gray-900 dark:text-white">{v.model}</p>
                                        <p className="text-xs text-rose-600 font-mono font-semibold">
                                            {v.plate_number} • {v.mileage?.toLocaleString()} km (Due: {v.next_service_due_mileage?.toLocaleString()})
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => openCreateModal(v.id)}
                                        className="text-xs font-bold px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition"
                                    >
                                        Clear Flag
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Service History Table */}
                {logs.data.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700 shadow-sm">
                        <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Maintenance Logs Recorded</h3>
                        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                            Log routine oil changes and maintenance services to set fresh odometer intervals and maintain vehicle health.
                        </p>
                        <button
                            onClick={() => openCreateModal()}
                            className="mt-5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md transition"
                        >
                            Log First Service
                        </button>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 text-gray-400 uppercase text-[10px] tracking-wider">
                                        <th className="py-3.5 px-6">Vehicle</th>
                                        <th className="py-3.5 px-6">Service Type</th>
                                        <th className="py-3.5 px-6">Odometer at Service</th>
                                        <th className="py-3.5 px-6">Next Due Threshold</th>
                                        <th className="py-3.5 px-6">Service Cost</th>
                                        <th className="py-3.5 px-6">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                                    {logs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition">
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-gray-900 dark:text-white">
                                                    {log.vehicle ? `${log.vehicle.model}` : 'Vehicle N/A'}
                                                </div>
                                                <div className="text-xs text-gray-500 font-mono">
                                                    {log.vehicle?.plate_number}
                                                </div>
                                            </td>

                                            <td className="py-4 px-6 text-gray-800 dark:text-gray-200 font-medium capitalize">
                                                {log.type.replace('_', ' ')}
                                                {log.notes && <p className="text-xs text-gray-400 truncate max-w-xs">{log.notes}</p>}
                                            </td>

                                            <td className="py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">
                                                {log.mileage_at_service?.toLocaleString()} km
                                            </td>

                                            <td className="py-4 px-6 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                                                Due at: {log.next_due_mileage?.toLocaleString()} km
                                            </td>

                                            <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">
                                                {fmtCurrency(log.cost)}
                                            </td>

                                            <td className="py-4 px-6 text-gray-500 text-xs">
                                                {new Date(log.service_date).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* ---------- LOG SERVICE MODAL ---------- */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Record Fleet Maintenance Log
                    </h3>
                    <p className="text-xs text-gray-500">
                        Recording this service will update the next due odometer limit and restore the vehicle to Available.
                    </p>

                    <div>
                        <InputLabel htmlFor="m_vehicle_id" value="Select Vehicle *" />
                        <select
                            id="m_vehicle_id"
                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                            value={data.vehicle_id}
                            onChange={(e) => {
                                const vId = e.target.value;
                                const v = vehicles.find((item) => String(item.id) === String(vId));
                                setData({
                                    ...data,
                                    vehicle_id: vId,
                                    mileage_at_service: v?.mileage || '',
                                });
                            }}
                            required
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

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="m_type" value="Maintenance Type *" />
                            <select
                                id="m_type"
                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                            >
                                <option value="oil_change">Oil & Filter Change</option>
                                <option value="brake_service">Brake Pad Replacement</option>
                                <option value="engine_tuning">Engine Tuning & Spark Plugs</option>
                                <option value="tire_replacement">Tire Replacement & Alignment</option>
                                <option value="general_inspection">General Routine Inspection</option>
                            </select>
                        </div>

                        <div>
                            <InputLabel htmlFor="service_date" value="Service Date *" />
                            <TextInput
                                id="service_date"
                                type="date"
                                className="mt-1 block w-full"
                                value={data.service_date}
                                onChange={(e) => setData('service_date', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="mileage_at_service" value="Odometer at Service (km) *" />
                            <TextInput
                                id="mileage_at_service"
                                type="number"
                                className="mt-1 block w-full"
                                value={data.mileage_at_service}
                                onChange={(e) => setData('mileage_at_service', e.target.value)}
                                required
                            />
                            <InputError message={errors.mileage_at_service} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="service_interval_km" value="Interval to Next Service (km)" />
                            <TextInput
                                id="service_interval_km"
                                type="number"
                                placeholder="Default 5000"
                                className="mt-1 block w-full"
                                value={data.service_interval_km}
                                onChange={(e) => setData('service_interval_km', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <InputLabel htmlFor="cost" value="Service Cost (PKR)" />
                        <TextInput
                            id="cost"
                            type="number"
                            placeholder="e.g. 7500"
                            className="mt-1 block w-full"
                            value={data.cost}
                            onChange={(e) => setData('cost', e.target.value)}
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="notes" value="Service Notes / Parts Replaced" />
                        <textarea
                            id="notes"
                            rows={2}
                            placeholder="Shell 5W-30 synthetic, OEM oil filter..."
                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <SecondaryButton onClick={() => setIsModalOpen(false)}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={processing} className="bg-emerald-600 hover:bg-emerald-500">
                            Save Service & Restore Vehicle
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
