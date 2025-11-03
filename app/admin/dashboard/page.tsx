"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface DashboardStats {
  totalTickets: number
  openTickets: number
  inProgressTickets: number
  resolvedTickets: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    if (!token) {
      router.push("/admin/login")
      return
    }

    fetchStats()
  }, [router])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/support-tickets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch stats")
      }

      const data = await response.json()
      const tickets = data.data || []

      const stats = {
        totalTickets: tickets.length,
        openTickets: tickets.filter((t: any) => t.status === "open").length,
        inProgressTickets: tickets.filter((t: any) => t.status === "in_progress").length,
        resolvedTickets: tickets.filter((t: any) => t.status === "resolved").length,
      }

      setStats(stats)
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-cyan-300 border-t-cyan-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">Welcome to your support management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-950/30 dark:to-blue-950/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">{stats?.totalTickets || 0}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">All time tickets</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-cyan-950/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{stats?.openTickets || 0}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Awaiting response</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-cyan-700 dark:text-cyan-300">{stats?.inProgressTickets || 0}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Being investigated</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-950/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats?.resolvedTickets || 0}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Navigate to manage support tickets</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/admin/support-tickets">
            <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white">
              View All Support Tickets
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
