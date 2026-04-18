import type { OCRProvider } from "./OCRProvider"
import { StubOCRProvider } from "./StubOCRProvider"

export type { OCRProvider, OCRResult } from "./OCRProvider"

/**
 * Returns the active OCR provider. Switch based on env var in the future:
 *   const kind = process.env.OCR_PROVIDER
 *   if (kind === "google") return new GoogleVisionOCR()
 *   if (kind === "tesseract") return new TesseractOCR()
 */
export function getOCRProvider(): OCRProvider {
  return new StubOCRProvider()
}
