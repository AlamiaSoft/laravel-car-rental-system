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
import { Users, Plus, Edit2, Trash2, Phone, Award } from 'lucide-react';

export default function DriversIndex({ drivers }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);
    const [deletingDriver, setDeletingDriver] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        phone: '',
        license_no: '',
        status: 'available',
    });

    const openCreateModal = () => {
        setEditingDriver(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (d) => {
        setEditingDriver(d);
        clearErrors();
        setData({
            name: d.name,
            phone: d.phone,
            license_no: d.license_no || '',
            status: d.status,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingDriver) {
            put(route('rental.drivers.update', editingDriver.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('rental.drivers.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = () => {
        if (!deletingDriver) return;
        router.delete(route('rental.drivers.destroy', deletingDriver.id), {
            onSuccess: () => setDeletingDriver(null),
        });
    };

    const statusBadge = (status) => {
        const map = {
            available: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-300',
            on_trip: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border-blue-300',
            off_duty: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-300',
        };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${map[status] || 'bg-gray-100 text-gray-800'}`}>
                {status.replace('_', ' ')}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            Driver Roster
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Manage your full-time and on-demand rental drivers, trip assignments, and contact details.
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md transition"
                    >
                        <Plus className="w-4 h-4" /> Add Driver
                    </button>
                </div>
            }
        >
            <Head title="Driver Roster" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {drivers.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700 shadow-sm">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Drivers Registered</h3>
                        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                            Add company drivers to assign them to daily rental bookings and WhatsApp auto-matches.
                        </p>
                        <button
                            onClick={openCreateModal}
                            className="mt-5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md transition"
                        >
                            Register First Driver
                        </button>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 text-gray-400 uppercase text-[10px] tracking-wider">
                                        <th className="py-3.5 px-6">Driver Name</th>
                                        <th className="py-3.5 px-6">Phone Number</th>
                                        <th className="py-3.5 px-6">License No</th>
                                        <th className="py-3.5 px-6">Status</th>
                                        <th className="py-3.5 px-6">Total Bookings</th>
                                        <th className="py-3.5 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                                    {drivers.map((d) => (
                                        <tr key={d.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition">
                                            <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">
                                                {d.name}
                                            </td>
                                            <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                                                <div className="flex items-center gap-1.5">
                                                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                    {d.phone}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                                                {d.license_no ? (
                                                    <div className="flex items-center gap-1.5 font-mono text-xs">
                                                        <Award className="w-3.5 h-3.5 text-emerald-500" />
                                                        {d.license_no}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">Not recorded</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                {statusBadge(d.status)}
                                            </td>
                                            <td className="py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">
                                                {d.bookings_count || 0} trips
                                            </td>
                                            <td className="py-4 px-6 text-right space-x-2">
                                                <button
                                                    onClick={() => openEditModal(d)}
                                                    className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-gray-700 rounded-lg transition"
                                                    title="Edit Driver"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingDriver(d)}
                                                    className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-700 rounded-lg transition"
                                                    title="Delete Driver"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* ---------- ADD / EDIT DRIVER MODAL ---------- */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {editingDriver ? 'Edit Driver Details' : 'Register New Driver'}
                    </h3>

                    <div>
                        <InputLabel htmlFor="name" value="Driver Full Name *" />
                        <TextInput
                            id="name"
                            type="text"
                            className="mt-1 block w-full"
                            placeholder="e.g. Tariq Mehmood"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="phone" value="WhatsApp / Mobile Phone *" />
                        <TextInput
                            id="phone"
                            type="text"
                            className="mt-1 block w-full"
                            placeholder="e.g. +923001234567"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            required
                        />
                        <InputError message={errors.phone} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="license_no" value="Driving License Number" />
                        <TextInput
                            id="license_no"
                            type="text"
                            className="mt-1 block w-full uppercase"
                            placeholder="e.g. LHR-DL-9982"
                            value={data.license_no}
                            onChange={(e) => setData('license_no', e.target.value.toUpperCase())}
                        />
                        <InputError message={errors.license_no} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="status" value="Roster Status *" />
                        <select
                            id="status"
                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                        >
                            <option value="available">Available on Duty</option>
                            <option value="on_trip">Currently on Trip</option>
                            <option value="off_duty">Off Duty / On Leave</option>
                        </select>
                        <InputError message={errors.status} className="mt-1" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <SecondaryButton onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={processing} className="bg-emerald-600 hover:bg-emerald-500">
                            {editingDriver ? 'Update Driver' : 'Save Driver'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* ---------- DELETE CONFIRMATION MODAL ---------- */}
            <Modal show={!!deletingDriver} onClose={() => setDeletingDriver(null)}>
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Driver</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        Are you sure you want to remove <strong>{deletingDriver?.name}</strong> from the roster?
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setDeletingDriver(null)}>
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
