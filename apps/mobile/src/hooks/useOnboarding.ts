import { useState } from "react"
import { authClient } from "@/lib/auth-client"

const API_URL = process.env.EXPO_PUBLIC_API_URL!

export type OnboardingPrefs = {
  theme: "system" | "dark" | "light"
  distanceUnit: "metric" | "imperial"
  elevationUnit: "meters" | "feet"
  paceUnit: "min/km" | "min/mi"
  speedUnit: "km/h" | "mph" | "m/s"
  weightUnit: "kg" | "lb"
  timeFormat: "12h" | "24h"
}

export const DEFAULT_PREFS: OnboardingPrefs = {
  theme: "system",
  distanceUnit: "metric",
  elevationUnit: "meters",
  paceUnit: "min/km",
  speedUnit: "km/h",
  weightUnit: "kg",
  timeFormat: "24h",
}

export function useOnboarding() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Set the username for the current user.
   * Returns null on success, or an error string on failure.
   */
  async function updateUsername(username: string): Promise<string | null> {
    setError(null)
    setIsLoading(true)
    try {
      const res = await authClient.$fetch(`${API_URL}/api/user`, {
        method: "PATCH",
        body: JSON.stringify({ username }),
        headers: { "Content-Type": "application/json" },
      })
      if (res.error) {
        const msg = (res.error as any)?.message ?? "Failed to update username."
        setError(msg)
        return msg
      }
      return null
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update username."
      setError(msg)
      return msg
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Save preference fields (partial update).
   * Pass { onBoarded: true } to mark onboarding complete.
   */
  async function updatePreferences(data: Partial<OnboardingPrefs> & { onBoarded?: boolean }): Promise<string | null> {
    setError(null)
    setIsLoading(true)
    try {
      const res = await authClient.$fetch(`${API_URL}/api/preferences`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      })
      if (res.error) {
        const msg = (res.error as any)?.message ?? "Failed to save preferences."
        setError(msg)
        return msg
      }
      return null
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save preferences."
      setError(msg)
      return msg
    } finally {
      setIsLoading(false)
    }
  }

  /** Convenience: finalize onboarding with current preferences and mark as onboarded. */
  async function completeOnboarding(prefs: OnboardingPrefs): Promise<string | null> {
    return updatePreferences({ ...prefs, onBoarded: true })
  }

  /** Skip onboarding — uses all defaults, just flips the flag. */
  async function skipOnboarding(): Promise<string | null> {
    return updatePreferences({ onBoarded: true })
  }

  return {
    isLoading,
    error,
    updateUsername,
    updatePreferences,
    completeOnboarding,
    skipOnboarding,
  }
}
