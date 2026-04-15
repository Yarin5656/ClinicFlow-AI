export interface StorageProvider {
  upload(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    userId: string
  ): Promise<string>
  delete(storagePath: string): Promise<void>
}
