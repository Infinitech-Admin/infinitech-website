"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X, LogOut, LayoutDashboard, Ticket, ClipboardList, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-64 bg-gradient-to-b from-cyan-900 to-blue-900 dark:from-cyan-950 dark:to-blue-950 text-white transition-transform duration-300 flex flex-col fixed left-0 top-0 h-full shadow-lg z-50 lg:translate-x-0 lg:sticky lg:z-auto lg:flex-shrink-0`}
      >
        {/* Header */}
        <div className="p-6 border-b border-cyan-700/50 flex items-center justify-between">
          <h1 className="text-lg font-bold text-cyan-300">Admin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 hover:bg-cyan-800 rounded-lg transition-colors lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <a
            href="/admin/dashboard"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive("/admin/dashboard") ? "bg-cyan-600 text-white" : "hover:bg-cyan-800/50 text-cyan-100"
            }`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </a>

          <a
            href="/admin/support-tickets"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive("/admin/support-tickets") ? "bg-cyan-600 text-white" : "hover:bg-cyan-800/50 text-cyan-100"
            }`}
          >
            <Ticket size={20} />
            <span>Support Tickets</span>
          </a>

          <a
            href="/admin/survey"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive("/admin/survey") ? "bg-cyan-600 text-white" : "hover:bg-cyan-800/50 text-cyan-100"
            }`}
          >
            <ClipboardList size={20} />
            <span>Survey</span>
          </a>
          <a
            href="/admin/inquiries"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive("/admin/inquiries") ? "bg-cyan-600 text-white" : "hover:bg-cyan-800/50 text-cyan-100"
            }`}
          >
            <Inbox size={20} />
            <span>Inquiries</span>
          </a>
           <a
            href="/admin/juantap-survey"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive("/admin/juantap-survey") ? "bg-cyan-600 text-white" : "hover:bg-cyan-800/50 text-cyan-100"
            }`}
          >
            <Inbox size={20} />
            <span>Juantap Survey</span>
          </a>
        </nav>

        {/* Logout Button */}
        <div className="px-4 py-6 border-t border-cyan-700/50">
          <Button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white gap-2 flex items-center justify-center"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors lg:hidden"
          >
            <Menu size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
          <div className="text-sm text-slate-500 dark:text-slate-400">Admin Dashboard</div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-6">{children}</div>
      </main>
    </div>
  )
}
