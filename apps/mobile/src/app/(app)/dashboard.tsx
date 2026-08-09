import { View, Text, TouchableOpacity } from "react-native";
import { useSession, signOut } from "@/lib/auth-client";

export default function DashboardScreen() {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <View className="flex-1 justify-center items-center p-6 bg-neutral-50">
      <Text className="text-3xl font-bold text-gray-800 mb-2">Dashboard</Text>
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
  );
}