Your intuition is partly correct, but I'd change the architecture significantly.

The biggest mistake most teams make is treating this as an "AI feature." It isn't.

It's a **document ingestion pipeline** with AI used only where deterministic parsing fails.

---

# Recommended Import Pipeline

```
             Upload
                │
      Detect file type
                │
     ┌──────────┴──────────┐
     │                     │
 Structured          Unstructured
(CSV/XLSX)        (Image/PDF)
     │                     │
Deterministic        OCR Extraction
     │                     │
     └──────────┬──────────┘
                │
     Normalize to Common JSON
                │
     AI Cleanup & Classification
                │
        Human Review Screen
                │
          Import Database
```

The AI should never be responsible for reading an entire document if a deterministic parser can do the job.

---

# Supported Formats

I would support much more than your current list.

| Format        | Parser                        |
| ------------- | ----------------------------- |
| CSV           | Native parser / Laravel Excel |
| XLSX          | Laravel Excel                 |
| XLS           | Laravel Excel                 |
| PDF (text)    | PDF text extraction           |
| PDF (scanned) | OCR                           |
| JPG           | OCR                           |
| PNG           | OCR                           |
| WEBP          | OCR                           |
| HEIC          | OCR                           |

Restaurants will upload literally anything.

---

# OCR vs AI

Instead of sending every menu to Gemini Vision, split the process.

## CSV / Excel

No AI.

Just parse.

99% accurate.

---

## Digital PDFs

Many PDFs already contain selectable text.

Example:

```
Pizza

Chicken Supreme...........899
Pepperoni................799
```

No OCR needed.

Extract text directly.

Much faster.

---

## Images / Scanned PDFs

Use OCR.

Examples:

* Google Vision OCR
* Tesseract
* Azure OCR
* AWS Textract
* PaddleOCR

OCR gives:

```
BURGERS

Zinger Burger      650

Cheese Burger      720

Fries              300
```

Now AI becomes useful.

---

# Where AI Actually Helps

AI should receive OCR output—not the original image.

Example:

OCR:

```
Burgers

Zinger Burger 650

Cheese Burger 720

Pizza

Fajita Large 1490

Chicken Tikka Large 1590
```

Prompt:

```
Convert this restaurant menu into JSON.

Return only JSON.

Detect:

- categories
- products
- descriptions
- prices
- deals
- variants

Ignore decorations.

Fix OCR mistakes.

Output:

{
 categories:[]
}
```

Now Gemini only performs:

* cleanup

* classification

* typo correction

* grouping

instead of expensive vision inference.

---

# Vision AI Still Has Value

Sometimes OCR completely fails.

Example:

Fancy menu:

```
🍕
Pepperoni

Rs 1490

(image overlays)

Handwritten fonts

Background textures
```

OCR:

```
Pepperonl
149O
```

Vision AI handles these much better.

Therefore:

```
if OCR confidence > threshold

    use OCR + LLM

else

    Vision AI
```

---

# Add Confidence Score

Every extracted item should have confidence.

Example

```
Chicken Burger

Price: 650

Confidence:

Name 98%

Price 99%

Category 91%
```

Low confidence rows get highlighted.

Restaurant owner quickly fixes them.

---

# Do NOT Save Immediately

Never.

Always show preview.

```
✓ Burgers

✓ Pizza

✓ Drinks

✓ Deals
```

Each expandable.

```
Category

Item

Description

Price

Image

Tax

Available

Delete

Edit
```

---

# Detect Duplicate Imports

Many restaurants will import twice.

Example:

```
Chicken Burger

650
```

already exists.

Ask:

```
Duplicate found

○ Skip

○ Update Existing

○ Keep Both
```

---

# Smart Category Matching

Restaurant already has:

```
Pizza
```

AI extracts

```
Pizzas
```

Suggest

```
Match to existing category?

Pizza ✓
```

instead of creating duplicates.

---

# Deals Are Different

I would **not** store deals as products.

Eventually you'll want:

```
Family Deal

includes

2 Pizza

1 Drink

2 Fries
```

A dedicated Deal model is much more future-proof.

Something like:

```
Deal

id

name

price

description
```

then

```
DealItems

deal_id

product_id

quantity
```

Later this enables:

* Combo Builder

* Meal Deals

* Upselling

* Inventory deduction

* Analytics

without hacks.

---

# AI Should Generate Descriptions

Many menus only say

```
Chicken Supreme
```

AI can generate

```
Chicken Supreme Pizza topped with mozzarella, olives and grilled chicken.
```

Owner approves or edits.

Nice enhancement.

---

# Auto Image Search (Optional)

Later:

Restaurant imports

```
Chicken Burger
```

AI suggests a stock image.

Owner chooses one.

Very useful for WhatsApp menus.

---

# Menu Versioning

Keep imports.

```
Version 1

Imported

June
```

```
Version 2

Imported

August
```

Rollback possible.

---

# Import Report

After import:

```
58 products

9 categories

6 deals

2 duplicate products

4 warnings

Time

17 sec
```

---

# Suggested Service Architecture

```
MenuImportController

↓

MenuImportPipeline

↓

FileDetector

↓

CsvParser

↓

ExcelParser

↓

PdfParser

↓

OCRService

↓

LLMNormalizer

↓

DuplicateDetector

↓

PreviewGenerator

↓

ImportService
```

Each parser simply outputs the same normalized schema, making the rest of the pipeline format-agnostic.

---

# Normalized Schema

Everything should convert into one internal structure before review:

```json
{
  "categories": [
    {
      "name": "Pizza",
      "items": [
        {
          "name": "Chicken Supreme",
          "description": "",
          "price": 1490,
          "currency": "PKR",
          "variants": [],
          "modifiers": [],
          "confidence": 0.98
        }
      ]
    }
  ],
  "deals": [],
  "warnings": [],
  "metadata": {
    "source": "image",
    "ocr_confidence": 0.94
  }
}
```

Every importer (CSV, Excel, PDF, OCR, Vision AI) should produce this exact schema, so everything after parsing—preview, validation, duplicate detection, and import—uses a single code path.

## Technology recommendations

For your Laravel stack, I'd lean toward this combination:

* **CSV/XLS/XLSX:** `maatwebsite/excel`
* **Text-based PDFs:** a PHP PDF text extractor (avoids OCR when possible)
* **OCR:** PaddleOCR (a free self-hosted option)
* **LLM:** Google Gemini Flash or lightweight/cheap model for normalization, typo correction, category inference, and generating missing descriptions

This approach minimizes AI cost while keeping quality high. Most imports will never require expensive vision inference, and the AI is used where it adds the most value: interpreting imperfect OCR output, not replacing deterministic parsing.
