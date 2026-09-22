import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Pos({ auth, categories }) {
    const [cart, setCart] = useState([]);
    const [tableNumber, setTableNumber] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(categories.length > 0 ? categories[0].id : null);

    const addToCart = (product) => {
        const existing = cart.find(item => item.product_id === product.id);
        if (existing) {
            setCart(cart.map(item => item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { product_id: product.id, name: product.name, price: product.price, quantity: 1 }]);
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.product_id !== productId));
    };

    const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const placeOrder = (e) => {
        e.preventDefault();
        if (cart.length === 0) return;
        setLoading(true);

        router.post(route('orders.store'), {
            table_number: tableNumber,
            customer_phone: customerPhone,
            items: cart,
            total_amount: totalAmount
        }, {
            onSuccess: () => {
                setCart([]);
                setTableNumber('');
                setCustomerPhone('');
                setLoading(false);
            },
            onError: () => setLoading(false)
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Manual Order (POS)</h2>}
        >
            <Head title="POS" />

            <div className="py-8 h-[calc(100vh-130px)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex gap-6">
                    
                    {/* Menu Section */}
                    <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                        {/* Tabs */}
                        <div className="flex overflow-x-auto border-b border-gray-200">
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveTab(category.id)}
                                    className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 focus:outline-none transition-colors ${activeTab === category.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>

                        {/* Products */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                            {categories.map(category => (
                                <div key={category.id} className={activeTab === category.id ? 'grid grid-cols-2 lg:grid-cols-3 gap-4' : 'hidden'}>
                                    {category.products.map(product => (
                                        <button
                                            key={product.id}
                                            onClick={() => addToCart(product)}
                                            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-indigo-500 hover:shadow-md transition text-left flex flex-col justify-between h-32"
                                        >
                                            <div className="font-medium text-gray-900 line-clamp-2">{product.name}</div>
                                            <div className="text-indigo-600 font-bold mt-2">Rs {product.price}</div>
                                        </button>
                                    ))}
                                    {category.products.length === 0 && (
                                        <div className="col-span-full text-center py-8 text-gray-500">No products in this category</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cart Section */}
                    <div className="w-96 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-200 bg-gray-50 font-semibold text-gray-800">
                            Current Order
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {cart.length === 0 ? (
                                <div className="text-center text-gray-400 py-8 italic">Cart is empty</div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.product_id} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className="text-sm font-medium text-gray-900 truncate">{item.name}</div>
                                            <div className="text-xs text-gray-500">Rs {item.price} x {item.quantity}</div>
                                        </div>
                                        <div className="text-sm font-bold text-gray-900 w-16 text-right">
                                            Rs {item.price * item.quantity}
                                        </div>
                                        <button onClick={() => removeFromCart(item.product_id)} className="ml-2 text-red-500 hover:text-red-700 p-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-200 bg-gray-50">
                            <form onSubmit={placeOrder} className="space-y-4">
                                <div className="flex justify-between items-center text-lg font-bold text-gray-900 mb-4">
                                    <span>Total:</span>
                                    <span>Rs {totalAmount}</span>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Table Number</label>
                                    <select
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={tableNumber}
                                        onChange={e => setTableNumber(e.target.value)}
                                    >
                                        <option value="">Select Table (Optional)</option>
                                        {[...Array(10)].map((_, i) => (
                                            <option key={i+1} value={`Table ${i+1}`}>Table {i+1}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Customer Phone</label>
                                    <input
                                        type="text"
                                        placeholder="Optional"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={customerPhone}
                                        onChange={e => setCustomerPhone(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || cart.length === 0}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition"
                                >
                                    {loading ? 'Processing...' : 'Place Order'}
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
