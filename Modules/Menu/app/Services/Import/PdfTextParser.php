<?php

namespace Modules\Menu\Services\Import;

use Smalot\PdfParser\Parser;

class PdfTextParser
{
    public function parse(string $filePath): array
    {
        $parser = new Parser;
        $pdf = $parser->parseFile($filePath);
        $text = $pdf->getText();

        return [
            'raw_text' => $text,
            'source' => 'pdf',
        ];
    }
}
