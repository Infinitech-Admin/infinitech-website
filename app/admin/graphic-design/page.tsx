// 📁 Place this file at: app/admin/graphic-design/page.tsx
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
  Palette,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import jsPDF from "jspdf";

interface GraphicDesignRequest {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  business_name: string | null;
  design_categories: string | null;
  details: string | null;
  is_read: boolean;
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

export default function GraphicDesignAdminPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<GraphicDesignRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] =
    useState<GraphicDesignRequest | null>(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [sendingEmailId, setSendingEmailId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailRequest, setEmailRequest] = useState<GraphicDesignRequest | null>(
    null,
  );
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetchRequests();
  }, [router]);

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/graphic-design-requests");

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(`Failed to fetch requests: ${response.status}`);
      }

      const data = await response.json();

      let requestsData: GraphicDesignRequest[] = [];

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
        setMessage("No graphic design requests found yet.");
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

  const markAsRead = async (request: GraphicDesignRequest) => {
    try {
      const response = await fetch(
        `/api/graphic-design-requests/${request.id}`,
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

  const deleteRequest = async (request: GraphicDesignRequest) => {
    if (!confirm(`Delete request from ${request.name}? This cannot be undone.`))
      return;

    try {
      const response = await fetch(
        `/api/graphic-design-requests/${request.id}`,
        {
          method: "DELETE",
        },
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

  const generatePDF = async (request: GraphicDesignRequest) => {
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
        doc.text("Graphic Design Request", pageWidth / 2, 15, {
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
        doc.text("Graphic Design Requests", pageWidth / 2, pageHeight - 12, {
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
      addTableRow("Business Name", request.business_name || "N/A", true);

      addSectionHeader("PROJECT DETAILS");
      addTableRow(
        "Design Categories",
        request.design_categories
          ? request.design_categories.split(",").join(", ")
          : "N/A",
        false,
      );
      addMultilineRow("Project Goals", request.details || "N/A", true);

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        addFooter(i, pageCount);
      }

      doc.save(
        `graphic-design-${request.id}-${request.name.replace(/\s+/g, "-").toLowerCase()}.pdf`,
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

  const openEmailDialog = (request: GraphicDesignRequest) => {
    setEmailRequest(request);
    setEmailSubject(
      `Your Graphic Design Request - ${request.business_name || request.name}`,
    );
    setEmailMessage(`Dear ${request.name},

Thank you for your interest in graphic design services${
      request.business_name ? ` for ${request.business_name}` : ""
    }.

We've received your submission${
      request.design_categories
        ? ` covering: ${request.design_categories.split(",").join(", ")}`
        : ""
    }. Our design team will review your goals and follow up shortly with next steps.

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
      const response = await fetch("/api/send-graphic-design-email", {
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
          (request.business_name?.toLowerCase() || "").includes(q) ||
          (request.phone?.toLowerCase() || "").includes(q) ||
          (request.design_categories?.toLowerCase() || "").includes(q)
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4 inline-block">
            <FileText className="h-8 w-8 text-orange-600" />
          </div>
          <p className="text-muted-foreground">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <Palette className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                Graphic Design Requests
              </h1>
              <p className="text-muted-foreground">
                View and manage all graphic design requests
              </p>
            </div>
          </div>
        </div>

        {message && (
          <Alert className="mb-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              {message}
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-6 border-2">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, business, phone, or category..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-b-2">
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
                  <TableRow className="bg-slate-100 dark:bg-slate-800">
                    <TableHead className="font-bold">ID</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold">Name</TableHead>
                    <TableHead className="font-bold">Business</TableHead>
                    <TableHead className="font-bold">Email</TableHead>
                    <TableHead className="font-bold">Categories</TableHead>
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
                      className="hover:bg-orange-50/50 dark:hover:bg-orange-900/20 border-b"
                    >
                      <TableCell className="font-bold text-orange-600">
                        {request.id}
                      </TableCell>
                      <TableCell>
                        {request.is_read ? (
                          <Badge variant="secondary">Read</Badge>
                        ) : (
                          <Badge className="bg-orange-500 hover:bg-orange-600">
                            New
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {request.name}
                      </TableCell>
                      <TableCell className="text-sm">
                        {request.business_name || "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-blue-600 dark:text-blue-400">
                        {request.email}
                      </TableCell>
                      <TableCell className="text-sm max-w-[160px] truncate">
                        {request.design_categories
                          ? request.design_categories.split(",").join(", ")
                          : "N/A"}
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
                                className="border-2 border-orange-200 hover:bg-orange-50 hover:text-orange-700 dark:border-orange-800 dark:hover:bg-orange-900/20"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            {selectedRequest?.id === request.id && (
                              <DialogContent className="max-w-[92vw] sm:max-w-md max-h-[85vh] overflow-y-auto border-2 p-0 gap-0">
                                <div className="space-y-0">
                                  <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 text-white">
                                    <div className="flex items-center gap-2.5">
                                      <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                        <User className="h-4.5 w-4.5" />
                                      </div>
                                      <div className="min-w-0">
                                        <h2 className="text-base font-bold truncate">
                                          {request.name}
                                        </h2>
                                        {request.business_name && (
                                          <p className="text-xs text-white/80 truncate">
                                            {request.business_name}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="px-4 py-3 space-y-3">
                                    <div className="space-y-1.5">
                                      <h3 className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
                                        Contact
                                      </h3>

                                      <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded-md">
                                        <a
                                          href={`mailto:${request.email}`}
                                          className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline break-all"
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
                                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded flex-shrink-0"
                                        >
                                          <Copy className="h-3 w-3 text-slate-500" />
                                        </button>
                                      </div>

                                      {request.phone && (
                                        <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded-md">
                                          <a
                                            href={`tel:${request.phone}`}
                                            className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
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
                                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded flex-shrink-0"
                                          >
                                            <Copy className="h-3 w-3 text-slate-500" />
                                          </button>
                                        </div>
                                      )}

                                      {request.business_name && (
                                        <div className="flex items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-900 rounded-md text-xs">
                                          <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
                                          {request.business_name}
                                        </div>
                                      )}

                                      {request.design_categories && (
                                        <div className="flex items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-900 rounded-md text-xs">
                                          <Palette className="h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
                                          {request.design_categories
                                            .split(",")
                                            .join(", ")}
                                        </div>
                                      )}
                                    </div>

                                    {request.details && (
                                      <div className="space-y-1">
                                        <h3 className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-1.5">
                                          <MessageSquare className="h-3 w-3" />
                                          Project Goals
                                        </h3>
                                        <p className="text-xs bg-slate-50 dark:bg-slate-900 rounded-md p-2 leading-relaxed max-h-24 overflow-y-auto">
                                          {request.details}
                                        </p>
                                      </div>
                                    )}

                                    <p className="text-[10px] text-muted-foreground">
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
                            className="border-2 border-green-200 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:hover:bg-green-900/20"
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
                            className="border-2 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:hover:bg-blue-950/20"
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
                            className="border-2 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-950/20"
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
            <p className="text-sm text-muted-foreground">
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
          <DialogContent className="max-w-2xl">
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
                  className="bg-slate-50 dark:bg-slate-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-subject">Subject</Label>
                <Input
                  id="email-subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject..."
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
                  className="resize-none"
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
