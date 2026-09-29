import { Redirect, Stack } from "expo-router"
import { ActivityIndicator, View } from "react-native"
import { useSession } from "@/lib/auth-client"

export default function AppLayout() {
  const { data: session, isPending } = useSession()

  // Gating here rather than per-screen means protected screens never mount
  // unauthenticated, so their data effects don't fire doomed requests.
  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100 dark:bg-slate-950">
        <ActivityIndicator size="large" color="#FC5200" />
      </View>
    )
  }

  if (!session) {
    return <Redirect href={"/(auth)/auth" as any} />
  }

  return <Stack screenOptions={{ headerShown: false, statusBarStyle: "auto" }} />
}
