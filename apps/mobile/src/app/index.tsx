import { Redirect } from "expo-router"
import { useSession } from "@/lib/auth-client"
import { View, ActivityIndicator } from "react-native"
import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"

const API_URL = process.env.EXPO_PUBLIC_API_URL!

export default function Index() {
  const { data: session, isPending } = useSession()
  const [onBoarded, setOnBoarded] = useState<boolean | null>(null)

  useEffect(() => {
    if (!session) return
    authClient.$fetch<{ onBoarded: boolean }>(`${API_URL}/api/preferences`)
      .then((res) => {
        setOnBoarded(res.data?.onBoarded ?? false)
      })
      .catch(() => {
        // On network error default to onboarding so user can still proceed
        setOnBoarded(false)
      })
  }, [session])

  // Show spinner while session resolves or while fetching preferences
  if (isPending || (session && onBoarded === null)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FC4C02" />
      </View>
    )
  }

  if (!session) {
    return <Redirect href={"/(auth)/sign-in" as any} />
  }

  if (!onBoarded) {
    return <Redirect href={"/(onboarding)" as any} />
  }

  return <Redirect href={"/(app)/dashboard" as any} />
}
