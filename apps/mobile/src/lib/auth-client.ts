import { createAuthClient } from "better-auth/react"
import { expoClient } from "@better-auth/expo/client"
import * as SecureStore from "expo-secure-store"
import { AppState } from "react-native"

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL!,
  sessionOptions: {
    // Foregrounding is a frequent event (app switch, screen lock, biometric
    // prompt) and must not translate into a request per foreground. We drive
    // revalidation ourselves below, gated on staleness.
    refetchOnWindowFocus: false,
    // No polling. The staleness gate handles it without burning battery.
    refetchInterval: 0,
    refetchWhenOffline: false,
  },
  plugins: [
    // @ts-expect-error — known type mismatch between better-auth and @better-auth/expo generics
    expoClient({
      scheme: "mobile",
      storagePrefix: "strava-clone",
      storage: SecureStore,
    }),
  ],
})

export const { signIn, signUp, signOut, useSession } = authClient

/**
 * Revalidate the session on foreground only if the last check is older than
 * this. Kept in step with `session.cookieCache.maxAge` on the server
 * (apps/web/lib/auth.ts) so that we never outrun the server's own cache:
 * a refetch inside that window would read the same cached data anyway, and
 * skipping it avoids the request entirely.
 */
const REVALIDATION_INTERVAL_MS = 5 * 60 * 1000

type SessionAtomValue = {
  data: unknown
  error: unknown
  isPending: boolean
  isRefetching: boolean
  refetch: (queryParams?: unknown) => Promise<void>
}

const sessionAtom = authClient.$store.atoms.session as unknown as {
  get: () => SessionAtomValue
  subscribe: (listener: (value: SessionAtomValue) => void) => () => void
}

/** Timestamp of the last session check that reached the server successfully. */
let lastVerifiedAt = 0

// A fetch is in flight across an isRefetching true -> false transition, so use
// that edge to record verification. Failed checks deliberately do not count:
// a transient network error should not suppress the next revalidation.
let wasRefetching = false
sessionAtom.subscribe((value) => {
  if (value.isRefetching) {
    wasRefetching = true
    return
  }
  if (!wasRefetching) return
  wasRefetching = false
  if (!value.error) lastVerifiedAt = Date.now()
})

AppState.addEventListener("change", (state) => {
  if (state !== "active") return
  if (Date.now() - lastVerifiedAt < REVALIDATION_INTERVAL_MS) return

  const { isRefetching, data, refetch } = sessionAtom.get()
  // A settled null session means there is nothing to revalidate, and an
  // in-flight check already covers this foreground.
  if (isRefetching || data == null) return

  // lastVerifiedAt is advanced by the subscription above once the request
  // settles, and only on success. Bumping it here would let a failed check
  // suppress the next revalidation.
  refetch()
})

export type User = typeof authClient.$Infer.Session.user
export type Session = typeof authClient.$Infer.Session
