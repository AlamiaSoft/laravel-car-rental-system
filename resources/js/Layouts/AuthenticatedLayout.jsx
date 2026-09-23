import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Smartphone } from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const tenant = usePage().props.tenant;

    const hasCapability = (cap) => {
        if (!tenant) return ['rentals', 'fleet'].includes(cap);
        return Boolean(tenant.capabilities && tenant.capabilities.includes(cap));
    };

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <nav className="border-b border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink>

                                {hasCapability('ordering') && (
                                    <div className="hidden sm:flex sm:items-center">
                                        <div className="relative">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <button type="button" className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none h-16 ${route().current('orders.*') ? 'border-indigo-400 text-gray-900 focus:border-indigo-700 dark:border-indigo-600 dark:text-gray-100' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 focus:border-gray-300 focus:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300 dark:focus:border-gray-700 dark:focus:text-gray-300'}`}>
                                                        Orders
                                                        <svg className="ml-1 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </Dropdown.Trigger>
                                                <Dropdown.Content>
                                                    <Dropdown.Link href={route('orders.kds-unified')}>Unified KDS</Dropdown.Link>
                                                    <Dropdown.Link href={route('orders.create')}>POS (Manual Order)</Dropdown.Link>
                                                    <Dropdown.Link href={route('simulator.index')}>Customer Bot Interface</Dropdown.Link>
                                                    <Dropdown.Link href={route('orders.history')}>Order History</Dropdown.Link>
                                                    <Dropdown.Link href={route('orders.index')}>Old KDS</Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
                                    </div>
                                )}

                                {hasCapability('catalog') && (
                                    <div className="hidden sm:flex sm:items-center">
                                        <div className="relative">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <button type="button" className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none h-16 ${route().current('menu.*') ? 'border-indigo-400 text-gray-900 focus:border-indigo-700 dark:border-indigo-600 dark:text-gray-100' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 focus:border-gray-300 focus:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300 dark:focus:border-gray-700 dark:focus:text-gray-300'}`}>
                                                        Menu
                                                        <svg className="ml-1 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </Dropdown.Trigger>
                                                <Dropdown.Content>
                                                    <Dropdown.Link href={route('menu.categories.index')}>Categories</Dropdown.Link>
                                                    <Dropdown.Link href={route('menu.products.index')}>Products</Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
                                    </div>
                                )}

                                {hasCapability('rentals') && (
                                    <div className="hidden sm:flex sm:items-center">
                                        <div className="relative">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <button type="button" className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none h-16 ${route().current('rental.bookings.*') || route().current('rental.requests.*') || route().current('rental.drivers.*') || route().current('rental.clients.*') ? 'border-emerald-400 text-gray-900 focus:border-emerald-700 dark:border-emerald-500 dark:text-gray-100' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 focus:border-gray-300 focus:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300'}`}>
                                                        Rentals
                                                        <svg className="ml-1 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </Dropdown.Trigger>
                                                <Dropdown.Content>
                                                    <Dropdown.Link href={route('rental.bookings.index')}>Bookings</Dropdown.Link>
                                                    <Dropdown.Link href={route('rental.requests.index')}>WhatsApp Requests</Dropdown.Link>
                                                    <Dropdown.Link href={route('rental.drivers.index')}>Drivers</Dropdown.Link>
                                                    <Dropdown.Link href={route('rental.clients.index')}>Clients</Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
                                    </div>
                                )}

                                {hasCapability('fleet') && (
                                    <div className="hidden sm:flex sm:items-center">
                                        <div className="relative">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <button type="button" className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none h-16 ${route().current('rental.vehicles.*') || route().current('rental.maintenance.*') || route().current('rental.vendors.*') ? 'border-emerald-400 text-gray-900 focus:border-emerald-700 dark:border-emerald-500 dark:text-gray-100' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 focus:border-gray-300 focus:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300'}`}>
                                                        Fleet
                                                        <svg className="ml-1 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </Dropdown.Trigger>
                                                <Dropdown.Content>
                                                    <Dropdown.Link href={route('rental.vehicles.index')}>Vehicles</Dropdown.Link>
                                                    <Dropdown.Link href={route('rental.maintenance.index')}>Maintenance Logs</Dropdown.Link>
                                                    <Dropdown.Link href={route('rental.vendors.index')}>Third-Party Partners</Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
                                    </div>
                                )}

                                <NavLink
                                    href={route('crm.index')}
                                    active={route().current('crm.*')}
                                >
                                    CRM
                                </NavLink>
                                <div className="hidden sm:flex sm:items-center">
                                    <div className="relative">
                                        <Dropdown>
                                            <Dropdown.Trigger>
                                                <button type="button" className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none h-16 ${route().current('settings.*') ? 'border-indigo-400 text-gray-900 focus:border-indigo-700 dark:border-indigo-600 dark:text-gray-100' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 focus:border-gray-300 focus:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300 dark:focus:border-gray-700 dark:focus:text-gray-300'}`}>
                                                    Settings
                                                    <svg className="ml-1 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </Dropdown.Trigger>
                                            <Dropdown.Content>
                                                <Dropdown.Link href={route('settings.integrations')}>Integrations</Dropdown.Link>
                                                <Dropdown.Link href={route('settings.billing')}>Billing</Dropdown.Link>
                                                <Dropdown.Link href={route('settings.miniapp')}>Mini-App Configuration</Dropdown.Link>
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            {user.tenant_id && (
                                <a
                                    href={`/app/${user.tenant_id}/${tenant?.primary_experience || 'rent'}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="me-3 inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition duration-150 ease-in-out shadow-sm"
                                >
                                    <Smartphone className="w-3.5 h-3.5" /> View Fleet App
                                </a>
                            )}
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none dark:text-gray-500 dark:hover:bg-gray-900 dark:hover:text-gray-400 dark:focus:bg-gray-900 dark:focus:text-gray-400"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="pt-2 pb-3 space-y-1">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>

                        {hasCapability('ordering') && (
                            <>
                                <div className="block px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</div>
                                <ResponsiveNavLink
                                    href={route('orders.kds-unified')}
                                    active={route().current('orders.kds-unified')}
                                    className="pl-6"
                                >
                                    Unified KDS
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('orders.create')}
                                    active={route().current('orders.create')}
                                    className="pl-6"
                                >
                                    POS (Manual Order)
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('simulator.index')}
                                    active={route().current('simulator.index')}
                                    className="pl-6"
                                >
                                    Customer Bot Interface
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('orders.history')}
                                    active={route().current('orders.history')}
                                    className="pl-6"
                                >
                                    Order History
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('orders.index')}
                                    active={route().current('orders.index')}
                                    className="pl-6"
                                >
                                    Old KDS
                                </ResponsiveNavLink>
                            </>
                        )}

                        {hasCapability('catalog') && (
                            <>
                                <div className="block px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">Menu</div>
                                <ResponsiveNavLink
                                    href={route('menu.categories.index')}
                                    active={route().current('menu.categories.*')}
                                    className="pl-6"
                                >
                                    Categories
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('menu.products.index')}
                                    active={route().current('menu.products.*')}
                                    className="pl-6"
                                >
                                    Products
                                </ResponsiveNavLink>
                            </>
                        )}

                        {hasCapability('rentals') && (
                            <>
                                <div className="block px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">Rentals</div>
                                <ResponsiveNavLink
                                    href={route('rental.bookings.index')}
                                    active={route().current('rental.bookings.*')}
                                    className="pl-6"
                                >
                                    Bookings
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('rental.requests.index')}
                                    active={route().current('rental.requests.*')}
                                    className="pl-6"
                                >
                                    WhatsApp Requests
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('rental.drivers.index')}
                                    active={route().current('rental.drivers.*')}
                                    className="pl-6"
                                >
                                    Drivers
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('rental.clients.index')}
                                    active={route().current('rental.clients.*')}
                                    className="pl-6"
                                >
                                    Clients
                                </ResponsiveNavLink>
                            </>
                        )}

                        {hasCapability('fleet') && (
                            <>
                                <div className="block px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">Fleet</div>
                                <ResponsiveNavLink
                                    href={route('rental.vehicles.index')}
                                    active={route().current('rental.vehicles.*')}
                                    className="pl-6"
                                >
                                    Vehicles
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('rental.maintenance.index')}
                                    active={route().current('rental.maintenance.*')}
                                    className="pl-6"
                                >
                                    Maintenance Logs
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('rental.vendors.index')}
                                    active={route().current('rental.vendors.*')}
                                    className="pl-6"
                                >
                                    Third-Party Partners
                                </ResponsiveNavLink>
                            </>
                        )}

                        <div className="block px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">Management</div>
                        <ResponsiveNavLink
                            href={route('crm.index')}
                            active={route().current('crm.*')}
                            className="pl-6"
                        >
                            CRM
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('settings.integrations')}
                            active={route().current('settings.integrations')}
                            className="pl-6"
                        >
                            Integrations
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('settings.billing')}
                            active={route().current('settings.billing')}
                            className="pl-6"
                        >
                            Billing
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('settings.miniapp')}
                            active={route().current('settings.miniapp')}
                            className="pl-6"
                        >
                            Mini-App Settings
                        </ResponsiveNavLink>
                        {user.tenant_id && (
                            <ResponsiveNavLink
                                href={route('pwa.menu', { tenant_slug: user.tenant_id })}
                                target="_blank"
                                className="pl-6 text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1.5"
                            >
                                <Smartphone className="w-4 h-4" /> View Your App
                            </ResponsiveNavLink>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4 dark:border-gray-600">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow dark:bg-gray-800">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            {usePage().props.tenant?.hasPendingInvoices && (
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm" role="alert">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-bold">Attention Required</p>
                                <p>You have pending invoices. Please go to your Billing Settings to review and settle them.</p>
                            </div>
                            <Link href={route('settings.billing')} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-sm transition">
                                View Billing
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {usePage().props.tenant?.is_read_only && (
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
                    <div className="bg-rose-900/40 border-l-4 border-rose-500 text-rose-200 p-4 rounded-xl shadow-lg flex justify-between items-center" role="alert">
                        <div>
                            <p className="font-bold text-rose-100 flex items-center gap-2">
                                <span>🔒</span> Account in Read-Only Mode
                            </p>
                            <p className="text-sm mt-0.5">Your 15-day trial or subscription has ended. You can still view your fleet and bookings, but creating or updating records requires an active subscription.</p>
                        </div>
                        <Link href={route('settings.billing')} className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 px-5 rounded-lg text-sm transition shrink-0 ml-4">
                            Subscribe Now →
                        </Link>
                    </div>
                </div>
            )}

            {!usePage().props.tenant?.is_read_only && usePage().props.tenant?.subscription_status === 'trial' && usePage().props.tenant?.days_left_in_trial !== null && (
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="bg-amber-950/40 border border-amber-600/30 text-amber-200 px-4 py-2.5 rounded-xl shadow-sm flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                            <span><strong>15-Day Free Trial:</strong> {usePage().props.tenant.days_left_in_trial} days remaining. All fleet, booking, and WhatsApp features are active.</span>
                        </div>
                        <Link href={route('settings.billing')} className="font-semibold text-amber-400 hover:text-amber-300 underline shrink-0 ml-3">
                            Upgrade Subscription
                        </Link>
                    </div>
                </div>
            )}

            <main>{children}</main>
        </div>
    );
}
