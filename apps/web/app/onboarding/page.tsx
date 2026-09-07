import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { PreferencesType } from "@repo/types"
import { createUserPreferences, updateUserPreference } from "@repo/db"
import OnboardingWizard from "@/components/onBoardingUI/OnboardingWizard"


export default async function OnBoarding() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) redirect("/auth")

  const userPreferences = await createUserPreferences(session.user.id)

  if (userPreferences.onBoarded) redirect("/dashboard")

  async function submitPreferences(data: PreferencesType) {
    "use server"
    await updateUserPreference(session!.user.id, data)
    redirect("/dashboard")
  }

  return (
    <OnboardingWizard
      userName={session.user.name}
      userId={session.user.id}
      submitPreferences={submitPreferences}
    />
  )
}