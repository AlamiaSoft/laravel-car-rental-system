<?php

namespace Modules\Bot\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CustomerPwaTokenService
{
    /**
     * Generate a short URL-safe opaque token valid for 15 minutes.
     */
    public static function generateToken(int $customerId, string $tenantId): string
    {
        $token = Str::random(16);

        $payload = [
            'customer_id' => $customerId,
            'tenant_id' => $tenantId,
            'expires_at' => now()->addMinutes(15)->timestamp,
        ];

        Cache::put("pwa_token_{$token}", $payload, now()->addMinutes(15));

        return $token;
    }

    /**
     * Validate and consume an opaque token.
     * Returns the decrypted payload array or null if invalid/expired.
     */
    public static function validateToken(string $token): ?array
    {
        try {
            if (empty($token)) {
                return null;
            }

            // 1. Check Cache for short token
            $cachedPayload = Cache::get("pwa_token_{$token}");
            if ($cachedPayload && is_array($cachedPayload)) {
                if (isset($cachedPayload['expires_at']) && $cachedPayload['expires_at'] >= now()->timestamp) {
                    return $cachedPayload;
                }
            }

            // 2. Fallback: try hex/encrypted payload for legacy long tokens
            $binaryData = @hex2bin($token);
            if ($binaryData !== false) {
                $decrypted = Crypt::decrypt($binaryData);
                $payload = json_decode($decrypted, true);

                if (is_array($payload) && isset($payload['expires_at']) && $payload['expires_at'] >= now()->timestamp) {
                    return $payload;
                }
            }

            return null;
        } catch (\Exception $e) {
            Log::warning('PWA Token Validation Error: '.$e->getMessage());

            return null;
        }
    }
}
