<?php

namespace Modules\Menu\Services\Import;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LlmNormalizer
{
    public function normalize(string $rawText): array
    {
        $apiKey = config('services.gemini.key', env('GEMINI_API_KEY'));

        if (! $apiKey) {
            Log::warning('GEMINI_API_KEY is missing. Mocking LLM normalization.');

            return $this->mockResponse();
        }

        $prompt = <<<TEXT
Convert this restaurant menu text into a strict JSON object.
Return ONLY valid JSON without any markdown formatting like ```json.

Schema:
{
  "categories": [
    {
      "name": "Category Name",
      "items": [
        {
          "name": "Item Name",
          "description": "Item Description (generate if missing but obvious, else empty)",
          "price": 100,
          "currency": "PKR",
          "variants": [],
          "modifiers": [],
          "confidence": 0.95,
          "duplicate_status": "new"
        }
      ]
    }
  ],
  "deals": [],
  "warnings": [],
  "metadata": {
    "source": "pdf",
    "ai_used": true
  }
}

Rules:
- Try to fix obvious typos.
- Group items into logical categories if categories are missing.
- Keep the confidence score between 0.0 and 1.0 based on how clear the text was.
- If something looks like a deal or combo, put it in the "deals" array.

Menu Text:
$rawText
TEXT;

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                        ],
                    ],
                ],
                'generationConfig' => [
                    'temperature' => 0.1,
                    'responseMimeType' => 'application/json',
                ],
            ]);

            if ($response->successful()) {
                $content = $response->json('candidates.0.content.parts.0.text');
                $decoded = json_decode($content, true);

                if (json_last_error() === JSON_ERROR_NONE) {
                    return $decoded;
                }
            }

            Log::error('LLM Normalization Failed: Invalid JSON or API Error', ['response' => $response->body()]);
        } catch (\Exception $e) {
            Log::error('LLM Normalization Exception', ['error' => $e->getMessage()]);
        }

        return $this->mockResponse();
    }

    protected function mockResponse(): array
    {
        return [
            'categories' => [
                [
                    'name' => 'Imported Items',
                    'items' => [
                        [
                            'name' => 'Sample Item (AI Failed)',
                            'description' => 'The AI failed or key is missing. This is a fallback.',
                            'price' => 100,
                            'currency' => 'PKR',
                            'variants' => [],
                            'modifiers' => [],
                            'confidence' => 0.5,
                            'duplicate_status' => 'new',
                        ],
                    ],
                ],
            ],
            'deals' => [],
            'warnings' => [
                ['type' => 'ai_error', 'message' => 'AI Processing failed or API key missing.'],
            ],
            'metadata' => [
                'source' => 'pdf',
                'ai_used' => false,
            ],
        ];
    }
}
