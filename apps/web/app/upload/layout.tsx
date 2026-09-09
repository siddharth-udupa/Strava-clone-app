import UploadButton from "@/components/UploadBtns"

export default function UploadLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-gray-50/50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-56 shrink-0 sticky top-20">
          <UploadButton />
        </div>
        <main className="flex-1 w-full bg-white border border-gray-200 rounded-xl shadow-xs p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}