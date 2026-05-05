"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader,
  Filter,
  Search,
  Calendar,
  Clock,
  Trash2,
  LogIn,
  LogOut,
  User,
  UserPlus,
  Users,
  ShieldCheck,
  X,
  AlertTriangle,
  Wifi,
  Smartphone,
  Monitor,
  TrendingUp,
  Award,
  Timer,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React from "react"

interface AttendanceRecord {
  id: number
  full_name: string
  date: string
  time_in: string
  time_out: string | null
  total_minutes: number | null
  created_at: string
  updated_at: string
  ip_address?: string
  user_agent?: string
}

interface Trainee {
  id: number
  full_name: string
  created_at: string
}

interface SuspiciousActivity {
  type: string
  severity: 'low' | 'medium' | 'high'
  record?: AttendanceRecord
  trainee?: string
  reason: string
  ip_count?: number
  count?: number
  date?: string
  details?: any
}

// ─── CONFIGURABLE OJT TARGETS ─────────────────────────────────────────────────
// Default hours required for all trainees. Add name overrides below as needed.
const OJT_DEFAULT_HOURS = 486

// Per-trainee overrides — key must exactly match the trainee's full_name
const OJT_HOURS_OVERRIDES: Record<string, number> = {
  "Chrissa May Canedo": 500,
}

/** Returns the required OJT hours for a specific trainee */
const getRequiredHours = (fullName: string): number =>
  OJT_HOURS_OVERRIDES[fullName] ?? OJT_DEFAULT_HOURS

// ─── PER-TRAINEE BONUS MINUTES ────────────────────────────────────────────────
// Add extra minutes to a trainee's cumulative total (e.g. approved exceptions).
const BONUS_MINUTES: Record<string, number> = {
  "Chrissa May Canedo": 32 * 60, // +32 hours exception
}
// ──────────────────────────────────────────────────────────────────────────────

// Maximum minutes that can be counted per attendance record (8 hours)
const MAX_DAILY_MINUTES = 480

const ITEMS_PER_PAGE = 10

const formatDate = (dateString: string) => {
  if (!dateString) return "—"
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return "—"
  const date = new Date(dateString)
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
}

const getDeviceType = (userAgent?: string): { icon: any; label: string } => {
  if (!userAgent) return { icon: Monitor, label: 'Unknown' }
  const ua = userAgent.toLowerCase()
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return { icon: Smartphone, label: 'Mobile' }
  return { icon: Monitor, label: 'Desktop' }
}

