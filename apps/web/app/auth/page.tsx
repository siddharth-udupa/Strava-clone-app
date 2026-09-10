"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn, signUp } from "@/lib/auth-client"

type Tab = "signin" | "signup"

function AuthForm() {
  const [tab, setTab] = useState<Tab>("signin")
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard"

  const update = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (tab === "signup") {
        const { error } = await signUp.email({
          name: form.name,
          email: form.email,
          password: form.password,
        })
        if (error) { setError(error.message ?? "Sign up failed"); return }
      } else {
        const { error } = await signIn.email({
          email: form.email,
          password: form.password,
        })
        if (error) { setError(error.message ?? "Sign in failed"); return }
      }

      router.push(callbackUrl)
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async () => {
    setError("")
    setLoading(true)
    try {
      await signIn.social({
        provider: "google",
        callbackURL: callbackUrl,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google OAuth Sign-In failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full my-8 flex justify-center">
      <div className="border p-6 w-full max-w-sm flex flex-col gap-6">
        <h1 className="text-4xl text-stravaorange font-semibold">
          {tab === "signin" ? "Welcome back" : "Get started"}
        </h1>

        {/* Tab toggle */}
        <div className="flex border rounded overflow-hidden">
          <button
            type="button"
            onClick={() => setTab("signin")}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === "signin"
              ? "bg-stravaorange text-white"
              : "text-gray-500 hover:bg-gray-50"
              }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab("signup")}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === "signup"
              ? "bg-stravaorange text-white"
              : "text-gray-500 hover:bg-gray-50"
              }`}
          >
            Sign Up
          </button>
        </div>

        {/* OAuth placeholder */}
        <div className="w-full h-12 border rounded flex items-center justify-center text-sm text-gray-400">
          <button
            type="button"
            onClick={handleOAuth}
            disabled={loading}
            className="w-full h-12 border border-black rounded-md flex items-center justify-center gap-2 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
          > 
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {/* Blue section */}
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              {/* Green section */}
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              {/* Yellow section */}
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              {/* Red section */}
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            {tab === "signin" ? 
              "Sign in with Google" : "Sign up with Google"}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400">
            {tab === "signin" ? "or sign in with email" : "or sign up with email"}
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {tab === "signup" && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={form.name}
                onChange={update("name")}
                required
                className="p-3 border rounded-md text-sm"
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="example@gmail.com"
              value={form.email}
              onChange={update("email")}
              required
              className="p-3 border rounded-md text-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete={tab === "signup" ? "new-password" : "current-password"}
              placeholder="password123"
              value={form.password}
              onChange={update("password")}
              required
              minLength={8}
              className="p-3 border rounded-md text-sm"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="py-3 bg-stravaorange text-white font-semibold rounded-md disabled:opacity-50"
          >
            {loading ? "Please wait..." : tab === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="w-full my-8 flex justify-center text-sm text-gray-400">Loading auth form...</div>}>
      <AuthForm />
    </Suspense>
  )
}