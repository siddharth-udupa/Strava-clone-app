"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import {
  Search,
  ChevronDown,
  Bell,
  Plus,
  Menu,
  X,
  User,
  LogOut,
  Activity,
  FileUp,
  PenSquare,
  MapPin,
  Trophy,
  Compass,
} from "lucide-react"
import { useSession, signOut } from "@/lib/auth-client"

// Strava Dual Chevron Logo Icon Component
function StravaLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Strava Logo"
    >
      <path
        fill="#FC5200"
        d="M15.387 17.944l-3.689-7.378-3.69 7.378H0L11.698 0l11.7 23.98h-8.011l-3.69-6.036z"
      />
      <path
        fill="#E34400"
        d="M15.387 17.944l2.684 5.378h5.908L15.387 11.69 9.176 23.98h5.908z"
      />
    </svg>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  // Desktop active dropdown state: 'dashboard' | 'training' | 'plus' | 'profile' | 'search' | null
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  // Mobile menu open state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Mobile accordions state
  const [mobileExpandedSection, setMobileExpandedSection] = useState<string | null>("dashboard")

  // Search input state
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const navRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
        setIsSearchOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Close mobile menu on page navigation
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setActiveDropdown(null)
    setIsSearchOpen(false)
  }, [pathname])

  // Focus search input when search is opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  const toggleDropdown = (name: string) => {
    setActiveDropdown((prev) => (prev === name ? null : name))
  }

  const toggleMobileAccordion = (name: string) => {
    setMobileExpandedSection((prev) => (prev === name ? null : name))
  }

  const handleSearchSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/dashboard?search=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setIsMobileMenuOpen(false)
      setSearchQuery("")
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth")
  }

  const user = session?.user
  const userInitials = user?.name
    ? user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : "ST"

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-xs" ref={navRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16">

          {/* LEFT SECTION: Logo & Primary Nav (Desktop) */}
          <div className="flex items-center gap-6 lg:gap-8">
            {/* Strava Brand Logo */}
            <Link
              href={session ? "/dashboard" : "/"}
              className="flex items-center gap-2 group focus:outline-none"
              aria-label="Strava Clone Home"
            >
              <StravaLogo className="h-7 w-7 transition-transform group-hover:scale-105" />
              <span className="text-stravaorange font-black tracking-tighter text-2xl font-sans uppercase italic select-none">
                STRAVA
              </span>
            </Link>

            {/* Desktop Navigation Links & Dropdowns */}
            <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-gray-800">

              {/* Search Toggle Icon */}
              <div className="relative">
                <button
                  onClick={() => setIsSearchOpen((prev) => !prev)}
                  className={`p-2 rounded-full transition-colors hover:bg-gray-100 ${isSearchOpen ? "bg-gray-100 text-stravaorange" : "text-gray-600 hover:text-black"
                    }`}
                  title="Search"
                  aria-label="Search activities or athletes"
                >
                  <Search className="w-4 h-4" />
                </button>

                {/* Desktop Search Expandable Bar */}
                {isSearchOpen && (
                  <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-50">
                    <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                      <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search athletes, activities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stravaorange focus:bg-white text-gray-900"
                      />
                    </form>
                  </div>
                )}
              </div>

              {/* Dashboard Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("dashboard")}
                  onMouseEnter={() => setActiveDropdown("dashboard")}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors hover:text-stravaorange ${pathname.startsWith("/dashboard") || pathname.startsWith("/activities")
                    ? "text-stravaorange font-bold"
                    : "text-gray-700"
                    }`}
                >
                  <span>Dashboard</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === "dashboard" ? "rotate-180 text-stravaorange" : "text-gray-400"
                      }`}
                  />
                </button>

                {activeDropdown === "dashboard" && (
                  <div
                    onMouseLeave={() => setActiveDropdown(null)}
                    className="absolute left-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-orange-50 hover:text-stravaorange transition-colors font-medium"
                    >
                      <Activity className="w-4 h-4 text-stravaorange" />
                      Activity Feed
                    </Link>
                    <Link
                      href="/activities"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-orange-50 hover:text-stravaorange transition-colors font-medium"
                    >
                      <Compass className="w-4 h-4 text-stravaorange" />
                      My Activities
                    </Link>
                    <Link
                      href="/maps"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-orange-50 hover:text-stravaorange transition-colors font-medium"
                    >
                      <MapPin className="w-4 h-4 text-stravaorange" />
                      My Routes & Segments
                    </Link>
                  </div>
                )}
              </div>

              {/* Training Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("training")}
                  onMouseEnter={() => setActiveDropdown("training")}
                  className="flex items-center gap-1 px-3 py-2 rounded-md transition-colors text-gray-700 hover:text-stravaorange"
                >
                  <span>Training</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === "training" ? "rotate-180 text-stravaorange" : "text-gray-400"
                      }`}
                  />
                </button>

                {activeDropdown === "training" && (
                  <div
                    onMouseLeave={() => setActiveDropdown(null)}
                    className="absolute left-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    <Link
                      href="/upload"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-orange-50 hover:text-stravaorange transition-colors font-medium"
                    >
                      <FileUp className="w-4 h-4 text-stravaorange" />
                      Training Log & Upload
                    </Link>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-orange-50 hover:text-stravaorange transition-colors font-medium"
                    >
                      <Trophy className="w-4 h-4 text-stravaorange" />
                      My Weekly Goals
                    </Link>
                  </div>
                )}
              </div>

              {/* Maps Link */}
              <Link
                href="/maps"
                className={`px-3 py-2 rounded-md transition-colors hover:text-stravaorange ${pathname.startsWith("/maps") ? "text-stravaorange font-bold" : "text-gray-700"
                  }`}
              >
                Maps
              </Link>

              {/* Challenges Link */}
              <Link
                href="/dashboard"
                className="px-3 py-2 rounded-md transition-colors text-gray-700 hover:text-stravaorange"
              >
                Challenges
              </Link>
            </nav>
          </div>

          {/* RIGHT SECTION: Notifications, Profile, Plus Action (Desktop) */}
          <div className="hidden lg:flex items-center gap-4">

            {/* Notification Bell */}
            <button
              className="p-1.5 text-gray-600 hover:text-black rounded-full hover:bg-gray-100 transition-colors relative"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-stravaorange rounded-full ring-2 ring-white" />
            </button>

            {/* Profile Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("profile")}
                className="flex items-center gap-1 p-0.5 rounded-full hover:ring-2 hover:ring-stravaorange transition-all focus:outline-none"
                aria-label="User menu"
              >
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User Avatar"}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-orange-400 to-stravaorange text-white text-xs font-bold flex items-center justify-center border border-gray-200">
                    {userInitials}
                  </div>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>

              {activeDropdown === "profile" && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 divide-y divide-gray-100">
                  <div className="px-4 py-2.5">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {user?.name || "Athlete Account"}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {user?.email || "athlete@strava.clone"}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-orange-50 hover:text-stravaorange"
                    >
                      <User className="w-3.5 h-3.5" />
                      My Profile
                    </Link>
                    <Link
                      href="/onboarding"
                      className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-orange-50 hover:text-stravaorange"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      Settings & Preferences
                    </Link>
                  </div>
                  <div className="py-1">
                    {session ? (
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Log Out
                      </button>
                    ) : (
                      <Link
                        href="/auth"
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-stravaorange hover:bg-orange-50 font-bold"
                      >
                        <User className="w-3.5 h-3.5" />
                        Log In / Register
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Plus Icon Action Dropdown (Upload Activity) */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("plus")}
                className="w-8 h-8 rounded-full border-2 border-stravaorange text-stravaorange flex items-center justify-center hover:bg-orange-50 transition-colors focus:outline-none active:scale-95"
                title="Add activity"
                aria-label="Upload or Create Activity"
              >
                <Plus className="w-4 h-4 stroke-3" />
              </button>

              {activeDropdown === "plus" && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-lg shadow-xl border border-gray-100 py-1.5 z-50">
                  <Link
                    href="/upload/file"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-orange-50 hover:text-stravaorange font-medium"
                  >
                    <FileUp className="w-4 h-4 text-stravaorange" />
                    Upload activity (.gpx)
                  </Link>
                  <Link
                    href="/upload/manual"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-orange-50 hover:text-stravaorange font-medium"
                  >
                    <PenSquare className="w-4 h-4 text-stravaorange" />
                    Add manual entry
                  </Link>
                  <Link
                    href="/maps"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-orange-50 hover:text-stravaorange font-medium"
                  >
                    <MapPin className="w-4 h-4 text-stravaorange" />
                    Create a route
                  </Link>
                </div>
              )}
            </div>

          </div>

          {/* MOBILE TOGGLE BUTTON (Matches image 2 design) */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="p-2 text-gray-800 hover:text-stravaorange focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-7 h-7" />
              ) : (
                <Menu className="w-7 h-7" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE NAVIGATION MENU OVERLAY (Matches image 2 requirement) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-14 bg-white border-b border-gray-200 shadow-2xl z-40 max-h-[calc(100vh-3.5rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 pt-4 pb-6 space-y-4">

            {/* Search Input Bar inside Mobile Menu */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search athletes, activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stravaorange focus:bg-white text-gray-900"
              />
            </form>

            {/* Mobile Navigation Links */}
            <div className="divide-y divide-gray-100 text-sm font-semibold text-gray-800">

              {/* Dashboard Accordion */}
              <div className="py-2">
                <button
                  onClick={() => toggleMobileAccordion("dashboard")}
                  className="w-full flex items-center justify-between py-2 text-left text-gray-900"
                >
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-stravaorange" />
                    Dashboard
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${mobileExpandedSection === "dashboard" ? "rotate-180 text-stravaorange" : "text-gray-400"
                      }`}
                  />
                </button>

                {mobileExpandedSection === "dashboard" && (
                  <div className="pl-6 pt-1 pb-2 space-y-2 text-xs font-medium text-gray-600">
                    <Link href="/dashboard" className="block py-1.5 hover:text-stravaorange">
                      Activity Feed
                    </Link>
                    <Link href="/activities" className="block py-1.5 hover:text-stravaorange">
                      My Activities
                    </Link>
                    <Link href="/maps" className="block py-1.5 hover:text-stravaorange">
                      My Routes & Segments
                    </Link>
                  </div>
                )}
              </div>

              {/* Training Accordion */}
              <div className="py-2">
                <button
                  onClick={() => toggleMobileAccordion("training")}
                  className="w-full flex items-center justify-between py-2 text-left text-gray-900"
                >
                  <span className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-stravaorange" />
                    Training
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${mobileExpandedSection === "training" ? "rotate-180 text-stravaorange" : "text-gray-400"
                      }`}
                  />
                </button>

                {mobileExpandedSection === "training" && (
                  <div className="pl-6 pt-1 pb-2 space-y-2 text-xs font-medium text-gray-600">
                    <Link href="/upload" className="block py-1.5 hover:text-stravaorange">
                      Training Log & Upload
                    </Link>
                    <Link href="/dashboard" className="block py-1.5 hover:text-stravaorange">
                      My Weekly Goals
                    </Link>
                  </div>
                )}
              </div>

              {/* Maps Link */}
              <div className="py-2">
                <Link
                  href="/maps"
                  className="flex items-center gap-2 py-2 text-gray-900 hover:text-stravaorange"
                >
                  <MapPin className="w-4 h-4 text-stravaorange" />
                  Maps
                </Link>
              </div>

              {/* Challenges Link */}
              <div className="py-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 py-2 text-gray-900 hover:text-stravaorange"
                >
                  <Compass className="w-4 h-4 text-stravaorange" />
                  Challenges
                </Link>
              </div>

            </div>

            {/* Mobile Actions Section */}
            <div className="pt-4 border-t border-gray-100 space-y-3">

              {/* Quick Activity Actions */}
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <Link
                  href="/upload/file"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-orange-50 text-stravaorange border border-orange-200 rounded-lg hover:bg-orange-100"
                >
                  <FileUp className="w-3.5 h-3.5" />
                  <span>Upload GPX</span>
                </Link>
                <Link
                  href="/upload/manual"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-orange-50 text-stravaorange border border-orange-200 rounded-lg hover:bg-orange-100"
                >
                  <PenSquare className="w-3.5 h-3.5" />
                  <span>Manual Entry</span>
                </Link>
              </div>

              {/* User Profile / Auth State */}
              <div className="pt-2">
                {session ? (
                  <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-stravaorange text-white font-bold flex items-center justify-center text-xs">
                        {userInitials}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{user?.name || "Athlete"}</p>
                        <p className="text-[10px] text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                      title="Log Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/auth"
                    className="w-full border-2 border-stravaorange text-stravaorange font-bold text-sm py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-orange-50"
                  >
                    <User className="w-4 h-4" />
                    <span>Log In / Join</span>
                  </Link>
                )}
              </div>

            </div>

          </div>
        </div>
      )}
    </header>
  )
}