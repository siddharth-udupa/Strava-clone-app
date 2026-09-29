import AsyncStorage from "@react-native-async-storage/async-storage"
import { useEffect, useSyncExternalStore } from "react"
import type { PreferencesType } from "@repo/types"
import { authClient, useSession } from "@/lib/auth-client"

const API_URL = process.env.EXPO_PUBLIC_API_URL!

const STORAGE_KEY_PREFIX = "@strava_clone_preferences_v1:"

// How long the on-device copy is trusted before we quietly re-sync.
const RESYNC_INTERVAL_MS = 5 * 60 * 1000

/**
 * Mirrors the column defaults in `@repo/db` `userPreferences`. Used only as a
 * render-time fallback before a real row exists - it is never persisted, so
 * the server remains the source of truth for actual values.
 */
export const DEFAULT_PREFERENCES: PreferencesType = {
  userId: "",
  onBoarded: false,
  theme: "system",
  distanceUnit: "metric",
  elevationUnit: "meters",
  paceUnit: "min/km",
  speedUnit: "km/h",
  weightUnit: "kg",
  timeFormat: "24h",
  updatedAt: null,
}

export type PreferencesStatus = "idle" | "loading" | "ready"

export type PreferencesState = {
  status: PreferencesStatus
  userId: string | null
  preferences: PreferencesType | null
}

let state: PreferencesState = { status: "idle", userId: null, preferences: null }

const listeners = new Set<() => void>()

function setState(next: PreferencesState) {
  // Guard on value equality so no-op updates (a sign-out that was already
  // signed out, a re-render with the same row) don't churn subscribers.
  if (
    state.status === next.status &&
    state.userId === next.userId &&
    state.preferences === next.preferences
  ) {
    return
  }
  state = next
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => state

function storageKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}${userId}`
}

/**
 * Round-trip a preferences row through JSON. `updatedAt` is a `Date` on the
 * type but a string once serialized, so it is restored here to keep the shape
 * honest for anything that reads it off the store.
 */
function normalize(raw: unknown): PreferencesType | null {
  if (!raw || typeof raw !== "object") return null
  const prefs = raw as Partial<PreferencesType>
  if (typeof prefs.userId !== "string" || typeof prefs.onBoarded !== "boolean") {
    return null
  }
  return {
    ...(prefs as PreferencesType),
    updatedAt: prefs.updatedAt ? new Date(prefs.updatedAt) : null,
  }
}

async function readStoredPreferences(userId: string): Promise<PreferencesType | null> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId))
    if (!raw) return null
    return normalize(JSON.parse(raw))
  } catch (err) {
    console.warn("[preferences] Failed to read local preferences:", err)
    return null
  }
}

async function writeStoredPreferences(prefs: PreferencesType): Promise<void> {
  try {
    await AsyncStorage.setItem(storageKey(prefs.userId), JSON.stringify(prefs))
  } catch (err) {
    console.warn("[preferences] Failed to persist preferences:", err)
  }
}

/** The in-flight hydration, so concurrent callers share one disk read. */
let inFlight: { userId: string; promise: Promise<PreferencesType | null> } | null = null

/** Timestamp of the last successful server sync, for the resync window. */
let lastSyncedAt = 0

/**
 * Adopt a row from the server as the new truth and mirror it to disk. This is
 * the write-through path every preference mutation funnels through, so the
 * device copy is never behind what the user just changed.
 */
export async function applyServerPreferences(prefs: PreferencesType): Promise<void> {
  const normalized = normalize(prefs)
  if (!normalized) return

  // A response that lands after a sign-out must not be published into the
  // (now empty) snapshot, but persisting it is still correct.
  if (state.userId === normalized.userId) {
    setState({ status: "ready", userId: normalized.userId, preferences: normalized })
    // The server just answered, so the copy is fresh as of now. Marking it
    // here stops the very next mount from immediately re-fetching what the
    // write-through already established.
    lastSyncedAt = Date.now()
  }
  await writeStoredPreferences(normalized)
}

/**
 * Re-read preferences from the server and refresh the device copy.
 *
 * Never throws: on failure the existing copy stays authoritative, so a
 * returning user keeps working offline and a dropped connection can never
 * bounce them back into onboarding.
 */
export async function refreshPreferences(
  options: { force?: boolean } = {},
): Promise<PreferencesType | null> {
  const userId = state.userId
  if (!userId) return null

  if (!options.force && lastSyncedAt > 0 && Date.now() - lastSyncedAt < RESYNC_INTERVAL_MS) {
    return state.preferences
  }

  try {
    const res = await authClient.$fetch<PreferencesType>(`${API_URL}/api/preferences`)
    const remote = res?.error ? null : normalize(res?.data)
    if (!remote) return state.preferences
    // Stamps `lastSyncedAt` via applyServerPreferences.
    await applyServerPreferences(remote)
    return remote
  } catch (err) {
    console.warn("[preferences] Sync failed, keeping local copy:", err)
    return state.preferences
  }
}

/**
 * Make preferences available for `userId`, preferring the copy already on the
 * device.
 *
 * This is what the onboarding gate waits on. When a copy exists the answer is
 * ready as soon as disk has been read — no request. Only a device that has
 * never seen this account has to wait on the network, and that wait is exactly
 * the "first sign in" case we can't answer offline.
 */
export async function hydratePreferences(userId: string): Promise<PreferencesType | null> {
  if (inFlight?.userId === userId) return inFlight.promise
  if (state.userId === userId && state.status === "ready") return state.preferences

  if (state.userId !== userId) {
    // A different account is becoming active. Clear first, then read: dropping
    // the snapshot before the await means no screen can render the previous
    // account's preferences in the meantime.
    inFlight = null
    setState({ status: "loading", userId, preferences: null })
  }

  const promise = (async () => {
    const local = await readStoredPreferences(userId)
    // The account may have changed while we were reading.
    if (state.userId !== userId) return null

    if (local) {
      setState({ status: "ready", userId, preferences: local })
      // Keep the copy honest if it changed on another device, without ever
      // holding up the gate on the value we just read.
      void refreshPreferences()
      return local
    }

    const remote = await refreshPreferences({ force: true })
    if (state.userId !== userId) return null
    // `remote` is null if the network failed; we report "ready" anyway so the
    // gate falls through to onboarding rather than spinning forever.
    setState({ status: "ready", userId, preferences: remote })
    return remote
  })()

  inFlight = { userId, promise }
  return promise
}

/**
 * Drop the in-memory snapshot on sign-out. The per-user copy on disk is kept:
 * it is namespaced by user id so it is safe, and it lets a returning user skip
 * the network entirely on the next launch.
 */
export function clearPreferences(): void {
  inFlight = null
  lastSyncedAt = 0
  setState({ status: "idle", userId: null, preferences: null })
}

/**
 * Read the current user's preferences, hydrating them on mount.
 *
 * Returns `status: "ready"` once preferences are trustworthy. Consumers that
 * only need units for rendering can use `preferences ?? DEFAULT_PREFERENCES`
 * and re-render when it changes.
 */
export function usePreferences(): PreferencesState {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const { data: session } = useSession()
  const userId = session?.user.id

  useEffect(() => {
    if (!userId) {
      clearPreferences()
      return
    }
    hydratePreferences(userId).catch((err) => {
      console.warn("[preferences] Hydration failed:", err)
    })
  }, [userId])

  return snapshot
}
