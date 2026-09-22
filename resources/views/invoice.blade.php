<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice #{{ $invoice->id }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @media print {
            body { -webkit-print-color-adjust: exact; }
            @page { margin: 1cm; }
            .no-print { display: none !important; }
        }
        /* TipTap Prose styles */
        .prose h2 { font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem; }
        .prose h3 { font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem; }
        .prose p { margin-bottom: 1rem; }
        .prose ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
    </style>
</head>
<body class="bg-gray-100 text-gray-900 font-sans antialiased p-8">
    
    <div class="max-w-4xl mx-auto bg-white p-10 shadow-lg relative min-h-[1056px]">
        <div class="absolute top-4 right-4 no-print flex gap-2">
            <button onclick="window.print()" class="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700">Print / Save as PDF</button>
            <button onclick="window.close()" class="bg-gray-200 text-gray-800 px-4 py-2 rounded shadow hover:bg-gray-300">Close</button>
        </div>

        <div class="mt-8">
            <div class="flex justify-between items-start mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-indigo-700">{{ $settings['app_name'] ?? config('app.name') }}</h1>
                    <p class="text-gray-500 mt-1">Invoice</p>
                </div>
                <div class="text-right">
                    <p class="text-sm font-semibold text-gray-700">Invoice #{{ $invoice->id }}</p>
                    <p class="text-sm text-gray-500">Date: {{ $invoice->created_at->format('M d, Y') }}</p>
                    <p class="text-sm text-gray-500">Due: <span class="font-semibold text-red-500">{{ \Carbon\Carbon::parse($invoice->due_date)->format('M d, Y') }}</span></p>
                </div>
            </div>

            <div class="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <h2 class="text-lg font-semibold text-gray-800 mb-2">Billed To</h2>
                <p class="text-gray-700 font-medium text-xl">{{ $invoice->tenant->name ?? 'N/A' }}</p>
            </div>

            <table class="w-full text-left border-collapse mb-8">
                <thead>
                    <tr class="bg-indigo-50 border-b-2 border-indigo-200">
                        <th class="py-3 px-4 font-semibold text-indigo-900">Description</th>
                        <th class="py-3 px-4 font-semibold text-indigo-900 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="border-b border-gray-200">
                        <td class="py-4 px-4 text-gray-700">
                            Software Subscription & Commission<br>
                            <span class="text-sm text-gray-500">Period: {{ \Carbon\Carbon::parse($invoice->billing_period_start)->format('M d, Y') }} to {{ \Carbon\Carbon::parse($invoice->billing_period_end)->format('M d, Y') }}</span>
                        </td>
                        <td class="py-4 px-4 text-right text-gray-900 font-semibold">Rs. {{ number_format($invoice->amount, 2) }}</td>
                    </tr>
                    <tr class="bg-indigo-50">
                        <td class="py-4 px-4 font-bold text-indigo-900 text-right">Total Due</td>
                        <td class="py-4 px-4 text-right font-bold text-indigo-900 text-lg">Rs. {{ number_format($invoice->amount, 2) }}</td>
                    </tr>
                </tbody>
            </table>

            <div class="mb-8">
                <h3 class="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-2">Status</h3>
                <p class="text-sm font-medium px-3 py-1 inline-block rounded-full {{ $invoice->status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }}">
                    {{ strtoupper($invoice->status) }}
                </p>
            </div>

            <div class="border-t border-gray-200 pt-8 mt-8 text-sm text-gray-600 text-center">
                <p class="font-semibold text-gray-800">{{ $settings['app_name'] ?? config('app.name') }}</p>
                <p>{{ $settings['company_address'] ?? '' }} | Phone: {{ $settings['company_phone'] ?? '' }} | Email: {{ $settings['company_email'] ?? '' }}</p>
                
                @if(!empty($settings['footer_notes']))
                    <p class="mt-4 italic">{{ $settings['footer_notes'] }}</p>
                @endif
                
                <p class="mt-2 text-xs text-gray-400">Thank you for your business. For technical queries, contact the developer team.</p>
            </div>
        </div>

</body>
</html>