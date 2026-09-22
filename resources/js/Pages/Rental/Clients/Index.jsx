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
import { UserCheck, Plus, Edit2, Trash2, Phone, CreditCard, FileText } from 'lucide-react';

export default function ClientsIndex({ clients }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [deletingClient, setDeletingClient] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        phone: '',
        cnic: '',
        license_doc_url: '',
        notes: '',
    });

    const openCreateModal = () => {
        setEditingClient(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (c) => {
        setEditingClient(c);
        clearErrors();
        setData({
            name: c.name,
            phone: c.phone,
            cnic: c.cnic || '',
            license_doc_url: c.license_doc_url || '',
            notes: c.notes || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingClient) {
            put(route('rental.clients.update', editingClient.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('rental.clients.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = () => {
        if (!deletingClient) return;
        router.delete(route('rental.clients.destroy', deletingClient.id), {
            onSuccess: () => setDeletingClient(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            Client CRM
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Customer identities, verified WhatsApp numbers, CNIC records, and rental histories.
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md transition"
                    >
                        <Plus className="w-4 h-4" /> Add Client
                    </button>
                </div>
            }
        >
            <Head title="Rental Clients" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {clients.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700 shadow-sm">
                        <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Clients Yet</h3>
                        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                            Clients are registered when you create a booking or automatically upserted when converting WhatsApp inquiries.
                        </p>
                        <button
                            onClick={openCreateModal}
                            className="mt-5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md transition"
                        >
                            Register New Client
                        </button>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 text-gray-400 uppercase text-[10px] tracking-wider">
                                        <th className="py-3.5 px-6">Client Name</th>
                                        <th className="py-3.5 px-6">Phone Number</th>
                                        <th className="py-3.5 px-6">CNIC / ID</th>
                                        <th className="py-3.5 px-6">Total Bookings</th>
                                        <th className="py-3.5 px-6">Notes</th>
                                        <th className="py-3.5 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                                    {clients.map((c) => (
                                        <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition">
                                            <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">
                                                {c.name}
                                            </td>
                                            <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                                                <div className="flex items-center gap-1.5 font-mono text-xs">
                                                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                    {c.phone}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-gray-600 dark:text-gray-300 font-mono text-xs">
                                                {c.cnic ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                                                        {c.cnic}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">N/A</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 font-semibold text-emerald-600 dark:text-emerald-400">
                                                {c.bookings_count || 0} rentals
                                            </td>
                                            <td className="py-4 px-6 text-gray-500 max-w-xs truncate text-xs">
                                                {c.notes || '-'}
                                            </td>
                                            <td className="py-4 px-6 text-right space-x-2">
                                                <button
                                                    onClick={() => openEditModal(c)}
                                                    className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-gray-700 rounded-lg transition"
                                                    title="Edit Client"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingClient(c)}
                                                    className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-700 rounded-lg transition"
                                                    title="Delete Client"
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

            {/* ---------- ADD / EDIT CLIENT MODAL ---------- */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {editingClient ? 'Edit Client Details' : 'Register New Client'}
                    </h3>

                    <div>
                        <InputLabel htmlFor="name" value="Full Name *" />
                        <TextInput
                            id="name"
                            type="text"
                            className="mt-1 block w-full"
                            placeholder="e.g. Asim Riaz"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="phone" value="Phone / WhatsApp Number *" />
                        <TextInput
                            id="phone"
                            type="text"
                            className="mt-1 block w-full"
                            placeholder="e.g. +923214455667"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            required
                        />
                        <InputError message={errors.phone} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="cnic" value="CNIC / National Identity Card" />
                        <TextInput
                            id="cnic"
                            type="text"
                            className="mt-1 block w-full"
                            placeholder="e.g. 35202-1234567-1"
                            value={data.cnic}
                            onChange={(e) => setData('cnic', e.target.value)}
                        />
                        <InputError message={errors.cnic} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="notes" value="Internal Customer Notes" />
                        <textarea
                            id="notes"
                            rows={3}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                            placeholder="VIP client, corporate account, preferred vehicle class..."
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                        />
                        <InputError message={errors.notes} className="mt-1" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <SecondaryButton onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={processing} className="bg-emerald-600 hover:bg-emerald-500">
                            {editingClient ? 'Update Client' : 'Save Client'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* ---------- DELETE CONFIRMATION MODAL ---------- */}
            <Modal show={!!deletingClient} onClose={() => setDeletingClient(null)}>
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Client Profile</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        Are you sure you want to delete <strong>{deletingClient?.name}</strong>? Clients with active bookings cannot be deleted.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setDeletingClient(null)}>
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
