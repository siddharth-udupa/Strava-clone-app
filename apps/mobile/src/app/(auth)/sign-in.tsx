import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from "react-native"
import { useRouter } from "expo-router"
import { signIn, signUp } from "@/lib/auth-client"

type Tab = "signin" | "signup"

export default function SignInScreen() {
  const [tab, setTab] = useState<Tab>("signin")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    if (!email || !password || (tab === "signup" && !name)) {
      Alert.alert("Missing fields", "Please fill in all fields.")
      return
    }

    setLoading(true)
    try {
      if (tab === "signup") {
        const { error } = await signUp.email({ name, email, password })
        if (error) {
          Alert.alert("Sign Up Failed", error.message ?? "Something went wrong")
          return
        }
      } else {
        const { error } = await signIn.email({ email, password })
        if (error) {
          Alert.alert("Sign In Failed", error.message ?? "Something went wrong")
          return
        }
      }
      router.push("/(app)/dashboard")
    }
    catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "An unexpected error occurred")
    }
    finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signIn.social({ provider: "google", callbackURL: "/dashboard" })
      router.push("/(app)/dashboard")
    }
    catch (err) {
      Alert.alert("OAuth Error", err instanceof Error ? err.message : "Google sign-in failed")
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-neutral-50"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center p-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="bg-white rounded-2xl p-6 shadow-md gap-4">
          {/* Header */}
          <Text className="text-3xl font-bold text-strava">
            {tab === "signin" ? "Welcome back" : "Get started"}
          </Text>
          <Text className="text-sm text-gray-500 -mt-2">
            {tab === "signin" ? "Sign in to your account" : "Create a new account"}
          </Text>

          {/* Tab Toggle */}
          <View className="flex-row rounded-lg border border-gray-200 overflow-hidden">
            <TouchableOpacity
              className={`flex-1 py-2.5 items-center ${tab === "signin" ? "bg-strava" : "bg-white"}`}
              onPress={() => setTab("signin")}
            >
              <Text className={`text-sm font-semibold ${tab === "signin" ? "text-white" : "text-gray-500"}`}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-2.5 items-center ${tab === "signup" ? "bg-strava" : "bg-white"}`}
              onPress={() => setTab("signup")}
            >
              <Text className={`text-sm font-semibold ${tab === "signup" ? "text-white" : "text-gray-500"}`}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Google OAuth */}
          <TouchableOpacity
            className="border border-gray-800 rounded-lg py-3.5 items-center"
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <Text className="text-sm font-semibold text-gray-800">
              {tab === "signin" ? "Sign in with Google" : "Sign up with Google"}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center gap-3">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="text-xs text-gray-400">
              {tab === "signin" ? "or sign in with email" : "or sign up with email"}
            </Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Form Fields */}
          {tab === "signup" && (
            <View className="gap-1">
              <Text className="text-sm font-medium text-gray-800">Name</Text>
              <TextInput
                className="border border-gray-200 rounded-lg px-3.5 py-3 text-sm text-gray-800 bg-neutral-50"
                placeholder="Your name"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>
          )}

          <View className="gap-1">
            <Text className="text-sm font-medium text-gray-800">Email</Text>
            <TextInput
              className="border border-gray-200 rounded-lg px-3.5 py-3 text-sm text-gray-800 bg-neutral-50"
              placeholder="example@gmail.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View className="gap-1">
            <Text className="text-sm font-medium text-gray-800">Password</Text>
            <TextInput
              className="border border-gray-200 rounded-lg px-3.5 py-3 text-sm text-gray-800 bg-neutral-50"
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete={tab === "signup" ? "new-password" : "current-password"}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            className={`bg-strava rounded-lg py-3.5 items-center mt-1 ${loading ? "opacity-50" : ""}`}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-bold">
                {tab === "signin" ? "Sign In" : "Create Account"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}