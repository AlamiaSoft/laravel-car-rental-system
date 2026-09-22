import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Car, Plus, Edit2, Trash2, AlertTriangle, Fuel, Gauge, CheckCircle2 } from 'lucide-react';

export default function VehiclesIndex({ vehicles }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [deletingVehicle, setDeletingVehicle] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        plate_number: '',
        model: '',
        year: new Date().getFullYear(),
        status: 'available',
        mileage: 0,
        fuel_tank_capacity: 45,
        gps_device_id: '',
        next_service_due_mileage: 5000,
        daily_rate: 6000,
    });

    const openCreateModal = () => {
        setEditingVehicle(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (v) => {
        setEditingVehicle(v);
        clearErrors();
        setData({
            plate_number: v.plate_number,
            model: v.model,
            year: v.year || '',
            status: v.status,
            mileage: v.mileage || 0,
            fuel_tank_capacity: v.fuel_tank_capacity || 45,
            gps_device_id: v.gps_device_id || '',
            next_service_due_mileage: v.next_service_due_mileage || 5000,
            daily_rate: v.daily_rate || 6000,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingVehicle) {
            put(route('rental.vehicles.update', editingVehicle.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('rental.vehicles.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = () => {
        if (!deletingVehicle) return;
        router.delete(route('rental.vehicles.destroy', deletingVehicle.id), {
            onSuccess: () => setDeletingVehicle(null),
        });
    };

    const statusBadge = (status) => {
        const map = {
            available: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-300',
            rented: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border-blue-300',
            maintenance: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border-rose-300',
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
                            Fleet Inventory
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Manage your company-owned vehicles, fuel capacities, and odometer maintenance limits.
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md transition"
                    >
                        <Plus className="w-4 h-4" /> Add Vehicle
                    </button>
                </div>
            }
        >
            <Head title="Fleet Vehicles" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {vehicles.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700 shadow-sm">
                        <Car className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Vehicles in Fleet</h3>
                        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                            Add your fleet vehicles with plate numbers and service mileage thresholds to begin taking bookings.
                        </p>
                        <button
                            onClick={openCreateModal}
                            className="mt-5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md transition"
                        >
                            Add Your First Vehicle
                        </button>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 text-gray-400 uppercase text-[10px] tracking-wider">
                                        <th className="py-3.5 px-6">Vehicle</th>
                                        <th className="py-3.5 px-6">Plate Number</th>
                                        <th className="py-3.5 px-6">Status</th>
                                        <th className="py-3.5 px-6">Mileage & Service Due</th>
                                        <th className="py-3.5 px-6">Fuel Tank</th>
                                        <th className="py-3.5 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                                    {vehicles.map((v) => {
                                        const isDue = v.next_service_due_mileage && v.mileage >= v.next_service_due_mileage;
                                        return (
                                            <tr key={v.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        {v.image_url ? (
                                                            <div className="relative group/img flex-shrink-0">
                                                                <img
                                                                    src={v.image_url}
                                                                    alt={v.model}
                                                                    className="w-16 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700 shadow-xs"
                                                                    loading="lazy"
                                                                />
                                                                {v.photo_metadata?.photographer && (
                                                                    <a
                                                                        href={v.photo_metadata.pexels_url || v.photo_metadata.photographer_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="hidden group-hover/img:block absolute bottom-0 left-0 right-0 bg-black/85 text-[8px] text-gray-200 text-center py-0.5 px-1 truncate rounded-b-lg"
                                                                        title={`Photo by ${v.photo_metadata.photographer} on Pexels`}
                                                                    >
                                                                        By {v.photo_metadata.photographer}
                                                                    </a>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="w-16 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl flex-shrink-0">
                                                                🚗
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="font-bold text-gray-900 dark:text-white">{v.model}</div>
                                                            <div className="text-xs text-gray-500">
                                                                {v.year ? `Year ${v.year}` : 'Model N/A'}
                                                                {v.photo_metadata?.photographer && (
                                                                    <span className="text-[10px] text-gray-400 ml-1.5">
                                                                        · <a href={v.photo_metadata.pexels_url} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 underline">Pexels</a>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="font-mono bg-gray-100 dark:bg-gray-900 px-2.5 py-1 rounded-md text-xs font-bold text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                                                        {v.plate_number}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {statusBadge(v.status)}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-gray-200">
                                                        <Gauge className="w-3.5 h-3.5 text-gray-400" />
                                                        {v.mileage?.toLocaleString() || 0} km
                                                    </div>
                                                    <div className={`text-xs mt-0.5 ${isDue ? 'text-rose-500 font-bold flex items-center gap-1' : 'text-gray-500'}`}>
                                                        {isDue && <AlertTriangle className="w-3 h-3" />}
                                                        Due at: {v.next_service_due_mileage?.toLocaleString() || 'N/A'} km
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                                                    <div className="flex items-center gap-1 text-xs font-medium">
                                                        <Fuel className="w-3.5 h-3.5 text-amber-500" />
                                                        {v.fuel_tank_capacity ? `${v.fuel_tank_capacity} L` : 'Standard (45L)'}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-right space-x-2">
                                                    <button
                                                        onClick={() => openEditModal(v)}
                                                        className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-gray-700 rounded-lg transition"
                                                        title="Edit Vehicle"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingVehicle(v)}
                                                        className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-700 rounded-lg transition"
                                                        title="Delete Vehicle"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* ---------- ADD / EDIT VEHICLE MODAL ---------- */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {editingVehicle ? 'Edit Vehicle Details' : 'Register New Fleet Vehicle'}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="plate_number" value="License Plate Number *" />
                            <TextInput
                                id="plate_number"
                                type="text"
                                className="mt-1 block w-full uppercase"
                                placeholder="e.g. LEA-2024"
                                value={data.plate_number}
                                onChange={(e) => setData('plate_number', e.target.value.toUpperCase())}
                                required
                            />
                            <InputError message={errors.plate_number} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="model" value="Make & Model *" />
                            <TextInput
                                id="model"
                                type="text"
                                className="mt-1 block w-full"
                                placeholder="e.g. Toyota Corolla GLi"
                                value={data.model}
                                onChange={(e) => setData('model', e.target.value)}
                                required
                            />
                            <InputError message={errors.model} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="year" value="Manufacturing Year" />
                            <TextInput
                                id="year"
                                type="number"
                                className="mt-1 block w-full"
                                value={data.year}
                                onChange={(e) => setData('year', e.target.value)}
                            />
                            <InputError message={errors.year} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="status" value="Operational Status *" />
                            <select
                                id="status"
                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                            >
                                <option value="available">Available for Rent</option>
                                <option value="rented">Currently Rented</option>
                                <option value="maintenance">Under Maintenance</option>
                            </select>
                            <InputError message={errors.status} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="mileage" value="Current Odometer (km) *" />
                            <TextInput
                                id="mileage"
                                type="number"
                                className="mt-1 block w-full"
                                value={data.mileage}
                                onChange={(e) => setData('mileage', e.target.value)}
                                required
                            />
                            <InputError message={errors.mileage} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="next_service_due_mileage" value="Next Service Due at (km)" />
                            <TextInput
                                id="next_service_due_mileage"
                                type="number"
                                className="mt-1 block w-full"
                                value={data.next_service_due_mileage}
                                onChange={(e) => setData('next_service_due_mileage', e.target.value)}
                            />
                            <InputError message={errors.next_service_due_mileage} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="fuel_tank_capacity" value="Fuel Tank Capacity (Liters)" />
                            <TextInput
                                id="fuel_tank_capacity"
                                type="number"
                                step="0.5"
                                className="mt-1 block w-full"
                                placeholder="e.g. 45"
                                value={data.fuel_tank_capacity}
                                onChange={(e) => setData('fuel_tank_capacity', e.target.value)}
                            />
                            <InputError message={errors.fuel_tank_capacity} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="gps_device_id" value="GPS Device ID (Optional)" />
                            <TextInput
                                id="gps_device_id"
                                type="text"
                                className="mt-1 block w-full"
                                placeholder="e.g. GPS-9921"
                                value={data.gps_device_id}
                                onChange={(e) => setData('gps_device_id', e.target.value)}
                            />
                            <InputError message={errors.gps_device_id} className="mt-1" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <SecondaryButton onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={processing} className="bg-emerald-600 hover:bg-emerald-500">
                            {editingVehicle ? 'Update Vehicle' : 'Save Vehicle'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* ---------- DELETE CONFIRMATION MODAL ---------- */}
            <Modal show={!!deletingVehicle} onClose={() => setDeletingVehicle(null)}>
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Vehicle</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        Are you sure you want to remove <strong>{deletingVehicle?.model} ({deletingVehicle?.plate_number})</strong> from your fleet? This action cannot be undone.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setDeletingVehicle(null)}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={handleDelete}>
                            Confirm Delete
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
