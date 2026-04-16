import path from "path"
import fs from "fs/promises"
import type { WorkflowDefinition } from "@/types"

let cached: WorkflowDefinition[] | null = null

/**
 * Loads workflow JSON definitions from the /workflows directory at project root.
 * Results are cached per process (cleared on server restart).
 *
 * @param opts.forceReload — skip cache and re-read from disk (used by tests/seed)
 */
export async function loadWorkflows(opts?: { forceReload?: boolean }): Promise<WorkflowDefinition[]> {
  if (cached && !opts?.forceReload) return cached

  const workflowsDir = path.join(process.cwd(), "workflows")
  const entries = await fs.readdir(workflowsDir)
  const jsonFiles = entries.filter((f) => f.endsWith(".json"))

  const defs = await Promise.all(
    jsonFiles.map(async (filename) => {
      const fullPath = path.join(workflowsDir, filename)
      const contents = await fs.readFile(fullPath, "utf-8")
      return JSON.parse(contents) as WorkflowDefinition
    })
  )

  cached = defs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  return cached
}

/** Test helper — clear the workflow cache between runs. */
export function _resetWorkflowCache() {
  cached = null
}
