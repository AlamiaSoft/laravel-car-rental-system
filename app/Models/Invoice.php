<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Invoice extends Model
{
    protected $fillable = [
        'tenant_id',
        'amount',
        'status',
        'billing_period_start',
        'billing_period_end',
        'due_date',
        'type',
    ];

    protected $casts = [
        'billing_period_start' => 'date',
        'billing_period_end' => 'date',
        'due_date' => 'date',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function renderTemplate(?string $template = null): string
    {
        $settings = Cache::rememberForever('global_settings', function () {
            return GlobalSetting::pluck('value', 'key')->toArray();
        });

        if (! $template) {
            $template = $settings['invoice_template'] ?? '';
            if (! $template) {
                $template = '<h2>Invoice #{{ invoice_id }}</h2><p><strong>Tenant:</strong> {{ tenant_name }}</p><p><strong>Amount Due:</strong> Rs. {{ amount }}</p><p><strong>Status:</strong> {{ status }}</p><p><strong>Billing Period:</strong> {{ period_start }} to {{ period_end }}</p><p><strong>Due Date:</strong> {{ due_date }}</p>';
            }
        }

        $this->loadMissing('tenant');

        $replacements = [
            '{{ app_name }}' => $settings['app_name'] ?? config('app.name'),
            '{{ company_address }}' => $settings['company_address'] ?? 'N/A',
            '{{ company_phone }}' => $settings['company_phone'] ?? 'N/A',
            '{{ company_email }}' => $settings['company_email'] ?? 'N/A',
            '{{ footer_notes }}' => $settings['footer_notes'] ?? '',
            '{{ invoice_id }}' => $this->id,
            '{{ tenant_name }}' => $this->tenant->name ?? 'N/A',
            '{{ amount }}' => number_format($this->amount, 2),
            '{{ status }}' => strtoupper($this->status),
            '{{ due_date }}' => Carbon::parse($this->due_date)->format('M d, Y'),
            '{{ date_generated }}' => $this->created_at->format('M d, Y'),
            '{{ period_start }}' => Carbon::parse($this->billing_period_start)->format('M d, Y'),
            '{{ period_end }}' => Carbon::parse($this->billing_period_end)->format('M d, Y'),
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $template);
    }
}
