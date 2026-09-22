<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GlobalSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = GlobalSetting::pluck('value', 'key')->toArray();

        return Inertia::render('Admin/Settings', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'payment_instructions' => 'nullable|string',
            'invoice_notifications' => 'required|in:auto,manual',
            'app_name' => 'nullable|string|max:255',
            'company_address' => 'nullable|string',
            'company_phone' => 'nullable|string|max:255',
            'company_email' => 'nullable|email|max:255',
            'footer_notes' => 'nullable|string',
        ]);

        foreach ($validated as $key => $value) {
            GlobalSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        Cache::forget('global_settings');

        return redirect()->back()->with('success', 'Global settings updated successfully.');
    }

    public function clearCache()
    {
        Cache::forget('global_settings');

        return redirect()->back()->with('success', 'Global settings cache cleared successfully.');
    }
}
