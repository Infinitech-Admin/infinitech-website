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
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader,
  BarChart3,
  Filter,
  Search,
  Calendar,
  Clock,
  Trash2,
  Download,
  LogIn,
  LogOut,
  User,
  UserPlus,
  Users,
  ShieldCheck,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AttendanceRecord {
  id: number
  full_name: string
  date: string
  time_in: string
  time_out: string | null
  total_minutes: number | null
  created_at: string
  updated_at: string
}

interface Trainee {
  id: number
  full_name: string
  created_at: string
}

const ITEMS_PER_PAGE = 10

// Date formatting helpers
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export default function AdminAttendancePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all") // all, completed, pending
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<AttendanceRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Trainee management states
  const [traineesDialogOpen, setTraineesDialogOpen] = useState(false)
  const [addTraineeDialogOpen, setAddTraineeDialogOpen] = useState(false)
  const [trainees, setTrainees] = useState<Trainee[]>([])
  const [loadingTrainees, setLoadingTrainees] = useState(false)
  const [newTraineeName, setNewTraineeName] = useState("")
  const [submittingTrainee, setSubmittingTrainee] = useState(false)
  const [traineeToDelete, setTraineeToDelete] = useState<Trainee | null>(null)
  const [deleteTraineeDialogOpen, setDeleteTraineeDialogOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    if (!token) {
      router.push("/admin/login")
      return
    }

    fetchRecords(token)
  }, [router])

  // Find this function in your component (around line 159)
