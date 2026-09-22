import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Welcome({ auth }) {
    const { appName } = usePage().props;
    const name = appName || 'FleetOS';

    // ---- Car Rental ROI & Fleet Revenue Calculator State ----
    const [fleetSize, setFleetSize] = useState(15);
    const [dailyRate, setDailyRate] = useState(6500);
    const [utilization, setUtilization] = useState(65);
    const [unrecoveredFuelPerMonth, setUnrecoveredFuelPerMonth] = useState(4500);

    const fmt = (n) => 'Rs ' + Math.round(n).toLocaleString('en-PK');

    // Calculations
    const annualRentalRevenue = fleetSize * (utilization / 100) * 365 * dailyRate;
    const annualFuelRecovered = fleetSize * unrecoveredFuelPerMonth * 12;
    const annualUtilizationBoost = fleetSize * (0.08) * 365 * dailyRate; // 8% idle reduction via instant WhatsApp matcher
    const totalBottomLineGain = annualFuelRecovered + annualUtilizationBoost;

    // ---- Interactive Feature Preview Tab ----
    const [activeTab, setActiveTab] = useState('dispatch');

    return (
        <>
            <Head title={`${name} — Modern Multi-Tenant Car Rental Operating System & Fleet Management`} />

            <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-white">
                {/* ---------- NAVBAR ---------- */}
                <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                                🚗
                            </div>
                            <span className="font-extrabold text-xl tracking-tight text-white">
                                {name}<span className="text-amber-400">Rent</span>
                            </span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
                            <a href="#features" className="hover:text-amber-400 transition-colors">Features</a>
                            <a href="#dual-pricing" className="hover:text-amber-400 transition-colors">Dual Pricing</a>
                            <a href="#fuel-settlement" className="hover:text-amber-400 transition-colors">Fuel Settlement</a>
                            <a href="#calculator" className="hover:text-amber-400 transition-colors">Fleet ROI Calculator</a>
                            <a href="#pricing" className="hover:text-amber-400 transition-colors">Pricing</a>
                        </nav>

                        <div className="flex items-center gap-4">
                            {auth?.user ? (
                                <Link
                                    href={route('rental.dashboard')}
                                    className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:bg-amber-400 hover:shadow-amber-500/40 transition-all"
                                >
                                    Fleet Dashboard →
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="text-sm font-bold text-slate-300 hover:text-white transition-colors hidden sm:block"
                                    >
                                        Agency Login
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:bg-amber-400 hover:shadow-amber-500/40 transition-all"
                                    >
                                        Start 15-Day Free Trial
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* ---------- HERO SECTION ---------- */}
                <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-950 to-slate-950 pointer-events-none" />
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />

                    <div className="relative mx-auto max-w-7xl px-6">
                        <div className="text-center max-w-3xl mx-auto space-y-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest">
                                🚗 The Multi-Tenant Car Rental Operating System
                            </div>

                            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15]">
                                Turn WhatsApp Inquiries & Fleet Chaos Into <span className="bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent">High-Margin Automated Bookings</span>
                            </h1>

                            <p className="text-lg text-slate-300 sm:text-xl leading-relaxed">
                                Complete multi-tenant operational stack for car rental agencies. 1-click WhatsApp auto-matching, dual pricing engine (Daily vs Lumpsum), live pickup & drop-off fuel settlement, and automated odometer maintenance alerts.
                            </p>

                            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                                <Link
                                    href={route('register')}
                                    className="rounded-xl bg-amber-500 px-8 py-4 text-base font-extrabold text-slate-950 shadow-xl shadow-amber-500/30 hover:bg-amber-400 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Start Free 15-Day Trial →
                                </Link>
                                <a
                                    href="#features"
                                    className="rounded-xl border border-slate-800 bg-slate-900/80 px-7 py-4 text-base font-bold text-white hover:bg-slate-800 hover:border-slate-700 transition-all"
                                >
                                    Explore Fleet Features
                                </a>
                            </div>

                            {/* Trust Row */}
                            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-400">
                                <span className="flex items-center gap-2">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">✓</span>
                                    Dual Pricing (Daily vs Lumpsum)
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">✓</span>
                                    Live Liter-Based Fuel Settlement
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">✓</span>
                                    WhatsApp Inbound Auto-Matcher
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">✓</span>
                                    15-Day Free Trial (No Card Required)
                                </span>
                            </div>
                        </div>

                        {/* HERO MOCKUP GRAPHIC */}
                        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
                            {/* WhatsApp Auto-Matcher Card */}
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl space-y-4 relative overflow-hidden group hover:border-slate-700 transition-all">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                                            WA
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-sm">Inbound WhatsApp Dispatcher</div>
                                            <div className="text-xs text-emerald-400 flex items-center gap-1">
                                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span> Smart Matcher Active
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-mono bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-md">Auto-Match 98%</span>
                                </div>

                                <div className="space-y-3 font-sans text-xs">
                                    <div className="bg-slate-800/80 p-3 rounded-lg text-slate-200">
                                        <div className="font-bold text-amber-400 text-[11px] mb-1">Incoming WhatsApp Request:</div>
                                        "Hi, need a Toyota Fortuner with driver for 3 days from Lahore Airport to Islamabad. Dates: Oct 1 - Oct 3."
                                    </div>

                                    <div className="bg-slate-950/90 border border-amber-500/30 p-3.5 rounded-xl text-slate-200 space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-white">Recommended Allocation:</span>
                                            <span className="text-amber-400 font-mono font-bold">Rs. 22,000 / day</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                                            <div className="bg-slate-900 p-2 rounded border border-slate-800">
                                                🚙 <b>Fortuner V (LED-21-4920)</b>
                                                <div className="text-slate-400">Available · 80L Tank</div>
                                            </div>
                                            <div className="bg-slate-900 p-2 rounded border border-slate-800">
                                                👨‍✈️ <b>Driver: Tariq Mehmood</b>
                                                <div className="text-slate-400">Available · Commercial Lic.</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-amber-500 p-3 rounded-xl text-slate-950 font-bold text-center text-sm shadow-lg shadow-amber-500/20">
                                        ⚡ 1-Click Convert to Confirmed Booking →
                                    </div>
                                </div>
                            </div>

                            {/* Drop-Off & Fuel Settlement Card */}
                            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl space-y-4 relative overflow-hidden">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-sm">
                                            ⛽
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-sm">Drop-Off & Fuel Settlement</div>
                                            <div className="text-xs text-slate-400">Zero unrecovered fuel loss</div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-mono bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-md">Precision Audit</span>
                                </div>

                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                                            <div className="text-[11px] text-slate-400">Trip Distance</div>
                                            <div className="text-base font-bold text-white font-mono">480 km</div>
                                            <div className="text-[10px] text-slate-400 mt-1">45,200 km → 45,680 km</div>
                                        </div>

                                        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                                            <div className="text-[11px] text-slate-400">Fuel Level Deficit</div>
                                            <div className="text-base font-bold text-amber-400 font-mono">25 Liters (50%)</div>
                                            <div className="text-[10px] text-slate-400 mt-1">Handed: 100% | Return: 50%</div>
                                        </div>
                                    </div>

                                    <div className="bg-amber-950/50 border border-amber-500/30 p-3 rounded-xl flex items-center justify-between">
                                        <div>
                                            <div className="text-xs font-bold text-white">Fuel Shortfall Recovery</div>
                                            <div className="text-[11px] text-amber-300/80">25L x Rs. 280/L = Charged to Bill</div>
                                        </div>
                                        <span className="text-base font-extrabold font-mono text-amber-400">Rs. 7,000</span>
                                    </div>

                                    <div className="flex items-center justify-between text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                                        <span className="text-slate-400">🔧 Service Inspection Due:</span>
                                        <span className="text-emerald-400 font-bold">In 320 km (Odometer safe)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ---------- DUAL PRICING SECTION ---------- */}
                <section id="dual-pricing" className="py-20 border-t border-slate-800 bg-slate-900/50">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
                            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                                Dual Pricing Engine: Daily vs. Lumpsum
                            </h2>
                            <p className="text-slate-400 text-base">
                                Protect your agency margins across every rental scenario. Choose the optimal contract pricing model with one click.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 space-y-6 hover:border-amber-500/50 transition-colors">
                                <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl font-bold">
                                    📅
                                </div>
                                <h3 className="text-2xl font-bold text-white">1. Daily Rate (Fuel Return Policy)</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Ideal for multi-day business rentals, city commuting, and long-term hires. The client is billed per calendar day and contractually obligated to return the vehicle at the exact same fuel level.
                                </p>
                                <ul className="space-y-2 text-xs font-semibold text-slate-300">
                                    <li className="flex items-center gap-2 text-amber-400">✓ Accurate duration calculation (calendar day rounding)</li>
                                    <li className="flex items-center gap-2 text-amber-400">✓ Automatic fuel shortfall detection on drop-off</li>
                                    <li className="flex items-center gap-2 text-amber-400">✓ Tank capacity in liters x market fuel price</li>
                                </ul>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 space-y-6 hover:border-amber-500/50 transition-colors">
                                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-2xl font-bold">
                                    🏷️
                                </div>
                                <h3 className="text-2xl font-bold text-white">2. All-Inclusive Lumpsum Package</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Perfect for airport transfers, VIP delegations, weddings, and inter-city outstation trips. Set one flat all-inclusive rate with driver allowances and toll/fuel expenses baked right in.
                                </p>
                                <ul className="space-y-2 text-xs font-semibold text-slate-300">
                                    <li className="flex items-center gap-2 text-indigo-400">✓ Fixed package total with zero surprise fuel disputes</li>
                                    <li className="flex items-center gap-2 text-indigo-400">✓ Clear security deposit tracking and return status</li>
                                    <li className="flex items-center gap-2 text-indigo-400">✓ Partner fleet markup support for outsourced vehicles</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ---------- FUEL SETTLEMENT & MAINTENANCE ---------- */}
                <section id="fuel-settlement" className="py-20 border-t border-slate-800 bg-slate-950">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-bold text-amber-400 uppercase tracking-widest">
                                    ⛽ Fleet Financial Control
                                </div>

                                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                                    Flexible 3-Way Fuel Settlement & Auto Maintenance
                                </h2>

                                <p className="text-slate-400 text-base leading-relaxed">
                                    Unrecovered fuel is the #1 silent profit killer in car rental operations. Our drop-off engine computes the exact shortfall against the car's tank capacity and lets staff settle seamlessly.
                                </p>

                                <div className="space-y-4 pt-2">
                                    <div className="flex items-start gap-4">
                                        <div className="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">1</div>
                                        <div>
                                            <div className="font-bold text-white text-sm">Charged to Client Invoice</div>
                                            <div className="text-xs text-slate-400">Fuel shortfall is automatically added to the remaining balance and settled at payment counter.</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">2</div>
                                        <div>
                                            <div className="font-bold text-white text-sm">Paid Direct Cash to Driver</div>
                                            <div className="text-xs text-slate-400">Client pays the driver directly at roadside handover; recorded in audit trail without altering customer bill.</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">3</div>
                                        <div>
                                            <div className="font-bold text-white text-sm">Client Refilled On-Route</div>
                                            <div className="text-xs text-slate-400">Zero penalty incurred; logged in drop-off inspection report with verified fuel gauge photos.</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="h-8 w-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-sm shrink-0">4</div>
                                        <div>
                                            <div className="font-bold text-white text-sm">Automated Odometer Maintenance Flags</div>
                                            <div className="text-xs text-slate-400">When drop-off odometer reaches or exceeds next service mileage, vehicle is auto-flagged to Maintenance status to prevent breakdowns.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Visual Feature Card */}
                            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                    <div className="font-bold text-white text-sm flex items-center gap-2">
                                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                        Live Fleet Inspection Queue
                                    </div>
                                    <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded">Active Telemetry</span>
                                </div>

                                <div className="space-y-3 text-xs">
                                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-white">Honda Civic 2023 · LEA-19-2044</span>
                                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[11px] font-bold">Dropped Off</span>
                                        </div>
                                        <div className="text-slate-400 text-[11px]">Returned at 75% fuel (Shortfall: 11.75L). Shortfall settled via Charged to Bill (Rs. 3,290).</div>
                                    </div>

                                    <div className="bg-slate-950 p-3.5 rounded-xl border border-rose-500/30 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-white">Toyota Prado TX · AKB-789</span>
                                            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[11px] font-bold">Service Triggered</span>
                                        </div>
                                        <div className="text-slate-400 text-[11px]">Odometer reached 85,020 km (Service limit: 85,000 km). Vehicle moved to Maintenance automatically.</div>
                                    </div>

                                    <div className="bg-slate-950 p-3.5 rounded-xl border border-indigo-500/30 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-white">Hyundai Tucson · BCL-550</span>
                                            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[11px] font-bold">Partner Fleet</span>
                                        </div>
                                        <div className="text-slate-400 text-[11px]">Supplied by Apex Car Rental: Vendor Cost Rs. 8,000 | Client Billed Rs. 11,500 (Profit: Rs. 3,500).</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ---------- FLEET ROI CALCULATOR ---------- */}
                <section id="calculator" className="py-20 border-t border-slate-800 bg-slate-900/50">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
                            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-bold text-amber-400 uppercase tracking-widest">
                                💰 Agency ROI Engine
                            </div>
                            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                                Calculate Your Fleet's Bottom-Line Boost
                            </h2>
                            <p className="text-slate-400 text-base">
                                See how automated fuel shortfall recovery and instant WhatsApp auto-dispatch translate directly to annual profit.
                            </p>
                        </div>

                        <div className="max-w-4xl mx-auto rounded-3xl border border-slate-800 bg-slate-900 p-8 lg:p-12 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Sliders */}
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm font-bold text-slate-300 mb-2">
                                        <span>Total Fleet Size</span>
                                        <span className="text-amber-400 font-mono text-base">{fleetSize} Vehicles</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="3"
                                        max="100"
                                        value={fleetSize}
                                        onChange={(e) => setFleetSize(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm font-bold text-slate-300 mb-2">
                                        <span>Average Daily Rental Rate</span>
                                        <span className="text-amber-400 font-mono text-base">{fmt(dailyRate)}/day</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="2500"
                                        max="30000"
                                        step="500"
                                        value={dailyRate}
                                        onChange={(e) => setDailyRate(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm font-bold text-slate-300 mb-2">
                                        <span>Fleet Utilization Rate</span>
                                        <span className="text-amber-400 font-mono text-base">{utilization}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="30"
                                        max="90"
                                        value={utilization}
                                        onChange={(e) => setUtilization(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm font-bold text-slate-300 mb-2">
                                        <span>Recovered Fuel Shortfall / Car / Month</span>
                                        <span className="text-amber-400 font-mono text-base">{fmt(unrecoveredFuelPerMonth)}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1000"
                                        max="15000"
                                        step="500"
                                        value={unrecoveredFuelPerMonth}
                                        onChange={(e) => setUnrecoveredFuelPerMonth(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                                    />
                                </div>
                            </div>

                            {/* Output Card */}
                            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-6 flex flex-col justify-between space-y-6">
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                                        Estimated Annual Bottom-Line Improvement
                                    </div>
                                    <div className="text-4xl font-extrabold text-white font-mono">
                                        {fmt(totalBottomLineGain)}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-2">
                                        Combined from prevented fuel leakage and faster dispatch turnaround.
                                    </div>
                                </div>

                                <div className="space-y-2 border-t border-amber-500/20 pt-4 text-xs font-semibold">
                                    <div className="flex justify-between text-slate-300">
                                        <span>Annual Fuel Recovery Saved:</span>
                                        <span className="font-mono text-amber-400">{fmt(annualFuelRecovered)}/yr</span>
                                    </div>
                                    <div className="flex justify-between text-slate-300">
                                        <span>8% Faster Dispatch Revenue Boost:</span>
                                        <span className="font-mono text-amber-400">{fmt(annualUtilizationBoost)}/yr</span>
                                    </div>
                                    <div className="flex justify-between text-slate-300">
                                        <span>Estimated Gross Fleet Revenue:</span>
                                        <span className="font-mono text-slate-300">{fmt(annualRentalRevenue)}/yr</span>
                                    </div>
                                    <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800">
                                        <span>{name} SaaS Flat Fee:</span>
                                        <span className="font-mono text-slate-400">- Rs 6,999/mo</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ---------- CORE FEATURES GRID ---------- */}
                <section id="features" className="py-20 border-t border-slate-800 bg-slate-950">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
                            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                                Built Exclusively for Car Rental Operations
                            </h2>
                            <p className="text-slate-400 text-base">
                                Every tool your team needs to streamline dispatch, monitor drivers, track third-party suppliers, and grow your fleet.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 hover:border-slate-700 transition-all">
                                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl font-bold">
                                    🚘
                                </div>
                                <h3 className="text-lg font-bold text-white">Fleet & Odometer Audit</h3>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    Track full vehicle specs, registration, fuel tank capacities in liters, current mileage, and insurance expiration dates with digital status locks.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 hover:border-slate-700 transition-all">
                                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl font-bold">
                                    💬
                                </div>
                                <h3 className="text-lg font-bold text-white">WhatsApp Auto-Matcher</h3>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    Ingest inbound customer chat inquiries and automatically pair them with the optimal available vehicle and roster driver with 1-click booking confirmation.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 hover:border-slate-700 transition-all">
                                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl font-bold">
                                    👨‍✈️
                                </div>
                                <h3 className="text-lg font-bold text-white">Driver Roster Management</h3>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    Maintain full driver profiles, CNIC/licenses, assigned vehicles, and on-trip/off-duty availability status with built-in audit trails.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 hover:border-slate-700 transition-all">
                                <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-xl font-bold">
                                    🤝
                                </div>
                                <h3 className="text-lg font-bold text-white">Third-Party Fleet Sourcing</h3>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    Never turn down a high-value customer booking. Source partner vehicles from external vendors while tracking cost versus client billing markup.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 hover:border-slate-700 transition-all">
                                <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-xl font-bold">
                                    🔧
                                </div>
                                <h3 className="text-lg font-bold text-white">Preventive Maintenance Engine</h3>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    Automated scheduled scanning locks vehicles due for oil changes or inspection upon drop-off, protecting your capital investments.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 hover:border-slate-700 transition-all">
                                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xl font-bold">
                                    🏢
                                </div>
                                <h3 className="text-lg font-bold text-white">True Multi-Tenant Isolation</h3>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    Built on robust tenant data separation. Your clients, pricing, rates, and fleet data are completely segregated and secured.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ---------- PRICING SECTION ---------- */}
                <section id="pricing" className="py-20 border-t border-slate-800 bg-slate-900/50">
                    <div className="mx-auto max-w-7xl px-6 text-center">
                        <div className="max-w-3xl mx-auto space-y-4 mb-16">
                            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                                Simple Flat Agency Pricing. No Hidden Commissions.
                            </h2>
                            <p className="text-slate-400 text-base">
                                Start with our 15-day free trial. Scale seamlessly as your fleet expands.
                            </p>
                        </div>

                        <div className="max-w-md mx-auto rounded-3xl border-2 border-amber-500 bg-slate-900 p-8 shadow-2xl space-y-6 relative">
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest px-4 py-1 rounded-full shadow">
                                Most Popular Agency Plan
                            </div>

                            <div>
                                <div className="text-lg font-bold text-slate-300">Fleet Growth Plan</div>
                                <div className="text-4xl font-extrabold text-white font-mono mt-2">
                                    Rs 6,999<span className="text-base text-slate-400 font-sans font-normal"> / month</span>
                                </div>
                            </div>

                            <ul className="space-y-3 text-sm text-slate-300 text-left border-t border-b border-slate-800 py-6">
                                <li className="flex items-center gap-3">
                                    <span className="text-amber-400 font-bold">✓</span> Up to 50 Fleet Vehicles & Unlimited Bookings
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-amber-400 font-bold">✓</span> WhatsApp Inbound Request Auto-Matcher
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-amber-400 font-bold">✓</span> Dual Pricing Engine (Daily + Fuel vs Lumpsum)
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-amber-400 font-bold">✓</span> Live Liter-Based Drop-Off Fuel Settlement
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-amber-400 font-bold">✓</span> Automated Odometer Maintenance Flagging
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-amber-400 font-bold">✓</span> Third-Party Partner Fleet Sourcing
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-amber-400 font-bold">✓</span> Client CRM & Payment Tracking
                                </li>
                            </ul>

                            <Link
                                href={route('register')}
                                className="block w-full rounded-xl bg-amber-500 py-3.5 text-center text-base font-extrabold text-slate-950 shadow-lg shadow-amber-500/25 hover:bg-amber-400 transition-all"
                            >
                                Start 15-Day Free Trial →
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ---------- FOOTER ---------- */}
                <footer className="border-t border-slate-800 bg-slate-950 py-12 text-xs text-slate-500">
                    <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-black text-sm">
                                🚗
                            </div>
                            <span className="font-bold text-slate-300 text-sm">{name} Car Rental Operating System</span>
                        </div>

                        <div>
                            © {new Date().getFullYear()} {name}. All rights reserved. Multi-Tenant Fleet Management & WhatsApp Dispatch SaaS.
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
