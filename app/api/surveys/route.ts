import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = searchParams.get("page") || "1"

    const response = await fetch(`${API_URL}/api/surveys?page=${page}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch surveys", error: String(error) },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const filteredData = {
      // Client Information
      client_name: body.client_name || "",
      email: body.email || "",
      phone: body.phone || "",
      company_name: body.company_name || "",
      role: body.role || "",
      industries: body.industries || [],
      industry_other: body.industry_other || "",

      // Discovery Survey Questions
      business_goals: body.business_goals || [],
      business_goals_other: body.business_goals_other || "",
      slowdown_issues: body.slowdown_issues || [],
      slowdown_issues_other: body.slowdown_issues_other || "",
      customer_journey: body.customer_journey || "",
      customer_journey_details: body.customer_journey_details || "",
      sops_status: body.sops_status || "",
      sops_details: body.sops_details || "",
      current_tools: body.current_tools || [],
      current_tools_details: body.current_tools_details || "",
      marketing_confidence: body.marketing_confidence || "",
      marketing_details: body.marketing_details || "",
      content_quality: body.content_quality || "",
      content_details: body.content_details || "",
      problem_areas: body.problem_areas || [],
      problem_areas_details: body.problem_areas_details || "",
      data_analytics: body.data_analytics || "",
      data_details: body.data_details || "",
      solution_openness: body.solution_openness || "",
      solution_details: body.solution_details || "",
    }

    const response = await fetch(`${API_URL}/api/surveys`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(filteredData),
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to submit survey", error: String(error) },
      { status: 500 },
    )
  }
}
