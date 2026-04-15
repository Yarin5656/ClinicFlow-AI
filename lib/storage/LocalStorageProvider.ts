import path from "path"
import fs from "fs/promises"
import { randomUUID } from "crypto"
import type { StorageProvider } from "./StorageProvider"

export class LocalStorageProvider implements StorageProvider {
  private baseDir: string

  constructor(baseDir?: string) {
    this.baseDir = baseDir ?? path.join(process.cwd(), "storage")
  }

  async upload(
    buffer: Buffer,
    filename: string,
    _mimeType: string,
    userId: string
  ): Promise<string> {
    const userDir = path.join(this.baseDir, userId)
    await fs.mkdir(userDir, { recursive: true })

    const ext = path.extname(filename)
    const storedName = `${Date.now()}-${randomUUID()}${ext}`
    const storagePath = path.join(userId, storedName)
    const fullPath = path.join(this.baseDir, storagePath)

    await fs.writeFile(fullPath, buffer)
    return storagePath
  }

  async delete(storagePath: string): Promise<void> {
    const fullPath = path.join(this.baseDir, storagePath)
    await fs.unlink(fullPath).catch(() => {})
  }

  getFullPath(storagePath: string): string {
    return path.join(this.baseDir, storagePath)
  }
}
