import { Redirect } from "expo-router";
import { useSession } from "@/lib/auth-client";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FC4C02" />
      </View>
    );
  }

  if (session) {
    return <Redirect href={"/(app)/dashboard" as any} />;
  }

  return <Redirect href={"/(auth)/sign-in" as any} />;
}
