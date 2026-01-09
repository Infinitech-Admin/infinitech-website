import nodemailer from "nodemailer"
import { type NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"

interface Survey {
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

// Initialize Groq client
const groq = new Groq({
  apiKey: "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"
})

async function generateEmailContent(survey: Survey): Promise<{ subject: string; html: string }> {
  // Build a context prompt with the survey data for AI analysis
  const surveyContext = `
Client: ${survey.client_name}
Company: ${survey.company_name}
Role: ${survey.role}
Industry: ${survey.industries.join(", ")}${survey.industry_other ? ` - ${survey.industry_other}` : ""}

Business Situation:
- Slowdown Issues: ${survey.slowdown_issues.join(", ")}${survey.slowdown_issues_other ? ` - ${survey.slowdown_issues_other}` : ""}
- Problem Areas: ${survey.problem_areas.join(", ")}${survey.problem_areas_details ? ` - ${survey.problem_areas_details}` : ""}
- Customer Journey Status: ${survey.customer_journey}${survey.customer_journey_details ? ` - ${survey.customer_journey_details}` : ""}
- Standard Operating Procedures: ${survey.sops_status}${survey.sops_details ? ` - ${survey.sops_details}` : ""}
- Current Tools: ${survey.current_tools.join(", ")}${survey.current_tools_details ? ` - ${survey.current_tools_details}` : ""}
- Marketing Confidence: ${survey.marketing_confidence}${survey.marketing_details ? ` - ${survey.marketing_details}` : ""}
- Content Quality: ${survey.content_quality}${survey.content_details ? ` - ${survey.content_details}` : ""}
- Data & Analytics: ${survey.data_analytics}${survey.data_details ? ` - ${survey.data_details}` : ""}
- Solution Openness: ${survey.solution_openness}${survey.solution_details ? ` - ${survey.solution_details}` : ""}
`

  // Generate AI email subject
  const subjectPrompt = `Based on this business assessment survey, generate a compelling email subject line that acknowledges the client's main challenges and hints at a solution. The subject should be professional and specific to their situation. Return ONLY the subject line, nothing else.

Survey Context:
${surveyContext}`

  const subjectCompletion = await groq.chat.completions.create({
    messages: [{ role: "user", content: subjectPrompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 100,
  })

  const subject = subjectCompletion.choices[0]?.message?.content?.trim() || "Your Business Assessment Results"

  // Generate AI email body
  const emailPrompt = `You are a professional business consultant. Write a personalized, warm email to ${survey.client_name} from Infinitechphil based on their completed business assessment survey. 

Requirements:
- Acknowledge their specific challenges and pain points mentioned in the survey
- Show genuine understanding of their business situation
- Provide specific, actionable insights based on their responses
- Highlight the most critical problems they mentioned
- Suggest how to address these challenges
- Include a clear call-to-action: "Let's discuss your challenges and create a tailored solution. Visit infinitechphil.com/contact to schedule a consultation or get in touch with our team."
- Keep the tone conversational, professional, and empathetic
- Use 3-4 paragraphs maximum
- Do NOT mention Calendly or any meeting scheduling links
- Only mention infinitechphil.com/contact as the way to reach out
- Do NOT include any closing signature like "Best regards" or "[Your Name]" - the signature will be added separately
- End the email body with the main content only, no sign-off

Survey Context:
${surveyContext}

Write the email body as clean, professional text suitable for an HTML email. DO NOT include any closing or signature.`

  const emailCompletion = await groq.chat.completions.create({
    messages: [{ role: "user", content: emailPrompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.8,
    max_tokens: 1500,
  })

  const emailBody = emailCompletion.choices[0]?.message?.content || ""

  // Create professional HTML email with the AI-generated content
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #2c3e50; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .header p { margin: 10px 0 0 0; font-size: 15px; opacity: 0.9; }
          .content { padding: 0 20px; }
          .content p { margin: 15px 0; font-size: 15px; line-height: 1.8; }
          .content strong { color: #667eea; }
          .cta { 
            background: #667eea; 
            color: white; 
            padding: 14px 28px; 
            border-radius: 6px; 
            text-decoration: none; 
            display: inline-block; 
            margin: 25px 0; 
            font-weight: 600;
            transition: background 0.3s;
          }
          .cta:hover { background: #764ba2; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #ecf0f1; font-size: 12px; color: #7f8c8d; text-align: center; }
          .footer-contact { margin: 15px 0; line-height: 1.8; }
          .footer-contact strong { color: #2c3e50; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Insights from Your Assessment</h1>
            <p>Personalized recommendations for ${survey.company_name}</p>
          </div>

          <div class="content">
            <p>Hi ${survey.client_name},</p>
            
            ${emailBody
              .split("\n")
              .filter((line) => line.trim())
              .map((paragraph) => `<p>${paragraph.trim()}</p>`)
              .join("")}

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://infinitechphil.com/contact" class="cta">Schedule Your Consultation</a>
            </div>

            <p style="margin-top: 30px;">
              Best regards,<br>
              <strong style="color: #667eea;">INFINITECH TEAM</strong>
            </p>
            
            <p style="font-style: italic; color: #7f8c8d; font-size: 14px;">
              We're excited to help you transform your business. Looking forward to connecting with you soon!
            </p>
          </div>

          <div class="footer">
            <div class="footer-contact">
              <strong>Assessment Summary</strong><br>
              Client: ${survey.client_name}<br>
              Company: ${survey.company_name}<br>
              Submitted: ${new Date(survey.created_at).toLocaleDateString()}
            </div>
            <p>© 2026 Infinitechphil. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return { subject, html }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { survey } = body

    if (!survey) {
      return NextResponse.json({ error: "Survey data is required" }, { status: 400 })
    }

    // Create transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT || "465"),
      secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    const { subject, html } = await generateEmailContent(survey)

    // Send email to the client
    await transporter.sendMail({
      from: process.env.SMTP_USERNAME,
      to: survey.email,
      subject: subject,
      html: html,
    })

    // Also send a copy to admin emails
    const adminEmails = (process.env.SMTP_RECEIVER || "").split(",").map((email) => email.trim())
    if (adminEmails.length > 0) {
      await transporter.sendMail({
        from: process.env.SMTP_USERNAME,
        to: adminEmails.join(","),
        subject: `[Admin Copy] ${subject}`,
        html: html,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Email sent successfully to ${survey.email}`,
    })
  } catch (error) {
    console.error("Email sending error:", error)
    return NextResponse.json({ error: "Failed to send email. Please check SMTP configuration." }, { status: 500 })
  }
}
