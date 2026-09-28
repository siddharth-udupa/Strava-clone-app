import type { MbtilesDb } from "@repo/tiles"
import { ZodError } from "@repo/validation"
import cpeak, { cors, type Cpeak } from "cpeak"
import { systemRoutes } from "./routes/system.js"
import { tileRoutes } from "./routes/tiles.js"

type ServerOptions = {
  db: MbtilesDb
}

/**
 * Cpeak's convention for an HTTP failure is a `status` on the thrown value —
 * `throw { status: 404, message: "..." }` — so that is what a route can rely
 * on. Anything thrown as a plain `Error` has no status and is unexpected.
 */
function statusOf(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined
  const { status } = error as { status?: unknown }
  return typeof status === "number" ? status : undefined
}

function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === "object" && error !== null) {
    const { message } = error as { message?: unknown }
    if (typeof message === "string") return message
  }
  return "Unknown error"
}

/**
 * Assembles the HTTP layer around an open tileset.
 *
 * Cpeak has no plugin system, so route modules are plain functions that
 * register themselves on the app passed in. Cpeak types a route's handler as a
 * union of function types, which leaves an inline arrow untyped, so those
 * modules annotate their handlers as `Handler`.
 */
export function buildServer({ db }: ServerOptions): Cpeak {
  const app = cpeak()

  app.beforeEach(cors())

  app.handleErr((error, _request, response) => {
    // Cpeak drops the socket before calling us once bytes are out, so there is
    // no response left to write to.
    if (response.headersSent) return

    if (error instanceof ZodError) {
      return response
        .status(400)
        .json({ error: "Invalid tile coordinate", issues: error.issues })
    }

    console.error(error)

    const status = statusOf(error)
    if (status !== undefined && status < 500) {
      return response.status(status).json({ error: messageOf(error) })
    }
    return response.status(500).json({ error: "Internal server error" })
  })

  tileRoutes(app, { db })
  systemRoutes(app, { db })

  return app
}
