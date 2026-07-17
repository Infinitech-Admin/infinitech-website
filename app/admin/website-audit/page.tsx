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
  Globe,
  Send,
  Loader,
  Copy,
  MessageSquare,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import jsPDF from "jspdf";

interface WebsiteInquiry {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  website: string;
  details: string | null;
  is_read: boolean;
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

export default function WebsiteInquiriesAdminPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<WebsiteInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInquiry, setSelectedInquiry] = useState<WebsiteInquiry | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [sendingEmailId, setSendingEmailId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailInquiry, setEmailInquiry] = useState<WebsiteInquiry | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetchInquiries();
  }, [router]);

  const fetchInquiries = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/website-inquiries`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(`Failed to fetch inquiries: ${response.status}`);
      }

      const data = await response.json();

      let inquiriesData: WebsiteInquiry[] = [];

      if (Array.isArray(data)) {
        inquiriesData = data;
      } else if (data.data) {
        if (Array.isArray(data.data)) {
          inquiriesData = data.data;
        } else if (data.data.data && Array.isArray(data.data.data)) {
          inquiriesData = data.data.data;
        }
      }

      setInquiries(inquiriesData);

      if (inquiriesData.length === 0) {
        setMessage("No website inquiries found yet.");
      }
    } catch (error) {
      console.error("❌ Error fetching inquiries:", error);
      setMessage(
        `Failed to load inquiries: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (inquiry: WebsiteInquiry) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(
        `${apiUrl}/api/website-inquiries/${inquiry.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_read: true }),
        },
      );

      if (!response.ok) throw new Error("Failed to update inquiry");

      setInquiries((prev) =>
        prev.map((i) => (i.id === inquiry.id ? { ...i, is_read: true } : i)),
      );
    } catch (error) {
      console.error("Error marking inquiry as read:", error);
    }
  };

  const deleteInquiry = async (inquiry: WebsiteInquiry) => {
    if (!confirm(`Delete inquiry from ${inquiry.name}? This cannot be undone.`))
      return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(
        `${apiUrl}/api/website-inquiries/${inquiry.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) throw new Error("Failed to delete inquiry");

      setInquiries((prev) => prev.filter((i) => i.id !== inquiry.id));
      setMessage("Inquiry deleted successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting inquiry:", error);
      setMessage("Failed to delete inquiry.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const generatePDF = async (inquiry: WebsiteInquiry) => {
    setDownloadingId(inquiry.id);
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
        doc.text("Website Audit Inquiry", pageWidth / 2, 15, {
          align: "center",
        });

        doc.setTextColor(...colors.textMuted);
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text("Client Submission Details", pageWidth / 2, 25, {
          align: "center",
        });

        doc.setFontSize(8);
        doc.text(`Inquiry ID: ${inquiry.id}`, pageWidth / 2, 32, {
          align: "center",
        });
        doc.text(
          `Date: ${new Date(inquiry.created_at).toLocaleDateString()}`,
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
        doc.text("Website Audit Inquiries", pageWidth / 2, pageHeight - 12, {
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
      addTableRow("Full Name", inquiry.name, false);
      addTableRow("Email", inquiry.email, true);
      addTableRow("Phone", inquiry.phone || "N/A", false);
      addTableRow("Company", inquiry.company || "N/A", true);

      addSectionHeader("WEBSITE DETAILS");
      addTableRow("Website URL", inquiry.website, false);
      addMultilineRow("Focus Areas", inquiry.details || "N/A", true);

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        addFooter(i, pageCount);
      }

      doc.save(
        `website-inquiry-${inquiry.id}-${inquiry.name.replace(/\s+/g, "-").toLowerCase()}.pdf`,
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

  const openEmailDialog = (inquiry: WebsiteInquiry) => {
    setEmailInquiry(inquiry);
    setEmailSubject(
      `Your Website Audit Request - ${inquiry.company || inquiry.name}`,
    );
    setEmailMessage(`Dear ${inquiry.name},

Thank you for requesting a website audit for ${inquiry.website}.

We've received your submission and our team will review your site${
      inquiry.details ? ` with a focus on: ${inquiry.details}` : ""
    }. We'll follow up shortly with our findings and recommendations.

If you have any questions in the meantime, feel free to reach out.

Best regards,
The Team`);
    setEmailDialogOpen(true);
  };

  const sendInquiryEmail = async () => {
    if (!emailInquiry?.email) {
      setMessage("Inquiry has no email address!");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setSendingEmailId(emailInquiry.id);
    try {
      const response = await fetch("/api/send-inquiry-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: emailInquiry.email,
          subject: emailSubject,
          message: emailMessage,
          inquiryId: emailInquiry.id,
          inquiryData: emailInquiry,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      setMessage("Email sent successfully!");
      setEmailDialogOpen(false);
      setEmailInquiry(null);
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

  const filteredInquiries = Array.isArray(inquiries)
    ? inquiries.filter((inquiry) => {
        const q = searchQuery.toLowerCase();
        return (
          (inquiry.name?.toLowerCase() || "").includes(q) ||
          (inquiry.email?.toLowerCase() || "").includes(q) ||
          (inquiry.company?.toLowerCase() || "").includes(q) ||
          (inquiry.website?.toLowerCase() || "").includes(q) ||
          (inquiry.phone?.toLowerCase() || "").includes(q)
        );
      })
    : [];

  const totalPages = Math.ceil(filteredInquiries.length / ITEMS_PER_PAGE);
  const paginatedInquiries = filteredInquiries.slice(
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
          <p className="text-muted-foreground">Loading inquiries...</p>
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
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                Website Audit Inquiries
              </h1>
              <p className="text-muted-foreground">
                View and manage all website audit requests
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
                placeholder="Search by name, email, company, website, or phone..."
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
                <CardTitle>Inquiry Submissions</CardTitle>
                <CardDescription>
                  Showing {paginatedInquiries.length} of{" "}
                  {filteredInquiries.length} inquiries
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
                    <TableHead className="font-bold">Company</TableHead>
                    <TableHead className="font-bold">Email</TableHead>
                    <TableHead className="font-bold">Phone</TableHead>
                    <TableHead className="font-bold">Website</TableHead>
                    <TableHead className="font-bold">Submitted</TableHead>
                    <TableHead className="font-bold text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInquiries.map((inquiry) => (
                    <TableRow
                      key={inquiry.id}
                      className="hover:bg-orange-50/50 dark:hover:bg-orange-900/20 border-b"
                    >
                      <TableCell className="font-bold text-orange-600">
                        {inquiry.id}
                      </TableCell>
                      <TableCell>
                        {inquiry.is_read ? (
                          <Badge variant="secondary">Read</Badge>
                        ) : (
                          <Badge className="bg-orange-500 hover:bg-orange-600">
                            New
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {inquiry.name}
                      </TableCell>
                      <TableCell className="text-sm">
                        {inquiry.company || "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-blue-600 dark:text-blue-400">
                        {inquiry.email}
                      </TableCell>
                      <TableCell className="text-sm">
                        {inquiry.phone || "N/A"}
                      </TableCell>
                      <TableCell className="text-sm max-w-[160px] truncate">
                        <a
                          href={
                            inquiry.website.startsWith("http")
                              ? inquiry.website
                              : `https://${inquiry.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {inquiry.website}
                        </a>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(inquiry.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedInquiry(inquiry);
                                  if (!inquiry.is_read) markAsRead(inquiry);
                                }}
                                className="border-2 border-orange-200 hover:bg-orange-50 hover:text-orange-700 dark:border-orange-800 dark:hover:bg-orange-900/20"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            {selectedInquiry?.id === inquiry.id && (
                              <DialogContent className="max-w-[92vw] sm:max-w-md max-h-[85vh] overflow-y-auto border-2 p-0 gap-0">
                                <div className="space-y-0">
                                  <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 text-white">
                                    <div className="flex items-center gap-2.5">
                                      <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                        <User className="h-4.5 w-4.5" />
                                      </div>
                                      <div className="min-w-0">
                                        <h2 className="text-base font-bold truncate">
                                          {inquiry.name}
                                        </h2>
                                        {inquiry.company && (
                                          <p className="text-xs text-white/80 truncate">
                                            {inquiry.company}
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
                                          href={`mailto:${inquiry.email}`}
                                          className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline break-all"
                                        >
                                          <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                          {inquiry.email}
                                        </a>
                                        <button
                                          onClick={() =>
                                            navigator.clipboard.writeText(
                                              inquiry.email,
                                            )
                                          }
                                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded flex-shrink-0"
                                        >
                                          <Copy className="h-3 w-3 text-slate-500" />
                                        </button>
                                      </div>

                                      {inquiry.phone && (
                                        <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded-md">
                                          <a
                                            href={`tel:${inquiry.phone}`}
                                            className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                          >
                                            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                                            {inquiry.phone}
                                          </a>
                                          <button
                                            onClick={() =>
                                              navigator.clipboard.writeText(
                                                inquiry.phone!,
                                              )
                                            }
                                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded flex-shrink-0"
                                          >
                                            <Copy className="h-3 w-3 text-slate-500" />
                                          </button>
                                        </div>
                                      )}

                                      {inquiry.company && (
                                        <div className="flex items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-900 rounded-md text-xs">
                                          <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
                                          {inquiry.company}
                                        </div>
                                      )}

                                      <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded-md">
                                        <a
                                          href={
                                            inquiry.website.startsWith("http")
                                              ? inquiry.website
                                              : `https://${inquiry.website}`
                                          }
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline break-all"
                                        >
                                          <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                                          {inquiry.website}
                                        </a>
                                        <button
                                          onClick={() =>
                                            navigator.clipboard.writeText(
                                              inquiry.website,
                                            )
                                          }
                                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded flex-shrink-0"
                                        >
                                          <Copy className="h-3 w-3 text-slate-500" />
                                        </button>
                                      </div>
                                    </div>

                                    {inquiry.details && (
                                      <div className="space-y-1">
                                        <h3 className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-1.5">
                                          <MessageSquare className="h-3 w-3" />
                                          Focus Areas
                                        </h3>
                                        <p className="text-xs bg-slate-50 dark:bg-slate-900 rounded-md p-2 leading-relaxed max-h-24 overflow-y-auto">
                                          {inquiry.details}
                                        </p>
                                      </div>
                                    )}

                                    <p className="text-[10px] text-muted-foreground">
                                      Submitted{" "}
                                      {new Date(
                                        inquiry.created_at,
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
                            onClick={() => generatePDF(inquiry)}
                            disabled={downloadingId === inquiry.id}
                            className="border-2 border-green-200 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:hover:bg-green-900/20"
                          >
                            {downloadingId === inquiry.id ? (
                              <Loader className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4 mr-1" />
                            )}
                            PDF
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEmailDialog(inquiry)}
                            disabled={
                              sendingEmailId === inquiry.id || !inquiry.email
                            }
                            className="border-2 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:hover:bg-blue-950/20"
                          >
                            {sendingEmailId === inquiry.id ? (
                              <Loader className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4 mr-1" />
                            )}
                            Email
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteInquiry(inquiry)}
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
                Send Email to {emailInquiry?.name || "User"}
              </DialogTitle>
              <DialogDescription>
                Compose your message to {emailInquiry?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email-to">To</Label>
                <Input
                  id="email-to"
                  value={emailInquiry?.email || ""}
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
                onClick={sendInquiryEmail}
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
