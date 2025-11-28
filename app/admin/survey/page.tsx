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
  Building2,
  Mail,
  Phone,
  MapPin,
  Send,
  Loader,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import jsPDF from "jspdf"

interface Survey {
  id: number
  survey_id: string
  company_name: string
  no_of_employees: string
  location: string
  industries: string[]
  industry_other: string
  contact_person: string
  role: string
  email: string
  phone: string
  current_systems: string[]
  current_system_other: string
  satisfaction_level: string
  system_performance_issues: string[]
  process_workflow_issues: string[]
  reporting_data_issues: string[]
  hr_payroll_issues: string[]
  customer_sales_issues: string[]
  inventory_supply_chain_issues: string[]
  digital_marketing_issues: string[]
  daily_situations: string[]
  improvement_areas: string[]
  systems_of_interest: string[]
  system_of_interest_other: string
  preferred_features: string[]
  pain_points: string
  ideal_system: string
  additional_comments: string
  created_at: string
}

const ITEMS_PER_PAGE = 10

export default function AdminSurveyPage() {
  const router = useRouter()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterIndustry, setFilterIndustry] = useState("all")

  const [sendingEmailId, setSendingEmailId] = useState<number | null>(null)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [emailSurvey, setEmailSurvey] = useState<Survey | null>(null)
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
      const response = await fetch("/api/surveys")

      if (!response.ok) {
        throw new Error("Failed to fetch surveys")
      }

      const data = await response.json()
      setSurveys(data.data.data || [])
    } catch (error) {
      console.error("Error fetching surveys:", error)
      setMessage("Failed to load surveys")
    } finally {
      setLoading(false)
    }
  }

  const generatePDF = async (survey: Survey) => {
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

      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = src
        })
      }

      const addHeader = async () => {
        doc.setFillColor(255, 255, 255)
        doc.rect(0, 0, pageWidth, 45, "F")

        try {
          const logo = await loadImage("/images/logo.png")
          const canvas = document.createElement("canvas")
          canvas.width = logo.width
          canvas.height = logo.height
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.drawImage(logo, 0, 0)
            const logoData = canvas.toDataURL("image/png")
            const logoWidth = 35
            const logoHeight = 20
            doc.addImage(logoData, "PNG", (pageWidth - logoWidth) / 2, 4, logoWidth, logoHeight)
          }
        } catch (e) {
          doc.setTextColor(...colors.primaryDark)
          doc.setFontSize(10)
          doc.setFont("helvetica", "bold")
          doc.text("INFINITECH", pageWidth / 2, 15, { align: "center" })
        }

        doc.setTextColor(...colors.primaryDark)
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("Business Needs Assessment", pageWidth / 2, 32, { align: "center" })

        doc.setTextColor(...colors.textMuted)
        doc.setFontSize(8)
        doc.setFont("helvetica", "normal")
       doc.text("Survey Response Report", pageWidth / 2, 39, { align: "center" });

