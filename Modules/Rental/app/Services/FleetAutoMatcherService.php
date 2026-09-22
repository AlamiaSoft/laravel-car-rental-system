<?php

namespace Modules\Rental\Services;

use App\Enums\DriverStatus;
use App\Enums\RequestStatus;
use App\Enums\VehicleStatus;
use Modules\Rental\Models\BookingRequest;
use Modules\Rental\Models\Client;
use Modules\Rental\Models\Driver;
use Modules\Rental\Models\Vehicle;

class FleetAutoMatcherService
{
    public function __construct(
        protected BookingLifecycleService $lifecycleService
    ) {}

    /**
     * Find the first free vehicle and driver for auto-dispatch.
     */
    public function matchFirstAvailable(): array
    {
        $vehicle = Vehicle::where('status', VehicleStatus::Available)
            ->orderBy('id', 'asc')
            ->first();

        $driver = Driver::where('status', DriverStatus::Available)
            ->orderBy('id', 'asc')
            ->first();

        return [
            'vehicle' => $vehicle,
            'driver' => $driver,
        ];
    }

    /**
     * Ingest an inbound inquiry (e.g. from WhatsApp or simulator) and suggest allocation.
     */
    public function ingestInbound(
        string $fromPhone,
        string $messageText,
        ?string $fromName = null,
        string $source = 'whatsapp'
    ): BookingRequest {
        $match = $this->matchFirstAvailable();

        $hasVehicle = $match['vehicle'] !== null;
        $status = $hasVehicle ? RequestStatus::Matched : RequestStatus::Unmatched;

        return BookingRequest::create([
            'source' => $source,
            'from_phone' => $fromPhone,
            'from_name' => $fromName,
            'message_text' => $messageText,
            'suggested_vehicle_id' => $match['vehicle']?->id,
            'suggested_driver_id' => $match['driver']?->id,
            'status' => $status,
        ]);
    }

    /**
     * Re-run auto-matching on a pending request.
     */
    public function rematch(BookingRequest $request): BookingRequest
    {
        if ($request->status === RequestStatus::Converted || $request->status === RequestStatus::Rejected) {
            throw new \DomainException('Cannot rematch an already closed request.');
        }

        $match = $this->matchFirstAvailable();

        $request->update([
            'suggested_vehicle_id' => $match['vehicle']?->id,
            'suggested_driver_id' => $match['driver']?->id,
            'status' => $match['vehicle'] ? RequestStatus::Matched : RequestStatus::Unmatched,
        ]);

        return $request->fresh(['suggestedVehicle', 'suggestedDriver']);
    }

    /**
     * 1-Click convert: upsert client and generate booking with reserved vehicle & driver.
     */
    public function convert(BookingRequest $request, array $params): array
    {
        if ($request->status === RequestStatus::Converted) {
            throw new \DomainException('This request has already been converted.');
        }
        if ($request->status === RequestStatus::Rejected) {
            throw new \DomainException('This request was previously rejected.');
        }

        // Upsert Client by verified phone number within the tenant context
        $client = Client::firstOrCreate(
            ['phone' => $request->from_phone],
            ['name' => $params['client_name'] ?? $request->from_name ?? 'WhatsApp Customer']
        );

        if (! empty($params['client_name']) && $client->name !== $params['client_name']) {
            $client->update(['name' => $params['client_name']]);
        }

        $bookingData = array_merge($params, [
            'client_id' => $client->id,
            'vehicle_id' => $params['vehicle_id'] ?? $request->suggested_vehicle_id,
            'driver_id' => $params['driver_id'] ?? $request->suggested_driver_id,
            'start_date' => $params['start_date'] ?? now(),
        ]);

        $booking = $this->lifecycleService->create($bookingData);

        $request->update([
            'status' => RequestStatus::Converted,
            'booking_id' => $booking->id,
        ]);

        return [
            'request' => $request->fresh(),
            'booking' => $booking,
        ];
    }

    /**
     * Reject request.
     */
    public function reject(BookingRequest $request): BookingRequest
    {
        if ($request->status === RequestStatus::Converted) {
            throw new \DomainException('Cannot reject an already converted request.');
        }

        $request->update(['status' => RequestStatus::Rejected]);

        return $request->fresh();
    }
}
