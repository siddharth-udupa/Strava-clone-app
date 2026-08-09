import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.31.240:3000",
  plugins: [
    // @ts-expect-error — known type mismatch between better-auth and @better-auth/expo generics
    expoClient({
      scheme: "mobile",
      storagePrefix: "strava-clone",
      storage: SecureStore,
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;