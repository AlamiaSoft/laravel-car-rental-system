<?php

namespace Modules\Rental\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PexelsPhotoService
{
    /**
     * Verified Pexels curated stock catalog for common car rental body styles.
     * Used when API key is not yet configured or as an instant offline/fallback registry.
     */
    protected array $curatedCatalog = [
        'suv' => [
            'pexels_id' => 707046,
            'image_url' => 'https://images.pexels.com/photos/707046/pexels-photo-707046.jpeg?auto=compress&cs=tinysrgb&w=800',
            'photographer' => 'Vlad Alexandru Popa',
            'photographer_url' => 'https://www.pexels.com/@vlad-alexandru-popa-1402852',
            'pexels_url' => 'https://www.pexels.com/photo/707046/',
        ],
        'sedan' => [
            'pexels_id' => 112460,
            'image_url' => 'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&cs=tinysrgb&w=800',
            'photographer' => 'Mike Bird',
            'photographer_url' => 'https://www.pexels.com/@mikebirdy',
            'pexels_url' => 'https://www.pexels.com/photo/112460/',
        ],
        'hatchback' => [
            'pexels_id' => 210019,
            'image_url' => 'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=800',
            'photographer' => 'Pixabay',
            'photographer_url' => 'https://www.pexels.com/@pixabay',
            'pexels_url' => 'https://www.pexels.com/photo/210019/',
        ],
        'pickup' => [
            'pexels_id' => 1592384,
            'image_url' => 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800',
            'photographer' => 'Trace Hudson',
            'photographer_url' => 'https://www.pexels.com/@trace',
            'pexels_url' => 'https://www.pexels.com/photo/1592384/',
        ],
        'executive' => [
            'pexels_id' => 170811,
            'image_url' => 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800',
            'photographer' => 'Mike Bird',
            'photographer_url' => 'https://www.pexels.com/@mikebirdy',
            'pexels_url' => 'https://www.pexels.com/photo/170811/',
        ],
        'default' => [
            'pexels_id' => 1149137,
            'image_url' => 'https://images.pexels.com/photos/1149137/pexels-photo-1149137.jpeg?auto=compress&cs=tinysrgb&w=800',
            'photographer' => 'Svandis',
            'photographer_url' => 'https://www.pexels.com/@svandis',
            'pexels_url' => 'https://www.pexels.com/photo/1149137/',
        ],
    ];

    /**
     * Search official Pexels API for a specific vehicle subject.
     */
    public function search(string $query, int $perPage = 1): ?array
    {
        $apiKey = config('services.pexels.key') ?: env('PEXELS_API_KEY');

        if (! $apiKey) {
            return null;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $apiKey,
            ])
                ->timeout(5)
                ->get('https://api.pexels.com/v1/search', [
                    'query' => $query,
                    'per_page' => $perPage,
                    'orientation' => 'landscape',
                ]);

            if ($response->successful()) {
                $photos = $response->json('photos', []);
                if (! empty($photos)) {
                    $photo = $photos[0];

                    return [
                        'image_url' => $photo['src']['medium'] ?? ($photo['src']['large'] ?? $photo['src']['original']),
                        'photo_metadata' => [
                            'pexels_id' => $photo['id'],
                            'photographer' => $photo['photographer'] ?? 'Pexels Contributor',
                            'photographer_url' => $photo['photographer_url'] ?? 'https://www.pexels.com',
                            'pexels_url' => $photo['url'] ?? "https://www.pexels.com/photo/{$photo['id']}/",
                        ],
                    ];
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Pexels API error: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Resolve a high-quality Pexels CDN image with photographer attribution for a vehicle model.
     */
    public function resolveForVehicleModel(string $model): array
    {
        // 1. If API key exists, attempt official Pexels API search first
        $apiResult = $this->search($model . ' car');
        if ($apiResult) {
            return $apiResult;
        }

        // 2. Curated intelligent match based on model keywords
        $lower = strtolower($model);

        if (str_contains($lower, 'fortuner') || str_contains($lower, 'prado') || str_contains($lower, 'suv') || str_contains($lower, 'tucson') || str_contains($lower, 'sportage') || str_contains($lower, 'cruiser')) {
            $item = $this->curatedCatalog['suv'];
        } elseif (str_contains($lower, 'revo') || str_contains($lower, 'hilux') || str_contains($lower, 'd-max') || str_contains($lower, 'truck') || str_contains($lower, 'pickup')) {
            $item = $this->curatedCatalog['pickup'];
        } elseif (str_contains($lower, 'cultus') || str_contains($lower, 'swift') || str_contains($lower, 'hatchback') || str_contains($lower, 'vitz') || str_contains($lower, 'wagon') || str_contains($lower, 'alto')) {
            $item = $this->curatedCatalog['hatchback'];
        } elseif (str_contains($lower, 'mercedes') || str_contains($lower, 'audi') || str_contains($lower, 'bmw') || str_contains($lower, 'lexus') || str_contains($lower, 'executive')) {
            $item = $this->curatedCatalog['executive'];
        } elseif (str_contains($lower, 'civic') || str_contains($lower, 'corolla') || str_contains($lower, 'altis') || str_contains($lower, 'city') || str_contains($lower, 'yaris') || str_contains($lower, 'sedan')) {
            $item = $this->curatedCatalog['sedan'];
        } else {
            $item = $this->curatedCatalog['default'];
        }

        return [
            'image_url' => $item['image_url'],
            'photo_metadata' => [
                'pexels_id' => $item['pexels_id'],
                'photographer' => $item['photographer'],
                'photographer_url' => $item['photographer_url'],
                'pexels_url' => $item['pexels_url'],
            ],
        ];
    }
}
