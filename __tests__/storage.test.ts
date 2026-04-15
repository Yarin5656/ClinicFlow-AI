import { describe, it, expect, afterEach } from "vitest"
import path from "path"
import fs from "fs/promises"
import { LocalStorageProvider } from "@/lib/storage/LocalStorageProvider"

const TEST_STORAGE = path.join(process.cwd(), "storage-test")

describe("LocalStorageProvider", () => {
  afterEach(async () => {
    await fs.rm(TEST_STORAGE, { recursive: true, force: true })
  })

  it("uploads a file and returns a storagePath", async () => {
    const provider = new LocalStorageProvider(TEST_STORAGE)
    const buffer = Buffer.from("hello world")
    const storagePath = await provider.upload(buffer, "test.txt", "text/plain", "user-123")
    expect(storagePath).toContain("user-123")
    expect(storagePath).toMatch(/\.txt$/)
  })

  it("stored file is readable at the returned path", async () => {
    const provider = new LocalStorageProvider(TEST_STORAGE)
    const content = "file content here"
    const buffer = Buffer.from(content)
    const storagePath = await provider.upload(buffer, "doc.txt", "text/plain", "user-abc")
    const fullPath = provider.getFullPath(storagePath)
    const readBack = await fs.readFile(fullPath, "utf-8")
    expect(readBack).toBe(content)
  })

  it("deletes a file successfully", async () => {
    const provider = new LocalStorageProvider(TEST_STORAGE)
    const buffer = Buffer.from("to be deleted")
    const storagePath = await provider.upload(buffer, "delete-me.txt", "text/plain", "user-del")
    await provider.delete(storagePath)
    const fullPath = provider.getFullPath(storagePath)
    await expect(fs.access(fullPath)).rejects.toThrow()
  })

  it("delete is a no-op for non-existent file", async () => {
    const provider = new LocalStorageProvider(TEST_STORAGE)
    await expect(provider.delete("nonexistent/path.txt")).resolves.toBeUndefined()
  })
})
