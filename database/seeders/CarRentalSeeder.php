<?php

namespace Database\Seeders;

use App\Enums\BookingStatus;
use App\Enums\BusinessType;
use App\Enums\DriverStatus;
use App\Enums\FuelSettlement;
use App\Enums\PricingMode;
use App\Enums\RequestStatus;
use App\Enums\UserRole;
use App\Enums\VehicleStatus;
use App\Models\Tenant;
use App\Models\User;
use App\Services\TenantCapabilityService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Modules\Crm\Models\Customer;
use Modules\Crm\Models\CustomerAddress;
use Modules\Orders\Models\Order;
use Modules\Rental\Models\Booking;
use Modules\Rental\Models\BookingRequest;
use Modules\Rental\Models\Client;
use Modules\Rental\Models\Driver;
use Modules\Rental\Models\RentalPayment;
use Modules\Rental\Models\ThirdPartyVendor;
use Modules\Rental\Models\Vehicle;

class CarRentalSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolesAndPermissionsSeeder::class);

        $tenantId = 'prime-rentals';

        $tenant = Tenant::firstOrCreate(
            ['id' => $tenantId],
            [
                'name' => 'Prime Car Rentals',
                'is_active' => true,
                'subscription_status' => 'trial',
                'trial_ends_at' => now()->addDays(15),
            ]
        );

        app(TenantCapabilityService::class)->applyPreset($tenant, BusinessType::CarRental);
        tenancy()->initialize($tenant);

        // 1. Create Agency Owner User
        $user = User::firstOrCreate(
            ['email' => 'owner@primerentals.com'],
            [
                'name' => 'Prime Rentals Admin',
                'password' => bcrypt('password123'),
                'tenant_id' => $tenant->id,
                'email_verified_at' => now(),
            ]
        );
        $user->assignRole(UserRole::Owner->value);

        // 2. Seed 7 Fleet Vehicles with Real Pexels Stock Photos & Photographer Attribution
        $fortuner = Vehicle::updateOrCreate(
            ['plate_number' => 'LED-21-4920', 'tenant_id' => $tenant->id],
            [
                'model' => 'Toyota Fortuner Legender',
                'year' => 2024,
                'fuel_tank_capacity' => 80.0,
                'daily_rate' => 22000.00,
                'mileage' => 28400,
                'next_service_due_mileage' => 30000,
                'status' => VehicleStatus::Available,
                'image_url' => 'https://images.pexels.com/photos/707046/pexels-photo-707046.jpeg?auto=compress&cs=tinysrgb&w=800',
                'photo_metadata' => [
                    'pexels_id' => 707046,
                    'photographer' => 'Vlad Alexandru Popa',
                    'photographer_url' => 'https://www.pexels.com/@vlad-alexandru-popa-1402852',
                    'pexels_url' => 'https://www.pexels.com/photo/707046/',
                ],
            ]
        );

        $civic = Vehicle::updateOrCreate(
            ['plate_number' => 'ISB-23-8821', 'tenant_id' => $tenant->id],
            [
                'model' => 'Honda Civic RS Turbo',
                'year' => 2023,
                'fuel_tank_capacity' => 47.0,
                'daily_rate' => 9000.00,
                'mileage' => 34200,
                'next_service_due_mileage' => 35000,
                'status' => VehicleStatus::Rented,
                'image_url' => 'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&cs=tinysrgb&w=800',
                'photo_metadata' => [
                    'pexels_id' => 112460,
                    'photographer' => 'Mike Bird',
                    'photographer_url' => 'https://www.pexels.com/@mikebirdy',
                    'pexels_url' => 'https://www.pexels.com/photo/112460/',
                ],
            ]
        );

        $cultus = Vehicle::updateOrCreate(
            ['plate_number' => 'LHE-22-1199', 'tenant_id' => $tenant->id],
            [
                'model' => 'Suzuki Cultus Auto Gear',
                'year' => 2022,
                'fuel_tank_capacity' => 35.0,
                'daily_rate' => 4500.00,
                'mileage' => 41800,
                'next_service_due_mileage' => 45000,
                'status' => VehicleStatus::Available,
                'image_url' => 'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=800',
                'photo_metadata' => [
                    'pexels_id' => 210019,
                    'photographer' => 'Pixabay',
                    'photographer_url' => 'https://www.pexels.com/@pixabay',
                    'pexels_url' => 'https://www.pexels.com/photo/210019/',
                ],
            ]
        );

        $hilux = Vehicle::updateOrCreate(
            ['plate_number' => 'KHI-23-7744', 'tenant_id' => $tenant->id],
            [
                'model' => 'Toyota Hilux Revo Rocco',
                'year' => 2023,
                'fuel_tank_capacity' => 80.0,
                'daily_rate' => 18000.00,
                'mileage' => 50050,
                'next_service_due_mileage' => 50000,
                'status' => VehicleStatus::Maintenance,
                'image_url' => 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800',
                'photo_metadata' => [
                    'pexels_id' => 1592384,
                    'photographer' => 'Trace Hudson',
                    'photographer_url' => 'https://www.pexels.com/@trace',
                    'pexels_url' => 'https://www.pexels.com/photo/1592384/',
                ],
            ]
        );

        $mercedes = Vehicle::updateOrCreate(
            ['plate_number' => 'ISB-23-0007', 'tenant_id' => $tenant->id],
            [
                'model' => 'Mercedes-Benz E-Class AMG',
                'year' => 2023,
                'fuel_tank_capacity' => 66.0,
                'daily_rate' => 35000.00,
                'mileage' => 18200,
                'next_service_due_mileage' => 25000,
                'status' => VehicleStatus::Available,
                'image_url' => 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800',
                'photo_metadata' => [
                    'pexels_id' => 170811,
                    'photographer' => 'Mike Bird',
                    'photographer_url' => 'https://www.pexels.com/@mikebirdy',
                    'pexels_url' => 'https://www.pexels.com/photo/170811/',
                ],
            ]
        );

        $tucson = Vehicle::updateOrCreate(
            ['plate_number' => 'LHR-24-3311', 'tenant_id' => $tenant->id],
            [
                'model' => 'Hyundai Tucson GLS',
                'year' => 2024,
                'fuel_tank_capacity' => 62.0,
                'daily_rate' => 16000.00,
                'mileage' => 21500,
                'next_service_due_mileage' => 25000,
                'status' => VehicleStatus::Available,
                'image_url' => 'https://images.pexels.com/photos/1149137/pexels-photo-1149137.jpeg?auto=compress&cs=tinysrgb&w=800',
                'photo_metadata' => [
                    'pexels_id' => 1149137,
                    'photographer' => 'Svandis',
                    'photographer_url' => 'https://www.pexels.com/@svandis',
                    'pexels_url' => 'https://www.pexels.com/photo/1149137/',
                ],
            ]
        );

        $sportage = Vehicle::updateOrCreate(
            ['plate_number' => 'ISB-23-5566', 'tenant_id' => $tenant->id],
            [
                'model' => 'Kia Sportage AWD',
                'year' => 2023,
                'fuel_tank_capacity' => 62.0,
                'daily_rate' => 14000.00,
                'mileage' => 27800,
                'next_service_due_mileage' => 30000,
                'status' => VehicleStatus::Available,
                'image_url' => 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800',
                'photo_metadata' => [
                    'pexels_id' => 3802510,
                    'photographer' => 'Artur Roman',
                    'photographer_url' => 'https://www.pexels.com/@artur-roman',
                    'pexels_url' => 'https://www.pexels.com/photo/3802510/',
                ],
            ]
        );

        // 3. Seed 6 Professional Drivers
        $driver1 = Driver::updateOrCreate(
            ['phone' => '03001234567', 'tenant_id' => $tenant->id],
            [
                'name' => 'Tariq Mehmood',
                'license_no' => 'LHR-COMM-9812',
                'status' => DriverStatus::Available,
            ]
        );

        $driver2 = Driver::updateOrCreate(
            ['phone' => '03217654321', 'tenant_id' => $tenant->id],
            [
                'name' => 'Muhammad Usman',
                'license_no' => 'ISB-COMM-4410',
                'status' => DriverStatus::OnTrip,
            ]
        );

        $driver3 = Driver::updateOrCreate(
            ['phone' => '03335554433', 'tenant_id' => $tenant->id],
            [
                'name' => 'Bilal Ahmed',
                'license_no' => 'KHI-COMM-5120',
                'status' => DriverStatus::Available,
            ]
        );

        $driver4 = Driver::updateOrCreate(
            ['phone' => '03159988776', 'tenant_id' => $tenant->id],
            [
                'name' => 'Rashid Ali',
                'license_no' => 'RWP-COMM-1099',
                'status' => DriverStatus::OnTrip,
            ]
        );

        $driver5 = Driver::updateOrCreate(
            ['phone' => '03421122334', 'tenant_id' => $tenant->id],
            [
                'name' => 'Naveed Khan',
                'license_no' => 'PES-COMM-7733',
                'status' => DriverStatus::OffDuty,
            ]
        );

        $driver6 = Driver::updateOrCreate(
            ['phone' => '03087766554', 'tenant_id' => $tenant->id],
            [
                'name' => 'Kamran Asghar',
                'license_no' => 'MUL-COMM-3321',
                'status' => DriverStatus::Available,
            ]
        );

        // 4. Seed 6 Customers in both Rental Clients and CRM Customers
        $customerList = [
            [
                'name' => 'Zubair Hassan',
                'phone' => '03331112233',
                'cnic' => '35201-1122334-1',
                'notes' => 'Corporate account lead from Packages Mall.',
                'address' => 'Packages Mall, Walton Road, Lahore',
                'total_orders' => 4,
                'total_spent' => 145000.00,
                'last_order_days_ago' => 2,
            ],
            [
                'name' => 'Farhan Qureshi',
                'phone' => '03459998877',
                'cnic' => '35202-9988776-3',
                'notes' => 'Frequent airport executive traveler.',
                'address' => 'DHA Phase 5, Lahore',
                'total_orders' => 3,
                'total_spent' => 78500.00,
                'last_order_days_ago' => 1,
            ],
            [
                'name' => 'Ayesha Siddiqui',
                'phone' => '03008887766',
                'cnic' => '35201-5544332-2',
                'notes' => 'Event & Wedding planner - luxury convoy lead.',
                'address' => 'Gulberg III, Main Boulevard, Lahore',
                'total_orders' => 5,
                'total_spent' => 220000.00,
                'last_order_days_ago' => 3,
            ],
            [
                'name' => 'Malik Daniyal',
                'phone' => '03124445566',
                'cnic' => '37405-6677889-1',
                'notes' => 'Diplomatic and corporate executive client.',
                'address' => 'Sector F-7/2, Street 18, Islamabad',
                'total_orders' => 2,
                'total_spent' => 92000.00,
                'last_order_days_ago' => 5,
            ],
            [
                'name' => 'Saad Rehman',
                'phone' => '03223334455',
                'cnic' => '42101-7788990-5',
                'notes' => 'Logistics director and weekend family traveler.',
                'address' => 'Clifton Block 4, Marine Drive, Karachi',
                'total_orders' => 3,
                'total_spent' => 64000.00,
                'last_order_days_ago' => 4,
            ],
            [
                'name' => 'Fatima Zahra',
                'phone' => '03345556677',
                'cnic' => '35202-3344556-8',
                'notes' => 'High-Net-Worth VIP client for executive sedans.',
                'address' => 'Sector C, Bahria Town, Lahore',
                'total_orders' => 2,
                'total_spent' => 110000.00,
                'last_order_days_ago' => 6,
            ],
        ];

        $clients = [];
        foreach ($customerList as $custData) {
            // Rental Client record
            $client = Client::updateOrCreate(
                ['phone' => $custData['phone'], 'tenant_id' => $tenant->id],
                [
                    'name' => $custData['name'],
                    'cnic' => $custData['cnic'],
                    'notes' => $custData['notes'],
                ]
            );
            $clients[$custData['phone']] = $client;

            // CRM Customer record (powers /crm dashboard)
            $crmCust = Customer::updateOrCreate(
                ['phone' => $custData['phone'], 'tenant_id' => $tenant->id],
                [
                    'name' => $custData['name'],
                    'total_orders' => $custData['total_orders'],
                    'total_spent' => $custData['total_spent'],
                    'last_order_date' => Carbon::now()->subDays($custData['last_order_days_ago']),
                ]
            );

            // Add address if none exists
            if ($crmCust->addresses()->count() === 0) {
                CustomerAddress::create([
                    'customer_id' => $crmCust->id,
                    'address' => $custData['address'],
                    'label' => 'Primary Address',
                    'is_default' => true,
                ]);
            }
        }

        // 5. Seed Third-Party Partner Vendor
        $vendor = ThirdPartyVendor::firstOrCreate(
            ['vendor_name' => 'Apex VIP Motors & Luxury Rentals', 'tenant_id' => $tenant->id],
            [
                'contact' => 'Aslam Khan (03120001122)',
            ]
        );

        // 6. Seed at least 6 Real-World Rental Bookings
        $booking1 = Booking::updateOrCreate(
            ['booking_number' => 'BK-2026-001', 'tenant_id' => $tenant->id],
            [
                'client_id' => $clients['03459998877']->id,
                'vehicle_id' => $civic->id,
                'driver_id' => $driver2->id,
                'pricing_mode' => PricingMode::Daily,
                'daily_driver_rate' => 8500.00,
                'daily_lunch_rate' => 500.00,
                'number_of_days' => 3,
                'start_date' => Carbon::now()->subDay(),
                'end_date' => Carbon::now()->addDays(2),
                'mileage_pickup' => 34200,
                'fuel_level_pickup' => 100,
                'fuel_settlement' => FuelSettlement::ChargedToBill,
                'status' => BookingStatus::Active,
                'total_cost' => 54000.00,
                'notes' => 'Airport pickup and daily executive transport.',
            ]
        );

        $booking2 = Booking::updateOrCreate(
            ['booking_number' => 'BK-2026-002', 'tenant_id' => $tenant->id],
            [
                'client_id' => $clients['03008887766']->id,
                'vehicle_id' => $fortuner->id,
                'driver_id' => $driver4->id,
                'pricing_mode' => PricingMode::Lumpsum,
                'lumpsum_amount' => 88000.00,
                'number_of_days' => 4,
                'start_date' => Carbon::now()->subHours(12),
                'end_date' => Carbon::now()->addDays(3),
                'mileage_pickup' => 28400,
                'fuel_level_pickup' => 100,
                'fuel_settlement' => FuelSettlement::RefilledByClient,
                'status' => BookingStatus::Active,
                'total_cost' => 88000.00,
                'notes' => 'Wedding convoy lead car.',
            ]
        );

        $booking3 = Booking::updateOrCreate(
            ['booking_number' => 'BK-2026-003', 'tenant_id' => $tenant->id],
            [
                'client_id' => $clients['03124445566']->id,
                'vehicle_id' => $mercedes->id,
                'driver_id' => $driver1->id,
                'pricing_mode' => PricingMode::Lumpsum,
                'lumpsum_amount' => 65000.00,
                'number_of_days' => 2,
                'start_date' => Carbon::now()->subDays(5),
                'end_date' => Carbon::now()->subDays(3),
                'mileage_pickup' => 18200,
                'mileage_dropoff' => 18580,
                'fuel_level_pickup' => 100,
                'fuel_level_dropoff' => 95,
                'fuel_shortfall_fee' => 1500.00,
                'fuel_settlement' => FuelSettlement::ChargedToBill,
                'status' => BookingStatus::Completed,
                'total_cost' => 66500.00,
                'notes' => 'Diplomatic delegation transport Islamabad to Lahore.',
            ]
        );

        $booking4 = Booking::updateOrCreate(
            ['booking_number' => 'BK-2026-004', 'tenant_id' => $tenant->id],
            [
                'client_id' => $clients['03331112233']->id,
                'vehicle_id' => $cultus->id,
                'driver_id' => null, // Self-Drive
                'pricing_mode' => PricingMode::Daily,
                'daily_driver_rate' => 0.00,
                'daily_lunch_rate' => 0.00,
                'number_of_days' => 3,
                'start_date' => Carbon::now()->subDays(4),
                'end_date' => Carbon::now()->subDays(1),
                'mileage_pickup' => 41200,
                'mileage_dropoff' => 41800,
                'fuel_level_pickup' => 100,
                'fuel_level_dropoff' => 100,
                'fuel_settlement' => FuelSettlement::RefilledByClient,
                'status' => BookingStatus::Completed,
                'total_cost' => 13500.00,
                'notes' => 'Self-drive city running for retail audits.',
            ]
        );

        $booking5 = Booking::updateOrCreate(
            ['booking_number' => 'BK-2026-005', 'tenant_id' => $tenant->id],
            [
                'client_id' => $clients['03223334455']->id,
                'vehicle_id' => $hilux->id,
                'driver_id' => $driver3->id,
                'pricing_mode' => PricingMode::Daily,
                'daily_driver_rate' => 9000.00,
                'daily_lunch_rate' => 600.00,
                'number_of_days' => 3,
                'start_date' => Carbon::now()->addDays(2),
                'end_date' => Carbon::now()->addDays(5),
                'mileage_pickup' => 50050,
                'fuel_level_pickup' => 100,
                'fuel_settlement' => FuelSettlement::ChargedToBill,
                'status' => BookingStatus::Pending,
                'total_cost' => 54000.00,
                'notes' => 'Northern terrain site survey trip.',
            ]
        );

        $booking6 = Booking::updateOrCreate(
            ['booking_number' => 'BK-2026-006', 'tenant_id' => $tenant->id],
            [
                'client_id' => $clients['03345556677']->id,
                'vehicle_id' => $tucson->id,
                'driver_id' => $driver6->id,
                'pricing_mode' => PricingMode::Daily,
                'daily_driver_rate' => 6000.00,
                'daily_lunch_rate' => 500.00,
                'number_of_days' => 2,
                'start_date' => Carbon::now()->subDays(7),
                'end_date' => Carbon::now()->subDays(5),
                'mileage_pickup' => 21100,
                'mileage_dropoff' => 21500,
                'fuel_level_pickup' => 100,
                'fuel_level_dropoff' => 90,
                'fuel_shortfall_fee' => 2800.00,
                'fuel_settlement' => FuelSettlement::ChargedToBill,
                'status' => BookingStatus::Completed,
                'total_cost' => 47800.00,
                'notes' => 'VIP weekend trip.',
            ]
        );

        // 7. Seed Rental Payments
        RentalPayment::updateOrCreate(
            ['booking_id' => $booking1->id, 'tenant_id' => $tenant->id],
            [
                'amount' => 27000.00,
                'method' => 'bank_transfer',
                'status' => 'paid',
                'transaction_ref' => 'MEZ-TRF-990112',
            ]
        );

        RentalPayment::updateOrCreate(
            ['booking_id' => $booking2->id, 'tenant_id' => $tenant->id],
            [
                'amount' => 50000.00,
                'method' => 'cash',
                'status' => 'paid',
                'transaction_ref' => 'CASH-ADV-0044',
            ]
        );

        RentalPayment::updateOrCreate(
            ['booking_id' => $booking3->id, 'tenant_id' => $tenant->id],
            [
                'amount' => 66500.00,
                'method' => 'bank_transfer',
                'status' => 'paid',
                'transaction_ref' => 'HBL-DIP-887711',
            ]
        );

        RentalPayment::updateOrCreate(
            ['booking_id' => $booking4->id, 'tenant_id' => $tenant->id],
            [
                'amount' => 13500.00,
                'method' => 'jazzcash',
                'status' => 'paid',
                'transaction_ref' => 'JC-TXN-664422',
            ]
        );

        RentalPayment::updateOrCreate(
            ['booking_id' => $booking6->id, 'tenant_id' => $tenant->id],
            [
                'amount' => 47800.00,
                'method' => 'easypaisa',
                'status' => 'paid',
                'transaction_ref' => 'EP-TRX-109283',
            ]
        );

        // 8. Seed at least 6 Orders in Modules\Orders\Models\Order
        $ordersList = [
            [
                'order_number' => 'ORD-2026-001',
                'customer_phone' => '03459998877',
                'customer_name' => 'Farhan Qureshi',
                'total_amount' => 54000.00,
                'status' => 'Preparing',
                'order_type' => 'WhatsApp',
                'delivery_address' => 'DHA Phase 5, Lahore',
                'type' => 'dispatch',
                'source' => 'whatsapp',
            ],
            [
                'order_number' => 'ORD-2026-002',
                'customer_phone' => '03008887766',
                'customer_name' => 'Ayesha Siddiqui',
                'total_amount' => 88000.00,
                'status' => 'Ready',
                'order_type' => 'WhatsApp',
                'delivery_address' => 'Gulberg III, Lahore',
                'type' => 'dispatch',
                'source' => 'whatsapp',
            ],
            [
                'order_number' => 'ORD-2026-003',
                'customer_phone' => '03124445566',
                'customer_name' => 'Malik Daniyal',
                'total_amount' => 66500.00,
                'status' => 'Delivered',
                'order_type' => 'WhatsApp',
                'delivery_address' => 'Sector F-7/2, Islamabad',
                'type' => 'dispatch',
                'source' => 'whatsapp',
            ],
            [
                'order_number' => 'ORD-2026-004',
                'customer_phone' => '03331112233',
                'customer_name' => 'Zubair Hassan',
                'total_amount' => 13500.00,
                'status' => 'Delivered',
                'order_type' => 'PWA',
                'delivery_address' => 'Packages Mall, Lahore',
                'type' => 'self_drive',
                'source' => 'pwa',
            ],
            [
                'order_number' => 'ORD-2026-005',
                'customer_phone' => '03223334455',
                'customer_name' => 'Saad Rehman',
                'total_amount' => 54000.00,
                'status' => 'Pending',
                'order_type' => 'WhatsApp',
                'delivery_address' => 'Clifton Block 4, Karachi',
                'type' => 'dispatch',
                'source' => 'whatsapp',
            ],
            [
                'order_number' => 'ORD-2026-006',
                'customer_phone' => '03345556677',
                'customer_name' => 'Fatima Zahra',
                'total_amount' => 47800.00,
                'status' => 'Delivered',
                'order_type' => 'PWA',
                'delivery_address' => 'Sector C, Bahria Town, Lahore',
                'type' => 'dispatch',
                'source' => 'pwa',
            ],
        ];

        foreach ($ordersList as $oData) {
            Order::updateOrCreate(
                ['order_number' => $oData['order_number'], 'tenant_id' => $tenant->id],
                $oData
            );
        }

        // 9. Seed Inbound WhatsApp / PWA Booking Requests
        BookingRequest::updateOrCreate(
            ['from_phone' => '03225556677', 'tenant_id' => $tenant->id],
            [
                'from_name' => 'Hamza Tariq',
                'message_text' => 'Hi, need a 7-seater SUV Fortuner with driver for 3 days to Islamabad starting Friday morning.',
                'source' => 'whatsapp',
                'suggested_vehicle_id' => $fortuner->id,
                'suggested_driver_id' => $driver1->id,
                'status' => RequestStatus::Matched,
            ]
        );

        BookingRequest::updateOrCreate(
            ['from_phone' => '03158877665', 'tenant_id' => $tenant->id],
            [
                'from_name' => 'Dr. Sanaullah',
                'message_text' => 'Salam, need an executive Mercedes or sedan for 2 days for guest transport from airport.',
                'source' => 'whatsapp',
                'suggested_vehicle_id' => $mercedes->id,
                'suggested_driver_id' => $driver3->id,
                'status' => RequestStatus::Matched,
            ]
        );

        BookingRequest::updateOrCreate(
            ['from_phone' => '03014433221', 'tenant_id' => $tenant->id],
            [
                'from_name' => 'Bilal Cheema',
                'message_text' => 'Interested in renting Cultus for 5 days self drive.',
                'source' => 'pwa',
                'suggested_vehicle_id' => $cultus->id,
                'suggested_driver_id' => null,
                'status' => RequestStatus::Unmatched,
            ]
        );
    }
}
