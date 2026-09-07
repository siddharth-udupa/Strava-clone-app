export default function UsernameStep({ userName }: { userName: string }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-3">
        Welcome, {userName} 👋
      </h1>
      <p className="text-neutral-400 text-base leading-relaxed">
        Let's personalize your experience. We'll set up your preferred units and
        display settings in a few quick steps.
      </p>
    </div>
  )
}