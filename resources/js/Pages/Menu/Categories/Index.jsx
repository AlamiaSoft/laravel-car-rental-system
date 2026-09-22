import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

const PREDEFINED_TEMPLATES = [
    { name: 'Burgers', items: ['Beef Burger', 'Chicken Burger', 'Cheese Burger', 'Zinger Burger'] },
    { name: 'Pizzas', items: ['Margherita', 'Pepperoni', 'Chicken Tikka', 'Fajita'] },
    { name: 'Drinks', items: ['Cola', 'Sprite', 'Mineral Water', 'Fanta'] },
    { name: 'Sides', items: ['French Fries', 'Onion Rings', 'Garlic Bread', 'Nuggets'] },
    { name: 'Fast Food', items: ['Hot Dog', 'Club Sandwich', 'Shawarma', 'Fried Chicken'] },
    { name: 'Desi', items: ['Biryani', 'Karahi', 'Naan', 'Roti'] }
];

function TemplateModal({ isOpen, onClose }) {
    // State to hold selected categories and items. Structure: { "Burgers": ["Beef Burger", "Cheese Burger"] }
    const [selected, setSelected] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const toggleCategory = (categoryName, allItems) => {
        setSelected(prev => {
            const next = { ...prev };
            if (next[categoryName]) {
                delete next[categoryName];
            } else {
                next[categoryName] = [...allItems];
            }
            return next;
        });
    };

    const toggleItem = (categoryName, itemName) => {
        setSelected(prev => {
            const next = { ...prev };
            if (!next[categoryName]) {
                next[categoryName] = [itemName];
            } else {
                if (next[categoryName].includes(itemName)) {
                    next[categoryName] = next[categoryName].filter(i => i !== itemName);
                    if (next[categoryName].length === 0) delete next[categoryName];
                } else {
                    next[categoryName] = [...next[categoryName], itemName];
                }
            }
            return next;
        });
    };

    const handleApply = () => {
        setIsSubmitting(true);
        const payload = Object.keys(selected).map(catName => ({
            name: catName,
            items: selected[catName]
        }));

        router.post(route('menu.categories.template'), { categories: payload }, {
            onSuccess: () => {
                setIsSubmitting(false);
                setSelected({});
                onClose();
            },
            onError: () => setIsSubmitting(false)
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                            Start from Template
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Select the categories and standard items you want to instantly add to your menu.
                        </p>
                        
                        <div className="max-h-96 overflow-y-auto pr-2 space-y-6">
                            {PREDEFINED_TEMPLATES.map((cat) => {
                                const isCatSelected = !!selected[cat.name];
                                return (
                                    <div key={cat.name} className="border rounded-md p-4 bg-gray-50">
                                        <div className="flex items-center mb-2">
                                            <input 
                                                type="checkbox" 
                                                checked={isCatSelected}
                                                onChange={() => toggleCategory(cat.name, cat.items)}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 font-bold text-gray-900">{cat.name}</span>
                                        </div>
                                        <div className="ml-6 grid grid-cols-2 gap-2">
                                            {cat.items.map(item => {
                                                const isItemSelected = selected[cat.name]?.includes(item) || false;
                                                return (
                                                    <div key={item} className="flex items-center">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={isItemSelected}
                                                            onChange={() => toggleItem(cat.name, item)}
                                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">{item}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button 
                            type="button" 
                            disabled={isSubmitting || Object.keys(selected).length === 0}
                            onClick={handleApply}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                        >
                            {isSubmitting ? 'Applying...' : 'Apply Template'}
                        </button>
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CategoriesIndex({ categories }) {
    const { data, setData, post, put, delete: destroy, reset, errors } = useForm({
        name: '',
        description: '',
        is_active: true,
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('menu.categories.update', editId), {
                onSuccess: () => {
                    reset();
                    setIsEditing(false);
                    setEditId(null);
                }
            });
        } else {
            post(route('menu.categories.store'), {
                onSuccess: () => reset()
            });
        }
    };

    const handleEdit = (category) => {
        setIsEditing(true);
        setEditId(category.id);
        setData({
            name: category.name,
            description: category.description || '',
            is_active: category.is_active,
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this category?')) {
            destroy(route('menu.categories.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Menu Categories</h2>
                    <button
                        onClick={() => setIsTemplateModalOpen(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition font-medium text-sm"
                    >
                        ✨ Start from Template
                    </button>
                </div>
            }
        >
            <Head title="Menu Categories" />

            <TemplateModal 
                isOpen={isTemplateModalOpen} 
                onClose={() => setIsTemplateModalOpen(false)} 
            />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6">
                    
                    {/* Form Section */}
                    <div className="w-full md:w-1/3 bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 h-fit">
                        <h3 className="text-lg font-bold mb-4">{isEditing ? 'Edit Category' : 'Add Category'}</h3>
                        <form onSubmit={submit} className="space-y-4">
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
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    rows="3"
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
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {categories.map(category => (
                                    <tr key={category.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {category.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleEdit(category)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                            <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
