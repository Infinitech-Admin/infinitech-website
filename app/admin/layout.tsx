"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Inbox,
  ClipboardList,
  Video,
  IdCard,
  Ticket,
  FileCheck,
  UserCheck,
  SearchCheck,
  CalendarCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"

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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 flex overflow-hidden">

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-64 bg-gradient-to-b from-cyan-900 to-blue-900 dark:from-cyan-950 dark:to-blue-950 text-white transition-transform duration-300 flex flex-col fixed left-0 top-0 h-full shadow-lg z-50 lg:translate-x-0 lg:sticky`}
      >
        <div className="p-6 border-b border-cyan-700/50 flex items-center justify-between">
          <h1 className="text-lg font-bold text-cyan-300">Admin</h1>

          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 hover:bg-cyan-800 rounded-lg lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">

          <a
            href="/admin/dashboard"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive("/admin/dashboard")
                ? "bg-cyan-600 text-white"
                : "hover:bg-cyan-800/50 text-cyan-100"
            }`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </a>

          <a
            href="/admin/inquiries"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive("/admin/inquiries")
                ? "bg-cyan-600 text-white"
                : "hover:bg-cyan-800/50 text-cyan-100"
            }`}
          >
            <Inbox size={20} />
            Inquiries
          </a>

          <a
            href="/admin/juantap-survey"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive("/admin/juantap-survey")
                ? "bg-cyan-600 text-white"
                : "hover:bg-cyan-800/50 text-cyan-100"
            }`}
          >
            <IdCard size={20} />
            Juantap Survey
          </a>

          <a
            href="/admin/survey"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive("/admin/survey")
                ? "bg-cyan-600 text-white"
                : "hover:bg-cyan-800/50 text-cyan-100"
            }`}
          >
            <ClipboardList size={20} />
            Survey
          </a>

          <a
            href="/admin/video-survey"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive("/admin/video-survey")
                ? "bg-cyan-600 text-white"
                : "hover:bg-cyan-800/50 text-cyan-100"
            }`}
          >
            <Video size={20} />
            Video Survey
          </a>

          <a
            href="/admin/demo-requirements"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive("/admin/demo-requirements")
                ? "bg-cyan-600 text-white"
                : "hover:bg-cyan-800/50 text-cyan-100"
            }`}
          >
            <FileCheck size={20} />
            Demo Website Requirements
          </a>

          <a
            href="/admin/client-assessment"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive("/admin/client-assessment")
                ? "bg-cyan-600 text-white"
                : "hover:bg-cyan-800/50 text-cyan-100"
            }`}
          >
            <UserCheck size={20} />
            Client Assessment
          </a>

          <a
            href="/admin/support-tickets"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive("/admin/support-tickets")
                ? "bg-cyan-600 text-white"
                : "hover:bg-cyan-800/50 text-cyan-100"
            }`}
          >
            <Ticket size={20} />
            Support Tickets
          </a>

          <a
            href="/admin/seo-audits"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive("/admin/seo-audits")
                ? "bg-cyan-600 text-white"
                : "hover:bg-cyan-800/50 text-cyan-100"
            }`}
          >
            <SearchCheck size={20} />
            SEO Audit
          </a>

          <a
            href="/admin/attendance"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive("/admin/attendance")
                ? "bg-cyan-600 text-white"
                : "hover:bg-cyan-800/50 text-cyan-100"
            }`}
          >
            <CalendarCheck size={20} />
            OJT Attendance
          </a>

        </nav>

        <div className="px-4 py-6 border-t border-cyan-700/50">
          <Button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-auto">

        <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="text-sm text-slate-500 dark:text-slate-400">
            Admin Dashboard
          </div>
        </div>

        <div className="flex-1 p-4 lg:p-6">{children}</div>

      </main>
    </div>
  )
}
