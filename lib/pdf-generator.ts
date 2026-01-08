import jsPDF from "jspdf"

export interface Survey {
  id: number
  survey_id: string
  client_name: string
  company_name: string
  email: string
  phone: string
  role: string
  industries: string[]
  industry_other: string
  business_goals: string[]
  business_goals_other: string
  slowdown_issues: string[]
  slowdown_issues_other: string
  customer_journey: string
  customer_journey_details: string
  sops_status: string
  sops_details: string
  current_tools: string[]
  current_tools_details: string
  marketing_confidence: string
  marketing_details: string
  content_quality: string
  content_details: string
  problem_areas: string[]
  problem_areas_details: string
  data_analytics: string
  data_details: string
  solution_openness: string
  solution_details: string
  created_at: string
}

const colors = {
  primaryDark: [15, 23, 42] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  lightGray: [248, 250, 252] as [number, number, number],
  borderGray: [226, 232, 240] as [number, number, number],
  textDark: [30, 41, 59] as [number, number, number],
  textMuted: [71, 85, 105] as [number, number, number],
}

export const generateSurveyPDF = async (survey: Survey) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 12
  const tableWidth = pageWidth - margin * 2
  const labelWidth = 50
  const valueWidth = tableWidth - labelWidth
  let y = 20

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
      const logo = await loadImage("/logo.png")
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
      doc.text("SURVEY REPORT", pageWidth / 2, 15, { align: "center" })
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
    doc.text("Survey Response System", pageWidth / 2, pageHeight - 12, { align: "center" })

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

  // Build the PDF
  await addHeader()
  y = 48

  addSectionHeader("RESPONDENT INFORMATION")
  addTableRow("Client Name", survey.client_name, false)
  addTableRow("Company Name", survey.company_name, true)
  addTableRow("Email Address", survey.email, false)
  addTableRow("Phone Number", survey.phone, true)
  addTableRow("Role / Position", survey.role, false)
  addArrayRow("Industries", survey.industries, survey.industry_other, true)

  addSectionHeader("BUSINESS GOALS & CHALLENGES")
  addArrayRow("Business Goals", survey.business_goals, survey.business_goals_other, false)
  addArrayRow("Slowdown Issues", survey.slowdown_issues, survey.slowdown_issues_other, true)

  addSectionHeader("CURRENT STATE")
  addTableRow("Customer Journey Documented", survey.customer_journey, false)
  if (survey.customer_journey_details) {
    addTextRow("Details", survey.customer_journey_details, true)
  }

  addTableRow("SOPs Status", survey.sops_status, false)
  if (survey.sops_details) {
    addTextRow("SOP Details", survey.sops_details, true)
  }

  addArrayRow("Current Tools", survey.current_tools, undefined, false)
  if (survey.current_tools_details) {
    addTextRow("Tools Details", survey.current_tools_details, true)
  }

  addSectionHeader("CAPABILITIES & CONFIDENCE")
  addTableRow("Marketing Confidence", survey.marketing_confidence, false)
  if (survey.marketing_details) {
    addTextRow("Details", survey.marketing_details, true)
  }

  addTableRow("Content Quality", survey.content_quality, false)
  if (survey.content_details) {
    addTextRow("Details", survey.content_details, true)
  }

  addTableRow("Data & Analytics", survey.data_analytics, false)
  if (survey.data_details) {
    addTextRow("Details", survey.data_details, true)
  }

  if (survey.problem_areas?.length > 0) {
    addSectionHeader("PROBLEM AREAS")
    addArrayRow("Problem Areas", survey.problem_areas, undefined, false)
    if (survey.problem_areas_details) {
      addTextRow("Details", survey.problem_areas_details, true)
    }
  }

  addSectionHeader("SOLUTION READINESS")
  addTableRow("Solution Openness", survey.solution_openness, false)
  if (survey.solution_details) {
    addTextRow("Details", survey.solution_details, true)
  }

  // Add submission date
  addSectionHeader("SUBMISSION INFO")
  addTableRow("Submitted Date", new Date(survey.created_at).toLocaleString(), false)
  addTableRow("Survey ID", survey.survey_id, true)

  // Add footers to all pages
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    addFooter(i, pageCount)
  }

  // Save the PDF
  const filename = `survey-${survey.survey_id}-${survey.company_name?.replace(/\s+/g, "_") || "report"}.pdf`
  doc.save(filename)

  return filename
}
