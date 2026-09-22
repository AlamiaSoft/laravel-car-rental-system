<?php

namespace Modules\Menu\Services\Import;

use Illuminate\Http\UploadedFile;

class MenuImportPipeline
{
    public function __construct(
        protected CsvParser $csvParser,
        protected PdfTextParser $pdfParser,
        protected LlmNormalizer $llmNormalizer
    ) {}

    public function process(UploadedFile $file): array
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $filePath = $file->getRealPath();

        if (in_array($extension, ['csv', 'xls', 'xlsx'])) {
            // Deterministic path
            $normalizedData = $this->csvParser->parse($filePath);
        } elseif ($extension === 'pdf') {
            // AI Assisted path
            $parsed = $this->pdfParser->parse($filePath);

            if (empty(trim($parsed['raw_text']))) {
                throw new \Exception('Could not extract any selectable text from this PDF. Scanned images are not currently supported.');
            }

            $normalizedData = $this->llmNormalizer->normalize($parsed['raw_text']);
        } else {
            throw new \Exception("Unsupported file type: {$extension}. Please upload a CSV, Excel, or text-based PDF file.");
        }

        return $this->detectDuplicates($normalizedData);
    }

    protected function detectDuplicates(array $normalizedData): array
    {
        // For Phase 1, we will just pass this through and assume all are 'new'.
        // To implement full duplicate detection, we would query the database here
        // matching by item name and setting 'duplicate_status' to 'exact_match'.
        return $normalizedData;
    }
}