/** Format raw minutes → "Xh Ym" or "—" */
const fmtMins = (minutes: number) => {
  if (!minutes || minutes <= 0) return "—"
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export default function AdminAttendancePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDate, setFilterDate] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<AttendanceRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [traineesDialogOpen, setTraineesDialogOpen] = useState(false)
  const [addTraineeDialogOpen, setAddTraineeDialogOpen] = useState(false)
  const [trainees, setTrainees] = useState<Trainee[]>([])
  const [loadingTrainees, setLoadingTrainees] = useState(false)
  const [newTraineeName, setNewTraineeName] = useState("")
  const [submittingTrainee, setSubmittingTrainee] = useState(false)
  const [traineeToDelete, setTraineeToDelete] = useState<Trainee | null>(null)
  const [deleteTraineeDialogOpen, setDeleteTraineeDialogOpen] = useState(false)

  const [suspiciousActivities, setSuspiciousActivities] = useState<SuspiciousActivity[]>([])
  const [loadingSuspicious, setLoadingSuspicious] = useState(false)
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false)

  const [selectedTraineeName, setSelectedTraineeName] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    if (!token) { router.push("/admin/login"); return }
    fetchRecords(token)
    fetchTrainees()
    fetchSuspiciousActivity()
  }, [router])

  const fetchRecords = async (token: string) => {
    try {
      const response = await fetch("/api/admin/attendance")
      if (!response.ok) throw new Error("Failed to fetch attendance records")
      const data = await response.json()
      let recordsData: AttendanceRecord[] = []
      if (data.success && data.data) {
        if (data.data.data && Array.isArray(data.data.data)) recordsData = data.data.data
        else if (Array.isArray(data.data)) recordsData = data.data
      }
      setRecords(recordsData)
    } catch (error) {
      setMessage("Failed to load attendance records")
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  const fetchTrainees = async () => {
    setLoadingTrainees(true)
    try {
      const response = await fetch("/api/admin/trainees")
      if (!response.ok) throw new Error()
      const data = await response.json()
      setTrainees(data.trainees || [])
    } catch {
      toast({ title: "Error", description: "Failed to load registered trainees", variant: "destructive" })
    } finally {
      setLoadingTrainees(false)
    }
  }

  const fetchSuspiciousActivity = async () => {
    setLoadingSuspicious(true)
    try {
      const response = await fetch("/api/admin/analytics/suspicious")
      if (!response.ok) throw new Error()
      const data = await response.json()
      setSuspiciousActivities(data.records || [])
    } catch {
      // silent
    } finally {
      setLoadingSuspicious(false)
    }
  }

  // ─── HOURS COMPUTATION HELPERS ──────────────────────────────────────────────

  /**
   * Returns logged minutes for a single record, capped at MAX_DAILY_MINUTES (8h).
   * If the DB already has total_minutes, we trust it (but still cap it).
   * Otherwise we compute from time_in / time_out.
   */
  const getRecordMinutes = (record: AttendanceRecord): number => {
    if (record.total_minutes && record.total_minutes > 0)
      return Math.min(record.total_minutes, MAX_DAILY_MINUTES)
    if (!record.time_out) return 0
    const [inH, inM] = record.time_in.split(':').map(Number)
    const [outH, outM] = record.time_out.split(':').map(Number)
    const diff = (outH * 60 + outM) - (inH * 60 + inM)
    return diff > 0 ? Math.min(diff, MAX_DAILY_MINUTES) : 0
  }

  /** Returns total minutes across a list of records */
  const sumMinutes = (recs: AttendanceRecord[]) =>
    recs.reduce((sum, r) => sum + getRecordMinutes(r), 0)

  /**
   * Returns per-trainee hours map: { fullName → totalMinutes }
   * Includes any BONUS_MINUTES configured above.
   */
  const traineeHoursMap = React.useMemo(() => {
    const map: Record<string, number> = {}
    for (const r of records) {
      map[r.full_name] = (map[r.full_name] || 0) + getRecordMinutes(r)
    }
    // Apply per-trainee bonus minutes (approved exceptions)
    for (const [name, bonus] of Object.entries(BONUS_MINUTES)) {
      if (map[name] !== undefined) {
        map[name] += bonus
      }
    }
    return map
  }, [records])

  /** Progress percentage toward this trainee's required hours (capped at 100) */
  const hoursProgress = (minutes: number, traineeFullName: string) =>
    Math.min(100, Math.round((minutes / (getRequiredHours(traineeFullName) * 60)) * 100))

  /** Color class based on progress */
  const progressColor = (pct: number) => {
    if (pct >= 100) return "text-green-600"
    if (pct >= 60) return "text-blue-600"
    if (pct >= 30) return "text-yellow-600"
    return "text-orange-500"
  }

  // ────────────────────────────────────────────────────────────────────────────

  const handleAddTrainee = async () => {
    if (!newTraineeName.trim()) {
      toast({ title: "Name Required", description: "Please enter a trainee name", variant: "destructive" })
      return
    }
    setSubmittingTrainee(true)
    try {
      const response = await fetch("/api/admin/trainees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: newTraineeName.trim() }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to add trainee")
      toast({ title: "Success! 🎉", description: `${newTraineeName} has been registered!` })
      setNewTraineeName("")
      setAddTraineeDialogOpen(false)
      fetchTrainees()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add trainee", variant: "destructive" })
    } finally {
      setSubmittingTrainee(false)
    }
  }

  const handleDeleteTrainee = async () => {
    if (!traineeToDelete) return
    const token = localStorage.getItem("adminToken")
    if (!token) return
    setSubmittingTrainee(true)
    try {
      const response = await fetch(`/api/admin/trainees/${traineeToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error()
      toast({ title: "Success", description: `${traineeToDelete.full_name} has been removed` })
      setDeleteTraineeDialogOpen(false)
      setTraineeToDelete(null)
      fetchTrainees()
    } catch {
      toast({ title: "Error", description: "Failed to delete trainee", variant: "destructive" })
    } finally {
      setSubmittingTrainee(false)
    }
  }

  const handleDeleteRecord = async () => {
    if (!recordToDelete) return
    const token = localStorage.getItem("adminToken")
    if (!token) return
    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/attendance/${recordToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error()
      toast({ title: "Success", description: `Attendance record for ${recordToDelete.full_name} deleted successfully!` })
      setRecords(records.filter((r) => r.id !== recordToDelete.id))
      setDeleteDialogOpen(false)
      setRecordToDelete(null)
    } catch {
      toast({ title: "Error", description: "Failed to delete record. Please try again.", variant: "destructive" })
    } finally {
      setDeleting(false)
    }
  }

  const uniqueDates = Array.from(new Set(records.map(r => r.date))).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  )

  const filteredRecords = Array.isArray(records)
    ? records.filter((record) => {
        const matchesSearch =
          record.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.date?.includes(searchQuery)
        const matchesFilter =
          filterStatus === "all" ||
          (filterStatus === "completed" && record.time_out !== null) ||
          (filterStatus === "pending" && record.time_out === null)
        const matchesTrainee = selectedTraineeName === null || record.full_name === selectedTraineeName
        const matchesDate = filterDate === "all" || record.date === filterDate
        return matchesSearch && matchesFilter && matchesTrainee && matchesDate
      })
    : []

  const statsRecords = selectedTraineeName
    ? records.filter(r => r.full_name === selectedTraineeName)
    : records

  const totalMinutesInView = selectedTraineeName
    ? (traineeHoursMap[selectedTraineeName] || 0)
    : sumMinutes(statsRecords)

  const stats = {
    total: selectedTraineeName ? 1 : trainees.length,
    completed: statsRecords.filter((r) => r.time_out !== null).length,
    pending: statsRecords.filter((r) => r.time_out === null).length,
    totalMinutes: totalMinutesInView,
    totalHours: Math.floor(totalMinutesInView / 60),
    suspicious: suspiciousActivities.length,
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading attendance records...</p>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // ─── Selected trainee summary ────────────────────────────────────────────────
  const selectedTraineeMins = selectedTraineeName ? (traineeHoursMap[selectedTraineeName] || 0) : 0
  const selectedRequiredHours = selectedTraineeName ? getRequiredHours(selectedTraineeName) : OJT_DEFAULT_HOURS
  const selectedTraineePct = selectedTraineeName ? hoursProgress(selectedTraineeMins, selectedTraineeName) : 0
  const remainingMins = Math.max(0, selectedRequiredHours * 60 - selectedTraineeMins)

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-blue-900/10 dark:to-purple-950/10">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Clock className="h-8 w-8 sm:h-10 sm:w-10" />
                OJT Attendance Records
              </h1>
              <p className="text-blue-100">Manage and view all trainee attendance logs</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {/* Security Monitor */}
              <Dialog open={securityDialogOpen} onOpenChange={(open) => { setSecurityDialogOpen(open); if (open) fetchSuspiciousActivity() }}>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="bg-white hover:bg-gray-100 text-blue-900 relative">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Security Monitor
                    {stats.suspicious > 0 && <Badge className="ml-2 bg-red-500 text-white">{stats.suspicious}</Badge>}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                      <AlertTriangle className="h-6 w-6 text-orange-600" />
                      Security Monitoring
                    </DialogTitle>
                    <DialogDescription>Suspicious attendance patterns and potential policy violations</DialogDescription>
                  </DialogHeader>
                  {loadingSuspicious ? (
                    <div className="text-center py-12"><Loader className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" /><p className="text-sm text-muted-foreground">Analyzing activity...</p></div>
                  ) : suspiciousActivities.length === 0 ? (
                    <div className="text-center py-12">
                      <ShieldCheck className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <p className="text-lg font-semibold text-green-700">All Clear! ✅</p>
                      <p className="text-sm text-muted-foreground">No suspicious activity detected</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {suspiciousActivities.map((activity, index) => (
                        <Alert key={index} className={`border-2 ${getSeverityColor(activity.severity)}`}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle className="font-semibold">
                            {activity.type}
                            <Badge className="ml-2" variant="outline">{activity.severity.toUpperCase()}</Badge>
                          </AlertTitle>
                          <AlertDescription className="mt-2">
                            <p className="font-medium mb-2">{activity.reason}</p>
                            {activity.trainee && <p className="text-sm">Trainee: <strong>{activity.trainee}</strong></p>}
                            {activity.ip_count && <p className="text-sm">Different IPs used: <strong>{activity.ip_count}</strong></p>}
                            {activity.date && <p className="text-sm">Date: <strong>{formatDate(activity.date)}</strong></p>}
                            {activity.record && (
                              <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                                <p>Time In: {activity.record.time_in} | Time Out: {activity.record.time_out || 'N/A'}</p>
                                <p>Total: {fmtMins(activity.record.total_minutes || 0)}</p>
                              </div>
                            )}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Manage Trainees */}
              <Dialog open={traineesDialogOpen} onOpenChange={(open) => { setTraineesDialogOpen(open); if (open) fetchTrainees() }}>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="bg-white hover:bg-gray-100 text-blue-900">
                    <Users className="h-4 w-4 mr-2" />Manage Trainees
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                      <ShieldCheck className="h-6 w-6 text-blue-600" />Registered Trainees
                    </DialogTitle>
                    <DialogDescription>Manage who can access the attendance system</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Registered</p>
                          <p className="text-2xl font-bold text-blue-600">{trainees.length}</p>
                        </div>
                        <Dialog open={addTraineeDialogOpen} onOpenChange={setAddTraineeDialogOpen}>
                          <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                              <UserPlus className="h-4 w-4 mr-2" />Add Trainee
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add New Trainee</DialogTitle>
                              <DialogDescription>Register a new trainee to allow them access to the attendance system</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="trainee-name">Full Name</Label>
                                <Input id="trainee-name" placeholder="e.g. Juan dela Cruz" value={newTraineeName} onChange={(e) => setNewTraineeName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddTrainee()} />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setAddTraineeDialogOpen(false)} disabled={submittingTrainee}>Cancel</Button>
                              <Button onClick={handleAddTrainee} disabled={submittingTrainee}>
                                {submittingTrainee ? <><Loader className="h-4 w-4 mr-2 animate-spin" />Adding...</> : <><UserPlus className="h-4 w-4 mr-2" />Add Trainee</>}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    {loadingTrainees ? (
                      <div className="text-center py-8"><Loader className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" /><p className="text-sm text-muted-foreground">Loading trainees...</p></div>
                    ) : trainees.length === 0 ? (
                      <div className="text-center py-12"><Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" /><p className="text-muted-foreground font-medium">No registered trainees</p></div>
                    ) : (
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-800">
                              <TableHead>Name</TableHead>
                              <TableHead>Registered</TableHead>
                              <TableHead>Hours Logged</TableHead>
                              <TableHead>Progress</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {trainees.map((trainee) => {
                              const mins = traineeHoursMap[trainee.full_name] || 0
                              const reqHrs = getRequiredHours(trainee.full_name)
                              const pct = hoursProgress(mins, trainee.full_name)
                              return (
                                <TableRow key={trainee.id}>
                                  <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                                        {trainee.full_name?.charAt(0)?.toUpperCase()}
                                      </div>
                                      {trainee.full_name}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">{formatDate(trainee.created_at)}</TableCell>
                                  <TableCell>
                                    <span className={`font-bold ${progressColor(pct)}`}>{fmtMins(mins)}</span>
                                    <span className="text-xs text-muted-foreground ml-1">/ {reqHrs}h</span>
                                  </TableCell>
                                  <TableCell className="w-32">
                                    <div className="space-y-1">
                                      <Progress value={pct} className="h-2" />
                                      <p className="text-xs text-muted-foreground text-right">{pct}%</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Dialog open={deleteTraineeDialogOpen && traineeToDelete?.id === trainee.id} onOpenChange={setDeleteTraineeDialogOpen}>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" onClick={() => setTraineeToDelete(trainee)} className="border-red-200 hover:bg-red-50 hover:text-red-700">
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Remove Trainee</DialogTitle>
                                          <DialogDescription>Are you sure you want to remove <strong>{traineeToDelete?.full_name}</strong>? They will no longer be able to log attendance.</DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter className="mt-4">
                                          <Button variant="outline" onClick={() => setDeleteTraineeDialogOpen(false)} disabled={submittingTrainee}>Cancel</Button>
                                          <Button variant="destructive" onClick={handleDeleteTrainee} disabled={submittingTrainee}>
                                            {submittingTrainee ? <><Loader className="h-4 w-4 mr-2 animate-spin" />Removing...</> : <><Trash2 className="h-4 w-4 mr-2" />Remove</>}
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Link href="/admin/dashboard">
                <Button variant="secondary" className="bg-white hover:bg-gray-100 text-blue-900">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">

          {/* ── LEFT SIDEBAR ── */}
          <Card className="w-80 h-fit border-2 border-slate-200 dark:border-slate-800 shadow-lg sticky top-4">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-blue-900/10">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Filter by Trainee
              </CardTitle>
              <CardDescription>Click a name to filter records</CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              {loadingTrainees ? (
                <div className="text-center py-8"><Loader className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" /><p className="text-xs text-muted-foreground">Loading...</p></div>
              ) : trainees.length === 0 ? (
                <div className="text-center py-8"><Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" /><p className="text-xs text-muted-foreground">No trainees yet</p></div>
              ) : (
                <div className="space-y-2">
                  {/* All Trainees button */}
                  <Button
                    variant={selectedTraineeName === null ? "default" : "outline"}
                    className={`w-full justify-between ${selectedTraineeName === null ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" : "hover:bg-slate-50"}`}
                    onClick={() => { setSelectedTraineeName(null); setCurrentPage(1) }}
                  >
                    <span className="flex items-center gap-2"><Users className="h-4 w-4" /><span className="font-medium">All Trainees</span></span>
                    <Badge variant="secondary" className="ml-2">{trainees.length}</Badge>
                  </Button>

                  {/* Per-trainee buttons with mini progress */}
                  {trainees.map((trainee) => {
                    const mins = traineeHoursMap[trainee.full_name] || 0
                    const pct = hoursProgress(mins, trainee.full_name)
                    const isSelected = selectedTraineeName === trainee.full_name

                    return (
                      <button
                        key={trainee.id}
                        onClick={() => { setSelectedTraineeName(trainee.full_name); setCurrentPage(1) }}
                        className={`w-full text-left rounded-lg border-2 px-3 py-2.5 transition-all ${
                          isSelected
                            ? "border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30"
                            : "border-slate-200 hover:border-blue-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-blue-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                              {trainee.full_name?.charAt(0)?.toUpperCase()}
                            </div>
                            <span className="font-medium text-sm truncate">{trainee.full_name}</span>
                          </div>
                          {pct >= 100 && <Award className="h-4 w-4 text-green-500 flex-shrink-0" />}
                        </div>
                        {/* Mini progress bar */}
                        <div className="space-y-1">
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                pct >= 100 ? "bg-green-500" : pct >= 60 ? "bg-blue-500" : pct >= 30 ? "bg-yellow-500" : "bg-orange-400"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-xs font-semibold ${progressColor(pct)}`}>{fmtMins(mins)}</span>
                            <span className="text-xs text-muted-foreground">{pct}%</span>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── RIGHT CONTENT ── */}
          <div className="flex-1 space-y-6">

            {/* Active filter banner */}
            {selectedTraineeName && (
              <Alert className="border-2 border-blue-200 bg-blue-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="font-medium text-blue-900">
                      Showing records for: <strong>{selectedTraineeName}</strong>
                      {BONUS_MINUTES[selectedTraineeName] && (
                        <span className="ml-2 text-xs text-purple-600 font-normal">
                          (includes +{fmtMins(BONUS_MINUTES[selectedTraineeName])} approved exception)
                        </span>
                      )}
                    </AlertDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedTraineeName(null); setCurrentPage(1) }} className="text-blue-600 hover:text-blue-700 hover:bg-blue-100">
                    <X className="h-4 w-4 mr-1" />Clear Filter
                  </Button>
                </div>
              </Alert>
            )}

            {/* ── TRAINEE HOURS SUMMARY (shown when a trainee is selected) ── */}
            {selectedTraineeName && (
              <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">OJT Hours Progress</p>
                        <p className="text-xs text-muted-foreground">Target: {selectedRequiredHours} hours required</p>
                        {BONUS_MINUTES[selectedTraineeName] && (
                          <p className="text-xs text-purple-600 font-medium">+{fmtMins(BONUS_MINUTES[selectedTraineeName])} approved exception included</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-4 text-center">
                      <div>
                        <p className={`text-2xl font-bold ${progressColor(selectedTraineePct)}`}>{fmtMins(selectedTraineeMins)}</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                      <div className="w-px bg-slate-300" />
                      <div>
                        <p className="text-2xl font-bold text-slate-500">{fmtMins(remainingMins)}</p>
                        <p className="text-xs text-muted-foreground">Remaining</p>
                      </div>
                      <div className="w-px bg-slate-300" />
                      <div>
                        <p className={`text-2xl font-bold ${progressColor(selectedTraineePct)}`}>{selectedTraineePct}%</p>
                        <p className="text-xs text-muted-foreground">Complete</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <Progress value={selectedTraineePct} className="h-3" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0h</span>
                      <span className="font-medium">
                        {selectedTraineePct >= 100
                          ? "🎉 OJT requirement fulfilled!"
                          : `${fmtMins(remainingMins)} left to reach ${selectedRequiredHours}h goal`}
                      </span>
                      <span>{selectedRequiredHours}h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── STAT CARDS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className="border-2 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow bg-white/80 dark:bg-slate-900/80 backdrop-blur">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                        {selectedTraineeName ? "Selected Trainee" : "Registered Trainees"}
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow bg-white/80 dark:bg-slate-900/80 backdrop-blur">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Completed</p>
                      <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.completed}</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                      <LogOut className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ── TOTAL HOURS CARD ── */}
              <Card className="border-2 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow bg-white/80 dark:bg-slate-900/80 backdrop-blur">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Total Hours</p>
                      <p className="text-2xl sm:text-3xl font-bold text-purple-600">{fmtMins(stats.totalMinutes)}</p>
                      {selectedTraineeName && (
                        <p className="text-xs text-muted-foreground mt-0.5">{stats.totalHours}h of {selectedRequiredHours}h goal</p>
                      )}
                    </div>
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                      <Timer className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="border-2 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-shadow bg-white/80 dark:bg-slate-900/80 backdrop-blur cursor-pointer"
                onClick={() => setSecurityDialogOpen(true)}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Suspicious</p>
                      <p className="text-2xl sm:text-3xl font-bold text-orange-600">{stats.suspicious}</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                      <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {message && (
              <Alert className="mb-6 border-2" variant={message.includes("successfully") ? "default" : "destructive"}>
                <AlertDescription className="font-medium">{message}</AlertDescription>
              </Alert>
            )}

            {/* ── RECORDS TABLE ── */}
            <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur">
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-blue-900/10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                      <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      {selectedTraineeName ? `${selectedTraineeName}'s Records` : "All Records"}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Showing {filteredRecords.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filteredRecords.length)} of {filteredRecords.length}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 sm:min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search by name or date..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }} className="pl-9 border-2" />
                    </div>
                    <Select value={filterDate} onValueChange={(value) => { setFilterDate(value); setCurrentPage(1) }}>
                      <SelectTrigger className="w-full sm:w-[180px] border-2">
                        <Calendar className="h-4 w-4 mr-2" /><SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[100] bg-white dark:bg-slate-900 border-2 shadow-xl max-h-[300px] overflow-y-auto">
                        <SelectItem value="all">All Dates</SelectItem>
                        {uniqueDates.map((date) => <SelectItem key={date} value={date}>{formatDate(date)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={(value) => { setFilterStatus(value); setCurrentPage(1) }}>
                      <SelectTrigger className="w-full sm:w-[180px] border-2">
                        <Filter className="h-4 w-4 mr-2" /><SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[100] bg-white dark:bg-slate-900 border-2 shadow-xl">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-hidden">
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <TableHead className="font-semibold">Name</TableHead>
                        <TableHead className="font-semibold hidden md:table-cell">Date</TableHead>
                        <TableHead className="font-semibold">Time In</TableHead>
                        <TableHead className="font-semibold">Time Out</TableHead>
                        <TableHead className="font-semibold hidden lg:table-cell">Duration</TableHead>
                        <TableHead className="font-semibold hidden xl:table-cell">IP Address</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12">
                            <div className="flex flex-col items-center gap-2">
                              <Clock className="h-12 w-12 text-muted-foreground/50" />
                              <p className="text-muted-foreground font-medium">No attendance records found</p>
                              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedRecords.map((record) => {
                          const deviceInfo = getDeviceType(record.user_agent)
                          const DeviceIcon = deviceInfo.icon
                          const recMins = getRecordMinutes(record)

                          return (
                            <TableRow key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                                    {record.full_name?.charAt(0)?.toUpperCase() || "?"}
                                  </div>
                                  <span className="truncate">{record.full_name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  {formatDate(record.date)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-sm">
                                  <LogIn className="h-4 w-4 text-green-600" />{record.time_in}
                                </div>
                              </TableCell>
                              <TableCell>
                                {record.time_out
                                  ? <div className="flex items-center gap-1 text-sm"><LogOut className="h-4 w-4 text-blue-600" />{record.time_out}</div>
                                  : <span className="text-muted-foreground text-sm">—</span>}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <Badge variant="outline" className="font-mono">{fmtMins(recMins)}</Badge>
                              </TableCell>
                              <TableCell className="hidden xl:table-cell">
                                <div className="flex items-center gap-2">
                                  <Wifi className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs font-mono text-muted-foreground">{record.ip_address || 'N/A'}</span>
                                  <DeviceIcon className="h-3 w-3 text-muted-foreground" />
                                </div>
                              </TableCell>
                              <TableCell>
                                {record.time_out
                                  ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100">Completed</Badge>
                                  : <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100">Pending</Badge>}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {/* View dialog */}
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm" onClick={() => setSelectedRecord(record)} className="border-2 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:hover:bg-blue-900/20">
                                        <Eye className="h-4 w-4" /><span className="hidden sm:inline ml-1">View</span>
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl border-2">
                                      <DialogHeader>
                                        <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
                                          <User className="h-6 w-6 text-blue-600" />Attendance Details
                                        </DialogTitle>
                                        <DialogDescription>Record created: {formatDateTime(selectedRecord?.created_at || "")}</DialogDescription>
                                      </DialogHeader>
                                      {selectedRecord && (
                                        <div className="space-y-4 text-sm">
                                          <div className="grid grid-cols-2 gap-4 border-b pb-4">
                                            <div><p className="font-semibold text-slate-700 mb-1">Full Name</p><p>{selectedRecord.full_name}</p></div>
                                            <div><p className="font-semibold text-slate-700 mb-1">Date</p><p>{formatDate(selectedRecord.date)}</p></div>
                                          </div>
                                          <div className="grid grid-cols-2 gap-4 border-b pb-4">
                                            <div>
                                              <p className="font-semibold text-slate-700 mb-1 flex items-center gap-1"><LogIn className="h-4 w-4 text-green-600" />Time In</p>
                                              <p className="text-lg font-mono">{selectedRecord.time_in}</p>
                                            </div>
                                            <div>
                                              <p className="font-semibold text-slate-700 mb-1 flex items-center gap-1"><LogOut className="h-4 w-4 text-blue-600" />Time Out</p>
                                              <p className="text-lg font-mono">{selectedRecord.time_out || "Not yet recorded"}</p>
                                            </div>
                                          </div>
                                          <div className="border-b pb-4">
                                            <p className="font-semibold text-slate-700 mb-1 flex items-center gap-1"><Clock className="h-4 w-4 text-purple-600" />This Session</p>
                                            <p className="text-2xl font-bold text-purple-600">{fmtMins(getRecordMinutes(selectedRecord))}</p>
                                            {selectedRecord.total_minutes && selectedRecord.total_minutes > MAX_DAILY_MINUTES && (
                                              <p className="text-xs text-orange-500 mt-1">Capped at 8h max per day (raw: {fmtMins(selectedRecord.total_minutes)})</p>
                                            )}
                                          </div>
                                          {/* Cumulative total for this trainee */}
                                          <div className="border-b pb-4 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                                            <p className="font-semibold text-slate-700 mb-2 flex items-center gap-1"><TrendingUp className="h-4 w-4 text-purple-600" />Cumulative OJT Hours ({selectedRecord.full_name})</p>
                                            {BONUS_MINUTES[selectedRecord.full_name] && (
                                              <p className="text-xs text-purple-600 mb-2">Includes +{fmtMins(BONUS_MINUTES[selectedRecord.full_name])} approved exception</p>
                                            )}
                                            <div className="flex items-center gap-4">
                                              <div>
                                                <p className={`text-xl font-bold ${progressColor(hoursProgress(traineeHoursMap[selectedRecord.full_name] || 0, selectedRecord.full_name))}`}>
                                                  {fmtMins(traineeHoursMap[selectedRecord.full_name] || 0)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">of {getRequiredHours(selectedRecord.full_name)}h required</p>
                                              </div>
                                              <div className="flex-1">
                                                <Progress value={hoursProgress(traineeHoursMap[selectedRecord.full_name] || 0, selectedRecord.full_name)} className="h-2" />
                                                <p className="text-xs text-right text-muted-foreground mt-1">{hoursProgress(traineeHoursMap[selectedRecord.full_name] || 0, selectedRecord.full_name)}%</p>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="grid grid-cols-2 gap-4 border-b pb-4 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                            <div>
                                              <p className="font-semibold text-slate-700 mb-1 flex items-center gap-1"><Wifi className="h-4 w-4 text-blue-600" />IP Address</p>
                                              <p className="font-mono text-sm">{selectedRecord.ip_address || 'N/A'}</p>
                                            </div>
                                            <div>
                                              <p className="font-semibold text-slate-700 mb-1 flex items-center gap-1">
                                                {React.createElement(getDeviceType(selectedRecord.user_agent).icon, { className: "h-4 w-4 text-blue-600" })}Device
                                              </p>
                                              <p className="text-sm">{getDeviceType(selectedRecord.user_agent).label}</p>
                                            </div>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-slate-700 mb-1">Status</p>
                                            {selectedRecord.time_out
                                              ? <Badge className="bg-green-100 text-green-800">Completed</Badge>
                                              : <Badge className="bg-yellow-100 text-yellow-800">Pending Time Out</Badge>}
                                          </div>
                                        </div>
                                      )}
                                    </DialogContent>
                                  </Dialog>

                                  {/* Delete dialog */}
                                  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm" onClick={() => setRecordToDelete(record)} className="border-2 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-900/20">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Delete Attendance Record</DialogTitle>
                                        <DialogDescription>
                                          Are you sure you want to delete the attendance record for {recordToDelete?.full_name} on {formatDate(recordToDelete?.date || "")}? This action cannot be undone.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="flex gap-3 mt-6">
                                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>Cancel</Button>
                                        <Button variant="destructive" onClick={handleDeleteRecord} disabled={deleting}>
                                          {deleting && <Loader className="h-4 w-4 mr-2 animate-spin" />}Delete
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium">Page {currentPage} of {totalPages}</div>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
