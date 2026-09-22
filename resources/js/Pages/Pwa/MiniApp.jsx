import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Calendar, Clock, MessageSquare, CheckCircle, Info, Sparkles, MapPin, Phone, Car, Fuel, Users, Check } from 'lucide-react';
import axios from 'axios';

export default function MiniApp({ tenant, customer, services = [], vehicles = [], settings, currentExperience, capabilities = [], previewMode = false }) {
    const isRental = currentExperience === 'rent' || capabilities.includes('rentals') || capabilities.includes('fleet');
    const isBooking = currentExperience === 'book' || capabilities.includes('booking');
    
    const branding = settings?.branding || {};
    const primaryColor = isRental ? '#f59e0b' : (branding.primary_color || '#4f46e5');

    // Appointment State
    const [bookingSubmitted, setBookingSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [bookingForm, setBookingForm] = useState({
        name: customer?.name || '',
        phone: customer?.phone || '',
        service_id: services.length > 0 ? String(services[0].id) : '',
        preferredDate: '',
        preferredTime: '10:00',
        notes: '',
    });

    // Car Rental State
    const [rentalSubmitted, setRentalSubmitted] = useState(false);
    const [rentalSubmitting, setRentalSubmitting] = useState(false);
    const [rentalError, setRentalError] = useState('');
    const [rentalForm, setRentalForm] = useState({
        name: customer?.name || '',
        phone: customer?.phone || '',
        vehicle_id: vehicles.length > 0 ? String(vehicles[0].id) : '',
        start_date: '',
        end_date: '',
        notes: '',
    });

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError('');

        try {
            await axios.post(`/app/${tenant.id}/book`, {
                customer_name: bookingForm.name,
                customer_phone: bookingForm.phone,
                service_id: bookingForm.service_id ? Number(bookingForm.service_id) : null,
                booking_date: bookingForm.preferredDate,
                booking_time: bookingForm.preferredTime,
                notes: bookingForm.notes,
            });
            setBookingSubmitted(true);
        } catch (err) {
            setSubmitError(err.response?.data?.message || 'Failed to submit appointment request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRentalSubmit = async (e) => {
        e.preventDefault();
        setRentalSubmitting(true);
        setRentalError('');

        try {
            await axios.post(`/app/${tenant.id}/rent/request`, {
                customer_name: rentalForm.name,
                customer_phone: rentalForm.phone,
                vehicle_id: rentalForm.vehicle_id ? Number(rentalForm.vehicle_id) : null,
                start_date: rentalForm.start_date,
                end_date: rentalForm.end_date,
                notes: rentalForm.notes,
            });
            setRentalSubmitted(true);
        } catch (err) {
            setRentalError(err.response?.data?.message || 'Failed to submit rental request. Please try again.');
        } finally {
            setRentalSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col font-sans">
            <Head title={`${tenant.name} - ${isRental ? 'Car Rental Fleet' : 'Mini App'}`} />

            {/* Top Branding Banner */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-30">
                <div className="max-w-xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                            {tenant.name}
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {isRental ? 'Car Rental & Fleet Dispatch' : isBooking ? 'Online Booking & Appointments' : 'Digital Hub'}
                        </p>
                    </div>

                    {previewMode && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                            Live Preview
                        </span>
                    )}
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-xl w-full mx-auto p-4 space-y-6">
                {/* Hero Card */}
                <div 
                    className="rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
                    style={{ background: isRental ? 'linear-gradient(135deg, #b45309, #78350f)' : `linear-gradient(135deg, ${primaryColor}, #312e81)` }}
                >
                    <div className="relative z-10 flex items-start gap-4">
                        {branding.logo ? (
                            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/80 shadow-md bg-white flex-shrink-0">
                                <img src={branding.logo} alt={tenant.name} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-14 h-14 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-2xl font-bold flex-shrink-0">
                                {isRental ? '🚗' : '✨'}
                            </div>
                        )}
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-2">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>{isRental ? 'Available Rental Fleet' : isBooking ? 'Official Booking Portal' : 'Verified Business Portal'}</span>
                            </div>
                            <h2 className="text-2xl font-black mb-1">{tenant.name}</h2>
                            <p className="text-xs text-white/80 leading-relaxed max-w-md">
                                {isRental ? 'Select your preferred vehicle and request an instant booking via WhatsApp dispatch.' : (branding.description || 'Schedule your appointment or connect with our team directly.')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Experience Panels */}
                {isRental ? (
                    <div className="space-y-6">
                        {/* Fleet Vehicle Roster */}
                        {vehicles.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                    <Car className="w-4 h-4 text-amber-500" /> Available Fleet Vehicles
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {vehicles.map((v) => {
                                        const isSelected = String(rentalForm.vehicle_id) === String(v.id);
                                        return (
                                            <div
                                                key={v.id}
                                                onClick={() => setRentalForm({ ...rentalForm, vehicle_id: String(v.id) })}
                                                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-500 shadow-sm'
                                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-amber-300'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {v.image_url && (
                                                        <div className="flex-shrink-0 text-center">
                                                            <img
                                                                src={v.image_url}
                                                                alt={v.model}
                                                                className="w-16 h-16 rounded-xl object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
                                                            />
                                                            {v.photo_metadata?.photographer && (
                                                                <a
                                                                    href={v.photo_metadata.pexels_url || v.photo_metadata.photographer_url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="block text-[8px] text-gray-400 hover:text-amber-600 mt-0.5 truncate max-w-[64px]"
                                                                    title={`Photo by ${v.photo_metadata.photographer} on Pexels`}
                                                                >
                                                                    by {v.photo_metadata.photographer}
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div>
                                                                <div className="font-bold text-sm text-gray-900 dark:text-white truncate">
                                                                    {v.model} {v.year && `(${v.year})`}
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                                                                    {v.plate_number}
                                                                </div>
                                                            </div>
                                                            <div className="text-right flex-shrink-0">
                                                                <span className="font-extrabold text-amber-600 dark:text-amber-400 text-sm">
                                                                    Rs. {Number(v.daily_rate).toLocaleString()}
                                                                </span>
                                                                <span className="text-[10px] text-gray-400 block">/ day</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/60 text-xs text-gray-600 dark:text-gray-300">
                                                            <span className="flex items-center gap-1">
                                                                <Fuel className="w-3.5 h-3.5 text-gray-400" />
                                                                {v.fuel_tank_capacity ? `${v.fuel_tank_capacity}L Tank Capacity` : 'Standard Tank'}
                                                            </span>
                                                            {isSelected && (
                                                                <span className="ml-auto text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                                                    <Check className="w-3.5 h-3.5" /> Selected
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Rental Request Form */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-5">
                            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
                                <Car className="w-5 h-5 text-amber-500" />
                                <h3 className="font-bold text-base text-gray-900 dark:text-white">Request Vehicle Rental</h3>
                            </div>

                            {rentalError && (
                                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-800">
                                    {rentalError}
                                </div>
                            )}

                            {rentalSubmitted ? (
                                <div className="text-center py-8 space-y-3">
                                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle className="w-7 h-7" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">Rental Request Sent!</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                                        Your inquiry has been placed into our automated dispatch queue. Our operations team will confirm availability and contact you via WhatsApp shortly.
                                    </p>
                                    <button
                                        onClick={() => setRentalSubmitted(false)}
                                        className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-xs font-semibold rounded-lg transition"
                                    >
                                        Submit Another Request
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleRentalSubmit} className="space-y-4">
                                    {vehicles.length > 0 && (
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Select Vehicle</label>
                                            <select
                                                value={rentalForm.vehicle_id}
                                                onChange={(e) => setRentalForm({ ...rentalForm, vehicle_id: e.target.value })}
                                                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                            >
                                                <option value="">Any Available Vehicle</option>
                                                {vehicles.map((v) => (
                                                    <option key={v.id} value={v.id}>
                                                        {v.model} ({v.plate_number}) — Rs. {Number(v.daily_rate).toLocaleString()}/day
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Your Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={rentalForm.name}
                                            onChange={(e) => setRentalForm({ ...rentalForm, name: e.target.value })}
                                            placeholder="e.g. Tariq Khan"
                                            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">WhatsApp Phone Number</label>
                                        <input
                                            type="tel"
                                            required
                                            value={rentalForm.phone}
                                            onChange={(e) => setRentalForm({ ...rentalForm, phone: e.target.value })}
                                            placeholder="03001234567"
                                            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                                            <input
                                                type="date"
                                                required
                                                value={rentalForm.start_date}
                                                onChange={(e) => setRentalForm({ ...rentalForm, start_date: e.target.value })}
                                                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                                            <input
                                                type="date"
                                                required
                                                value={rentalForm.end_date}
                                                onChange={(e) => setRentalForm({ ...rentalForm, end_date: e.target.value })}
                                                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Requirements / Destination</label>
                                        <textarea
                                            rows={2}
                                            value={rentalForm.notes}
                                            onChange={(e) => setRentalForm({ ...rentalForm, notes: e.target.value })}
                                            placeholder="e.g. Need driver, inter-city trip to Islamabad, airport pickup..."
                                            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={rentalSubmitting}
                                        className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <Car className="w-4 h-4" /> {rentalSubmitting ? 'Sending Request...' : 'Submit Rental Inquiry →'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                ) : isBooking ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-5">
                        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
                            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <h3 className="font-bold text-base text-gray-900 dark:text-white">Request an Appointment</h3>
                        </div>

                        {submitError && (
                            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-800">
                                {submitError}
                            </div>
                        )}

                        {bookingSubmitted ? (
                            <div className="text-center py-8 space-y-3">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle className="w-7 h-7" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Request Received!</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                                    We have received your appointment request. Our team will confirm your slot via WhatsApp shortly.
                                </p>
                                <button
                                    onClick={() => setBookingSubmitted(false)}
                                    className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-xs font-semibold rounded-lg transition"
                                >
                                    Book Another Slot
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleBookingSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Your Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={bookingForm.name}
                                        onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                                        placeholder="Full Name"
                                        className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        value={bookingForm.phone}
                                        onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                                        placeholder="WhatsApp Number"
                                        className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>

                                {services.length > 0 && (
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Service Offering</label>
                                        <select
                                            value={bookingForm.service_id}
                                            onChange={(e) => setBookingForm({ ...bookingForm, service_id: e.target.value })}
                                            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        >
                                            <option value="">Select a service...</option>
                                            {services.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.name} ({s.duration_minutes ? `${s.duration_minutes}m` : ''} - Rs. {s.price})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Preferred Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={bookingForm.preferredDate}
                                            onChange={(e) => setBookingForm({ ...bookingForm, preferredDate: e.target.value })}
                                            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Preferred Time</label>
                                        <input
                                            type="time"
                                            required
                                            value={bookingForm.preferredTime}
                                            onChange={(e) => setBookingForm({ ...bookingForm, preferredTime: e.target.value })}
                                            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Notes / Additional Info (Optional)</label>
                                    <textarea
                                        rows={2}
                                        value={bookingForm.notes}
                                        onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                                        placeholder="Specific concerns or questions..."
                                        className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3 text-white font-bold rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    <Calendar className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Confirm Appointment Request'}
                                </button>
                            </form>
                        )}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-4 text-center">
                        <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto">
                            <Info className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">Direct Assistance & Contact</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                            Our team is available to assist you directly via WhatsApp. Send us a message for quotes, fleet availability, and immediate booking support.
                        </p>
                        
                        <div className="pt-2">
                            <a
                                href={`https://wa.me/?text=Hello%20${encodeURIComponent(tenant.name)}%2C%20I%20would%20like%20to%20rent%20a%20vehicle.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
                            >
                                <MessageSquare className="w-4 h-4" /> Message on WhatsApp
                            </a>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="py-6 text-center text-xs text-gray-400">
                Powered by Ormeasy Car Rental OS
            </footer>
        </div>
    );
}
