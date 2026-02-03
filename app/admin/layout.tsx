"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Ticket,
  ClipboardList,
  Inbox,
  Video,
  IdCard,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { path: "/admin/juantap-survey", label: "Juantap Survey", icon: ClipboardList },
  { path: "/admin/survey", label: "Survey", icon: ClipboardList },
  { path: "/admin/video-survey", label: "Video Survey", icon: Video },
  { path: "/admin/demo-requirements", label: "Demo Website Requirements", icon: IdCard },
  { path: "/admin/support-tickets", label: "Support Tickets", icon: Ticket },
  { path: "/admin/attendance", label: "OJT Attendance", icon: Clock },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === "/admin/login") {
      setIsChecking(false)
      return
    }

    const token = localStorage.getItem("adminToken")
    if (!token) {
      router.push("/admin/login")
      return
    }

    setIsAuthenticated(true)
    setIsChecking(false)
  }, [pathname, router])

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    router.push("/admin/login")
  }

  const isActive = (path: string) => pathname === path

  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  if (isChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-lg animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-cyan-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0 lg:flex
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-cyan-700">
          <h1 className="text-xl font-bold tracking-tight">Admin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 hover:bg-cyan-800 rounded-lg transition-colors lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              onClick={() => {
                router.push(path)
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left
                ${
                  isActive(path)
                    ? "bg-cyan-600 text-white"
                    : "hover:bg-cyan-800/50 text-cyan-100"
                }
              `}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="px-3 py-4 border-t border-cyan-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-cyan-100 hover:bg-cyan-800/50 transition-colors text-left"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors lg:hidden"
            >
              <Menu size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Admin Dashboard
            </h2>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
