import { View, Text, TouchableOpacity } from "react-native"
import { useSession, signOut } from "@/lib/auth-client"
import { Redirect } from "expo-router"

export default function DashboardScreen() {
  const { data: session } = useSession()

  if(!session) {
    <Redirect href={"/(auth)/sign-in" as any} />
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <View className="flex-1 justify-center items-center p-6 bg-slate-800">
      <Text className="text-3xl font-bold text-white mb-2">Dashboard</Text>
      <Text className="text-lg text-gray-600">
        Welcome, {session?.user?.name ?? "User"}!
      </Text>
      <Text className="text-sm text-gray-400 mt-1">
        {session?.user?.email}
      </Text>
      <TouchableOpacity
        className="mt-8 px-6 py-3 bg-red-500 rounded-lg"
        onPress={handleSignOut}
      >
        <Text className="text-white font-semibold text-sm">Sign Out</Text>
      </TouchableOpacity>
    </View>
  )
}