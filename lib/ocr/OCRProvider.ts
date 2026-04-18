/**
 * OCR provider interface. Swap implementations without touching callers.
 *
 * MVP: StubOCRProvider returns null — the UI falls back to manual entry.
 * Future: GoogleVisionOCR, AWSTextractOCR, or local Tesseract.js.
 */
export interface OCRResult {
  /** Raw text extracted from the document (or null if not available). */
  rawText: string | null
  /** Best-effort structured fields, keyed by doc type (or null). */
  fields: Record<string, string | number | null> | null
  /** Confidence 0–1 if provider reports it. */
  confidence?: number
}

export interface OCRProvider {
  /**
   * Extract text and known fields from a document.
   * @param buffer  File contents
   * @param mimeType MIME type (provider may reject non-image/non-PDF)
   * @param docType Optional hint for field extraction (e.g. "rental-contract")
   */
  extract(
    buffer: Buffer,
    mimeType: string,
    docType?: string | null
  ): Promise<OCRResult>
}
