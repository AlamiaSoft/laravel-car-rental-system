import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Simulator({ tenant, tenants = [] }) {
    const { appName } = usePage().props;
    const name = appName || 'Hotel Wala Bot';

    const [phoneNumber, setPhoneNumber] = useState('');
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // If no tenant is provided via URL, default to the first one available
    const [currentTenant, setCurrentTenant] = useState(tenant || (tenants.length > 0 ? tenants[0].id : ''));

    const currentTenantObj = tenants.find(t => t.id === currentTenant);
    const tenantDisplayName = currentTenantObj ? currentTenantObj.name : (currentTenant || 'None');

    useEffect(() => {
        let savedPhone = localStorage.getItem('simulator_phone');
        if (!savedPhone) {
            savedPhone = '+1' + Math.floor(1000000000 + Math.random() * 9000000000).toString();
            localStorage.setItem('simulator_phone', savedPhone);
        }
        setPhoneNumber(savedPhone);

        setMessages([{
            id: Date.now(),
            sender: 'bot',
            type: 'text',
            text: { body: `Simulator initialized. Tenant: ${tenantDisplayName}. Type 'Hi' to start.` }
        }]);
    }, [currentTenant]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handlePhoneChange = (e) => {
        setPhoneNumber(e.target.value);
        localStorage.setItem('simulator_phone', e.target.value);
    };

    const sendWebhookRequest = async (payload) => {
        if (!currentTenant) {
            alert('No tenant selected!');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/bot/whatsapp/webhook/${currentTenant}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', ...data }]);
            } else {
                try {
                    const errorData = await response.json();
                    if (errorData.type === 'text') {
                        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', type: 'text', text: { body: `[System] ${errorData.text.body}` } }]);
                    } else {
                        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', type: 'text', text: { body: `[System] Error ${response.status}` } }]);
                    }
                } catch(e) {
                    setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', type: 'text', text: { body: `[System] Server error occurred (Check console).` } }]);
                }
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendText = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const textBody = input.trim();
        setInput('');

        setMessages(prev => [...prev, { id: Date.now(), sender: 'user', type: 'text', text: { body: textBody } }]);

        const payload = {
            object: "whatsapp_business_account",
            entry: [{
                changes: [{
                    value: {
                        messages: [{
                            from: phoneNumber,
                            type: "text",
                            text: { body: textBody }
                        }]
                    }
                }]
            }]
        };

        await sendWebhookRequest(payload);
    };

    const handleInteractiveClick = async (actionId, title, type = 'button_reply') => {
        setMessages(prev => [...prev, { id: Date.now(), sender: 'user', type: 'text', text: { body: `[Clicked] ${title}` } }]);

        const payload = {
            object: "whatsapp_business_account",
            entry: [{
                changes: [{
                    value: {
                        messages: [{
                            from: phoneNumber,
                            type: "interactive",
                            interactive: {
                                type: type,
                                [type]: {
                                    id: actionId,
                                    title: title
                                }
                            }
                        }]
                    }
                }]
            }]
        };

        await sendWebhookRequest(payload);
    };

    const renderMessage = (msg) => {
        const isUser = msg.sender === 'user';
        
        return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${isUser ? 'bg-green-100 text-gray-800' : 'bg-white shadow-sm border text-gray-800'}`}>
                    
                    {msg.type === 'text' && (
                        <div className="whitespace-pre-wrap">{msg.text.body}</div>
                    )}

                    {msg.type === 'interactive' && (
                        <div>
                            {msg.interactive.header && (
                                <div className="font-bold mb-1">{msg.interactive.header.text}</div>
                            )}
                            <div className="whitespace-pre-wrap mb-2">{msg.interactive.body?.text}</div>
                            
                            {msg.interactive.type === 'button' && (
                                <div className="flex flex-col gap-2 mt-3 border-t pt-2">
                                    {msg.interactive.action.buttons.map((btn, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleInteractiveClick(btn.reply.id, btn.reply.title)}
                                            className="text-center text-blue-500 py-2 border rounded hover:bg-blue-50 transition-colors font-medium"
                                        >
                                            {btn.reply.title}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {msg.interactive.type === 'list' && (
                                <div className="mt-3 border-t pt-2">
                                    <div className="text-center font-medium text-gray-600 mb-2 border p-2 rounded bg-gray-50">
                                        ☰ {msg.interactive.action.button}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {msg.interactive.action.sections.map((section, sIdx) => (
                                            <div key={sIdx}>
                                                {section.title && <div className="text-xs font-bold text-gray-500 uppercase mt-2 mb-1 px-1">{section.title}</div>}
                                                {section.rows.map((row, rIdx) => (
                                                    <button
                                                        key={rIdx}
                                                        onClick={() => handleInteractiveClick(row.id, row.title, 'list_reply')}
                                                        className="w-full text-left p-2 border-b hover:bg-gray-50 transition-colors"
                                                    >
                                                        <div className="font-medium text-blue-600">{row.title}</div>
                                                        {row.description && <div className="text-xs text-gray-500 mt-1 line-clamp-2">{row.description}</div>}
                                                    </button>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row items-center justify-center p-4">
            <Head title="WhatsApp Simulator" />

            <div className="w-full md:w-1/3 max-w-sm mb-4 md:mb-0 md:mr-6 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <h1 className="text-2xl font-bold mb-4">Simulator settings</h1>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Tenant</label>
                    <select
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={currentTenant}
                        onChange={(e) => {
                            setCurrentTenant(e.target.value);
                            // Optionally update URL to reflect this
                            window.history.pushState({}, '', `/simulator?tenant=${e.target.value}`);
                        }}
                    >
                        {tenants.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Testing Phone Number</label>
                    <input 
                        type="text" 
                        value={phoneNumber} 
                        onChange={handlePhoneChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Sessions are tracked by this number. Change it to simulate a different user.</p>
                </div>

                <Link href="/" className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                    &larr; Back to App
                </Link>
            </div>

            <div className="w-full max-w-md h-[800px] max-h-[90vh] bg-[#efeae2] flex flex-col rounded-[2rem] overflow-hidden shadow-2xl border-[8px] border-gray-800 relative">
                
                <div className="bg-[#00a884] text-white p-4 flex items-center shrink-0 shadow-md z-10">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                        🤖
                    </div>
                    <div>
                        <div className="font-medium text-lg leading-tight">{tenantDisplayName || name}</div>
                        <div className="text-xs text-white/80">Simulator mode</div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 relative" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}>
                    {messages.map(renderMessage)}
                    {loading && (
                        <div className="flex justify-start mb-4">
                            <div className="bg-white rounded-lg p-3 text-gray-400 text-sm shadow-sm border">
                                typing...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="bg-gray-100 p-3 flex items-center shrink-0">
                    <form onSubmit={handleSendText} className="flex-1 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 rounded-full border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 px-4 py-2"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading || !currentTenant}
                            className="bg-[#00a884] text-white rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-50 hover:bg-[#008f6f] transition-colors"
                        >
                            <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