const fetchRecords = async (token: string) => {
  try {
    const response = await fetch("/api/admin/attendance", {
      // Remove the Authorization header completely
      // headers: {
      //   Authorization: `Bearer ${token}`,
      // },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch attendance records")
    }

    const data = await response.json()

    let recordsData = []
    if (data.success && data.data) {
      if (data.data.data && Array.isArray(data.data.data)) {
        recordsData = data.data.data
      } else if (Array.isArray(data.data)) {
        recordsData = data.data
      }
    }

    setRecords(recordsData)
  } catch (error) {
    console.error("Error fetching records:", error)
    setMessage("Failed to load attendance records")
    setRecords([])
  } finally {
    setLoading(false)
  }
}

 // Find this function (around line 181)
const fetchTrainees = async () => {
  const token = localStorage.getItem("adminToken")
  if (!token) return

  setLoadingTrainees(true)
  try {
    const response = await fetch("/api/admin/trainees", {
      // Remove the Authorization header
      // headers: {
      //   Authorization: `Bearer ${token}`,
      // },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch trainees")
    }

    const data = await response.json()
    setTrainees(data.trainees || [])
  } catch (error) {
    console.error("Error fetching trainees:", error)
    toast({
      title: "Error",
      description: "Failed to load registered trainees",
      variant: "destructive",
    })
  } finally {
    setLoadingTrainees(false)
  }
}

// Around line 207
const handleAddTrainee = async () => {
  if (!newTraineeName.trim()) {
    toast({
      title: "Name Required",
      description: "Please enter a trainee name",
      variant: "destructive",
    })
    return
  }

  const token = localStorage.getItem("adminToken")
  if (!token) return

  setSubmittingTrainee(true)
  try {
    const response = await fetch("/api/admin/trainees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Remove Authorization header
      },
      body: JSON.stringify({ full_name: newTraineeName.trim() }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to add trainee")
    }

    toast({
      title: "Success! 🎉",
      description: `${newTraineeName} has been registered!`,
    })

    setNewTraineeName("")
    setAddTraineeDialogOpen(false)
    fetchTrainees()
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message || "Failed to add trainee",
      variant: "destructive",
    })
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete trainee")
      }

      toast({
        title: "Success",
        description: `${traineeToDelete.full_name} has been removed`,
      })

      setDeleteTraineeDialogOpen(false)
      setTraineeToDelete(null)
      fetchTrainees() // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete trainee",
        variant: "destructive",
      })
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete record")
      }

      toast({
        title: "Success",
        description: `Attendance record for ${recordToDelete.full_name} deleted successfully!`,
        variant: "default",
      })

      setRecords(records.filter((r) => r.id !== recordToDelete.id))
      setDeleteDialogOpen(false)
      setRecordToDelete(null)
    } catch (error) {
      console.error("Error deleting record:", error)
      toast({
        title: "Error",
        description: "Failed to delete record. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  // Helper function to calculate minutes from time strings
  const calculateMinutes = (timeIn: string, timeOut: string | null) => {
    if (!timeOut) return 0;
    
    const [inHour, inMin] = timeIn.split(':').map(Number);
    const [outHour, outMin] = timeOut.split(':').map(Number);
    const totalMins = (outHour * 60 + outMin) - (inHour * 60 + inMin);
    
    return totalMins > 0 ? totalMins : 0;
  };

  // Helper function to get actual minutes for a record
  const getActualMinutes = (record: AttendanceRecord): number => {
    if (record.total_minutes) {
      return record.total_minutes;
    }
    return calculateMinutes(record.time_in, record.time_out);
  };

  // Format minutes to hours and minutes display
  const formatHoursMinutes = (minutes: number | null, timeIn?: string | null, timeOut?: string | null) => {
    let totalMinutes = minutes;
    
    // If minutes is null but we have time_in and time_out, calculate it
    if (!totalMinutes && timeIn && timeOut) {
      totalMinutes = calculateMinutes(timeIn, timeOut);
    }
    
    if (!totalMinutes || totalMinutes === 0) return "—";
    
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h ${mins}m`;
  };

  const filteredRecords = Array.isArray(records)
    ? records.filter((record) => {
        const matchesSearch =
          record.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.date?.includes(searchQuery)

        const matchesFilter =
          filterStatus === "all" ||
          (filterStatus === "completed" && record.time_out !== null) ||
          (filterStatus === "pending" && record.time_out === null)

        return matchesSearch && matchesFilter
      })
    : []

  const stats = {
    total: Array.isArray(records) ? records.length : 0,
    completed: Array.isArray(records) ? records.filter((r) => r.time_out !== null).length : 0,
    pending: Array.isArray(records) ? records.filter((r) => r.time_out === null).length : 0,
    totalHours: Array.isArray(records)
      ? Math.floor(records.reduce((sum, r) => sum + getActualMinutes(r), 0) / 60)
      : 0,
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
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex)

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-blue-900/10 dark:to-purple-950/10">
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
            <div className="flex gap-2">
              {/* Manage Trainees Button */}
              <Dialog open={traineesDialogOpen} onOpenChange={(open) => {
                setTraineesDialogOpen(open)
                if (open) fetchTrainees()
              }}>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="bg-white hover:bg-gray-100 text-blue-900">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Trainees
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                      <ShieldCheck className="h-6 w-6 text-blue-600" />
                      Registered Trainees
                    </DialogTitle>
                    <DialogDescription>
                      Manage who can access the attendance system
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    {/* Stats */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Registered</p>
                          <p className="text-2xl font-bold text-blue-600">{trainees.length}</p>
                        </div>
                        <Dialog open={addTraineeDialogOpen} onOpenChange={setAddTraineeDialogOpen}>
                          <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                              <UserPlus className="h-4 w-4 mr-2" />
                              Add Trainee
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add New Trainee</DialogTitle>
                              <DialogDescription>
                                Register a new trainee to allow them access to the attendance system
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="trainee-name">Full Name</Label>
                                <Input
                                  id="trainee-name"
                                  placeholder="e.g. Juan dela Cruz"
                                  value={newTraineeName}
                                  onChange={(e) => setNewTraineeName(e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && handleAddTrainee()}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setAddTraineeDialogOpen(false)}
                                disabled={submittingTrainee}
                              >
                                Cancel
                              </Button>
                              <Button onClick={handleAddTrainee} disabled={submittingTrainee}>
                                {submittingTrainee ? (
                                  <>
                                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                                    Adding...
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add Trainee
                                  </>
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    {/* Trainees List */}
                    {loadingTrainees ? (
                      <div className="text-center py-8">
                        <Loader className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                        <p className="text-sm text-muted-foreground">Loading trainees...</p>
                      </div>
                    ) : trainees.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                        <p className="text-muted-foreground font-medium">No registered trainees</p>
                        <p className="text-sm text-muted-foreground">Add your first trainee to get started</p>
                      </div>
                    ) : (
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-800">
                              <TableHead>Name</TableHead>
                              <TableHead>Registered</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {trainees.map((trainee) => (
                              <TableRow key={trainee.id}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                                      {trainee.full_name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    {trainee.full_name}
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {formatDate(trainee.created_at)}
                                </TableCell>
                                <TableCell>
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                    Active
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Dialog open={deleteTraineeDialogOpen && traineeToDelete?.id === trainee.id} onOpenChange={setDeleteTraineeDialogOpen}>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setTraineeToDelete(trainee)}
                                        className="border-red-200 hover:bg-red-50 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Remove Trainee</DialogTitle>
                                        <DialogDescription>
                                          Are you sure you want to remove <strong>{traineeToDelete?.full_name}</strong>? 
                                          They will no longer be able to log attendance.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <DialogFooter className="mt-4">
                                        <Button
                                          variant="outline"
                                          onClick={() => setDeleteTraineeDialogOpen(false)}
                                          disabled={submittingTrainee}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          onClick={handleDeleteTrainee}
                                          disabled={submittingTrainee}
                                        >
                                          {submittingTrainee ? (
                                            <>
                                              <Loader className="h-4 w-4 mr-2 animate-spin" />
                                              Removing...
                                            </>
                                          ) : (
                                            <>
                                              <Trash2 className="h-4 w-4 mr-2" />
                                              Remove
                                            </>
                                          )}
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Link href="/admin/dashboard">
                <Button variant="secondary" className="bg-white hover:bg-gray-100 text-blue-900">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="border-2 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow bg-white/80 dark:bg-slate-900/80 backdrop-blur">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Total Records</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
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

          <Card className="border-2 border-yellow-200 dark:border-yellow-800 hover:shadow-lg transition-shadow bg-white/80 dark:bg-slate-900/80 backdrop-blur">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Pending</p>
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow bg-white/80 dark:bg-slate-900/80 backdrop-blur">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Total Hours</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.totalHours}h</p>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
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

        {/* Records Table */}
        <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-blue-900/10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  All Records
                </CardTitle>
                <CardDescription className="mt-1">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredRecords.length)} of {filteredRecords.length}
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or date..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-9 border-2"
                  />
                </div>
                <Select
                  value={filterStatus}
                  onValueChange={(value) => {
                    setFilterStatus(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[180px] border-2">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
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
                    <TableHead className="font-semibold hidden lg:table-cell">Total Hours</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Clock className="h-12 w-12 text-muted-foreground/50" />
                          <p className="text-muted-foreground font-medium">No attendance records found</p>
                          <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRecords.map((record) => (
                      <TableRow
                        key={record.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                      >
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
                            <LogIn className="h-4 w-4 text-green-600" />
                            {record.time_in}
                          </div>
                        </TableCell>
                        <TableCell>
                          {record.time_out ? (
                            <div className="flex items-center gap-1 text-sm">
                              <LogOut className="h-4 w-4 text-blue-600" />
                              {record.time_out}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="outline" className="font-mono">
                            {formatHoursMinutes(record.total_minutes, record.time_in, record.time_out)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {record.time_out ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100">
                              Completed
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedRecord(record)}
                                  className="border-2 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:hover:bg-blue-900/20"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="hidden sm:inline ml-1">View</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl border-2">
                                <DialogHeader>
                                  <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
                                    <User className="h-6 w-6 text-blue-600" />
                                    Attendance Details
                                  </DialogTitle>
                                  <DialogDescription>
                                    Record created: {formatDateTime(selectedRecord?.created_at || "")}
                                  </DialogDescription>
                                </DialogHeader>

                                {selectedRecord && (
                                  <div className="space-y-4 text-sm">
                                    <div className="grid grid-cols-2 gap-4 border-b pb-4">
                                      <div>
                                        <p className="font-semibold text-slate-700 mb-1">Full Name</p>
                                        <p>{selectedRecord.full_name}</p>
                                      </div>
                                      <div>
                                        <p className="font-semibold text-slate-700 mb-1">Date</p>
                                        <p>{formatDate(selectedRecord.date)}</p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 border-b pb-4">
                                      <div>
                                        <p className="font-semibold text-slate-700 mb-1 flex items-center gap-1">
                                          <LogIn className="h-4 w-4 text-green-600" />
                                          Time In
                                        </p>
                                        <p className="text-lg font-mono">{selectedRecord.time_in}</p>
                                      </div>
                                      <div>
                                        <p className="font-semibold text-slate-700 mb-1 flex items-center gap-1">
                                          <LogOut className="h-4 w-4 text-blue-600" />
                                          Time Out
                                        </p>
                                        <p className="text-lg font-mono">
                                          {selectedRecord.time_out || "Not yet recorded"}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="border-b pb-4">
                                      <p className="font-semibold text-slate-700 mb-1 flex items-center gap-1">
                                        <Clock className="h-4 w-4 text-purple-600" />
                                        Total Hours
                                      </p>
                                      <p className="text-2xl font-bold text-purple-600">
                                        {formatHoursMinutes(selectedRecord.total_minutes, selectedRecord.time_in, selectedRecord.time_out)}
                                      </p>
                                    </div>

                                    <div>
                                      <p className="font-semibold text-slate-700 mb-1">Status</p>
                                      {selectedRecord.time_out ? (
                                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                                      ) : (
                                        <Badge className="bg-yellow-100 text-yellow-800">Pending Time Out</Badge>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setRecordToDelete(record)}
                                  className="border-2 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete Attendance Record</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete the attendance record for{" "}
                                    {recordToDelete?.full_name} on {formatDate(recordToDelete?.date || "")}? This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex gap-3 mt-6">
                                  <Button
                                    variant="outline"
                                    onClick={() => setDeleteDialogOpen(false)}
                                    disabled={deleting}
                                  >
                                    Cancel
                                  </Button>
                                  <Button variant="destructive" onClick={handleDeleteRecord} disabled={deleting}>
                                    {deleting ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : null}
                                    Delete
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
