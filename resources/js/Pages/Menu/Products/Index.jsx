import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function ProductsIndex({ products, categories }) {
    const { data, setData, post, put, delete: destroy, reset, errors } = useForm({
        category_id: '',
        name: '',
        description: '',
        price: '',
        image_url: '',
        is_active: true,
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('menu.products.update', editId), {
                onSuccess: () => {
                    reset();
                    setIsEditing(false);
                    setEditId(null);
                }
            });
        } else {
            post(route('menu.products.store'), {
                onSuccess: () => reset()
            });
        }
    };

    const handleEdit = (product) => {
        setIsEditing(true);
        setEditId(product.id);
        setData({
            category_id: product.category_id,
            name: product.name,
            description: product.description || '',
            price: product.price,
            image_url: product.image_url || '',
            is_active: product.is_active,
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this product?')) {
            destroy(route('menu.products.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Menu Products</h2>
                    <Link
                        href={route('menu.import.show')}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                    >
                        Import Menu (AI/CSV)
                    </Link>
                </div>
            }
        >
            <Head title="Menu Products" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6">
                    
                    {/* Form Section */}
                    <div className="w-full md:w-1/3 bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 h-fit">
                        <h3 className="text-lg font-bold mb-4">{isEditing ? 'Edit Product' : 'Add Product'}</h3>
                        <form onSubmit={submit} className="space-y-4">
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <select
                                    value={data.category_id}
                                    onChange={e => setData('category_id', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Select a category...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                {errors.category_id && <div className="text-red-500 text-sm mt-1">{errors.category_id}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Price (Rs.)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.price}
                                    onChange={e => setData('price', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                {errors.price && <div className="text-red-500 text-sm mt-1">{errors.price}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Image URL</label>
                                <input
                                    type="url"
                                    value={data.image_url}
                                    onChange={e => setData('image_url', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    rows="2"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={e => setData('is_active', e.target.checked)}
                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                />
                                <label className="ml-2 block text-sm text-gray-900">Active</label>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    type="submit"
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                                >
                                    {isEditing ? 'Update' : 'Save'}
                                </button>
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            reset();
                                            setIsEditing(false);
                                            setEditId(null);
                                        }}
                                        className="text-gray-600 hover:text-gray-900"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Table Section */}
                    <div className="w-full md:w-2/3 bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.map(product => (
                                    <tr key={product.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs. {product.price}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {product.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleEdit(product)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                            <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No products found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
