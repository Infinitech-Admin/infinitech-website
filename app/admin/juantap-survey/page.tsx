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
  DialogFooter,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  BarChart3,
  FileText,
  Search,
  User,
  Mail,
  Phone,
  MapPin,
  Send,
  Loader,
  Globe,
  Facebook,
  Instagram,
  MessageCircle,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import jsPDF from "jspdf"

interface SocialMedia {
  platform: string
  url: string
}

interface JuanTapSurvey {
  id: number
  email: string
  username: string
  address: string
  phone_number: string
  display_name: string
  first_name: string
  last_name: string
  website: string
  social_media: SocialMedia[]
  created_at: string
}

const ITEMS_PER_PAGE = 10

export default function JuanTapAdminPage() {
  const router = useRouter()
  const [surveys, setSurveys] = useState<JuanTapSurvey[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedSurvey, setSelectedSurvey] = useState<JuanTapSurvey | null>(null)
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const [sendingEmailId, setSendingEmailId] = useState<number | null>(null)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [emailSurvey, setEmailSurvey] = useState<JuanTapSurvey | null>(null)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    if (!token) {
      router.push("/admin/login")
      return
    }

    fetchSurveys()
  }, [router])

  const fetchSurveys = async () => {
    try {
      console.log("Fetching surveys from /api/juantap-surveys...")
      const response = await fetch("/api/juantap-surveys")

      console.log("Response status:", response.status)
      console.log("Response ok:", response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Response error:", errorText)
        throw new Error(`Failed to fetch surveys: ${response.status}`)
      }

      const data = await response.json()
      console.log("Full API Response:", data)
      console.log("Type of data:", typeof data)
      console.log("Is data an array?", Array.isArray(data))
      
      // Handle different response structures
      let surveysData = []
      
      if (Array.isArray(data)) {
        console.log("✅ Data is direct array")
        surveysData = data
      } else if (data.data) {
        console.log("📦 Data is nested in 'data' property")
        console.log("Type of data.data:", typeof data.data)
        console.log("Is data.data an array?", Array.isArray(data.data))
        
        if (Array.isArray(data.data)) {
          surveysData = data.data
        } else if (data.data.data && Array.isArray(data.data.data)) {
          console.log("📦📦 Data is nested in 'data.data' property (Laravel pagination)")
          surveysData = data.data.data
        }
      } else if (data.surveys && Array.isArray(data.surveys)) {
        console.log("📋 Data is nested in 'surveys' property")
        surveysData = data.surveys
      } else {
        console.warn("⚠️ Unknown data structure:", Object.keys(data))
      }
      
      console.log("Final surveysData:", surveysData)
      console.log("Number of surveys:", surveysData.length)
      
      setSurveys(surveysData)
      
      if (surveysData.length === 0) {
        setMessage("No surveys found. The database might be empty.")
      }
    } catch (error) {
      console.error("❌ Error fetching surveys:", error)
      setMessage(`Failed to load surveys: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setSurveys([]) // Ensure surveys is always an array
    } finally {
      setLoading(false)
    }
  }

  const generatePDF = async (survey: JuanTapSurvey) => {
    setDownloadingId(survey.id)
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 12
      const tableWidth = pageWidth - margin * 2
      const labelWidth = 50
      const valueWidth = tableWidth - labelWidth
      let y = 20

      const colors = {
        primaryDark: [15, 23, 42] as [number, number, number],
        orange: [249, 115, 22] as [number, number, number],
        white: [255, 255, 255] as [number, number, number],
        lightGray: [248, 250, 252] as [number, number, number],
        borderGray: [226, 232, 240] as [number, number, number],
        textDark: [30, 41, 59] as [number, number, number],
        textMuted: [71, 85, 105] as [number, number, number],
      }

      const addHeader = () => {
        doc.setFillColor(255, 255, 255)
        doc.rect(0, 0, pageWidth, 45, "F")

        doc.setTextColor(...colors.primaryDark)
        doc.setFontSize(16)
        doc.setFont("helvetica", "bold")
        doc.text("JuanTap", pageWidth / 2, 15, { align: "center" })

        doc.setTextColor(...colors.textMuted)
        doc.setFontSize(12)
        doc.setFont("helvetica", "normal")
        doc.text("Digital Profile Information", pageWidth / 2, 25, { align: "center" })

        doc.setFontSize(8)
        doc.text(`Survey ID: ${survey.id}`, pageWidth / 2, 32, { align: "center" })
        doc.text(`Date: ${new Date(survey.created_at).toLocaleDateString()}`, pageWidth / 2, 38, { align: "center" })
      }

      const addFooter = (pageNum: number, totalPages: number) => {
        doc.setFillColor(255, 255, 255)
        doc.rect(0, pageHeight - 18, pageWidth, 18, "F")

        doc.setDrawColor(...colors.borderGray)
        doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18)

        doc.setTextColor(...colors.textDark)
        doc.setFontSize(8)
        doc.setFont("helvetica", "bold")
        doc.text("JuanTap Digital Profile Platform", pageWidth / 2, pageHeight - 12, { align: "center" })

        doc.setTextColor(...colors.textMuted)
        doc.setFontSize(7)
        doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: "right" })
      }

      const checkPageBreak = (height: number) => {
        if (y + height > pageHeight - 25) {
          doc.addPage()
          y = 15
        }
      }

      const addSectionHeader = (title: string) => {
        checkPageBreak(8)
        doc.setFillColor(...colors.primaryDark)
        doc.rect(margin, y, tableWidth, 7, "F")
        doc.setDrawColor(...colors.borderGray)
        doc.rect(margin, y, tableWidth, 7, "S")
        doc.setTextColor(...colors.white)
        doc.setFontSize(8)
        doc.setFont("helvetica", "bold")
        doc.text(title, margin + 3, y + 5)
        y += 7
      }

      const addTableRow = (label: string, value: string, isAlt = false) => {
        checkPageBreak(7)
        const rowHeight = 7
        const bgColor = isAlt ? colors.lightGray : colors.white

        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2])
        doc.rect(margin, y, tableWidth, rowHeight, "F")
        doc.setDrawColor(...colors.borderGray)
        doc.rect(margin, y, labelWidth, rowHeight, "S")
        doc.rect(margin + labelWidth, y, valueWidth, rowHeight, "S")

        doc.setTextColor(...colors.textMuted)
        doc.setFontSize(8)
        doc.setFont("helvetica", "bold")
        doc.text(label, margin + 2, y + 5)

        doc.setTextColor(...colors.textDark)
        doc.setFont("helvetica", "normal")
        const truncatedValue = value && value.length > 80 ? value.substring(0, 77) + "..." : value || "N/A"
        doc.text(truncatedValue, margin + labelWidth + 2, y + 5)

        y += rowHeight
      }

      const addArrayRow = (label: string, items: SocialMedia[], isAlt = false) => {
        if (!items || items.length === 0) return

        const valueText = items.map(item => `${item.platform}: ${item.url}`).join(", ")
        doc.setFontSize(8)
        const lines = doc.splitTextToSize(valueText, valueWidth - 4)
        const rowHeight = Math.max(7, lines.length * 4 + 3)

        checkPageBreak(rowHeight)
        const bgColor = isAlt ? colors.lightGray : colors.white

        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2])
        doc.rect(margin, y, tableWidth, rowHeight, "F")
        doc.setDrawColor(...colors.borderGray)
        doc.rect(margin, y, labelWidth, rowHeight, "S")
        doc.rect(margin + labelWidth, y, valueWidth, rowHeight, "S")

        doc.setTextColor(...colors.textMuted)
        doc.setFont("helvetica", "bold")
        doc.text(label, margin + 2, y + 5)

        doc.setTextColor(...colors.textDark)
        doc.setFont("helvetica", "normal")
        for (let i = 0; i < lines.length; i++) {
          doc.text(lines[i], margin + labelWidth + 2, y + 5 + i * 4)
        }

        y += rowHeight
      }

      // Generate PDF content
      addHeader()
      y = 48

      // SECTION 1: PERSONAL INFORMATION
      addSectionHeader("PERSONAL INFORMATION")
      addTableRow("Email", survey.email, false)
      addTableRow("Username", survey.username, true)
      addTableRow("Display Name", survey.display_name, false)
      addTableRow("First Name", survey.first_name, true)
      addTableRow("Last Name", survey.last_name, false)

      // SECTION 2: CONTACT INFORMATION
      addSectionHeader("CONTACT INFORMATION")
      addTableRow("Phone Number", survey.phone_number, false)
      addTableRow("Address", survey.address, true)
      addTableRow("Website", survey.website, false)

      // SECTION 3: SOCIAL MEDIA
      if (survey.social_media && survey.social_media.length > 0) {
        addSectionHeader("SOCIAL MEDIA ACCOUNTS")
        addArrayRow("Platforms", survey.social_media, false)
      }

      // Add footers to all pages
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        addFooter(i, pageCount)
      }

      // Auto-download
      doc.save(`juantap-survey-${survey.id}-${survey.username || "profile"}.pdf`)

      setMessage("PDF downloaded successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("Error generating PDF:", error)
      setMessage("Error generating PDF")
      setTimeout(() => setMessage(""), 3000)
    } finally {
      setDownloadingId(null)
    }
  }

  const openEmailDialog = (survey: JuanTapSurvey) => {
    setEmailSurvey(survey)
    setEmailSubject(`JuanTap Profile Setup - ${survey.display_name || survey.username}`)
    setEmailMessage(`Dear ${survey.display_name || survey.first_name || "Valued User"},

Thank you for submitting your information for JuanTap digital profile.

We have received your details and will begin setting up your digital profile shortly. We'll notify you once your JuanTap is ready.

If you have any questions or need assistance, please don't hesitate to reach out.

Best regards,
JuanTap Team`)
    setEmailDialogOpen(true)
  }

  const sendSurveyEmail = async () => {
    if (!emailSurvey?.email) {
      setMessage("Survey has no email address!")
      setTimeout(() => setMessage(""), 3000)
      return
    }

    setSendingEmailId(emailSurvey.id)
    try {
      const response = await fetch("/api/send-juantap-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: emailSurvey.email,
          subject: emailSubject,
          message: emailMessage,
          surveyId: emailSurvey.id,
          displayName: emailSurvey.display_name,
          surveyData: emailSurvey,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send email")
      }

      setMessage("Email sent successfully!")
      setEmailDialogOpen(false)
      setEmailSurvey(null)
      setEmailSubject("")
      setEmailMessage("")
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("Error sending email:", error)
      setMessage("Failed to send email. Check SMTP configuration.")
      setTimeout(() => setMessage(""), 3000)
    } finally {
      setSendingEmailId(null)
    }
  }

  const filteredSurveys = Array.isArray(surveys) ? surveys.filter((survey) => {
    const matchesSearch =
      (survey.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (survey.username?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (survey.display_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (survey.first_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (survey.last_name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    return matchesSearch
  }) : []

  const totalPages = Math.ceil(filteredSurveys.length / ITEMS_PER_PAGE)
  const paginatedSurveys = filteredSurveys.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return <Facebook className="h-4 w-4" />
      case 'instagram':
        return <Instagram className="h-4 w-4" />
      case 'whatsapp':
      case 'wechat':
      case 'viber':
      case 'telegram':
        return <MessageCircle className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4 inline-block">
            <FileText className="h-8 w-8 text-orange-600" />
          </div>
          <p className="text-muted-foreground">Loading surveys...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">JT</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">JuanTap Survey Management</h1>
              <p className="text-muted-foreground">View and manage all JuanTap profile submissions</p>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <Alert className="mb-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <AlertDescription className="text-blue-800 dark:text-blue-200">{message}</AlertDescription>
          </Alert>
        )}

        {/* Search */}
        <Card className="mb-6 border-2">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, username, display name, first or last name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="border-2 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-b-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Survey Responses</CardTitle>
                <CardDescription>
                  Showing {paginatedSurveys.length} of {filteredSurveys.length} surveys
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
                    <TableHead className="font-bold">Display Name</TableHead>
                    <TableHead className="font-bold">Username</TableHead>
                    <TableHead className="font-bold">Email</TableHead>
                    <TableHead className="font-bold">Phone</TableHead>
                    <TableHead className="font-bold">Submitted</TableHead>
                    <TableHead className="font-bold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSurveys.map((survey) => (
                    <TableRow key={survey.id} className="hover:bg-purple-50/50 dark:hover:bg-purple-950/20 border-b">
                      <TableCell className="font-bold text-purple-600">{survey.id}</TableCell>
                      <TableCell className="font-medium">{survey.display_name || "N/A"}</TableCell>
                      <TableCell className="text-sm">{survey.username || "N/A"}</TableCell>
                      <TableCell className="text-sm text-blue-600 dark:text-blue-400">{survey.email || "N/A"}</TableCell>
                      <TableCell className="text-sm">{survey.phone_number || "N/A"}</TableCell>
                      <TableCell className="text-sm">{new Date(survey.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedSurvey(survey)}
                                className="border-2 border-purple-200 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-800 dark:hover:bg-purple-900/20"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            {selectedSurvey?.id === survey.id && (
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-2">
                                <DialogHeader>
                                  <DialogTitle className="text-2xl flex items-center gap-2">
                                    <User className="h-6 w-6 text-purple-600" />
                                    JuanTap Profile Details
                                  </DialogTitle>
                                  <DialogDescription>
                                    Survey ID: {survey.id} | Submitted on {new Date(survey.created_at).toLocaleDateString()}
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-6">
                                  {/* Personal Information */}
                                  <div className="bg-gradient-to-br from-slate-50 to-purple-50/30 dark:from-slate-800 dark:to-purple-950/10 p-6 rounded-xl border-2">
                                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                      <User className="h-5 w-5 text-purple-600" />
                                      Personal Information
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium flex items-center gap-1">
                                          <Mail className="h-3 w-3" />
                                          {survey.email || "N/A"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Username</p>
                                        <p className="font-medium">{survey.username || "N/A"}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Display Name</p>
                                        <p className="font-medium">{survey.display_name || "N/A"}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">First Name</p>
                                        <p className="font-medium">{survey.first_name || "N/A"}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Last Name</p>
                                        <p className="font-medium">{survey.last_name || "N/A"}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Contact Information */}
                                  <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-blue-950/10 p-6 rounded-xl border-2">
                                    <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm text-muted-foreground">Phone Number</p>
                                        <p className="font-medium flex items-center gap-1">
                                          <Phone className="h-3 w-3" />
                                          {survey.phone_number || "N/A"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Website</p>
                                        <p className="font-medium flex items-center gap-1">
                                          <Globe className="h-3 w-3" />
                                          {survey.website || "N/A"}
                                        </p>
                                      </div>
                                      <div className="md:col-span-2">
                                        <p className="text-sm text-muted-foreground">Address</p>
                                        <p className="font-medium flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          {survey.address || "N/A"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Social Media */}
                                  {survey.social_media && survey.social_media.length > 0 && (
                                    <div className="bg-gradient-to-br from-slate-50 to-green-50/30 dark:from-slate-800 dark:to-green-950/10 p-6 rounded-xl border-2">
                                      <h3 className="font-semibold text-lg mb-4">Social Media Accounts</h3>
                                      <div className="space-y-3">
                                        {survey.social_media.map((social, idx) => (
                                          <div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border">
                                            <div className="flex items-center gap-2">
                                              {getSocialIcon(social.platform)}
                                              <span className="font-semibold text-sm">{social.platform}:</span>
                                            </div>
                                            <a 
                                              href={social.url} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-blue-600 dark:text-blue-400 hover:underline text-sm truncate flex-1"
                                            >
                                              {social.url}
                                            </a>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            )}
                          </Dialog>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generatePDF(survey)}
                            disabled={downloadingId === survey.id}
                            className="border-2 border-green-200 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:hover:bg-green-900/20"
                          >
                            {downloadingId === survey.id ? (
                              <Loader className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4 mr-1" />
                            )}
                            PDF
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEmailDialog(survey)}
                            disabled={sendingEmailId === survey.id || !survey.email}
                            className="border-2 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:hover:bg-blue-950/20"
                          >
                            {sendingEmailId === survey.id ? (
                              <Loader className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4 mr-1" />
                            )}
                            Email
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

        {/* Pagination */}
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
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Email Dialog */}
        <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                Send Email to {emailSurvey?.display_name || emailSurvey?.username || "User"}
              </DialogTitle>
              <DialogDescription>Compose your message to {emailSurvey?.email}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email-to">To</Label>
                <Input
                  id="email-to"
                  value={emailSurvey?.email || ""}
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
              <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={sendSurveyEmail}
                disabled={sendingEmailId !== null || !emailSubject || !emailMessage}
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
  )
}
