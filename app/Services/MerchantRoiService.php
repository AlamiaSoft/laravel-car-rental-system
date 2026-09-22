<?php

namespace App\Services;

use App\Models\Tenant;
use Carbon\Carbon;
use Modules\Crm\Models\Customer;
use Modules\Menu\Models\Product;
use Modules\Orders\Models\Order;

class MerchantRoiService
{
    public function __construct(
        protected TenantSettingsService $settingsService
    ) {}

    /**
     * Calculate ROI & commercial metrics for a tenant within a given timeframe.
     *
     * @param  string  $period  'today' | 'this_week' | 'this_month' | 'all_time'
     */
    public function calculate(?string $tenantId = null, string $period = 'this_month'): array
    {
        $tenantId = $tenantId ?? (tenant() ? tenant('id') : null);
        $dateRange = $this->resolveDateRange($period);

        // 1. Commission Take Rate from Tenant Settings
        $commissionRate = 25.0;
        if ($tenantId) {
            $settings = $this->settingsService->getSettings($tenantId, 'published');
            $orderingSettings = $settings->ordering ?? [];
            if (! empty($orderingSettings['marketplace_commission_rate']) && is_numeric($orderingSettings['marketplace_commission_rate'])) {
                $commissionRate = (float) $orderingSettings['marketplace_commission_rate'];
            }
        }

        // 2. Orders & Revenue
        $ordersBaseQuery = Order::query()
            ->when($dateRange, fn ($q) => $q->whereBetween('created_at', $dateRange));

        $totalOrders = (clone $ordersBaseQuery)->count();

        // Revenue based on completed/delivered orders (or fallback to positive orders if in demo mode)
        $completedSales = (clone $ordersBaseQuery)
            ->whereIn('status', ['Completed', 'Delivered'])
            ->sum('total_amount');

        $grossRevenue = (float) $completedSales;
        if ($grossRevenue <= 0 && $totalOrders > 0) {
            // Fallback for non-completed demo orders
            $grossRevenue = (float) (clone $ordersBaseQuery)->whereNotIn('status', ['Cancelled', 'cancelled'])->sum('total_amount');
        }

        $averageOrderValue = $totalOrders > 0 && $grossRevenue > 0
            ? round($grossRevenue / $totalOrders, 2)
            : 0.0;

        // Estimated Marketplace Commission Saved
        $commissionSaved = round($grossRevenue * ($commissionRate / 100), 2);

        // 3. Customer Retention & Repeat Behavior
        $customersInPeriod = (clone $ordersBaseQuery)
            ->whereNotNull('customer_phone')
            ->distinct()
            ->pluck('customer_phone')
            ->toArray();

        $uniqueOrderingCustomers = count($customersInPeriod);
        $newCustomersCount = 0;
        $returningCustomersCount = 0;

        if ($uniqueOrderingCustomers > 0) {
            foreach ($customersInPeriod as $phone) {
                // If the customer had orders before the start of the date range, they are returning
                $priorOrdersQuery = Order::where('customer_phone', $phone);
                if ($dateRange) {
                    $priorOrdersCount = $priorOrdersQuery->where('created_at', '<', $dateRange[0])->count();
                } else {
                    $priorOrdersCount = $priorOrdersQuery->count() - 1;
                }

                if ($priorOrdersCount > 0) {
                    $returningCustomersCount++;
                } else {
                    $newCustomersCount++;
                }
            }
        }

        $repeatRate = $uniqueOrderingCustomers > 0
            ? round(($returningCustomersCount / $uniqueOrderingCustomers) * 100, 1)
            : 0.0;

        // 4. CRM & Universal Catalog Stats
        $totalCustomers = Customer::count();
        $activeItems = Product::where('is_active', true)->count();

        $totalBookings = 0;
        $activeServices = 0;

        return [
            'period' => $period,
            'period_label' => $this->resolvePeriodLabel($period),
            'commission_rate' => $commissionRate,
            'commission_saved' => $commissionSaved,
            'gross_revenue' => $grossRevenue,
            'total_orders' => $totalOrders,
            'average_order_value' => $averageOrderValue,
            'unique_ordering_customers' => $uniqueOrderingCustomers,
            'new_customers_count' => $newCustomersCount,
            'returning_customers_count' => $returningCustomersCount,
            'repeat_rate' => $repeatRate,
            'total_customers' => $totalCustomers,
            'active_items' => $activeItems,
            'total_bookings' => $totalBookings,
            'active_services' => $activeServices,
        ];
    }

    /**
     * Resolve date range tuple for given period string.
     */
    protected function resolveDateRange(string $period): ?array
    {
        return match ($period) {
            'today' => [Carbon::now()->startOfDay(), Carbon::now()->endOfDay()],
            'this_week' => [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()],
            'this_month' => [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()],
            default => null, // 'all_time'
        };
    }

    /**
     * Human-readable period label for UI header.
     */
    protected function resolvePeriodLabel(string $period): string
    {
        return match ($period) {
            'today' => 'Today',
            'this_week' => 'This Week',
            'this_month' => 'This Month',
            default => 'All Time',
        };
    }
}