// Add the survey ID under the title
doc.text(`Survey ID: ${survey.survey_id}`, pageWidth / 2, 45, { align: "center" });
      }

      const addFooter = (pageNum: number, totalPages: number) => {
        doc.setFillColor(255, 255, 255)
        doc.rect(0, pageHeight - 18, pageWidth, 18, "F")

        doc.setDrawColor(...colors.borderGray)
        doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18)

        doc.setTextColor(...colors.textDark)
        doc.setFontSize(8)
        doc.setFont("helvetica", "bold")
        doc.text("INFINITECH Advertising Corporation", pageWidth / 2, pageHeight - 12, { align: "center" })

        doc.setTextColor(...colors.textDark)
        doc.setFontSize(6)
        doc.setFont("helvetica", "normal")
        doc.text(
          "311 Campos Rueda Building, Urban Avenue, Makati City | Tel: (02) 7001-6157 | Mobile: (+63) 919-587-4915 | Email: infinitechcorp.ph@gmail.com",
          pageWidth / 2,
          pageHeight - 6,
          { align: "center" },
        )

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

      const addArrayRow = (label: string, items: string[], otherValue?: string, isAlt = false) => {
        const allItems = [...(items || []), ...(otherValue ? [`${otherValue}`] : [])]
        const valueText = allItems.length > 0 ? allItems.join(", ") : "N/A"

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

      const addTextRow = (label: string, text: string, isAlt = false) => {
        if (!text) return
        doc.setFontSize(8)
        const lines = doc.splitTextToSize(text, valueWidth - 4)
        const rowHeight = Math.max(7, Math.min(lines.length * 4 + 3, 40))

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
        const maxLines = Math.floor((rowHeight - 3) / 4)
        for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
          doc.text(lines[i], margin + labelWidth + 2, y + 5 + i * 4)
        }

        y += rowHeight
      }

      // Generate PDF content
      await addHeader()
      y = 48

      // SECTION 1: COMPANY INFORMATION
      addSectionHeader("COMPANY INFORMATION")
      addTableRow("Company Name", survey.company_name, false)
       addTableRow("No. of Employees", survey.no_of_employees, false)
      addTableRow("Location", survey.location, true)
      addTableRow("Contact Person", survey.contact_person, false)
      addTableRow("Role / Position", survey.role, true)
      addTableRow("Email Address", survey.email, false)
      addTableRow("Phone Number", survey.phone, true)
      addArrayRow("Industries", survey.industries, survey.industry_other, false)

      // SECTION 2: CURRENT SYSTEMS & SATISFACTION
      addSectionHeader("CURRENT SYSTEMS & SATISFACTION")
      addArrayRow("Systems in Use", survey.current_systems, survey.current_system_other, false)
      addTableRow("Satisfaction Level", survey.satisfaction_level, true)

      // SECTION 3: SYSTEMS OF INTEREST
      addSectionHeader("SYSTEMS OF INTEREST")
      addArrayRow("Interested Systems", survey.systems_of_interest, survey.system_of_interest_other, false)

      // SECTION 4: AREAS TO IMPROVE
      if (survey.improvement_areas?.length > 0) {
        addSectionHeader("AREAS TO IMPROVE")
        addArrayRow("Improvement Areas", survey.improvement_areas, undefined, false)
      }

      // SECTION 5: PREFERRED FEATURES
      if (survey.preferred_features?.length > 0) {
        addSectionHeader("PREFERRED FEATURES")
        addArrayRow("Features", survey.preferred_features, undefined, false)
      }

      // SECTION 6: HIDDEN NEEDS / DAILY SITUATIONS
      if (survey.daily_situations?.length > 0) {
        addSectionHeader("HIDDEN NEEDS / DAILY SITUATIONS")
        addArrayRow("Daily Situations", survey.daily_situations, undefined, false)
      }

      // SECTION 7: OPERATIONAL CHALLENGES
      const hasOperationalChallenges =
        survey.system_performance_issues?.length ||
        survey.process_workflow_issues?.length ||
        survey.reporting_data_issues?.length ||
        survey.hr_payroll_issues?.length ||
        survey.customer_sales_issues?.length ||
        survey.inventory_supply_chain_issues?.length ||
        survey.digital_marketing_issues?.length

      if (hasOperationalChallenges) {
        addSectionHeader("OPERATIONAL CHALLENGES")
        let altRow = false
        if (survey.system_performance_issues?.length) {
          addArrayRow("System Performance", survey.system_performance_issues, undefined, altRow)
          altRow = !altRow
        }
        if (survey.process_workflow_issues?.length) {
          addArrayRow("Process & Workflow", survey.process_workflow_issues, undefined, altRow)
          altRow = !altRow
        }
        if (survey.reporting_data_issues?.length) {
          addArrayRow("Reporting & Data", survey.reporting_data_issues, undefined, altRow)
          altRow = !altRow
        }
        if (survey.hr_payroll_issues?.length) {
          addArrayRow("HR / Payroll", survey.hr_payroll_issues, undefined, altRow)
          altRow = !altRow
        }
        if (survey.customer_sales_issues?.length) {
          addArrayRow("Customer & Sales", survey.customer_sales_issues, undefined, altRow)
          altRow = !altRow
        }
        if (survey.inventory_supply_chain_issues?.length) {
          addArrayRow("Inventory & Supply Chain", survey.inventory_supply_chain_issues, undefined, altRow)
          altRow = !altRow
        }
        if (survey.digital_marketing_issues?.length) {
          addArrayRow("Digital Marketing", survey.digital_marketing_issues, undefined, altRow)
        }
      }

      // SECTION 8: FEEDBACK & COMMENTS
      if (survey.pain_points || survey.ideal_system || survey.additional_comments) {
        addSectionHeader("FEEDBACK & COMMENTS")
        let altRow = false
        if (survey.pain_points) {
          addTextRow("Pain Points", survey.pain_points, altRow)
          altRow = !altRow
        }
        if (survey.ideal_system) {
          addTextRow("Ideal System", survey.ideal_system, altRow)
          altRow = !altRow
        }
        if (survey.additional_comments) {
          addTextRow("Additional Comments", survey.additional_comments, altRow)
        }
      }

      // Add footers to all pages
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        addFooter(i, pageCount)
      }

      // Auto-download
      doc.save(`survey-${survey.survey_id}-${survey.company_name?.replace(/\s+/g, "_") || "report"}.pdf`)

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

  const openEmailDialog = (survey: Survey) => {
    setEmailSurvey(survey)
    setEmailSubject(`Follow-up: Survey Response  - ${survey.company_name}`)
    setEmailMessage(`Dear ${survey.contact_person || "Valued Customer"},

Thank you for taking the time to complete our survey. We appreciate your feedback regarding your business needs and challenges.

Based on your responses, we would like to schedule a call to discuss how we can better assist ${survey.company_name || "your organization"} with your requirements.

Please let us know your availability for a brief consultation.

Best regards,
The Team`)
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
      const response = await fetch("/api/send-survey-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: emailSurvey.email,
          subject: emailSubject,
          message: emailMessage,
          surveyId: emailSurvey.id,
          companyName: emailSurvey.company_name,
          contactPerson: emailSurvey.contact_person,
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

  const filteredSurveys = surveys.filter((survey) => {
    const matchesSearch =
      (survey.company_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (survey.contact_person?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (survey.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    const matchesFilter = filterIndustry === "all" || survey.industries?.includes(filterIndustry)
    return matchesSearch && matchesFilter
  })

  const totalPages = Math.ceil(filteredSurveys.length / ITEMS_PER_PAGE)
  const paginatedSurveys = filteredSurveys.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4 inline-block">
            <FileText className="h-8 w-8 text-cyan-600" />
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
            <BarChart3 className="h-8 w-8 text-cyan-600" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Survey Management</h1>
          </div>
          <p className="text-muted-foreground">View and manage all survey responses</p>
        </div>

        {/* Message Alert */}
        {message && (
          <Alert className="mb-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <AlertDescription className="text-blue-800 dark:text-blue-200">{message}</AlertDescription>
          </Alert>
        )}

        {/* Search and Filter */}
        <Card className="mb-6 border-2">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by company, contact, or email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10"
                />
              </div>
              <Select
                value={filterIndustry}
                onValueChange={(value) => {
                  setFilterIndustry(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Services">Services</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="border-2 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 border-b-2">
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
                    <TableHead className="font-bold">Company</TableHead>
                       <TableHead className="font-bold">Employees</TableHead>
                    <TableHead className="font-bold">Contact</TableHead>
                    <TableHead className="font-bold">Email</TableHead>
                    <TableHead className="font-bold">Industry</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSurveys.map((survey) => (
                    <TableRow key={survey.id} className="hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 border-b">
                      <TableCell className="font-bold text-cyan-600">{survey.survey_id}</TableCell>
                      <TableCell className="font-medium">{survey.company_name}</TableCell>
                        <TableCell className="font-medium">{survey.no_of_employees}</TableCell>
                      <TableCell className="text-sm">{survey.contact_person}</TableCell>
                      <TableCell className="text-sm text-blue-600 dark:text-blue-400">{survey.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950">
                          {survey.industries?.[0] || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            survey.satisfaction_level?.includes("satisfied") ? "bg-green-500" : "bg-yellow-500"
                          }
                        >
                          {survey.satisfaction_level
                            ? survey.satisfaction_level
                                .split("-")
                                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                                .join(" ")
                            : "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedSurvey(survey)}
                                className="border-2 border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 dark:border-cyan-800 dark:hover:bg-cyan-900/20"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            {selectedSurvey?.id === survey.id && (
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-2">
                                <DialogHeader>
                                  <DialogTitle className="text-2xl flex items-center gap-2">
                                    <Building2 className="h-6 w-6 text-cyan-600" />
                                    Survey Response 
                                  </DialogTitle>
                                   <DialogDescription>
                                    Survey ID {survey.survey_id}
                                  </DialogDescription>
                                  <DialogDescription>
                                    Submitted on {new Date(survey.created_at).toLocaleDateString()}
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-6">
                                  {/* Company Info */}
                                  <div className="bg-gradient-to-br from-slate-50 to-cyan-50/30 dark:from-slate-800 dark:to-cyan-950/10 p-6 rounded-xl border-2">
                                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                      <Building2 className="h-5 w-5 text-cyan-600" />
                                      Company Information
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm text-muted-foreground">Company Name</p>
                                        <p className="font-medium">{survey.company_name || "N/A"}</p>
                                      </div>
                                       <div>
                                        <p className="text-sm text-muted-foreground">No. of Employees</p>
                                        <p className="font-medium">{survey.no_of_employees || "N/A"}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Location</p>
                                        <p className="font-medium flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          {survey.location || "N/A"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Contact Person</p>
                                        <p className="font-medium">{survey.contact_person || "N/A"}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Role / Position</p>
                                        <p className="font-medium">{survey.role || "N/A"}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium flex items-center gap-1">
                                          <Mail className="h-3 w-3" />
                                          {survey.email || "N/A"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Phone</p>
                                        <p className="font-medium flex items-center gap-1">
                                          <Phone className="h-3 w-3" />
                                          {survey.phone || "N/A"}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="mt-4">
                                      <p className="text-sm text-muted-foreground mb-2">Industries</p>
                                      <div className="flex flex-wrap gap-2">
                                        {survey.industries?.map((ind, idx) => (
                                          <Badge
                                            key={idx}
                                            variant="outline"
                                            className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                                          >
                                            {ind}
                                          </Badge>
                                        ))}
                                        {survey.industry_other && (
                                          <Badge
                                            variant="outline"
                                            className="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                                          >
                                            {survey.industry_other}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Current Systems */}
                                  <div className="bg-gradient-to-br from-slate-50 to-cyan-50/30 dark:from-slate-800 dark:to-cyan-950/10 p-6 rounded-xl border-2">
                                    <h3 className="font-semibold text-lg mb-4">Current Systems</h3>
                                    <div className="space-y-3">
                                      <div>
                                        <p className="text-sm text-muted-foreground mb-2">Systems in Use</p>
                                        <div className="flex flex-wrap gap-2">
                                          {survey.current_systems?.map((sys, idx) => (
                                            <Badge
                                              key={idx}
                                              variant="outline"
                                              className="text-slate-700 dark:text-slate-300"
                                            >
                                              {sys}
                                            </Badge>
                                          ))}
                                          {survey.current_system_other && (
                                            <Badge
                                              variant="outline"
                                              className="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                                            >
                                              {survey.current_system_other}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Satisfaction Level</p>
                                        <Badge className="mt-1">{survey.satisfaction_level || "N/A"}</Badge>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Systems of Interest */}
                                  <div className="bg-gradient-to-br from-slate-50 to-cyan-50/30 dark:from-slate-800 dark:to-cyan-950/10 p-6 rounded-xl border-2">
                                    <h3 className="font-semibold text-lg mb-4">Systems of Interest</h3>
                                    <div className="flex flex-wrap gap-2">
                                      {survey.systems_of_interest?.map((sys, idx) => (
                                        <Badge
                                          key={idx}
                                          variant="outline"
                                          className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
                                        >
                                          {sys}
                                        </Badge>
                                      ))}
                                      {survey.system_of_interest_other && (
                                        <Badge
                                          variant="outline"
                                          className="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                                        >
                                           {survey.system_of_interest_other}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  {survey.improvement_areas?.length > 0 && (
                                    <div className="bg-gradient-to-br from-slate-50 to-cyan-50/30 dark:from-slate-800 dark:to-cyan-950/10 p-6 rounded-xl border-2">
                                      <h3 className="font-semibold text-lg mb-4">Areas to Improve</h3>
                                      <div className="flex flex-wrap gap-2">
                                        {survey.improvement_areas.map((area, idx) => (
                                          <Badge
                                            key={idx}
                                            variant="outline"
                                            className="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                                          >
                                            {area}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {survey.daily_situations?.length > 0 && (
                                    <div className="bg-gradient-to-br from-slate-50 to-cyan-50/30 dark:from-slate-800 dark:to-cyan-950/10 p-6 rounded-xl border-2">
                                      <h3 className="font-semibold text-lg mb-4">Hidden Needs / Daily Situations</h3>
                                      <div className="flex flex-wrap gap-2">
                                        {survey.daily_situations.map((situation, idx) => (
                                          <Badge
                                            key={idx}
                                            variant="outline"
                                            className="bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300"
                                          >
                                            {situation}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {(survey.system_performance_issues?.length ||
                                    survey.process_workflow_issues?.length ||
                                    survey.reporting_data_issues?.length ||
                                    survey.hr_payroll_issues?.length ||
                                    survey.customer_sales_issues?.length ||
                                    survey.inventory_supply_chain_issues?.length ||
                                    survey.digital_marketing_issues?.length) && (
                                    <div className="bg-gradient-to-br from-slate-50 to-cyan-50/30 dark:from-slate-800 dark:to-cyan-950/10 p-6 rounded-xl border-2">
                                      <h3 className="font-semibold text-lg mb-4">Operational Challenges</h3>
                                      <div className="space-y-4">
                                        {survey.system_performance_issues?.length > 0 && (
                                          <div>
                                            <p className="text-sm font-semibold text-muted-foreground mb-2">
                                              System Performance Issues
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                              {survey.system_performance_issues.map((issue, idx) => (
                                                <Badge
                                                  key={idx}
                                                  variant="outline"
                                                  className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                                                >
                                                  {issue}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        {survey.process_workflow_issues?.length > 0 && (
                                          <div>
                                            <p className="text-sm font-semibold text-muted-foreground mb-2">
                                              Process & Workflow Issues
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                              {survey.process_workflow_issues.map((issue, idx) => (
                                                <Badge
                                                  key={idx}
                                                  variant="outline"
                                                  className="bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                                                >
                                                  {issue}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        {survey.reporting_data_issues?.length > 0 && (
                                          <div>
                                            <p className="text-sm font-semibold text-muted-foreground mb-2">
                                              Reporting & Data Issues
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                              {survey.reporting_data_issues.map((issue, idx) => (
                                                <Badge
                                                  key={idx}
                                                  variant="outline"
                                                  className="bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800"
                                                >
                                                  {issue}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        {survey.hr_payroll_issues?.length > 0 && (
                                          <div>
                                            <p className="text-sm font-semibold text-muted-foreground mb-2">
                                              HR / Payroll Issues
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                              {survey.hr_payroll_issues.map((issue, idx) => (
                                                <Badge
                                                  key={idx}
                                                  variant="outline"
                                                  className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                                                >
                                                  {issue}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        {survey.customer_sales_issues?.length > 0 && (
                                          <div>
                                            <p className="text-sm font-semibold text-muted-foreground mb-2">
                                              Customer & Sales Issues
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                              {survey.customer_sales_issues.map((issue, idx) => (
                                                <Badge
                                                  key={idx}
                                                  variant="outline"
                                                  className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                                                >
                                                  {issue}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        {survey.inventory_supply_chain_issues?.length > 0 && (
                                          <div>
                                            <p className="text-sm font-semibold text-muted-foreground mb-2">
                                              Inventory & Supply Chain Issues
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                              {survey.inventory_supply_chain_issues.map((issue, idx) => (
                                                <Badge
                                                  key={idx}
                                                  variant="outline"
                                                  className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                                >
                                                  {issue}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        {survey.digital_marketing_issues?.length > 0 && (
                                          <div>
                                            <p className="text-sm font-semibold text-muted-foreground mb-2">
                                              Digital Marketing & Online Presence Issues
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                              {survey.digital_marketing_issues.map((issue, idx) => (
                                                <Badge
                                                  key={idx}
                                                  variant="outline"
                                                  className="bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800"
                                                >
                                                  {issue}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Feedback & Comments */}
                                  {(survey.pain_points || survey.ideal_system || survey.additional_comments) && (
                                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50/30 dark:from-amber-950 dark:to-yellow-950/10 p-6 rounded-xl border-2">
                                      <h3 className="font-semibold text-lg mb-4">Feedback & Comments</h3>
                                      <div className="space-y-4">
                                        {survey.pain_points && (
                                          <div>
                                            <p className="text-sm font-semibold text-muted-foreground mb-1">
                                              Pain Points
                                            </p>
                                            <p className="text-sm whitespace-pre-wrap">{survey.pain_points}</p>
                                          </div>
                                        )}
                                        {survey.ideal_system && (
                                          <div>
                                            <p className="text-sm font-semibold text-muted-foreground mb-1">
                                              Ideal System Description
                                            </p>
                                            <p className="text-sm whitespace-pre-wrap">{survey.ideal_system}</p>
                                          </div>
                                        )}
                                        {survey.additional_comments && (
                                          <div>
                                            <p className="text-sm font-semibold text-muted-foreground mb-1">
                                              Additional Comments
                                            </p>
                                            <p className="text-sm whitespace-pre-wrap">{survey.additional_comments}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Preferred Features */}
                                  {survey.preferred_features?.length > 0 && (
                                    <div className="bg-gradient-to-br from-slate-50 to-cyan-50/30 dark:from-slate-800 dark:to-cyan-950/10 p-6 rounded-xl border-2">
                                      <h3 className="font-semibold text-lg mb-4">Preferred Features</h3>
                                      <div className="flex flex-wrap gap-2">
                                        {survey.preferred_features.map((feature, idx) => (
                                          <Badge key={idx} className="bg-green-500 hover:bg-green-600 text-white">
                                            {feature}
                                          </Badge>
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
                            disabled={sendingEmailId === survey.id}
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
                Send Email to {emailSurvey?.contact_person || "Contact"}
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
