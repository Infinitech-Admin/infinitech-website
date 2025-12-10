import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

interface SurveyData {
  id: number
  survey_id: string
  company_name: string
  contact_person: string
  email: string
  phone: string
  role: string
  location: string
  system_performance_issues?: string[]
  process_workflow_issues?: string[]
  reporting_data_issues?: string[]
  hr_payroll_issues?: string[]
  customer_sales_issues?: string[]
  inventory_supply_chain_issues?: string[]
  digital_marketing_issues?: string[]
  pain_points?: string
  ideal_system?: string
  additional_comments?: string
}

export async function POST(request: Request) {
  try {
    const { to, contactPerson, companyName, surveyData, planType, selectedPlan, message } = await request.json()

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    const survey = surveyData as SurveyData

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

    // Build the challenge section
    const challengesHtml =
      challenges.length > 0
        ? challenges.map((challenge) => `<li style="margin-bottom: 8px; font-size: 14px;">${challenge}</li>`).join("")
        : '<li style="margin-bottom: 8px; font-size: 14px;">No specific challenges identified</li>'

    // Build the email content based on plan type
    let planName = ""
    let planDescription = ""

    if (planType === "juan-tap") {
      planName = "Complimentary Offer"
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

    const surveyLinkHtml =
      planType === "juan-tap"
        ? `<p style="font-size: 14px; color: #4b5563; margin: 12px 0;">
             To proceed, please visit: <a href="https://infinitechphil.com/juantap-survey" style="color: #1e40af; text-decoration: underline;">https://infinitechphil.com/juantap-survey</a>
           </p>`
        : ""

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            
            <!-- Header with Gradient -->
            <div style="
  background: linear-gradient(135deg, #f4f5f7ff 0%, #1e3a8a 100%);
  text-align: center;
  padding: 40px 20px;
  color: white; /* makes the text white */
">
              <!-- Updated logo URL to direct Infinitech URL without Google proxy -->
              <img src="https://www.infinitechphil.com/images/logo.png" alt="Infinitech Logo" style="max-width: 120px; height: auto; margin-bottom: 16px; display: inline-block;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: white;">
                INFINITECH
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255,255,255,0.9);">
                Business Solutions & Digital Transformation
              </p>
            </div>

            <!-- Survey ID Badge -->
            <div style="text-align: center; padding: 20px; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
              <div style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                Survey ID: ${survey.survey_id}
              </div>
            </div>

            <!-- Main Content -->
            <div style="padding: 32px 24px;">
              <div style="margin-bottom: 24px;">
                <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #1f2937;">
                  Good day ${contactPerson || "Valued Customer"}! 👋
                </h2>
                <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin: 0;">
                  Thank you for taking the time to visit our booth at AIM last November 29, 2025 and for completing our website survey. We truly appreciate the opportunity to learn more about ${companyName || "your organization"} and your current operational setup.
                </p>
              </div>

              <!-- Identified Challenges -->
              <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-top: 24px; border-left: 4px solid #dc2626;">
                <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #1f2937;">
                  🎯 Identified Challenges from Your Survey
                </h3>
                <p style="font-size: 14px; color: #4b5563; margin: 0 0 12px 0;">
                  Based on your responses, we've identified the following areas where we can assist:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #1f2937;">
                  ${challengesHtml}
                </ul>
              </div>

              <!-- Offer Section with "As a token of appreciation" text -->
              <div style="background: linear-gradient(135deg, rgba(30, 64, 175, 0.1) 0%, rgba(30, 58, 138, 0.1) 100%); border-radius: 8px; padding: 20px; margin-top: 24px; border: 2px solid #1e40af;">
                <p style="font-size: 14px; color: #4b5563; margin: 0 0 12px 0; font-style: italic;">
                  As a token of appreciation, we would like to offer you the following complimentary package:
                </p>
                <!-- Updated to show Free JuanTap Card and plan tier separately -->
                <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #1f2937;">
                  🎁 Free JuanTap Card - Complimentary Offer
                </h3>
                <p style="font-size: 14px; color: #4b5563; margin: 0 0 12px 0; font-weight: 600;">
                  Plan: ${selectedPlan ? selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1) : "Standard"}
                </p>
                <p style="font-size: 14px; color: #4b5563; margin: 0;">
                  ${planDescription}
                </p>
                ${surveyLinkHtml}
              </div>

              <!-- Contact Information -->
              <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-top: 24px;">
                <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #1f2937;">
                  📋 Your Information on File
                </h3>
                <table style="width: 100%; font-size: 14px; color: #1f2937;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #6b7280; width: 40%;">Company:</td>
                    <td style="padding: 8px 0;">${companyName || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Contact Person:</td>
                    <td style="padding: 8px 0;">${contactPerson || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Position:</td>
                    <td style="padding: 8px 0;">${survey.role || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Email:</td>
                    <td style="padding: 8px 0;"><a href="mailto:${survey.email}" style="color: #1e40af; text-decoration: none;">${survey.email || "N/A"}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Phone:</td>
                    <td style="padding: 8px 0;">${survey.phone || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Location:</td>
                    <td style="padding: 8px 0;">${survey.location || "N/A"}</td>
                  </tr>
                </table>
              </div>

              <!-- Next Steps -->
              <div style="background: #dbeafe; border-radius: 8px; padding: 20px; margin-top: 24px; border-left: 4px solid #1e40af;">
                <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #1f2937;">
                  📞 Next Steps
                </h3>
                <p style="font-size: 14px; color: #4b5563; margin: 0;">
                  We would love to schedule a consultation at your convenience to discuss how our solutions can help address the challenges you've identified and improve your operations. Please let us know your availability.
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; padding: 24px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">
                Thank you for your interest in our services
              </p>
              <div style="font-size: 12px; color: #9ca3af; margin-top: 16px;">
                © ${new Date().getFullYear()} INFINITECH Advertising Corporation. All rights reserved.
              </div>
            </div>

          </div>

          <!-- Security Notice -->
          <div style="max-width: 600px; margin: 16px auto 0; padding: 12px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; font-size: 12px; color: #92400e; line-height: 1.5;">
              🔒 <strong>Security Notice:</strong> This email contains personal information. Please keep it confidential.
            </p>
          </div>
        </body>
      </html>
    `

    await transporter.sendMail({
      from: `"INFINITECH" <${process.env.SMTP_USERNAME}>`,
      to,
      subject: `${planName} - ${companyName || "Your Organization"} - Survey Follow-up`,
      html: htmlContent,
      text:
        message ||
        `Good day ${contactPerson},\n\nThank you for completing our survey. We've identified several challenges from your responses and would like to offer you a complimentary ${planName} package.\n\nIdentified Challenges:\n${challenges.map((c) => `- ${c}`).join("\n")}\n\nWe look forward to discussing how we can help.\n\nBest regards,\nThe INFINITECH Team`,
    })

    return NextResponse.json({ success: true, message: "Challenge email sent successfully" })
  } catch (error) {
    console.error("Email error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
