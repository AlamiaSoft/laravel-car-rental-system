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
import { Building2, Plus, Edit2, Trash2, Phone } from 'lucide-react';

export default function VendorsIndex({ vendors }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);
    const [deletingVendor, setDeletingVendor] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        vendor_name: '',
        contact: '',
    });

    const openCreateModal = () => {
        setEditingVendor(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (vn) => {
        setEditingVendor(vn);
        clearErrors();
        setData({
            vendor_name: vn.vendor_name,
            contact: vn.contact || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingVendor) {
            put(route('rental.vendors.update', editingVendor.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('rental.vendors.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = () => {
        if (!deletingVendor) return;
        router.delete(route('rental.vendors.destroy', deletingVendor.id), {
            onSuccess: () => setDeletingVendor(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            Third-Party Sourcing Partners
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Outside fleet suppliers used to fulfill bookings when your own fleet is fully booked.
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md transition"
                    >
                        <Plus className="w-4 h-4" /> Add Partner Supplier
                    </button>
                </div>
            }
        >
            <Head title="Third-Party Partners" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {vendors.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700 shadow-sm">
                        <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Partner Suppliers Registered</h3>
                        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                            Add external rental agencies or car owners to outsource bookings when your own vehicles are all rented.
                        </p>
                        <button
                            onClick={openCreateModal}
                            className="mt-5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md transition"
                        >
                            Register Partner
                        </button>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 text-gray-400 uppercase text-[10px] tracking-wider">
                                        <th className="py-3.5 px-6">Supplier / Agency</th>
                                        <th className="py-3.5 px-6">Contact Details</th>
                                        <th className="py-3.5 px-6">Outsourced Bookings</th>
                                        <th className="py-3.5 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                                    {vendors.map((vn) => (
                                        <tr key={vn.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition">
                                            <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">
                                                {vn.vendor_name}
                                            </td>
                                            <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                                                <div className="flex items-center gap-1.5 font-mono text-xs">
                                                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                    {vn.contact || 'No contact recorded'}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 font-semibold text-emerald-600 dark:text-emerald-400">
                                                {vn.bookings_count || 0} outsourced trips
                                            </td>
                                            <td className="py-4 px-6 text-right space-x-2">
                                                <button
                                                    onClick={() => openEditModal(vn)}
                                                    className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-gray-700 rounded-lg transition"
                                                    title="Edit Partner"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingVendor(vn)}
                                                    className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-700 rounded-lg transition"
                                                    title="Delete Partner"
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

            {/* ---------- ADD / EDIT VENDOR MODAL ---------- */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {editingVendor ? 'Edit Partner Details' : 'Register Third-Party Supplier'}
                    </h3>

                    <div>
                        <InputLabel htmlFor="vendor_name" value="Agency / Supplier Name *" />
                        <TextInput
                            id="vendor_name"
                            type="text"
                            className="mt-1 block w-full"
                            placeholder="e.g. Al-Madina Car Rental"
                            value={data.vendor_name}
                            onChange={(e) => setData('vendor_name', e.target.value)}
                            required
                        />
                        <InputError message={errors.vendor_name} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="contact" value="Phone / WhatsApp Contact" />
                        <TextInput
                            id="contact"
                            type="text"
                            className="mt-1 block w-full"
                            placeholder="e.g. +923007654321"
                            value={data.contact}
                            onChange={(e) => setData('contact', e.target.value)}
                        />
                        <InputError message={errors.contact} className="mt-1" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <SecondaryButton onClick={() => setIsModalOpen(false)}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={processing} className="bg-emerald-600 hover:bg-emerald-500">
                            {editingVendor ? 'Update Supplier' : 'Save Supplier'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* ---------- DELETE CONFIRMATION MODAL ---------- */}
            <Modal show={!!deletingVendor} onClose={() => setDeletingVendor(null)}>
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Supplier</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        Are you sure you want to remove <strong>{deletingVendor?.vendor_name}</strong>?
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setDeletingVendor(null)}>Cancel</SecondaryButton>
                        <DangerButton onClick={handleDelete}>Confirm Delete</DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
