"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SupportTicket {
  id: number;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  ticket_number: string;
  current_page: string;
  domain: string;
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

export default function AdminSupportTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null,
  );
  const [replyMessage, setReplyMessage] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("adminSessionActive");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchTickets();
  }, [router]);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("adminSessionActive");
      const response = await fetch("/api/admin/support-tickets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }
      const data = await response.json();
      setTickets(data.data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setMessage("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) {
      setMessage("Please enter a reply message");
      return;
    }

    setSending(true);
    try {
      console.log("📤 Sending reply for ticket:", selectedTicket.ticket_number);
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
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("❌ Reply failed:", data);
        throw new Error(data.message || "Failed to send reply");
      }

      console.log("✅ Reply sent successfully");
      setMessage("Reply sent successfully!");
      setReplyMessage("");
      setNewStatus("");
      fetchTickets();
      setTimeout(() => {
        setSelectedTicket(null);
        setMessage("");
      }, 2000);
    } catch (error) {
      console.error("💥 Error in handleReply:", error);
      setMessage(
        error instanceof Error ? error.message : "Failed to send reply",
      );
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (ticketId: number, status: string) => {
    try {
      const token = localStorage.getItem("adminSessionActive");
      const response = await fetch(`/api/admin/support-tickets/${ticketId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error("Failed to update status");
      }
      fetchTickets();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Sort tickets: VIP (izakaya domains) first, then by creation date
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    const aIsVIP = a.domain.toLowerCase().includes("izakaya");
    const bIsVIP = b.domain.toLowerCase().includes("izakaya");
    // VIP tickets come first
    if (aIsVIP && !bIsVIP) return -1;
    if (!aIsVIP && bIsVIP) return 1;
    // If both are VIP or both are normal, sort by date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    vip: tickets.filter((t) => t.domain.toLowerCase().includes("izakaya"))
      .length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Loading tickets...</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(sortedTickets.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTickets = sortedTickets.slice(startIndex, endIndex);

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      bug_report: "bg-red-500/10 text-red-700 border-red-200 ",
      feature_request: "bg-blue-500/10 text-blue-700 border-blue-200 ",
      general_feedback: "bg-purple-500/10 text-purple-700 border-purple-200 ",
      menu_question: "bg-amber-500/10 text-amber-700 border-amber-200 ",
      other: "bg-gray-500/10 text-gray-700 border-gray-200 ",
    };
    return colors[category] || colors.other;
  };

  const isVIPTicket = (domain: string) => {
    return domain.toLowerCase().includes("izakaya");
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-red-500/10 text-red-700 border-red-200 ",
      in_progress: "bg-yellow-500/10 text-yellow-700 border-yellow-200 ",
      resolved: "bg-green-500/10 text-green-700 border-green-200 ",
      closed: "bg-slate-500/10 text-slate-700 border-slate-200 ",
    };
    return colors[status] || colors.open;
  };

  const getStatusTriggerColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-red-100 hover:bg-red-200 text-red-700 border-red-300 ",
      in_progress:
        "bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border-yellow-300 ",
      resolved:
        "bg-green-100 hover:bg-green-200 text-green-700 border-green-300 ",
      closed: "bg-slate-50 hover:bg-slate-200 text-slate-900 border-slate-300 ",
    };
    return colors[status] || colors.open;
  };

  return (
    <div className="min-h-full bg-slate-50 text-slate-900">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10" />
                Support Tickets
              </h1>
              <p className="text-blue-100">
                Manage and respond to customer inquiries
              </p>
            </div>
            <Link href="/admin/dashboard">
              <Button
                variant="secondary"
                className="bg-white hover:bg-gray-100 text-blue-900"
              >
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="border-2 border-slate-200 hover:shadow-lg transition-shadow bg-white text-slate-900">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">
                    Total Tickets
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 ">
                    {stats.total}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-200 hover:shadow-lg transition-shadow bg-white text-slate-900">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">
                    Open
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-red-600">
                    {stats.open}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                  <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-200 hover:shadow-lg transition-shadow bg-white text-slate-900">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">
                    In Progress
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-600">
                    {stats.inProgress}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 hover:shadow-lg transition-shadow bg-white text-slate-900">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">
                    Resolved
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">
                    {stats.resolved}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <Card className="border-2 border-amber-200 hover:shadow-lg transition-shadow bg-gradient-to-br from-amber-50 to-yellow-50 bg-white text-slate-900">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-amber-800 mb-1 flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    VIP Tickets (Izakaya Domains)
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-amber-600 ">
                    {stats.vip}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl">
                  <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {message && (
          <Alert
            className="mb-6 border-2"
            variant={
              message.includes("successfully") ? "default" : "destructive"
            }
          >
            <AlertDescription className="font-medium">
              {message}
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-2 border-slate-200 shadow-sm bg-white text-slate-900">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-cyan-50/30 ">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-600" />
                  All Tickets
                </CardTitle>
                <CardDescription className="mt-1">
                  Showing {startIndex + 1}-
                  {Math.min(endIndex, sortedTickets.length)} of{" "}
                  {sortedTickets.length}
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 border-2 bg-white text-slate-900 placeholder:text-slate-400 border-slate-200"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[150px] border-2 bg-white text-slate-900 border-slate-200">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-slate-900 border-slate-200">
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
                    <TableRow className="bg-slate-50 hover:bg-slate-50 ">
                      <TableHead className="font-semibold">Priority</TableHead>
                      <TableHead className="font-semibold">
                        Ticket Number
                      </TableHead>
                      <TableHead className="font-semibold">Subject</TableHead>
                      <TableHead className="font-semibold hidden md:table-cell">
                        From
                      </TableHead>
                      <TableHead className="font-semibold hidden xl:table-cell">
                        Domain
                      </TableHead>
                      <TableHead className="font-semibold hidden lg:table-cell">
                        Category
                      </TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold hidden sm:table-cell">
                        Date
                      </TableHead>
                      <TableHead className="font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTickets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2">
                            <MessageSquare className="h-12 w-12 text-slate-500/50" />
                            <p className="text-slate-500 font-medium">
                              No tickets found
                            </p>
                            <p className="text-sm text-slate-500">
                              Try adjusting your search or filters
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedTickets.map((ticket) => (
                        <TableRow
                          key={ticket.id}
                          className={`hover:bg-slate-50/50 transition-colors ${isVIPTicket(ticket.domain) ? "bg-amber-50/30 " : ""}`}
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
                                className="bg-slate-50 text-slate-600 border-slate-300 font-medium"
                              >
                                Normal
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium max-w-xs">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-cyan-500 flex-shrink-0"></div>
                              <span className="truncate">
                                {ticket.ticket_number}
                              </span>
                            </div>
                            <div className="md:hidden text-xs text-slate-500 mt-1">
                              {ticket.name}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium max-w-xs">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-cyan-500 flex-shrink-0"></div>
                              <span className="truncate">{ticket.subject}</span>
                            </div>
                            <div className="md:hidden text-xs text-slate-500 mt-1">
                              {ticket.name}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                                {ticket.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm truncate">
                                {ticket.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="bg-indigo-500/10 text-indigo-700 border-indigo-200 font-medium whitespace-nowrap"
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
                                  <span className="capitalize">
                                    {ticket.status.replace("_", " ")}
                                  </span>
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-48 p-2 z-[9999] bg-white border-2 shadow-xl text-slate-900 border-slate-200"
                                align="start"
                              >
                                <div className="space-y-1">
                                  <button
                                    onClick={() =>
                                      handleStatusChange(ticket.id, "open")
                                    }
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                                      ticket.status === "open"
                                        ? "bg-red-500 text-white"
                                        : "hover:bg-slate-50 text-slate-900 bg-white "
                                    }`}
                                  >
                                    {ticket.status === "open" && (
                                      <Check className="h-4 w-4" />
                                    )}
                                    Open
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleStatusChange(
                                        ticket.id,
                                        "in_progress",
                                      )
                                    }
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                                      ticket.status === "in_progress"
                                        ? "bg-yellow-500 text-white"
                                        : "hover:bg-slate-50 text-slate-900 bg-white "
                                    }`}
                                  >
                                    {ticket.status === "in_progress" && (
                                      <Check className="h-4 w-4" />
                                    )}
                                    In Progress
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleStatusChange(ticket.id, "resolved")
                                    }
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                                      ticket.status === "resolved"
                                        ? "bg-green-500 text-white"
                                        : "hover:bg-slate-50 text-slate-900 bg-white "
                                    }`}
                                  >
                                    {ticket.status === "resolved" && (
                                      <Check className="h-4 w-4" />
                                    )}
                                    Resolved
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleStatusChange(ticket.id, "closed")
                                    }
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                                      ticket.status === "closed"
                                        ? "bg-slate-500 text-white"
                                        : "hover:bg-slate-50 text-slate-900 bg-white "
                                    }`}
                                  >
                                    {ticket.status === "closed" && (
                                      <Check className="h-4 w-4" />
                                    )}
                                    Closed
                                  </button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Calendar className="h-4 w-4" />
                              {new Date(ticket.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Dialog
                              open={
                                selectedTicket?.ticket_number ===
                                ticket.ticket_number
                              }
                              onOpenChange={(open) =>
                                !open && setSelectedTicket(null)
                              }
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedTicket(ticket)}
                                  className="border-2 border-blue-200 hover:bg-blue-50 hover:text-blue-700 text-xs sm:text-sm whitespace-nowrap"
                                >
                                  View &amp; Reply
                                </Button>
                              </DialogTrigger>
                              {selectedTicket?.ticket_number ===
                                ticket.ticket_number && (
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-2 z-[9999] bg-white text-slate-900">
                                  <DialogHeader>
                                    <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
                                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium flex-shrink-0">
                                        #{ticket.id}
                                      </div>
                                      <span className="truncate">
                                        Ticket #{ticket.ticket_number}
                                      </span>
                                      {isVIPTicket(ticket.domain) && (
                                        <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 font-semibold flex items-center gap-1">
                                          <Crown className="h-3 w-3" />
                                          VIP
                                        </Badge>
                                      )}
                                    </DialogTitle>
                                    <DialogDescription className="text-base">
                                      {ticket.subject}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="bg-gradient-to-br from-slate-50 to-cyan-50/30 p-4 sm:p-6 rounded-xl border-2 border-slate-200 ">
                                      <div className="flex items-start gap-3 mb-4">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-medium flex-shrink-0">
                                          {ticket.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <h3 className="font-semibold text-base sm:text-lg truncate">
                                            {ticket.name}
                                          </h3>
                                          <p className="text-sm text-slate-500 truncate">
                                            {ticket.email}
                                          </p>
                                        </div>
                                      </div>
                                      <p className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                                        {ticket.message}
                                      </p>
                                      {ticket.current_page && (
                                        <div className="mt-4 pt-4 border-t border-slate-200 ">
                                          <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                                            <span className="font-medium">
                                              Page:
                                            </span>
                                            <span className="font-mono bg-slate-200 px-2 py-1 rounded break-all">
                                              {ticket.current_page}
                                            </span>
                                          </p>
                                        </div>
                                      )}
                                      {ticket.domain && (
                                        <div
                                          className={`${ticket.current_page ? "mt-2" : "mt-4 pt-4 border-t border-slate-200 "}`}
                                        >
                                          <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                                            <span className="font-medium">
                                              Domain:
                                            </span>
                                            <span className="font-mono bg-slate-200 px-2 py-1 rounded break-all">
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
                                      <Select
                                        value={newStatus || ticket.status}
                                        onValueChange={setNewStatus}
                                      >
                                        <SelectTrigger className="border-2 bg-white text-slate-900 border-slate-200">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="z-[9999] bg-white text-slate-900 border-slate-200">
                                          <SelectItem value="open">
                                            Open
                                          </SelectItem>
                                          <SelectItem value="in_progress">
                                            In Progress
                                          </SelectItem>
                                          <SelectItem value="resolved">
                                            Resolved
                                          </SelectItem>
                                          <SelectItem value="closed">
                                            Closed
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-3">
                                      <label
                                        htmlFor="reply"
                                        className="text-sm font-semibold flex items-center gap-2"
                                      >
                                        <Mail className="h-4 w-4" />
                                        Reply Message
                                      </label>
                                      <Textarea
                                        id="reply"
                                        placeholder="Type your reply here..."
                                        value={replyMessage}
                                        onChange={(e) =>
                                          setReplyMessage(e.target.value)
                                        }
                                        className="min-h-32 border-2 focus:ring-2 focus:ring-cyan-500 bg-white text-slate-900 placeholder:text-slate-400 border-slate-200"
                                      />
                                    </div>
                                    <Button
                                      onClick={handleReply}
                                      disabled={sending || !replyMessage.trim()}
                                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 text-base font-semibold"
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-6 border-t bg-slate-50/50 ">
                <p className="text-sm text-slate-500 font-medium">
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
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
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
  );
}
