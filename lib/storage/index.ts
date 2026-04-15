import type { StorageProvider } from "./StorageProvider"
import { LocalStorageProvider } from "./LocalStorageProvider"

export type { StorageProvider }

export function getStorageProvider(): LocalStorageProvider {
  return new LocalStorageProvider()
}
