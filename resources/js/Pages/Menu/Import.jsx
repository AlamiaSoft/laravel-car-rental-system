import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';

export default function ImportMenu() {
    const [file, setFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null);
        setPreviewData(null);
    };

    const handleProcess = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(route('menu.import.process'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPreviewData(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to process file.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDuplicateChange = (categoryIndex, itemIndex, status) => {
        const newData = { ...previewData };
        newData.categories[categoryIndex].items[itemIndex].duplicate_status = status;
        setPreviewData(newData);
    };

    const handleConfirm = () => {
        setIsSaving(true);
        router.post(route('menu.import.confirm'), {
            categories: previewData.categories,
            deals: previewData.deals
        }, {
            onFinish: () => setIsSaving(false)
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Import Menu</h2>}
        >
            <Head title="Import Menu" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* Step 1: Upload */}
                <div className="bg-white p-6 shadow sm:rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">1. Upload File</h3>
                        <a href={route('menu.import.template')} className="text-sm text-indigo-600 hover:underline">Download CSV Template</a>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Upload a CSV, Excel, or PDF file to automatically extract your menu items. We do not support images.</p>
                    
                    <div className="flex items-center gap-4">
                        <input 
                            type="file" 
                            accept=".csv, .xls, .xlsx, .pdf" 
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        <button 
                            onClick={handleProcess} 
                            disabled={!file || isProcessing}
                            className={`px-4 py-2 rounded-md text-white ${(!file || isProcessing) ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        >
                            {isProcessing ? 'Processing...' : 'Read File'}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>

                {/* Step 2: Human Review Preview */}
                {previewData && (
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold">2. Review & Confirm</h3>
                            <button 
                                onClick={handleConfirm} 
                                disabled={isSaving}
                                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-bold"
                            >
                                {isSaving ? 'Saving to Database...' : 'Looks Good, Import Menu!'}
                            </button>
                        </div>

                        {previewData.warnings?.length > 0 && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                                <h4 className="text-yellow-800 font-bold">Warnings ({previewData.warnings.length})</h4>
                                <ul className="list-disc pl-5 text-sm text-yellow-700 mt-2">
                                    {previewData.warnings.map((w, i) => <li key={i}>{w.message}</li>)}
                                </ul>
                            </div>
                        )}

                        <div className="space-y-6">
                            {previewData.categories.map((category, catIndex) => (
                                <div key={catIndex} className="border rounded-md overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-2 border-b font-bold flex justify-between">
                                        <span>Category: {category.name}</span>
                                        <span className="text-sm text-gray-500">{category.items.length} items</span>
                                    </div>
                                    <div className="divide-y">
                                        {category.items.map((item, itemIndex) => (
                                            <div key={itemIndex} className={`p-4 flex gap-4 items-start ${item.confidence < 0.8 ? 'bg-red-50' : ''}`}>
                                                <div className="flex-1">
                                                    <div className="font-semibold">{item.name}</div>
                                                    <div className="text-sm text-gray-500">{item.description}</div>
                                                    <div className="mt-1 font-medium text-green-700">Rs. {item.price}</div>
                                                    {item.confidence < 0.8 && <div className="text-xs text-red-600 mt-1">Low Confidence AI Extraction - Please verify.</div>}
                                                </div>
                                                <div className="w-48 text-right">
                                                    <select 
                                                        value={item.duplicate_status}
                                                        onChange={(e) => handleDuplicateChange(catIndex, itemIndex, e.target.value)}
                                                        className="text-sm border-gray-300 rounded-md shadow-sm"
                                                    >
                                                        <option value="new">Import as New</option>
                                                        <option value="update_existing">Update Existing</option>
                                                        <option value="skip">Skip / Ignore</option>
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {previewData.deals?.length > 0 && (
                                <div className="border rounded-md overflow-hidden">
                                    <div className="bg-indigo-50 px-4 py-2 border-b font-bold flex justify-between text-indigo-900">
                                        <span>Deals & Packages</span>
                                        <span className="text-sm">{previewData.deals.length} deals</span>
                                    </div>
                                    <div className="divide-y">
                                        {previewData.deals.map((deal, idx) => (
                                            <div key={idx} className="p-4">
                                                <div className="font-semibold text-indigo-700">{deal.name}</div>
                                                <div className="text-sm text-gray-500">{deal.description}</div>
                                                <div className="text-sm text-gray-700 italic">Items: {deal.deal_items_raw}</div>
                                                <div className="mt-1 font-medium text-green-700">Rs. {deal.price}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
