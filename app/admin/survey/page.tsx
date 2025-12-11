"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
  Building2,
  Mail,
  Phone,
  MapPin,
  Send,
  Loader,
  ExternalLink,
  Search,
  Filter,
  ChevronDown,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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

interface PlanModalState {
  isOpen: boolean
  survey: Survey | null
  planType: "juan-tap" | "video" | "photo" | null
}

interface EmailPreviewState {
  isOpen: boolean
  survey: Survey | null
  subject: string
  message: string
  htmlContent?: string
}

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

  const [emailPreview, setEmailPreview] = useState<EmailPreviewState>({
    isOpen: false,
    survey: null,
    subject: "",
    message: "",
    htmlContent: "",
  })

  const [planModal, setPlanModal] = useState<PlanModalState>({
    isOpen: false,
    survey: null,
    planType: null,
  })
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [sendingChallengeEmailId, setSendingChallengeEmailId] = useState<number | null>(null)
  const [challengeEmailPreview, setChallengeEmailPreview] = useState<EmailPreviewState>({
    isOpen: false,
    survey: null,
    subject: "",
    message: "",
    htmlContent: "",
  })

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

  const openEmailDialog = (survey: Survey) => {
    setEmailPreview({
      isOpen: true,
      survey,
      subject: `Follow-up: Survey Response - ${survey.company_name}`,
      message: `Dear ${survey.contact_person || "Valued Customer"},

Thank you for taking the time to complete our survey. We appreciate your feedback regarding your business needs and challenges.

Based on your responses, we would like to schedule a call to discuss how we can better assist ${survey.company_name || "your organization"} with your requirements.

Please let us know your availability for a brief consultation.

Best regards,
The Team`,
    })
  }

  const sendEmailFromPreview = async () => {
    if (!emailPreview.survey?.email) {
      setMessage("Survey has no email address!")
      setTimeout(() => setMessage(""), 3000)
      return
    }

    setSendingEmailId(emailPreview.survey.id)
    try {
      const response = await fetch("/api/send-survey-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: emailPreview.survey.email,
          subject: emailPreview.subject,
          message: emailPreview.message,
          surveyId: emailPreview.survey.id,
          companyName: emailPreview.survey.company_name,
          contactPerson: emailPreview.survey.contact_person,
          surveyData: emailPreview.survey,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send email")
      }

      setMessage("Email sent successfully!")
      setEmailPreview({
        isOpen: false,
        survey: null,
        subject: "",
        message: "",
      })
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("Error sending email:", error)
      setMessage("Failed to send email. Check SMTP configuration.")
      setTimeout(() => setMessage(""), 3000)
    } finally {
      setSendingEmailId(null)
    }
  }

  const openPlanModal = (survey: Survey, planType: "juan-tap" | "video" | "photo") => {
    setPlanModal({
      isOpen: true,
      survey,
      planType,
    })
    setSelectedPlan("")
  }

  const generateChallengeEmailPreview = async () => {
    if (!planModal.survey || !selectedPlan) {
      setMessage("Please select a plan")
      setTimeout(() => setMessage(""), 3000)
      return
    }

    const survey = planModal.survey
    const planType = planModal.planType

    // Identify challenges from survey data
    const challenges: string[] = []

    if (survey.system_performance_issues?.length) {
      challenges.push(...survey.system_performance_issues.map((issue) => `System Performance: ${issue}`))
    }
    if (survey.process_workflow_issues?.length) {
      challenges.push(...survey.process_workflow_issues.map((issue) => `Process & Workflow: ${issue}`))
    }
    if (survey.reporting_data_issues?.length) {
      challenges.push(...survey.reporting_data_issues.map((issue) => `Reporting & Data: ${issue}`))
    }
    if (survey.hr_payroll_issues?.length) {
      challenges.push(...survey.hr_payroll_issues.map((issue) => `HR & Payroll: ${issue}`))
    }
    if (survey.customer_sales_issues?.length) {
      challenges.push(...survey.customer_sales_issues.map((issue) => `Customer & Sales: ${issue}`))
    }
    if (survey.inventory_supply_chain_issues?.length) {
      challenges.push(...survey.inventory_supply_chain_issues.map((issue) => `Inventory & Supply Chain: ${issue}`))
    }
    if (survey.digital_marketing_issues?.length) {
      challenges.push(...survey.digital_marketing_issues.map((issue) => `Digital Marketing: ${issue}`))
    }

    let planName = ""
    let planDescription = ""

    if (planType === "juan-tap") {
      planName = "Free JuanTap Card"
      if (selectedPlan === "standard") {
        planDescription =
          "Standard JuanTap Card - Access to basic digital profile features with essential business card capabilities"
      } else if (selectedPlan === "premium") {
        planDescription =
          "Premium JuanTap Card - Enhanced digital profile with advanced features, analytics, and priority support"
      } else if (selectedPlan === "elite") {
        planDescription =
          "Elite JuanTap Card - Premium metal NFC digital business card with white glove service and exclusive features"
      }
    } else if (planType === "video") {
      planName = "Free Video Shoot"
      planDescription = "Professional video production package ideal for business promotion"
    } else if (planType === "photo") {
      planName = "Free Photo Shoot"
      planDescription = "Professional photography session with edited digital copies for business use"
    }

    const subject = `${planName} - ${survey.company_name || "Your Organization"} - Survey Follow-up`

    const challengesText =
      challenges.length > 0 ? challenges.map((c) => `• ${c}`).join("\n") : "• No specific challenges identified"

    const surveyLink =
      planType === "juan-tap" ? `\n\nTo proceed, please visit: https://infinitechphil.com/juantap-survey` : ""

    const message = `Good day ${survey.contact_person || "Valued Customer"}! 👋

Thank you for taking the time to visit our booth at AIM last November 29, 2025 and for completing our website survey. We truly appreciate the opportunity to learn more about ${survey.company_name || "your organization"} and your current operational setup.

🎯 Identified Challenges from Your Survey:
Based on your responses, we've identified the following areas where we can assist:

${challengesText}

As a token of appreciation, we would like to offer you the following complimentary package:

🎁 ${planName}
${planDescription}

${surveyLink}

📋 Your Information on File:
Company: ${survey.company_name || "N/A"}
Contact Person: ${survey.contact_person || "N/A"}
Position: ${survey.role || "N/A"}
Email: ${survey.email || "N/A"}
Phone: ${survey.phone || "N/A"}
Location: ${survey.location || "N/A"}

📞 Next Steps:
We would love to schedule a consultation at your convenience to discuss how our solutions can help address the challenges you've identified and improve your operations. Please let us know your availability.

Thank you for your interest in our services!

Best regards,
The Team

© ${new Date().getFullYear()} INFINITECH Advertising Corporation. All rights reserved.`

    setChallengeEmailPreview({
      isOpen: true,
      survey: survey,
      subject: subject,
      message: message,
      htmlContent: message,
    })

    // Close the plan modal
    setPlanModal({
      isOpen: false,
      survey: null,
      planType: null,
    })
  }

  const sendChallengeEmailFromPreview = async () => {
    if (!challengeEmailPreview.survey?.email) {
      setMessage("Survey has no email address!")
      setTimeout(() => setMessage(""), 3000)
      return
    }

    setSendingChallengeEmailId(challengeEmailPreview.survey.id)
    try {
      const response = await fetch("/api/send-challenge-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: challengeEmailPreview.survey.email,
          contactPerson: challengeEmailPreview.survey.contact_person,
          companyName: challengeEmailPreview.survey.company_name,
          surveyData: challengeEmailPreview.survey,
          planType: planModal.planType,
          selectedPlan: selectedPlan,
          message: challengeEmailPreview.message,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send challenge email")
      }

      setMessage("Challenge email sent successfully!")
      setChallengeEmailPreview({
        isOpen: false,
        survey: null,
        subject: "",
        message: "",
      })
      setSelectedPlan("")
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("Error sending challenge email:", error)
      setMessage("Failed to send challenge email. Check SMTP configuration.")
      setTimeout(() => setMessage(""), 3000)
    } finally {
      setSendingChallengeEmailId(null)
    }
  }

  // ... existing code for generatePDF ...
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
          const logo = await loadImage("/images/photo1765413474.jpg")
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
        doc.text("Survey Response Report", pageWidth / 2, 39, { align: "center" })

        doc.text(`Survey ID: ${survey.survey_id}`, pageWidth / 2, 45, { align: "center" })
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

      await addHeader()
      y = 48

      addSectionHeader("COMPANY INFORMATION")
      addTableRow("Company Name", survey.company_name, false)
      addTableRow("No. of Employees", survey.no_of_employees, false)
      addTableRow("Location", survey.location, true)
      addTableRow("Contact Person", survey.contact_person, false)
      addTableRow("Role / Position", survey.role, true)
      addTableRow("Email Address", survey.email, false)
      addTableRow("Phone Number", survey.phone, true)
      addArrayRow("Industries", survey.industries, survey.industry_other, false)

      addSectionHeader("CURRENT SYSTEMS & SATISFACTION")
      addArrayRow("Systems in Use", survey.current_systems, survey.current_system_other, false)
      addTableRow("Satisfaction Level", survey.satisfaction_level, true)

      addSectionHeader("SYSTEMS OF INTEREST")
      addArrayRow("Interested Systems", survey.systems_of_interest, survey.system_of_interest_other, false)

      if (survey.improvement_areas?.length > 0) {
        addSectionHeader("AREAS TO IMPROVE")
        addArrayRow("Improvement Areas", survey.improvement_areas, undefined, false)
      }

      if (survey.preferred_features?.length > 0) {
        addSectionHeader("PREFERRED FEATURES")
        addArrayRow("Features", survey.preferred_features, undefined, false)
      }

      if (survey.daily_situations?.length > 0) {
        addSectionHeader("HIDDEN NEEDS / DAILY SITUATIONS")
        addArrayRow("Daily Situations", survey.daily_situations, undefined, false)
      }

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

      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        addFooter(i, pageCount)
      }

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

  // Calculate stats
  const totalSurveys = surveys.length
  const pendingSurveys = 0 // You can implement this logic based on your requirements
  const repliedSurveys = surveys.length // Assuming all are replied for now
  const resolvedSurveys = 0 // You can implement this logic based on your requirements

  // Generate initials for avatar
  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  }

  // Generate avatar color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500", 
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-teal-500"
    ]
    const hash = name?.split('').reduce((a, b) => a + b.charCodeAt(0), 0) || 0
    return colors[hash % colors.length]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading surveys...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <BarChart3 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Survey Responses</h1>
              <p className="text-cyan-100 mt-1">Manage and respond to customer inquiries</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="bg-white text-blue-600 border-white hover:bg-blue-50"
            onClick={() => router.push("/admin")}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {message && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{message}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-l-4 border-l-cyan-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Inquiries</p>
                  <p className="text-3xl font-bold text-gray-900">{totalSurveys}</p>
                </div>
                <div className="p-3 bg-cyan-500 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-l-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{pendingSurveys}</p>
                </div>
                <div className="p-3 bg-yellow-500 rounded-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Replied</p>
                  <p className="text-3xl font-bold text-blue-600">{repliedSurveys}</p>
                </div>
                <div className="p-3 bg-blue-500 rounded-lg">
                  <Mail className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Resolved</p>
                  <p className="text-3xl font-bold text-green-600">{resolvedSurveys}</p>
                </div>
                <div className="p-3 bg-green-500 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="border-b border-gray-200 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">All Inquiries</CardTitle>
                  <CardDescription className="text-gray-500">
                    Showing 1-{Math.min(ITEMS_PER_PAGE, filteredSurveys.length)} of {filteredSurveys.length}
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search inquiries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  All Status
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-6 px-6 py-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
              <div className="col-span-3">Name</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">Phone</div>
              <div className="col-span-2">Message</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {paginatedSurveys.map((survey) => (
                <div key={survey.id} className="grid grid-cols-12 gap-6 px-6 py-4 hover:bg-gray-50 transition-colors items-center">
                  {/* Name with Avatar */}
                  <div className="col-span-3 flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${getAvatarColor(survey.contact_person || survey.company_name || "")}`}>
                      {getInitials(survey.contact_person || survey.company_name || "")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{survey.contact_person || "N/A"}</p>
                      <p className="text-sm text-gray-500 truncate">{survey.company_name}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="col-span-3 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-900 truncate">{survey.email}</span>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="col-span-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-900 truncate">{survey.phone}</span>
                    </div>
                  </div>

                  {/* Message Preview */}
                  <div className="col-span-2 min-w-0">
                    <p className="text-sm text-gray-600 truncate">
                      {survey.pain_points || survey.additional_comments || "Good day Ma'am/Sir, I hope you are doing..."}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="col-span-1">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 whitespace-nowrap">
                      Replied
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1">
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        {survey && (
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-2xl">
                                <Building2 className="h-6 w-6 text-blue-600" />
                                {survey.company_name}
                              </DialogTitle>
                              <DialogDescription>
                                Survey ID: {survey.survey_id} | Submitted:{" "}
                                {new Date(survey.created_at).toLocaleDateString()}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                                  <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
                                  <div className="space-y-3">
                                    <div className="flex items-start gap-2">
                                      <Building2 className="h-4 w-4 text-blue-600 mt-1" />
                                      <div>
                                        <p className="text-sm font-semibold text-muted-foreground">Company</p>
                                        <p className="text-sm">{survey.company_name}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <Mail className="h-4 w-4 text-blue-600 mt-1" />
                                      <div>
                                        <p className="text-sm font-semibold text-muted-foreground">Email</p>
                                        <p className="text-sm">{survey.email}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <Phone className="h-4 w-4 text-blue-600 mt-1" />
                                      <div>
                                        <p className="text-sm font-semibold text-muted-foreground">Phone</p>
                                        <p className="text-sm">{survey.phone}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <MapPin className="h-4 w-4 text-blue-600 mt-1" />
                                      <div>
                                        <p className="text-sm font-semibold text-muted-foreground">Location</p>
                                        <p className="text-sm">{survey.location}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 p-6 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                                  <h3 className="font-semibold text-lg mb-4">Business Profile</h3>
                                  <div className="space-y-3">
                                    <div>
                                      <p className="text-sm font-semibold text-muted-foreground mb-1">
                                        Contact Person
                                      </p>
                                      <p className="text-sm">{survey.contact_person}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-muted-foreground mb-1">Role</p>
                                      <p className="text-sm">{survey.role}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-muted-foreground mb-1">Employees</p>
                                      <p className="text-sm">{survey.no_of_employees}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-muted-foreground mb-1">Industries</p>
                                      <div className="flex flex-wrap gap-2">
                                        {survey.industries?.map((ind, idx) => (
                                          <Badge
                                            key={idx}
                                            className="bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100"
                                          >
                                            {ind}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {survey.current_systems?.length > 0 && (
                                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-950/30 dark:to-cyan-900/20 p-6 rounded-xl border-2 border-cyan-200 dark:border-cyan-800">
                                  <h3 className="font-semibold text-lg mb-4">Current Systems</h3>
                                  <div className="flex flex-wrap gap-2">
                                    {survey.current_systems.map((system, idx) => (
                                      <Badge
                                        key={idx}
                                        className="bg-cyan-200 dark:bg-cyan-800 text-cyan-900 dark:text-cyan-100"
                                      >
                                        {system}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {survey.systems_of_interest?.length > 0 && (
                                <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 p-6 rounded-xl border-2 border-green-200 dark:border-green-800">
                                  <h3 className="font-semibold text-lg mb-4">Systems of Interest</h3>
                                  <div className="flex flex-wrap gap-2">
                                    {survey.systems_of_interest.map((system, idx) => (
                                      <Badge
                                        key={idx}
                                        className="bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100"
                                      >
                                        {system}
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
                                <div className="bg-gradient-to-br from-red-50 to-orange-50/30 dark:from-red-950/30 dark:to-orange-950/20 p-6 rounded-xl border-2 border-red-200 dark:border-red-800">
                                  <h3 className="font-semibold text-lg mb-4">Identified Challenges</h3>
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
                                              className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
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

                              {survey.preferred_features?.length > 0 && (
                                <div className="bg-gradient-to-br from-slate-50 to-cyan-50/30 dark:from-slate-800 dark:to-cyan-950/10 p-6 rounded-xl border-2">
                                  <h3 className="font-semibold text-lg mb-4">Preferred Features</h3>
                                  <div className="flex flex-wrap gap-2 mb-6">
                                    {survey.preferred_features.map((feature, idx) => (
                                      <Badge key={idx} className="bg-green-500 hover:bg-green-600 text-white">
                                        {feature}
                                      </Badge>
                                    ))}
                                  </div>

                                  <div className="border-t pt-4 space-y-3">
                                    <p className="text-sm font-semibold text-muted-foreground">Actions</p>
                                    <div className="flex flex-col gap-2">
                                      <Button
                                        variant="outline"
                                        onClick={() => openEmailDialog(survey)}
                                        disabled={sendingEmailId === survey.id}
                                        className="w-full border-2 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:hover:bg-blue-950/20 justify-start"
                                      >
                                        {sendingEmailId === survey.id ? (
                                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                          <Send className="h-4 w-4 mr-2" />
                                        )}
                                        Send Email
                                      </Button>

                                      <Button
                                        variant="outline"
                                        onClick={() => openPlanModal(survey, "juan-tap")}
                                        disabled={sendingChallengeEmailId === survey.id}
                                        className="w-full border-2 border-purple-200 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-800 dark:hover:bg-purple-900/20 justify-start"
                                      >
                                        {sendingChallengeEmailId === survey.id ? (
                                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                          <Eye className="h-4 w-4 mr-2" />
                                        )}
                                        Free JuanTap
                                      </Button>

                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          openPlanModal(survey, "video")
                                        }}
                                        disabled={sendingChallengeEmailId === survey.id}
                                        className="w-full border-2 border-orange-200 hover:bg-orange-50 hover:text-orange-700 dark:border-orange-800 dark:hover:bg-orange-900/20 justify-start"
                                      >
                                        {sendingChallengeEmailId === survey.id ? (
                                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                          <Eye className="h-4 w-4 mr-2" />
                                        )}
                                        Free Video Shoot
                                      </Button>

                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          openPlanModal(survey, "photo")
                                        }}
                                        disabled={sendingChallengeEmailId === survey.id}
                                        className="w-full border-2 border-pink-200 hover:bg-pink-50 hover:text-pink-700 dark:border-pink-800 dark:hover:bg-pink-900/20 justify-start"
                                      >
                                        {sendingChallengeEmailId === survey.id ? (
                                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                          <Eye className="h-4 w-4 mr-2" />
                                        )}
                                        Free Photo Shoot
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        )}
                      </Dialog>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => generatePDF(survey)}
                        disabled={downloadingId === survey.id}
                        className="h-8 w-8 p-0"
                      >
                        {downloadingId === survey.id ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEmailDialog(survey)}
                        disabled={sendingEmailId === survey.id}
                        className="h-8 w-8 p-0"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">
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

        {/* All existing modals remain the same */}
        <Dialog
          open={emailPreview.isOpen}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setEmailPreview({
                isOpen: false,
                survey: null,
                subject: "",
                message: "",
              })
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                Email Preview
              </DialogTitle>
              <DialogDescription>
                Review and edit your email before sending to {emailPreview.survey?.contact_person || "contact"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="preview-to">To</Label>
                <Input
                  id="preview-to"
                  value={emailPreview.survey?.email || ""}
                  onChange={(e) =>
                    setEmailPreview({
                      ...emailPreview,
                      survey: emailPreview.survey ? { ...emailPreview.survey, email: e.target.value } : null,
                    })
                  }
                  className="bg-slate-50 dark:bg-slate-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preview-subject">Subject</Label>
                <Input
                  id="preview-subject"
                  value={emailPreview.subject}
                  onChange={(e) =>
                    setEmailPreview({
                      ...emailPreview,
                      subject: e.target.value,
                    })
                  }
                  placeholder="Enter email subject..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preview-message">Message</Label>
                <Textarea
                  id="preview-message"
                  value={emailPreview.message}
                  onChange={(e) =>
                    setEmailPreview({
                      ...emailPreview,
                      message: e.target.value,
                    })
                  }
                  placeholder="Enter your message..."
                  rows={12}
                  className="resize-none font-mono text-sm"
                />
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEmailPreview({
                    isOpen: false,
                    survey: null,
                    subject: "",
                    message: "",
                  })
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={sendEmailFromPreview}
                disabled={sendingEmailId !== null || !emailPreview.subject || !emailPreview.message}
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

        <Dialog
          open={planModal.isOpen}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setPlanModal({ ...planModal, isOpen })
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-600" />
                Select{" "}
                {planModal.planType === "juan-tap"
                  ? "Free JuanTap"
                  : planModal.planType === "video"
                    ? "Free Video Shoot"
                    : "Free Photo Shoot"}{" "}
                Plan
              </DialogTitle>
              <DialogDescription>
                Choose a plan for {planModal.survey?.contact_person || "the contact"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {planModal.planType === "juan-tap" && (
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">View JuanTap Survey</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                        To proceed with the JuanTap offering, please click the link below:
                      </p>
                      <a
                        href="https://infinitechphil.com/juantap-survey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
                      >
                        infinitechphil.com/juantap-survey
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-3">
                <Label>Available Plans</Label>
                <div className="grid grid-cols-1 gap-3">
                  {planModal.planType === "juan-tap" && (
                    <>
                      <div
                        className="p-4 border-2 rounded-lg cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/30"
                        onClick={() => setSelectedPlan("standard")}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="plan"
                            value="standard"
                            checked={selectedPlan === "standard"}
                            onChange={() => setSelectedPlan("standard")}
                          />
                          <div>
                            <p className="font-semibold">Standard Plan</p>
                            <p className="text-sm text-muted-foreground">Basic features included</p>
                          </div>
                        </div>
                      </div>
                      <div
                        className="p-4 border-2 rounded-lg cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/30"
                        onClick={() => setSelectedPlan("premium")}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="plan"
                            value="premium"
                            checked={selectedPlan === "premium"}
                            onChange={() => setSelectedPlan("premium")}
                          />
                          <div>
                            <p className="font-semibold">Premium Plan</p>
                            <p className="text-sm text-muted-foreground">Advanced features and support</p>
                          </div>
                        </div>
                      </div>
                      <div
                        className="p-4 border-2 rounded-lg cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/30"
                        onClick={() => setSelectedPlan("elite")}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="plan"
                            value="elite"
                            checked={selectedPlan === "elite"}
                            onChange={() => setSelectedPlan("elite")}
                          />
                          <div>
                            <p className="font-semibold">Elite Plan</p>
                            <p className="text-sm text-muted-foreground">Premium experience with priority support</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {planModal.planType === "video" && (
                    <div
                      className="p-4 border-2 rounded-lg cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-950/30"
                      onClick={() => setSelectedPlan("standard")}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="plan"
                          value="standard"
                          checked={selectedPlan === "standard"}
                          onChange={() => setSelectedPlan("standard")}
                        />
                        <div>
                          <p className="font-semibold">Free Video Shoot</p>
                          <p className="text-sm text-muted-foreground">Professional video production package</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {planModal.planType === "photo" && (
                    <div
                      className="p-4 border-2 rounded-lg cursor-pointer hover:bg-pink-50 dark:hover:bg-pink-950/30"
                      onClick={() => setSelectedPlan("standard")}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="plan"
                          value="standard"
                          checked={selectedPlan === "standard"}
                          onChange={() => setSelectedPlan("standard")}
                        />
                        <div>
                          <p className="font-semibold">Free Photo Shoot</p>
                          <p className="text-sm text-muted-foreground">Professional photography package</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setPlanModal({ isOpen: false, survey: null, planType: null })
                  setSelectedPlan("")
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={generateChallengeEmailPreview}
                disabled={sendingChallengeEmailId !== null || !selectedPlan}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {sendingChallengeEmailId !== null ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Review Email
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={challengeEmailPreview.isOpen}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setChallengeEmailPreview({
                isOpen: false,
                survey: null,
                subject: "",
                message: "",
              })
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-purple-600" />
                Email Preview
              </DialogTitle>
              <DialogDescription>
                Review the email content before sending to {challengeEmailPreview.survey?.contact_person || "contact"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="challenge-preview-to">To</Label>
                <Input
                  id="challenge-preview-to"
                  value={challengeEmailPreview.survey?.email || ""}
                  onChange={(e) =>
                    setChallengeEmailPreview({
                      ...challengeEmailPreview,
                      survey: challengeEmailPreview.survey
                        ? { ...challengeEmailPreview.survey, email: e.target.value }
                        : null,
                    })
                  }
                  className="bg-slate-50 dark:bg-slate-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="challenge-preview-subject">Subject</Label>
                <Input
                  id="challenge-preview-subject"
                  value={challengeEmailPreview.subject}
                  onChange={(e) =>
                    setChallengeEmailPreview({
                      ...challengeEmailPreview,
                      subject: e.target.value,
                    })
                  }
                  className="bg-slate-50 dark:bg-slate-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="challenge-preview-message">Message</Label>
                <Textarea
                  id="challenge-preview-message"
                  value={challengeEmailPreview.message}
                  onChange={(e) =>
                    setChallengeEmailPreview({
                      ...challengeEmailPreview,
                      message: e.target.value,
                    })
                  }
                  rows={14}
                  className="resize-none font-mono text-sm"
                />
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setChallengeEmailPreview({
                    isOpen: false,
                    survey: null,
                    subject: "",
                    message: "",
                  })
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={sendChallengeEmailFromPreview}
                disabled={sendingChallengeEmailId !== null}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {sendingChallengeEmailId !== null ? (
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
