"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { PenSquare, FileUp } from "lucide-react"

export default function UploadButton() {
  const pathname = usePathname()

  const links = [
    {
      name: "Manual Entry",
      href: "/upload/manual",
      icon: PenSquare,
    },
    {
      name: "GPX File",
      href: "/upload/file",
      icon: FileUp,
    },
  ]

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Upload Activity
        </h2>
      </div>
      <nav className="flex flex-row md:flex-col divide-x md:divide-x-0 md:divide-y divide-gray-100">
        {links.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                isActive
                  ? "bg-orange-50/80 border-l-0 md:border-l-4 border-b-2 md:border-b-0 border-stravaorange text-stravaorange font-semibold"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-stravaorange" : "text-gray-400"}`} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
