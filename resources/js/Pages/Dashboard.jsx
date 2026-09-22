import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    ArrowRight,
    Calendar, 
    CheckCircle2, 
    Circle,
    Clock, 
    DollarSign, 
    HelpCircle, 
    Info, 
    Monitor, 
    Package, 
    Percent, 
    Repeat, 
    Rocket,
    Settings as SettingsIcon, 
    ShoppingCart, 
    Sparkles, 
    TrendingUp, 
    Users, 
    UtensilsCrossed, 
    Zap 
} from 'lucide-react';
import { useState } from 'react';

export default function Dashboard({ kpis = {}, selectedPeriod = 'this_month', onboarding = {} }) {
    const { appName, auth, tenant } = usePage().props;
    const name = appName || 'OrmEasy';
    const user = auth.user;

    const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);
    const [isOnboardingHidden, setIsOnboardingHidden] = useState(() => {
        try {
            return localStorage.getItem('hide_onboarding_checklist') === 'true';
        } catch (e) {
            return false;
        }
    });

    const hideOnboardingChecklist = () => {
        setIsOnboardingHidden(true);
        try {
            localStorage.setItem('hide_onboarding_checklist', 'true');
        } catch (e) {
            // ignore
        }
    };

    const hasCap = (cap) => tenant?.capabilities ? tenant.capabilities.includes(cap) : true;
    const isOrdering = hasCap('ordering');
    const isCatalog = hasCap('catalog');
    const isKds = hasCap('kds');
    const isBooking = hasCap('booking');
    const isServices = hasCap('services');

    const periods = [
        { id: 'today', label: 'Today' },
        { id: 'this_week', label: 'This Week' },
        { id: 'this_month', label: 'This Month' },
        { id: 'all_time', label: 'All Time' },
    ];

    const changePeriod = (newPeriod) => {
        router.get(route('dashboard'), { period: newPeriod }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const commissionRate = kpis?.commission_rate || 25;
    const grossRevenue = kpis?.gross_revenue || 0;
    const commissionSaved = kpis?.commission_saved || 0;
    const totalOrders = kpis?.total_orders || 0;
    const aov = kpis?.average_order_value || 0;
    const repeatRate = kpis?.repeat_rate || 0;
    const returningCount = kpis?.returning_customers_count || 0;
    const newCount = kpis?.new_customers_count || 0;
    const totalCustomers = kpis?.total_customers || 0;
    const totalBookings = kpis?.total_bookings || 0;
    const activeServices = kpis?.active_services || 0;
    const activeItems = kpis?.active_items || 0;

    const onboardingSteps = onboarding?.steps || [];
    const onboardingProgress = onboarding?.progress_percent ?? 0;
    const isAllCompleted = onboarding?.is_all_completed ?? false;

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            Merchant ROI & Performance
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Real-time direct commercial metrics and customer retention analytics.
                        </p>
                    </div>

                    {/* Period Filter Tabs */}
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
                        {periods.map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => changePeriod(p.id)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                    selectedPeriod === p.id
                                        ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* 10-MINUTE MERCHANT ONBOARDING CHECKLIST */}
                    {onboardingSteps.length > 0 && !isAllCompleted && !isOnboardingHidden && (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-indigo-100 dark:border-indigo-900/40 space-y-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                                        <Rocket className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-gray-900 dark:text-white text-base">
                                            10-Minute Launch Checklist
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Complete these quick steps to get your direct ordering app live for customers.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                                            {onboardingProgress}% Complete
                                        </span>
                                        <p className="text-[11px] text-gray-400">
                                            {onboarding.completed_count} of {onboarding.total_count} steps
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={hideOnboardingChecklist}
                                        className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
                                        title="Hide from Dashboard"
                                    >
                                        Hide
                                    </button>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                                <div 
                                    className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${onboardingProgress}%` }}
                                />
                            </div>

                            {/* Step list */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                                {onboardingSteps.map((step) => (
                                    <div
                                        key={step.id}
                                        className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                                            step.is_completed
                                                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200'
                                                : 'bg-gray-50 dark:bg-gray-900/40 border-gray-100 dark:border-gray-750 text-gray-800 dark:text-gray-200'
                                        }`}
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                {step.is_completed ? (
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                                ) : (
                                                    <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                )}
                                                <h4 className="text-xs font-bold truncate">
                                                    {step.title}
                                                </h4>
                                            </div>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 pl-6 leading-tight">
                                                {step.description}
                                            </p>
                                        </div>

                                        <div className="pl-6">
                                            <a
                                                href={step.route}
                                                className={`inline-flex items-center gap-1 text-xs font-extrabold ${
                                                    step.is_completed
                                                        ? 'text-emerald-700 dark:text-emerald-400 hover:underline'
                                                        : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 underline'
                                                }`}
                                            >
                                                <span>{step.is_completed ? 'Edit Settings' : 'Configure Now'}</span>
                                                <ArrowRight className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* HERO ROI IMPACT CARD (Ordering / Commerce Verticals) */}
                    {isOrdering && (
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-900 text-white shadow-xl p-8 border border-emerald-500/30">
                            {/* Decorative background circle */}
                            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                            <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

                            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="space-y-2">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-emerald-100">
                                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                                        <span>Merchant Direct ROI Engine ({kpis?.period_label || 'This Month'})</span>
                                    </div>
                                    <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                                        Rs. {commissionSaved.toLocaleString()}
                                    </h3>
                                    <p className="text-sm text-emerald-100 max-w-xl font-medium">
                                        Estimated Aggregator Marketplace Commission Saved by processing direct customer orders.
                                    </p>
                                    <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-emerald-200">
                                        <span className="bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-400/30 font-semibold">
                                            Calculated on Rs. {grossRevenue.toLocaleString()} direct sales
                                        </span>
                                        <span className="bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-400/30 font-semibold">
                                            Benchmark: {commissionRate}% aggregator cut
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsCalcModalOpen(true)}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 backdrop-blur-md transition shadow"
                                    >
                                        <HelpCircle className="w-4 h-4 text-emerald-200" />
                                        How is this calculated?
                                    </button>

                                    {isCatalog && (
                                        <Link
                                            href={route('menu.categories.index')}
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition shadow"
                                        >
                                            <Package className="w-4 h-4 text-emerald-700" />
                                            Manage Menu
                                        </Link>
                                    )}

                                    {isKds && (
                                        <a
                                            href={route('orders.kds-unified')}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs border border-emerald-400/50 transition shadow"
                                        >
                                            <Monitor className="w-4 h-4" />
                                            Open KDS
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* COMMERCIAL & RETENTION METRICS GRID */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        
                        {/* Direct Revenue Card (Ordering only) */}
                        {isOrdering && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/60 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Direct Revenue
                                    </span>
                                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="text-2xl font-black text-gray-900 dark:text-white">
                                        Rs. {grossRevenue.toLocaleString()}
                                    </div>
                                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> 100% retained direct sales
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Average Order Value (AOV) Card (Ordering only) */}
                        {isOrdering && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/60 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Average Order Value
                                    </span>
                                    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="text-2xl font-black text-gray-900 dark:text-white">
                                        Rs. {aov.toLocaleString()}
                                    </div>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-1">
                                        Across {totalOrders} direct orders
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Direct Orders Processed Card (Ordering only) */}
                        {isOrdering && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/60 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Direct Orders
                                    </span>
                                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                                        <ShoppingCart className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="text-2xl font-black text-gray-900 dark:text-white">
                                        {totalOrders}
                                    </div>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-1">
                                        Zero aggregator middleman fees
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Customer Retention / Repeat Rate Card (Ordering only) */}
                        {isOrdering && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/60 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Customer Repeat Rate
                                    </span>
                                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                                        <Repeat className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="text-2xl font-black text-gray-900 dark:text-white">
                                        {repeatRate}%
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-1">
                                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">{returningCount} returning</span>
                                        <span>•</span>
                                        <span>{newCount} new</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Owned Customer Contacts Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/60 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Owned Customer Contacts
                                </span>
                                <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400">
                                    <Users className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="text-2xl font-black text-gray-900 dark:text-white">
                                    {totalCustomers}
                                </div>
                                <p className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold mt-1">
                                    100% direct merchant ownership
                                </p>
                            </div>
                        </div>

                        {/* Active Menu Items Card (Catalog only) */}
                        {isCatalog && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/60 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Active Menu Items
                                    </span>
                                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                                        <Package className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="text-2xl font-black text-gray-900 dark:text-white">
                                        {activeItems}
                                    </div>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-1">
                                        Live in customer PWA
                                    </p>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Transparent Calculation Breakdown Modal */}
            <Modal show={isCalcModalOpen} onClose={() => setIsCalcModalOpen(false)} maxWidth="md">
                <div className="p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-gray-900 dark:text-white text-base">
                                    Transparent ROI Formula
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    How your marketplace savings are derived
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3 text-xs">
                        <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                            <span>Direct Qualifying Revenue:</span>
                            <span className="font-bold text-gray-900 dark:text-white font-mono">
                                Rs. {grossRevenue.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                            <span>Marketplace Commission Benchmark:</span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                                × {commissionRate}%
                            </span>
                        </div>
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            <span>Estimated Cash Saved:</span>
                            <span className="font-mono text-base">
                                Rs. {commissionSaved.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                        Third-party food delivery aggregators typically charge between <strong>20% and 35%</strong> on every order. By taking direct orders through your own branded WhatsApp bot & Mini-App, you avoid these fees entirely.
                    </p>

                    <div className="bg-indigo-50 dark:bg-indigo-950/40 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800 flex items-center justify-between text-xs">
                        <span className="text-indigo-900 dark:text-indigo-200">
                            Want to change your commission benchmark?
                        </span>
                        <Link
                            href={route('settings.miniapp')}
                            className="font-bold text-indigo-600 hover:text-indigo-700 underline"
                        >
                            Adjust in Settings
                        </Link>
                    </div>

                    <div className="flex justify-end pt-2">
                        <SecondaryButton onClick={() => setIsCalcModalOpen(false)}>
                            Got it
                        </SecondaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
