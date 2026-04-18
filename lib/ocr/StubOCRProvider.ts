import type { OCRProvider, OCRResult } from "./OCRProvider"

/**
 * No-op OCR provider used during MVP. Always returns null fields —
 * the UI falls back to a manual extraction form. Keeps the surface
 * ready for a real provider (Google Vision / Textract / Tesseract.js).
 */
export class StubOCRProvider implements OCRProvider {
  async extract(
    _buffer: Buffer,
    _mimeType: string,
    _docType?: string | null
  ): Promise<OCRResult> {
    return { rawText: null, fields: null }
  }
}
