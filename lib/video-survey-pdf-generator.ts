// lib/video-survey-pdf-generator.ts

import jsPDF from "jspdf"

interface VideoSurvey {
  id: number
  survey_id: string
  company_name: string
  industry: string
  company_different: string
  brand_words: string
  video_purpose: string[]
  video_purpose_other: string
  viewer_action: string
  target_audience: string[]
  audience_matters: string[]
  preferred_style: string[]
  preferred_style_other: string
  preferred_format: string[]
  video_inclusions: string[]
  video_inclusions_other: string
  video_length: string[]
  video_length_other: string
  video_usage: string[]
  subtitles: string[]
  created_at: string
}

export async function generateVideoSurveyPDF(survey: VideoSurvey) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - 2 * margin
  let yPosition = margin

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage()
      yPosition = margin
      return true
    }
    return false
  }

  // Helper function to wrap text
  const addWrappedText = (text: string, fontSize: number, isBold: boolean = false) => {
    doc.setFontSize(fontSize)
    doc.setFont("helvetica", isBold ? "bold" : "normal")
    const lines = doc.splitTextToSize(text, contentWidth)
    
    checkPageBreak(lines.length * (fontSize * 0.5))
    
    lines.forEach((line: string) => {
      doc.text(line, margin, yPosition)
      yPosition += fontSize * 0.5
    })
    yPosition += 3
  }

  // Header with gradient effect (simulated)
  doc.setFillColor(59, 130, 246) // Blue
  doc.rect(0, 0, pageWidth, 40, "F")
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("Video Project Survey", margin, 25)
  
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Survey ID: ${survey.survey_id}`, margin, 33)
  doc.text(
    `Generated: ${new Date().toLocaleDateString()}`,
    pageWidth - margin - 60,
    33
  )

  yPosition = 50
  doc.setTextColor(0, 0, 0)

  // Company Information Section
  doc.setFillColor(241, 245, 249) // Light blue-gray
  doc.rect(margin, yPosition, contentWidth, 8, "F")
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(30, 58, 138) // Dark blue
  doc.text("Company Information", margin + 3, yPosition + 6)
  yPosition += 15
  doc.setTextColor(0, 0, 0)

  addWrappedText(`Company Name: ${survey.company_name}`, 11, true)
  addWrappedText(`Industry: ${survey.industry}`, 11, false)
  yPosition += 5

  // Question 1
  doc.setFillColor(241, 245, 249)
  doc.rect(margin, yPosition, contentWidth, 8, "F")
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(30, 58, 138)
  doc.text("Q1. Company Differentiation", margin + 3, yPosition + 6)
  yPosition += 15
  doc.setTextColor(0, 0, 0)
  
  addWrappedText(
    survey.company_different || "No response provided",
    10,
    false
  )
  yPosition += 3

  // Question 2
  doc.setFillColor(241, 245, 249)
  doc.rect(margin, yPosition, contentWidth, 8, "F")
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(30, 58, 138)
  doc.text("Q2. Brand in 3 Words", margin + 3, yPosition + 6)
  yPosition += 15
  doc.setTextColor(0, 0, 0)
  
  addWrappedText(survey.brand_words || "No response provided", 10, false)
  yPosition += 3

  // Question 3
  checkPageBreak(30)
  doc.setFillColor(241, 245, 249)
  doc.rect(margin, yPosition, contentWidth, 8, "F")
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(30, 58, 138)
  doc.text("Q3. Main Purpose of Video", margin + 3, yPosition + 6)
  yPosition += 15
  doc.setTextColor(0, 0, 0)
  
  if (survey.video_purpose && survey.video_purpose.length > 0) {
    survey.video_purpose.forEach((purpose) => {
      addWrappedText(`• ${purpose}`, 10, false)
    })
    if (survey.video_purpose_other) {
      addWrappedText(`  Other: ${survey.video_purpose_other}`, 10, false)
    }
  } else {
    addWrappedText("No response provided", 10, false)
  }
  yPosition += 3

  // Question 4
  checkPageBreak(30)
  doc.setFillColor(241, 245, 249)
  doc.rect(margin, yPosition, contentWidth, 8, "F")
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(30, 58, 138)
  doc.text("Q4. Desired Viewer Action", margin + 3, yPosition + 6)
  yPosition += 15
  doc.setTextColor(0, 0, 0)
  
  addWrappedText(survey.viewer_action || "No response provided", 10, false)
  yPosition += 3

  // Question 5
  checkPageBreak(30)
  doc.setFillColor(241, 245, 249)
  doc.rect(margin, yPosition, contentWidth, 8, "F")
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(30, 58, 138)
  doc.text("Q5. Target Audience", margin + 3, yPosition + 6)
  yPosition += 15
  doc.setTextColor(0, 0, 0)
  
  if (survey.target_audience && survey.target_audience.length > 0) {
    addWrappedText(survey.target_audience.join(", "), 10, false)
  } else {
    addWrappedText("No response provided", 10, false)
  }
  yPosition += 3

  // Question 6
  checkPageBreak(30)
  doc.setFillColor(241, 245, 249)
  doc.rect(margin, yPosition, contentWidth, 8, "F")
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(30, 58, 138)
  doc.text("Q6. What Matters Most to Audience", margin + 3, yPosition + 6)
  yPosition += 15
  doc.setTextColor(0, 0, 0)
  
  if (survey.audience_matters && survey.audience_matters.length > 0) {
    addWrappedText(survey.audience_matters.join(", "), 10, false)
  } else {
    addWrappedText("No response provided", 10, false)
  }
  yPosition += 3

  // Question 7
  checkPageBreak(30)
  doc.setFillColor(241, 245, 249)
  doc.rect(margin, yPosition, contentWidth, 8, "F")
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(30, 58, 138)
  doc.text("Q7. Preferred Style", margin + 3, yPosition + 6)
  yPosition += 15
  doc.setTextColor(0, 0, 0)
  
  if (survey.preferred_style && survey.preferred_style.length > 0) {
    survey.preferred_style.forEach((style) => {
      addWrappedText(`• ${style}`, 10, false)
    })
    if (survey.preferred_style_other) {
      addWrappedText(`  Other: ${survey.preferred_style_other}`, 10, false)
    }
  } else {
    addWrappedText("No response provided", 10, false)
  }
  yPosition += 3

  // Question 8
  checkPageBreak(30)
  doc.setFillColor(241, 245, 249)
  doc.rect(margin, yPosition, contentWidth, 8, "F")
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(30, 58, 138)
  doc.text("Q8. Preferred Format", margin + 3, yPosition + 6)
  yPosition += 15
  doc.setTextColor(0, 0, 0)
  
  if (survey.preferred_format && survey.preferred_format.length > 0) {
    addWrappedText(survey.preferred_format.join(", "), 10, false)
  } else {
    addWrappedText("No response provided", 10, false)
  }
  yPosition += 3

  // Question 9
  checkPageBreak(30)
  doc.setFillColor(241, 245, 249)
  doc.rect(margin, yPosition, contentWidth, 8, "F")
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(30, 58, 138)
  doc.text("Q9. Video Content Inclusions", margin + 3, yPosition + 6)
  yPosition += 15
  doc.setTextColor(0, 0, 0)
  
  if (survey.video_inclusions && survey.video_inclusions.length > 0) {
    survey.video_inclusions.forEach((content) => {
      addWrappedText(`• ${content}`, 10, false)
    })
    if (survey.video_inclusions_other) {
      addWrappedText(`  Other: ${survey.video_inclusions_other}`, 10, false)
    }
  } else {
    addWrappedText("No response provided", 10, false)
  }
  yPosition += 3

  // Question 10
  checkPageBreak(30)
  doc.setFillColor(241, 245, 249)
  doc.rect(margin, yPosition, contentWidth, 8, "F")
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(30, 58, 138)
  doc.text("Q10. Preferred Video Length", margin + 3, yPosition + 6)
  yPosition += 15
  doc.setTextColor(0, 0, 0)
  
  if (survey.video_length && survey.video_length.length > 0) {
    survey.video_length.forEach((length) => {
      addWrappedText(`• ${length}`, 10, false)
    })
    if (survey.video_length_other) {
      addWrappedText(`  Other: ${survey.video_length_other}`, 10, false)
    }
  } else {
    addWrappedText("No response provided", 10, false)
  }
  yPosition += 3

  // Question 11
  checkPageBreak(30)
  doc.setFillColor(241, 245, 249)
  doc.rect(margin, yPosition, contentWidth, 8, "F")
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(30, 58, 138)
  doc.text("Q11. Video Usage Platforms", margin + 3, yPosition + 6)
  yPosition += 15
  doc.setTextColor(0, 0, 0)
  
  if (survey.video_usage && survey.video_usage.length > 0) {
    addWrappedText(survey.video_usage.join(", "), 10, false)
  } else {
    addWrappedText("No response provided", 10, false)
  }
  yPosition += 3

  // Question 12
  checkPageBreak(30)
  doc.setFillColor(241, 245, 249)
  doc.rect(margin, yPosition, contentWidth, 8, "F")
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(30, 58, 138)
  doc.text("Q12. Subtitles Requirements", margin + 3, yPosition + 6)
  yPosition += 15
  doc.setTextColor(0, 0, 0)
  
  if (survey.subtitles && survey.subtitles.length > 0) {
    addWrappedText(survey.subtitles.join(", "), 10, false)
  } else {
    addWrappedText("No response provided", 10, false)
  }

  // Footer
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text(
      `Page ${i} of ${totalPages} | Submitted: ${new Date(survey.created_at).toLocaleDateString()}`,
      margin,
      pageHeight - 10
    )
  }

  // Save the PDF
  const filename = `Video_Survey_${survey.company_name.replace(/\s+/g, "_")}_${survey.survey_id}.pdf`
  doc.save(filename)
}
