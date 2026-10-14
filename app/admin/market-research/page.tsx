// 📁 Place this file at: app/admin/market-research/page.tsx
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Search,
  User,
  Mail,
  Phone,
  Building2,
  Send,
  Loader,
  Copy,
  MessageSquare,
  LineChart,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import jsPDF from "jspdf";

interface MarketResearchRequest {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  details: string | null;
  is_read: boolean;
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

export default function MarketResearchAdminPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<MarketResearchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] =
    useState<MarketResearchRequest | null>(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [sendingEmailId, setSendingEmailId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailRequest, setEmailRequest] =
    useState<MarketResearchRequest | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminSessionActive");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetchRequests();
  }, [router]);

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/market-research-requests");

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(`Failed to fetch requests: ${response.status}`);
      }

      const data = await response.json();

      let requestsData: MarketResearchRequest[] = [];

      if (Array.isArray(data)) {
        requestsData = data;
      } else if (data.data) {
        if (Array.isArray(data.data)) {
          requestsData = data.data;
        } else if (data.data.data && Array.isArray(data.data.data)) {
          requestsData = data.data.data;
        }
      }

      setRequests(requestsData);

      if (requestsData.length === 0) {
        setMessage("No market research requests found yet.");
      }
    } catch (error) {
      console.error("❌ Error fetching requests:", error);
      setMessage(
        `Failed to load requests: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (request: MarketResearchRequest) => {
    try {
      const response = await fetch(
        `/api/market-research-requests/${request.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_read: true }),
        },
      );

      if (!response.ok) throw new Error("Failed to update request");

      setRequests((prev) =>
        prev.map((r) => (r.id === request.id ? { ...r, is_read: true } : r)),
      );
    } catch (error) {
      console.error("Error marking request as read:", error);
    }
  };

  const deleteRequest = async (request: MarketResearchRequest) => {
    if (!confirm(`Delete request from ${request.name}? This cannot be undone.`))
      return;

    try {
      const response = await fetch(
        `/api/market-research-requests/${request.id}`,
        { method: "DELETE" },
      );

      if (!response.ok) throw new Error("Failed to delete request");

      setRequests((prev) => prev.filter((r) => r.id !== request.id));
      setMessage("Request deleted successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting request:", error);
      setMessage("Failed to delete request.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const generatePDF = async (request: MarketResearchRequest) => {
    setDownloadingId(request.id);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 12;
      const tableWidth = pageWidth - margin * 2;
      const labelWidth = 50;
      const valueWidth = tableWidth - labelWidth;
      let y = 20;

      const colors = {
        primaryDark: [15, 23, 42] as [number, number, number],
        white: [255, 255, 255] as [number, number, number],
        lightGray: [248, 250, 252] as [number, number, number],
        borderGray: [226, 232, 240] as [number, number, number],
        textDark: [30, 41, 59] as [number, number, number],
        textMuted: [71, 85, 105] as [number, number, number],
      };

      const addHeader = () => {
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, 45, "F");

        doc.setTextColor(...colors.primaryDark);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Market Research Report Request", pageWidth / 2, 15, {
          align: "center",
        });

        doc.setTextColor(...colors.textMuted);
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text("Client Submission Details", pageWidth / 2, 25, {
          align: "center",
        });

        doc.setFontSize(8);
        doc.text(`Request ID: ${request.id}`, pageWidth / 2, 32, {
          align: "center",
        });
        doc.text(
          `Date: ${new Date(request.created_at).toLocaleDateString()}`,
          pageWidth / 2,
          38,
          { align: "center" },
        );
      };

      const addFooter = (pageNum: number, totalPages: number) => {
        doc.setFillColor(255, 255, 255);
        doc.rect(0, pageHeight - 18, pageWidth, 18, "F");

        doc.setDrawColor(...colors.borderGray);
        doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);

        doc.setTextColor(...colors.textDark);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("Market Research Requests", pageWidth / 2, pageHeight - 12, {
          align: "center",
        });

        doc.setTextColor(...colors.textMuted);
        doc.setFontSize(7);
        doc.text(
          `Page ${pageNum} of ${totalPages}`,
          pageWidth - margin,
          pageHeight - 6,
          { align: "right" },
        );
      };

      const checkPageBreak = (height: number) => {
        if (y + height > pageHeight - 25) {
          doc.addPage();
          y = 15;
        }
      };

      const addSectionHeader = (title: string) => {
        checkPageBreak(8);
        doc.setFillColor(...colors.primaryDark);
        doc.rect(margin, y, tableWidth, 7, "F");
        doc.setDrawColor(...colors.borderGray);
        doc.rect(margin, y, tableWidth, 7, "S");
        doc.setTextColor(...colors.white);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text(title, margin + 3, y + 5);
        y += 7;
      };

      const addTableRow = (label: string, value: string, isAlt = false) => {
        checkPageBreak(7);
        const rowHeight = 7;
        const bgColor = isAlt ? colors.lightGray : colors.white;

        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        doc.rect(margin, y, tableWidth, rowHeight, "F");
        doc.setDrawColor(...colors.borderGray);
        doc.rect(margin, y, labelWidth, rowHeight, "S");
        doc.rect(margin + labelWidth, y, valueWidth, rowHeight, "S");

        doc.setTextColor(...colors.textMuted);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text(label, margin + 2, y + 5);

        doc.setTextColor(...colors.textDark);
        doc.setFont("helvetica", "normal");
        const truncatedValue =
          value && value.length > 80
            ? value.substring(0, 77) + "..."
            : value || "N/A";
        doc.text(truncatedValue, margin + labelWidth + 2, y + 5);

        y += rowHeight;
      };

      const addMultilineRow = (label: string, value: string, isAlt = false) => {
        if (!value) return;
        doc.setFontSize(8);
        const lines = doc.splitTextToSize(value, valueWidth - 4);
        const rowHeight = Math.max(7, lines.length * 4 + 3);

        checkPageBreak(rowHeight);
        const bgColor = isAlt ? colors.lightGray : colors.white;

        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        doc.rect(margin, y, tableWidth, rowHeight, "F");
        doc.setDrawColor(...colors.borderGray);
        doc.rect(margin, y, labelWidth, rowHeight, "S");
        doc.rect(margin + labelWidth, y, valueWidth, rowHeight, "S");

        doc.setTextColor(...colors.textMuted);
        doc.setFont("helvetica", "bold");
        doc.text(label, margin + 2, y + 5);

        doc.setTextColor(...colors.textDark);
        doc.setFont("helvetica", "normal");
        for (let i = 0; i < lines.length; i++) {
          doc.text(lines[i], margin + labelWidth + 2, y + 5 + i * 4);
        }

        y += rowHeight;
      };

      addHeader();
      y = 48;

      addSectionHeader("CONTACT INFORMATION");
      addTableRow("Full Name", request.name, false);
      addTableRow("Email", request.email, true);
      addTableRow("Phone", request.phone || "N/A", false);
      addTableRow("Company", request.company || "N/A", true);

      addSectionHeader("RESEARCH DETAILS");
      addMultilineRow("Research Focus", request.details || "N/A", false);

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        addFooter(i, pageCount);
      }

      doc.save(
        `market-research-${request.id}-${request.name.replace(/\s+/g, "-").toLowerCase()}.pdf`,
      );

      setMessage("PDF downloaded successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setMessage("Error generating PDF");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setDownloadingId(null);
    }
  };

  const openEmailDialog = (request: MarketResearchRequest) => {
    setEmailRequest(request);
    setEmailSubject(
      `Your Market Research Report Request - ${request.company || request.name}`,
    );
    setEmailMessage(`Dear ${request.name},

Thank you for requesting a market research report${
      request.company ? ` for ${request.company}` : ""
    }.

We've received your submission and our team will begin research${
      request.details ? ` focused on: ${request.details}` : ""
    }. We'll follow up shortly with our findings and recommendations.

If you have any questions in the meantime, feel free to reach out.

Best regards,
The Team`);
    setEmailDialogOpen(true);
  };

  const sendRequestEmail = async () => {
    if (!emailRequest?.email) {
      setMessage("Request has no email address!");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setSendingEmailId(emailRequest.id);
    try {
      const response = await fetch("/api/send-market-research-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailRequest.email,
          subject: emailSubject,
          message: emailMessage,
          requestId: emailRequest.id,
          requestData: emailRequest,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      setMessage("Email sent successfully!");
      setEmailDialogOpen(false);
      setEmailRequest(null);
      setEmailSubject("");
      setEmailMessage("");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error sending email:", error);
      setMessage("Failed to send email. Check SMTP configuration.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setSendingEmailId(null);
    }
  };

  const filteredRequests = Array.isArray(requests)
    ? requests.filter((request) => {
        const q = searchQuery.toLowerCase();
        return (
          (request.name?.toLowerCase() || "").includes(q) ||
          (request.email?.toLowerCase() || "").includes(q) ||
          (request.company?.toLowerCase() || "").includes(q) ||
          (request.phone?.toLowerCase() || "").includes(q)
        );
      })
    : [];

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-900">
        <div className="text-center">
          <div className="animate-spin mb-4 inline-block">
            <FileText className="h-8 w-8 text-blue-700" />
          </div>
          <p className="text-slate-500">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 text-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <LineChart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Market Research Requests
              </h1>
              <p className="text-slate-500">
                View and manage all market research report requests
              </p>
            </div>
          </div>
        </div>

        {message && (
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-800">
              {message}
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-6 border-2 bg-white text-slate-900">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search by name, email, company, or phone..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 bg-white text-slate-900 placeholder:text-slate-400 border-slate-200"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 overflow-hidden bg-white text-slate-900">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Request Submissions</CardTitle>
                <CardDescription>
                  Showing {paginatedRequests.length} of{" "}
                  {filteredRequests.length} requests
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-bold">ID</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold">Name</TableHead>
                    <TableHead className="font-bold">Company</TableHead>
                    <TableHead className="font-bold">Email</TableHead>
                    <TableHead className="font-bold">Phone</TableHead>
                    <TableHead className="font-bold">Submitted</TableHead>
                    <TableHead className="font-bold text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRequests.map((request) => (
                    <TableRow
                      key={request.id}
                      className="hover:bg-blue-50/60 border-b"
                    >
                      <TableCell className="font-bold text-blue-700">
                        {request.id}
                      </TableCell>
                      <TableCell>
                        {request.is_read ? (
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 text-slate-700"
                          >
                            Read
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-600 hover:bg-blue-700">
                            New
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {request.name}
                      </TableCell>
                      <TableCell className="text-sm">
                        {request.company || "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-blue-600">
                        {request.email}
                      </TableCell>
                      <TableCell className="text-sm">
                        {request.phone || "N/A"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(request.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  if (!request.is_read) markAsRead(request);
                                }}
                                className="border-2 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            {selectedRequest?.id === request.id && (
                              <DialogContent className="max-w-[92vw] sm:max-w-md max-h-[85vh] overflow-y-auto border-2 p-0 gap-0 bg-white text-slate-900">
                                <div className="space-y-0">
                                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-white">
                                    <div className="flex items-center gap-2.5">
                                      <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                        <User className="h-4.5 w-4.5" />
                                      </div>
                                      <div className="min-w-0">
                                        <h2 className="text-base font-bold truncate">
                                          {request.name}
                                        </h2>
                                        {request.company && (
                                          <p className="text-xs text-white/80 truncate">
                                            {request.company}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="px-4 py-3 space-y-3">
                                    <div className="space-y-1.5">
                                      <h3 className="text-[10px] uppercase tracking-widest font-semibold text-slate-500">
                                        Contact
                                      </h3>

                                      <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                                        <a
                                          href={`mailto:${request.email}`}
                                          className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline break-all"
                                        >
                                          <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                          {request.email}
                                        </a>
                                        <button
                                          onClick={() =>
                                            navigator.clipboard.writeText(
                                              request.email,
                                            )
                                          }
                                          className="p-1 hover:bg-slate-200 rounded flex-shrink-0"
                                        >
                                          <Copy className="h-3 w-3 text-slate-500" />
                                        </button>
                                      </div>

                                      {request.phone && (
                                        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                                          <a
                                            href={`tel:${request.phone}`}
                                            className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                                          >
                                            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                                            {request.phone}
                                          </a>
                                          <button
                                            onClick={() =>
                                              navigator.clipboard.writeText(
                                                request.phone!,
                                              )
                                            }
                                            className="p-1 hover:bg-slate-200 rounded flex-shrink-0"
                                          >
                                            <Copy className="h-3 w-3 text-slate-500" />
                                          </button>
                                        </div>
                                      )}

                                      {request.company && (
                                        <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-md text-xs">
                                          <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
                                          {request.company}
                                        </div>
                                      )}
                                    </div>

                                    {request.details && (
                                      <div className="space-y-1">
                                        <h3 className="text-[10px] uppercase tracking-widest font-semibold text-slate-500 flex items-center gap-1.5">
                                          <MessageSquare className="h-3 w-3" />
                                          Research Focus
                                        </h3>
                                        <p className="text-xs bg-slate-50 rounded-md p-2 leading-relaxed max-h-24 overflow-y-auto">
                                          {request.details}
                                        </p>
                                      </div>
                                    )}

                                    <p className="text-[10px] text-slate-500">
                                      Submitted{" "}
                                      {new Date(
                                        request.created_at,
                                      ).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </DialogContent>
                            )}
                          </Dialog>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generatePDF(request)}
                            disabled={downloadingId === request.id}
                            className="border-2 border-green-200 hover:bg-green-50 hover:text-green-700"
                          >
                            {downloadingId === request.id ? (
                              <Loader className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4 mr-1" />
                            )}
                            PDF
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEmailDialog(request)}
                            disabled={
                              sendingEmailId === request.id || !request.email
                            }
                            className="border-2 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          >
                            {sendingEmailId === request.id ? (
                              <Loader className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4 mr-1" />
                            )}
                            Email
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteRequest(request)}
                            className="border-2 border-red-200 hover:bg-red-50 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-slate-500">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
          <DialogContent className="max-w-2xl bg-white text-slate-900">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                Send Email to {emailRequest?.name || "User"}
              </DialogTitle>
              <DialogDescription>
                Compose your message to {emailRequest?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email-to">To</Label>
                <Input
                  id="email-to"
                  value={emailRequest?.email || ""}
                  disabled
                  className="bg-slate-50 bg-white text-slate-900 placeholder:text-slate-400 border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-subject">Subject</Label>
                <Input
                  id="email-subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  className="bg-white text-slate-900 placeholder:text-slate-400 border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-message">Message</Label>
                <Textarea
                  id="email-message"
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Enter your message..."
                  rows={10}
                  className="resize-none bg-white text-slate-900 placeholder:text-slate-400 border-slate-200"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEmailDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={sendRequestEmail}
                disabled={
                  sendingEmailId !== null || !emailSubject || !emailMessage
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                {sendingEmailId !== null ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
