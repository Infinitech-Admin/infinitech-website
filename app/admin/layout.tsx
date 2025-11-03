"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X, LogOut, LayoutDashboard, Ticket } from "lucide-react"
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
    // Skip auth check for login page
    if (pathname === "/admin/login") {
      setIsChecking(false)
      return
    }

    // Check authentication for all other admin pages
    const token = localStorage.getItem("adminToken")
    
    if (!token) {
      router.push("/admin/login")
      return
    }

    // Optionally verify token with your API
    // For now, just check if it exists
    setIsAuthenticated(true)
    setIsChecking(false)
  }, [pathname, router])

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    router.push("/admin/login")
  }

  const isActive = (path: string) => pathname === path

  // If on login page, render children without layout
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  // Show nothing while checking authentication (prevents layout flash)
  if (isChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-64 bg-gradient-to-b from-cyan-900 to-blue-900 dark:from-cyan-950 dark:to-blue-950 text-white transition-transform duration-300 flex flex-col fixed left-0 top-0 h-screen shadow-lg z-50 lg:translate-x-0 lg:relative lg:z-auto`}
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

      {/* Main Content */}
      <main className="flex-1 w-full overflow-auto">
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
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  )
}
