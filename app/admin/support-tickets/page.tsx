"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  MessageSquare,
  Filter,
  Search,
  Calendar,
  Crown,
  Check,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface SupportTicket {
  id: number
  name: string
  email: string
  category: string
  subject: string
  message: string
  status: string
  ticket_number: string
  current_page: string
  domain: string
  created_at: string
}

const ITEMS_PER_PAGE = 10

export default function AdminSupportTicketsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [replyMessage, setReplyMessage] = useState("")
  const [newStatus, setNewStatus] = useState("")
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    if (!token) {
      router.push("/admin/login")
      return
    }
    fetchTickets()
  }, [router])

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/support-tickets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch tickets")
      }
      const data = await response.json()
      setTickets(data.data || [])
    } catch (error) {
      console.error("Error fetching tickets:", error)
      setMessage("Failed to load tickets")
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) {
      setMessage("Please enter a reply message")
      return
    }

    setSending(true)
    try {
      console.log("📤 Sending reply for ticket:", selectedTicket.ticket_number)
      const response = await fetch("/api/admin/support-tickets/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          ticket_number: selectedTicket.ticket_number,
          email: selectedTicket.email,
          message: replyMessage,
          subject: selectedTicket.subject,
          status: newStatus || selectedTicket.status,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        console.error("❌ Reply failed:", data)
        throw new Error(data.message || "Failed to send reply")
      }

      console.log("✅ Reply sent successfully")
      setMessage("Reply sent successfully!")
      setReplyMessage("")
      setNewStatus("")
      fetchTickets()
      setTimeout(() => {
        setSelectedTicket(null)
        setMessage("")
      }, 2000)
    } catch (error) {
      console.error("💥 Error in handleReply:", error)
      setMessage(error instanceof Error ? error.message : "Failed to send reply")
    } finally {
      setSending(false)
    }
  }

  const handleStatusChange = async (ticketId: number, status: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/support-tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) {
        throw new Error("Failed to update status")
      }
      fetchTickets()
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || ticket.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Sort tickets: VIP (izakaya domains) first, then by creation date
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    const aIsVIP = a.domain.toLowerCase().includes("izakaya")
    const bIsVIP = b.domain.toLowerCase().includes("izakaya")
    // VIP tickets come first
    if (aIsVIP && !bIsVIP) return -1
    if (!aIsVIP && bIsVIP) return 1
    // If both are VIP or both are normal, sort by date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    vip: tickets.filter((t) => t.domain.toLowerCase().includes("izakaya")).length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tickets...</p>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil(sortedTickets.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedTickets = sortedTickets.slice(startIndex, endIndex)

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      bug_report: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
      feature_request: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      general_feedback:
        "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      menu_question: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      other: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800",
    }
    return colors[category] || colors.other
  }

  const isVIPTicket = (domain: string) => {
    return domain.toLowerCase().includes("izakaya")
  }

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
      in_progress: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
      resolved: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
      closed: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800",
    }
    return colors[status] || colors.open
  }

  const getStatusTriggerColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-red-100 hover:bg-red-200 dark:bg-red-950 dark:hover:bg-red-900 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800",
      in_progress:
        "bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-950 dark:hover:bg-yellow-900 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800",
      resolved:
        "bg-green-100 hover:bg-green-200 dark:bg-green-950 dark:hover:bg-green-900 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800",
      closed:
        "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700",
    }
    return colors[status] || colors.open
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/20 dark:from-slate-950 dark:via-cyan-900/10 dark:to-blue-950/10">
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-900 dark:to-blue-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10" />
                Support Tickets
              </h1>
              <p className="text-cyan-100">Manage and respond to customer inquiries</p>
            </div>
            <Link href="/admin/dashboard">
              <Button variant="secondary" className="bg-white hover:bg-gray-100 text-cyan-900">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="border-2 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow bg-white/80 dark:bg-slate-900/80 backdrop-blur">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Total Tickets</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-200 dark:border-red-800 hover:shadow-lg transition-shadow bg-white/80 dark:bg-slate-900/80 backdrop-blur">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Open</p>
                  <p className="text-2xl sm:text-3xl font-bold text-red-600">{stats.open}</p>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                  <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-200 dark:border-yellow-800 hover:shadow-lg transition-shadow bg-white/80 dark:bg-slate-900/80 backdrop-blur">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">In Progress</p>
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow bg-white/80 dark:bg-slate-900/80 backdrop-blur">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Resolved</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.resolved}</p>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <Card className="border-2 border-amber-200 dark:border-amber-800 hover:shadow-lg transition-shadow bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/50 dark:to-yellow-950/50 backdrop-blur">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    VIP Tickets (Izakaya Domains)
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.vip}</p>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl">
                  <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
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

        <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-cyan-50/30 dark:from-slate-800 dark:to-cyan-900/10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-600" />
                  All Tickets
                </CardTitle>
                <CardDescription className="mt-1">
                  Showing {startIndex + 1}-{Math.min(endIndex, sortedTickets.length)} of {sortedTickets.length}
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 border-2"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[150px] border-2">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden">
            <div className="w-full overflow-x-auto">
              <div className="overflow-visible">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <TableHead className="font-semibold">Priority</TableHead>
                      <TableHead className="font-semibold">Ticket Number</TableHead>
                      <TableHead className="font-semibold">Subject</TableHead>
                      <TableHead className="font-semibold hidden md:table-cell">From</TableHead>
                      <TableHead className="font-semibold hidden xl:table-cell">Domain</TableHead>
                      <TableHead className="font-semibold hidden lg:table-cell">Category</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold hidden sm:table-cell">Date</TableHead>
                      <TableHead className="font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTickets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2">
                            <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
                            <p className="text-muted-foreground font-medium">No tickets found</p>
                            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedTickets.map((ticket) => (
                        <TableRow
                          key={ticket.id}
                          className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${isVIPTicket(ticket.domain) ? "bg-amber-50/30 dark:bg-amber-950/10" : ""}`}
                        >
                          <TableCell>
                            {isVIPTicket(ticket.domain) ? (
                              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 font-semibold flex items-center gap-1 w-fit">
                                <Crown className="h-3 w-3" />
                                VIP
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 font-medium"
                              >
                                Normal
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium max-w-xs">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-cyan-500 flex-shrink-0"></div>
                              <span className="truncate">{ticket.ticket_number}</span>
                            </div>
                            <div className="md:hidden text-xs text-muted-foreground mt-1">{ticket.name}</div>
                          </TableCell>
                          <TableCell className="font-medium max-w-xs">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-cyan-500 flex-shrink-0"></div>
                              <span className="truncate">{ticket.subject}</span>
                            </div>
                            <div className="md:hidden text-xs text-muted-foreground mt-1">{ticket.name}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                                {ticket.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm truncate">{ticket.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 font-medium whitespace-nowrap"
                              >
                                {ticket.domain || "N/A"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge
                              className={`${getCategoryBadgeColor(ticket.category)} border font-medium whitespace-nowrap`}
                              variant="outline"
                            >
                              {ticket.category.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={`w-28 sm:w-36 border-2 text-xs sm:text-sm font-medium justify-between ${getStatusTriggerColor(ticket.status)}`}
                                >
                                  <span className="capitalize">{ticket.status.replace("_", " ")}</span>
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-48 p-2 z-[9999] bg-white dark:bg-slate-900 border-2 shadow-xl" align="start">
                                <div className="space-y-1">
                                  <button
                                    onClick={() => handleStatusChange(ticket.id, "open")}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                                      ticket.status === "open"
                                        ? "bg-red-500 text-white"
                                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900"
                                    }`}
                                  >
                                    {ticket.status === "open" && <Check className="h-4 w-4" />}
                                    Open
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(ticket.id, "in_progress")}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                                      ticket.status === "in_progress"
                                        ? "bg-yellow-500 text-white"
                                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900"
                                    }`}
                                  >
                                    {ticket.status === "in_progress" && <Check className="h-4 w-4" />}
                                    In Progress
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(ticket.id, "resolved")}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                                      ticket.status === "resolved"
                                        ? "bg-green-500 text-white"
                                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900"
                                    }`}
                                  >
                                    {ticket.status === "resolved" && <Check className="h-4 w-4" />}
                                    Resolved
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(ticket.id, "closed")}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                                      ticket.status === "closed"
                                        ? "bg-slate-500 text-white"
                                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900"
                                    }`}
                                  >
                                    {ticket.status === "closed" && <Check className="h-4 w-4" />}
                                    Closed
                                  </button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {new Date(ticket.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Dialog
                              open={selectedTicket?.ticket_number === ticket.ticket_number}
                              onOpenChange={(open) => !open && setSelectedTicket(null)}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedTicket(ticket)}
                                  className="border-2 border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 dark:border-cyan-800 dark:hover:bg-cyan-900/20 text-xs sm:text-sm whitespace-nowrap"
                                >
                                  View &amp; Reply
                                </Button>
                              </DialogTrigger>
                              {selectedTicket?.ticket_number === ticket.ticket_number && (
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-2 z-[9999]">
                                  <DialogHeader>
                                    <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
                                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-medium flex-shrink-0">
                                        #{ticket.id}
                                      </div>
                                      <span className="truncate">Ticket #{ticket.ticket_number}</span>
                                      {isVIPTicket(ticket.domain) && (
                                        <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 font-semibold flex items-center gap-1">
                                          <Crown className="h-3 w-3" />
                                          VIP
                                        </Badge>
                                      )}
                                    </DialogTitle>
                                    <DialogDescription className="text-base">{ticket.subject}</DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="bg-gradient-to-br from-slate-50 to-cyan-50/30 dark:from-slate-800 dark:to-cyan-900/10 p-4 sm:p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700">
                                      <div className="flex items-start gap-3 mb-4">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-medium flex-shrink-0">
                                          {ticket.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <h3 className="font-semibold text-base sm:text-lg truncate">{ticket.name}</h3>
                                          <p className="text-sm text-muted-foreground truncate">{ticket.email}</p>
                                        </div>
                                      </div>
                                      <p className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                                        {ticket.message}
                                      </p>
                                      {ticket.current_page && (
                                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                          <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                                            <span className="font-medium">Page:</span>
                                            <span className="font-mono bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded break-all">
                                              {ticket.current_page}
                                            </span>
                                          </p>
                                        </div>
                                      )}
                                      {ticket.domain && (
                                        <div
                                          className={`${ticket.current_page ? "mt-2" : "mt-4 pt-4 border-t border-slate-200 dark:border-slate-700"}`}
                                        >
                                          <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                                            <span className="font-medium">Domain:</span>
                                            <span className="font-mono bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded break-all">
                                              {ticket.domain}
                                            </span>
                                            {isVIPTicket(ticket.domain) && (
                                              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 text-xs font-semibold flex items-center gap-1">
                                                <Crown className="h-3 w-3" />
                                                VIP Priority
                                              </Badge>
                                            )}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                    <div className="space-y-3">
                                      <label className="text-sm font-semibold flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Update Status
                                      </label>
                                      <Select value={newStatus || ticket.status} onValueChange={setNewStatus}>
                                        <SelectTrigger className="border-2">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="z-[9999]">
                                          <SelectItem value="open">Open</SelectItem>
                                          <SelectItem value="in_progress">In Progress</SelectItem>
                                          <SelectItem value="resolved">Resolved</SelectItem>
                                          <SelectItem value="closed">Closed</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-3">
                                      <label htmlFor="reply" className="text-sm font-semibold flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        Reply Message
                                      </label>
                                      <Textarea
                                        id="reply"
                                        placeholder="Type your reply here..."
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        className="min-h-32 border-2 focus:ring-2 focus:ring-cyan-500"
                                      />
                                    </div>
                                    <Button
                                      onClick={handleReply}
                                      disabled={sending || !replyMessage.trim()}
                                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white h-12 text-base font-semibold"
                                    >
                                      {sending ? (
                                        <>
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                          Sending...
                                        </>
                                      ) : (
                                        <>
                                          <Mail className="h-4 w-4 mr-2" />
                                          Send Reply
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </DialogContent>
                              )}
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-6 border-t bg-slate-50/50 dark:bg-slate-800/20">
                <p className="text-sm text-muted-foreground font-medium">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="border-2"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="border-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
