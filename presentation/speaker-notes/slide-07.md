# Slide 7: OCR — From Image to Structured Information

## SLIDE PURPOSE
Explain what OCR actually does, how AWS Textract extracts structured data with confidence scores, why OCR makes mistakes, and why OCR success does not prove authenticity.

## SAY THIS (50s)
"Let's be very clear about what Optical Character Recognition does and does not do. OCR simply answers the question: 'What characters and numbers are printed on this piece of paper?' ClaimGuard utilizes AWS Textract's AnalyzeExpense API. When a receipt arrives, Textract identifies geometric text blocks, key-value pairs, and line items — extracting the vendor name, total amount, invoice date, and 15-character GST tax identification number. Crucially, Textract provides confidence scores for each extracted field. If ink is smudged or folded, confidence drops. But here is the most critical principle in ClaimGuard: successful OCR extraction does not mean the receipt is authentic. A completely fake, fabricated invoice printed on paper will extract with 100% OCR confidence. That is why OCR is only the beginning of our pipeline."

## SIMPLE EXPLANATION
OCR is like a digital scanner that reads the words and numbers printed on a receipt and converts them into computer data. But just because a computer can read a piece of paper clearly doesn't mean that the paper is a real receipt. It only means the ink is readable.

## TECHNICAL EXPLANATION
The OCR pipeline sends S3 object references to `Textract.analyzeExpense()`. The response returns `SummaryFields` (VENDOR_NAME, TOTAL, INVOICE_RECEIPT_DATE) and `LineItemGroups`. A deterministic normalizer parses date formats into ISO 8601 (`YYYY-MM-DD`), strips currency symbols into floating-point amounts, and extracts 15-character alphanumeric GSTIN strings via regular expressions.

## WHY IT MATTERS
Treating OCR as a complete verification solution is a dangerous industry pitfall. By decoupling text extraction from document authenticity, ClaimGuard avoids false confidence.

## IMPORTANT CAVEAT
OCR algorithms struggle with thermal paper fading, heavy perspective skew, and poor camera lighting. In ClaimGuard, any field extraction with confidence below 70% triggers an `OCR_LOW_CONFIDENCE` flag and routes the claim to the employee for verification.

## TRANSITION
"If OCR only reads the text, how do we know if the claim is valid or fraudulent? That brings us to our deterministic validation and fraud signals."
