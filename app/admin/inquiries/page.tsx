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
  Trash2,
  Phone,
  User,
} from "lucide-react"
import { Input } from "@/components/ui/input"

interface Inquiry {
  id: number
  name: string
  email: string
  phone: string
  message: string
  status: string
  created_at: string
}

const ITEMS_PER_PAGE = 10

export default function AdminInquiriesPage() {
  const router = useRouter()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [replyMessage, setReplyMessage] = useState("")
  const [newStatus, setNewStatus] = useState("")
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    fetchInquiries()
  }, [])

  const fetchInquiries = async () => {
    try {
      const response = await fetch("/api/inquiries")
      if (!response.ok) {
        throw new Error("Failed to fetch inquiries")
      }
      const data = await response.json()
      console.log("Fetched data:", data)
      
      // Handle different response structures
      if (data.success && data.data) {
        setInquiries(Array.isArray(data.data) ? data.data : [])
      } else if (Array.isArray(data)) {
        setInquiries(data)
      } else {
        setInquiries([])
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error)
      setMessage("Failed to load inquiries")
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async () => {
    if (!selectedInquiry || !replyMessage.trim()) {
      setMessage("Please enter a reply message")
      return
    }

    setSending(true)
    try {
      console.log("📤 Sending reply for inquiry:", selectedInquiry.id)
      const response = await fetch("/api/inquiries/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiryId: selectedInquiry.id,
          email: selectedInquiry.email,
          name: selectedInquiry.name,
          message: replyMessage,
          status: newStatus || selectedInquiry.status,
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
      fetchInquiries()
      setTimeout(() => {
        setSelectedInquiry(null)
        setMessage("")
      }, 2000)
    } catch (error) {
      console.error("💥 Error in handleReply:", error)
      setMessage(error instanceof Error ? error.message : "Failed to send reply")
    } finally {
      setSending(false)
    }
  }

  const handleStatusChange = async (inquiryId: number, status: string) => {
    try {
      const response = await fetch(`/api/inquiries/${inquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) {
        throw new Error("Failed to update status")
      }
      fetchInquiries()
    } catch (error) {
      console.error("Error updating status:", error)
      setMessage("Failed to update status")
    }
  }

  const handleDelete = async (inquiryId: number) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) {
      return
    }

    try {
      const response = await fetch(`/api/inquiries/${inquiryId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete inquiry")
      }
      setMessage("Inquiry deleted successfully")
      fetchInquiries()
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("Error deleting inquiry:", error)
      setMessage("Failed to delete inquiry")
    }
  }

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch =
      inquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || inquiry.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const sortedInquiries = [...filteredInquiries].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const stats = {
    total: inquiries.length,
    pending: inquiries.filter((i) => i.status === "pending").length,
    replied: inquiries.filter((i) => i.status === "replied").length,
    resolved: inquiries.filter((i) => i.status === "resolved").length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading inquiries...</p>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil(sortedInquiries.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedInquiries = sortedInquiries.slice(startIndex, endIndex)

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
      replied: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      resolved: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
    }
    return colors[status] || colors.pending
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/20 dark:from-slate-950 dark:via-cyan-900/10 dark:to-blue-950/10">
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-900 dark:to-blue-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10" />
                Inquiries
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
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Total Inquiries</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
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

          <Card className="border-2 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow bg-white/80 dark:bg-slate-900/80 backdrop-blur">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Replied</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.replied}</p>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
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
                  All Inquiries
                </CardTitle>
                <CardDescription className="mt-1">
                  Showing {startIndex + 1}-{Math.min(endIndex, sortedInquiries.length)} of {sortedInquiries.length}
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search inquiries..."
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
                    <SelectContent className="z-[100] bg-white dark:bg-slate-900 border-2 shadow-xl">
                       <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="replied">Replied</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
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
                    <TableHead className="font-semibold hidden md:table-cell">Email</TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell">Phone</TableHead>
                    <TableHead className="font-semibold">Message</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold hidden sm:table-cell">Date</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInquiries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
                          <p className="text-muted-foreground font-medium">No inquiries found</p>
                          <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedInquiries.map((inquiry) => (
                      <TableRow key={inquiry.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                              {inquiry.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate">{inquiry.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{inquiry.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{inquiry.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="truncate text-sm">{inquiry.message}</p>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={inquiry.status}
                            onValueChange={(value) => handleStatusChange(inquiry.id, value)}
                          >
                            <SelectTrigger className={`w-28 border-2 ${getStatusBadgeColor(inquiry.status)}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-[100] bg-white dark:bg-slate-900 border-2 shadow-xl">
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="replied">Replied</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(inquiry.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedInquiry(inquiry)}
                                  className="border-2 border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 dark:border-cyan-800 dark:hover:bg-cyan-900/20"
                                >
                                  Reply
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-2">
                                <DialogHeader>
                                  <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
                                    <Mail className="h-6 w-6 text-cyan-600" />
                                    Reply to Inquiry
                                  </DialogTitle>
                                  <DialogDescription>Send a response to {inquiry.name}</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="bg-gradient-to-br from-slate-50 to-cyan-50/30 dark:from-slate-800 dark:to-cyan-900/10 p-6 rounded-xl border-2">
                                    <div className="flex items-start gap-3 mb-4">
                                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-medium">
                                        {inquiry.name.charAt(0).toUpperCase()}
                                      </div>
                                      <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{inquiry.name}</h3>
                                        <p className="text-sm text-muted-foreground">{inquiry.email}</p>
                                        <p className="text-sm text-muted-foreground">{inquiry.phone}</p>
                                      </div>
                                    </div>
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{inquiry.message}</p>
                                  </div>

                                  <div className="space-y-3">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                      <CheckCircle2 className="h-4 w-4" />
                                      Update Status
                                    </label>
                                    <TableCell>
                          <Select
                            value={inquiry.status}
                            onValueChange={(value) => handleStatusChange(inquiry.id, value)}
                          >
                            <SelectTrigger className={`w-28 border-2 ${getStatusBadgeColor(inquiry.status)}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-[100] bg-white dark:bg-slate-900 border-2 shadow-xl">
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="replied">Replied</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
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
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(inquiry.id)}
                              className="border-2 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-t bg-slate-50/50 dark:bg-slate-800/20">
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
