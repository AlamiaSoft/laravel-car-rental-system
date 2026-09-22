<?php

namespace Modules\Menu\Services\Import;

use Maatwebsite\Excel\Concerns\ToArray;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Facades\Excel;

class CsvParser
{
    public function parse(string $filePath): array
    {
        // We'll read the first sheet/file and skip empty rows.
        $data = Excel::toArray(new class implements ToArray, WithHeadingRow
        {
            public function array(array $array) {}
        }, $filePath)[0] ?? [];

        return $this->normalize($data);
    }

    protected function normalize(array $rows): array
    {
        $categories = [];
        $deals = [];
        $warnings = [];

        foreach ($rows as $index => $row) {
            $categoryName = trim($row['category'] ?? 'Uncategorized');
            $itemName = trim($row['item_name'] ?? '');

            if (empty($itemName)) {
                $warnings[] = ['type' => 'missing_name', 'message' => 'Row '.($index + 2).' is missing an item name.'];

                continue;
            }

            $price = (float) ($row['price'] ?? 0);
            $description = trim($row['description'] ?? '');
            $isDeal = strtolower(trim($row['is_deal'] ?? 'no')) === 'yes';
            $dealItemsRaw = trim($row['deal_items'] ?? '');

            if ($isDeal) {
                // If it's a deal, we will put it in the "deals" array for now
                $deals[] = [
                    'name' => $itemName,
                    'description' => $description,
                    'price' => $price,
                    'deal_items_raw' => $dealItemsRaw,
                    'confidence' => 1.0,
                    'duplicate_status' => 'new',
                ];

                continue;
            }

            if (! isset($categories[$categoryName])) {
                $categories[$categoryName] = [
                    'name' => $categoryName,
                    'items' => [],
                ];
            }

            $categories[$categoryName]['items'][] = [
                'name' => $itemName,
                'description' => $description,
                'price' => $price,
                'currency' => 'PKR',
                'variants' => [],
                'modifiers' => [],
                'confidence' => 1.0,
                'duplicate_status' => 'new',
            ];
        }

        return [
            'categories' => array_values($categories),
            'deals' => $deals,
            'warnings' => $warnings,
            'metadata' => [
                'source' => 'csv/excel',
                'ai_used' => false,
            ],
        ];
    }
}
