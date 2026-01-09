"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function SurveyForm() {
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Complete form data state
  const [formData, setFormData] = useState({
    // Client Information
    client_name: "",
    email: "",
    phone: "",
    company_name: "",
    role: "",
    industries: [] as string[],
    industry_other: "",

    // Discovery Survey - Question 1: Business Goals (Checkbox)
    business_goals: [] as string[],
    business_goals_other: "",

    // Discovery Survey - Question 2: Slowdown Issues (Checkbox)
    slowdown_issues: [] as string[],
    slowdown_issues_other: "",

    // Discovery Survey - Question 3: Customer Journey (Radio - Yes/No)
    customer_journey: "",
    customer_journey_details: "",

    // Discovery Survey - Question 4: SOPs (Radio - Yes/No)
    sops_status: "",
    sops_details: "",

    // Discovery Survey - Question 5: Tools/Systems (Checkbox)
    current_tools: [] as string[],
    current_tools_details: "",

    // Discovery Survey - Question 6: Marketing Confidence (Radio)
    marketing_confidence: "",
    marketing_details: "",

    // Discovery Survey - Question 7: Content Quality (Radio with full options)
    content_quality: "",
    content_details: "",

    // Discovery Survey - Question 8: Problem Areas (Checkbox)
    problem_areas: [] as string[],
    problem_areas_details: "",

    // Discovery Survey - Question 9: Data/Analytics (Radio)
    data_analytics: "",
    data_details: "",

    // Discovery Survey - Question 10: Solution Openness (Radio)
    solution_openness: "",
    solution_details: "",
  })

  const [errors, setErrors] = useState({
    email: "",
    phone: "",
  })

  const [otherSelections, setOtherSelections] = useState({
    industry: false,
    businessGoals: false,
    slowdownIssues: false,
    tools: false,
    problemAreas: false,
  })

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCheckboxChange = (field: keyof typeof formData, value: string, checked: boolean) => {
    setFormData((prev) => {
      const currentArray = prev[field] as string[]
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] }
      } else {
        return { ...prev, [field]: currentArray.filter((item) => item !== value) }
      }
    })
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const sanitizedValue = value.replace(/[a-zA-Z]/g, "")
    setFormData((prev) => ({ ...prev, phone: sanitizedValue }))

    if (value !== sanitizedValue) {
      setErrors((prev) => ({ ...prev, phone: "Phone number cannot contain letters" }))
    } else {
      setErrors((prev) => ({ ...prev, phone: "" }))
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData((prev) => ({ ...prev, email: value }))

    if (value && !validateEmail(value)) {
      setErrors((prev) => ({ ...prev, email: "Please enter a valid email address" }))
    } else {
      setErrors((prev) => ({ ...prev, email: "" }))
    }
  }

  const handleOtherToggle = (
    field: "industry" | "businessGoals" | "slowdownIssues" | "tools" | "problemAreas",
    checked: boolean,
  ) => {
    setOtherSelections((prev) => ({ ...prev, [field]: checked }))

    if (field === "industry") {
      if (checked) {
        setFormData((prev) => ({
          ...prev,
          industries: [...prev.industries, "Other"],
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          industries: prev.industries.filter((item) => item !== "Other"),
          industry_other: "",
        }))
      }
    } else if (field === "businessGoals") {
      if (checked) {
        setFormData((prev) => ({
          ...prev,
          business_goals: [...prev.business_goals, "Other"],
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          business_goals: prev.business_goals.filter((item) => item !== "Other"),
          business_goals_other: "",
        }))
      }
    } else if (field === "slowdownIssues") {
      if (checked) {
        setFormData((prev) => ({
          ...prev,
          slowdown_issues: [...prev.slowdown_issues, "Other"],
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          slowdown_issues: prev.slowdown_issues.filter((item) => item !== "Other"),
          slowdown_issues_other: "",
        }))
      }
    } else if (field === "tools") {
      if (checked) {
        setFormData((prev) => ({
          ...prev,
          current_tools: [...prev.current_tools, "Other"],
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          current_tools: prev.current_tools.filter((item) => item !== "Other"),
          current_tools_details: "",
        }))
      }
    } else if (field === "problemAreas") {
      if (checked) {
        setFormData((prev) => ({
          ...prev,
          problem_areas: [...prev.problem_areas, "Other"],
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          problem_areas: prev.problem_areas.filter((item) => item !== "Other"),
          problem_areas_details: "",
        }))
      }
    }
  }

  const handleSubmit = async () => {
    let hasErrors = false
    const newErrors = { email: "", phone: "" }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address"
      hasErrors = true
    }

    if (formData.phone && /[a-zA-Z]/.test(formData.phone)) {
      newErrors.phone = "Phone number cannot contain letters"
      hasErrors = true
    }

    setErrors(newErrors)
    if (hasErrors) {
      toast({
        title: "Validation Error",
        description: Object.values(newErrors).filter(Boolean).join(", "),
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/surveys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Survey submitted successfully! Thank you for your feedback.",
          variant: "default",
        })
        setSubmitted(true)
      } else {
        const errorMessage = data.errors
          ? typeof data.errors === "object"
            ? Object.values(data.errors).join(", ")
            : data.errors
          : data.message || "Failed to submit survey"

        toast({
          title: "Submission Error",
          description: errorMessage,
          variant: "destructive",
        })
        console.error("Failed to submit survey:", data)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred while submitting the survey"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      console.error("Error submitting survey:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Card className="max-w-lg mx-auto bg-white/95 backdrop-blur shadow-2xl border-0">
        <CardContent className="pt-12 pb-12 text-center">
          <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3 text-slate-800">Thank You!</h2>
          <p className="text-slate-600">
            Thank you for taking the time to share your business needs. Your feedback helps us build smarter, more
            effective customized systems for your organization.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full min-h-screen py-8 px-4">
      <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur shadow-2xl border-0">
        <CardHeader className="bg-accent text-white rounded-t-lg">
          <CardTitle className="text-2xl">Client Discovery Survey</CardTitle>
          <CardDescription className="text-slate-100">
            Please fill out all fields below. All questions are on this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 space-y-8">
          {/* Client Information Section */}
          <div className="space-y-4 pb-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">Client Information Details</h3>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="clientName" className="text-slate-700">
                  Client Name *
                </Label>
                <Input
                  id="clientName"
                  placeholder="Enter name"
                  className="border-slate-300"
                  value={formData.client_name}
                  onChange={(e) => handleInputChange("client_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  className={cn("border-slate-300", errors.email && "border-red-500 focus-visible:ring-red-500")}
                  value={formData.email}
                  onChange={handleEmailChange}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-700">
                  Phone No. *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  className={cn("border-slate-300", errors.phone && "border-red-500 focus-visible:ring-red-500")}
                  value={formData.phone}
                  onChange={handlePhoneChange}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-slate-700">
                  Company Name
                </Label>
                <Input
                  id="companyName"
                  placeholder="Enter company name"
                  className="border-slate-300"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange("company_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-slate-700">
                  Position
                </Label>
                <Input
                  id="role"
                  placeholder="Enter your position"
                  className="border-slate-300"
                  value={formData.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                />
              </div>
            </div>

            {/* Industry Selection */}
            <div className="space-y-3">
              <Label className="text-slate-700">Industry</Label>
              <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                {[
                  "Manufacturing",
                  "Retail",
                  "Healthcare",
                  "Logistics",
                  "Education",
                  "Finance",
                  "Hospitality",
                  "Construction",
                  "Other",
                ].map((industry) => (
                  <div key={industry}>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`industry-${industry}`}
                        checked={
                          industry === "Other" ? otherSelections.industry : formData.industries.includes(industry)
                        }
                        onCheckedChange={(checked) => {
                          if (industry === "Other") {
                            handleOtherToggle("industry", checked as boolean)
                          } else {
                            handleCheckboxChange("industries", industry, checked as boolean)
                          }
                        }}
                      />
                      <Label htmlFor={`industry-${industry}`} className="font-normal text-sm text-slate-600">
                        {industry}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
              {otherSelections.industry && (
                <div className="mt-2 ml-6">
                  <Input
                    placeholder="Please specify your industry"
                    value={formData.industry_other}
                    onChange={(e) => handleInputChange("industry_other", e.target.value)}
                    className="border-slate-300"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Question 1: Business Goals */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-800">
              1. What are your top 3 business goals for the next 6–12 months?
            </h3>
            <p className="text-sm text-slate-600">Select all that apply</p>
            <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
              {[
                "Increase sales",
                "Improve brand visibility",
                "Reduce operational errors",
                "Save time / manpower",
                "Scale the business",
                "Other",
              ].map((goal) => (
                <div key={goal}>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`goal-${goal}`}
                      checked={
                        goal === "Other" ? otherSelections.businessGoals : formData.business_goals.includes(goal)
                      }
                      onCheckedChange={(checked) => {
                        if (goal === "Other") {
                          handleOtherToggle("businessGoals", checked as boolean)
                        } else {
                          handleCheckboxChange("business_goals", goal, checked as boolean)
                        }
                      }}
                    />
                    <Label htmlFor={`goal-${goal}`} className="font-normal text-sm text-slate-600">
                      {goal}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
            {otherSelections.businessGoals && (
              <div className="mt-2 ml-6">
                <Input
                  placeholder="Please specify other goals"
                  value={formData.business_goals_other}
                  onChange={(e) => handleInputChange("business_goals_other", e.target.value)}
                  className="border-slate-300"
                />
              </div>
            )}
          </div>

          {/* Question 2: Slowdown Issues */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-800">
              2. What is currently slowing down your business growth the most?
            </h3>
            <p className="text-sm text-slate-600">Select all that apply</p>
            <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
              {[
                "Low-quality leads",
                "Inefficient internal processes",
                "Poor online presence",
                "Manual work / duplicated tasks",
                "Lack of clear SOPs",
                "Unclear customer journey",
                "Other",
              ].map((issue) => (
                <div key={issue}>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`slowdown-${issue}`}
                      checked={
                        issue === "Other" ? otherSelections.slowdownIssues : formData.slowdown_issues.includes(issue)
                      }
                      onCheckedChange={(checked) => {
                        if (issue === "Other") {
                          handleOtherToggle("slowdownIssues", checked as boolean)
                        } else {
                          handleCheckboxChange("slowdown_issues", issue, checked as boolean)
                        }
                      }}
                    />
                    <Label htmlFor={`slowdown-${issue}`} className="font-normal text-sm text-slate-600">
                      {issue}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
            {otherSelections.slowdownIssues && (
              <div className="mt-2 ml-6">
                <Input
                  placeholder="Please specify other issues"
                  value={formData.slowdown_issues_other}
                  onChange={(e) => handleInputChange("slowdown_issues_other", e.target.value)}
                  className="border-slate-300"
                />
              </div>
            )}
            <Textarea
              placeholder="Please provide additional details..."
              value={formData.slowdown_issues_other}
              onChange={(e) => handleInputChange("slowdown_issues_other", e.target.value)}
              className="border-slate-300 mt-2"
              rows={3}
            />
          </div>

          {/* Question 3: Customer Journey (Radio - Yes/No) */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-800">
              3. Can you clearly explain how a customer finds you, contacts you, and becomes a paying client?
            </h3>
            <RadioGroup
              value={formData.customer_journey}
              onValueChange={(value) => handleInputChange("customer_journey", value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Yes, very clear and documented" id="journey-1" />
                <Label htmlFor="journey-1" className="font-normal text-sm text-slate-600">
                  Yes, very clear and documented
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Somewhat clear but not documented" id="journey-2" />
                <Label htmlFor="journey-2" className="font-normal text-sm text-slate-600">
                  Somewhat clear but not fully documented / Need clarity
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="No, it's inconsistent" id="journey-3" />
                <Label htmlFor="journey-3" className="font-normal text-sm text-slate-600">
                  No, it's inconsistent
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="I've never mapped this out" id="journey-4" />
                <Label htmlFor="journey-4" className="font-normal text-sm text-slate-600">
                  I've never mapped this out
                </Label>
              </div>
            </RadioGroup>
            <Textarea
              placeholder="Please provide additional details about your customer journey..."
              value={formData.customer_journey_details}
              onChange={(e) => handleInputChange("customer_journey_details", e.target.value)}
              className="border-slate-300 mt-2"
              rows={3}
            />
          </div>

          {/* Question 4: SOPs */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-800">
              4. Do you have documented SOPs for marketing, sales, and operations?
            </h3>
            <RadioGroup
              value={formData.sops_status}
              onValueChange={(value) => handleInputChange("sops_status", value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Yes, clear and followed" id="sops-1" />
                <Label htmlFor="sops-1" className="font-normal text-sm text-slate-600">
                  Yes, clear and followed
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Exists but not updated" id="sops-2" />
                <Label htmlFor="sops-2" className="font-normal text-sm text-slate-600">
                  Exists but not updated
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Informal / depends on people" id="sops-3" />
                <Label htmlFor="sops-3" className="font-normal text-sm text-slate-600">
                  Informal / depends on people
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="No SOPs at all" id="sops-4" />
                <Label htmlFor="sops-4" className="font-normal text-sm text-slate-600">
                  No SOPs at all
                </Label>
              </div>
            </RadioGroup>
            <Textarea
              placeholder="Please describe your current SOPs..."
              value={formData.sops_details}
              onChange={(e) => handleInputChange("sops_details", e.target.value)}
              className="border-slate-300 mt-2"
              rows={3}
            />
          </div>

          {/* Question 5: Tools/Systems */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-800">5. What tools and systems are you currently using?</h3>
            <p className="text-sm text-slate-600">Select all that apply</p>
            <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
              {[
                "Website / landing pages",
                "CRM / customer database",
                "Automation tools (email etc.)",
                "Analytics / reporting tools",
                "Mostly manual (Excel, WhatsApp, phone calls)",
                "Other",
              ].map((tool) => (
                <div key={tool}>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`tool-${tool}`}
                      checked={tool === "Other" ? otherSelections.tools : formData.current_tools.includes(tool)}
                      onCheckedChange={(checked) => {
                        if (tool === "Other") {
                          handleOtherToggle("tools", checked as boolean)
                        } else {
                          handleCheckboxChange("current_tools", tool, checked as boolean)
                        }
                      }}
                    />
                    <Label htmlFor={`tool-${tool}`} className="font-normal text-sm text-slate-600">
                      {tool}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
            {otherSelections.tools && (
              <div className="mt-2 ml-6">
                <Input
                  placeholder="Please specify other tools"
                  value={formData.current_tools_details}
                  onChange={(e) => handleInputChange("current_tools_details", e.target.value)}
                  className="border-slate-300"
                />
              </div>
            )}
          </div>

          {/* Question 6: Marketing Confidence */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-800">
              6. How confident are you that your current marketing brings the right customers?
            </h3>
            <RadioGroup
              value={formData.marketing_confidence}
              onValueChange={(value) => handleInputChange("marketing_confidence", value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Very confident" id="marketing-1" />
                <Label htmlFor="marketing-1" className="font-normal text-sm text-slate-600">
                  Very confident
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Somewhat confident" id="marketing-2" />
                <Label htmlFor="marketing-2" className="font-normal text-sm text-slate-600">
                  Somewhat confident
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Not sure" id="marketing-3" />
                <Label htmlFor="marketing-3" className="font-normal text-sm text-slate-600">
                  Not sure
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Not confident at all" id="marketing-4" />
                <Label htmlFor="marketing-4" className="font-normal text-sm text-slate-600">
                  Not confident at all
                </Label>
              </div>
            </RadioGroup>
            <Textarea
              placeholder="Please describe your marketing confidence..."
              value={formData.marketing_details}
              onChange={(e) => handleInputChange("marketing_details", e.target.value)}
              className="border-slate-300 mt-2"
              rows={3}
            />
          </div>

          {/* Question 7: Content Quality */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-800">
              7. Do your videos, photos, and online content clearly communicate your value and build trust?
            </h3>
            <RadioGroup
              value={formData.content_quality}
              onValueChange={(value) => handleInputChange("content_quality", value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Yes, strongly" id="content-1" />
                <Label htmlFor="content-1" className="font-normal text-sm text-slate-600">
                  Yes, strongly
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Somewhat" id="content-2" />
                <Label htmlFor="content-2" className="font-normal text-sm text-slate-600">
                  Somewhat
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Not really" id="content-3" />
                <Label htmlFor="content-3" className="font-normal text-sm text-slate-600">
                  Not really
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="We don't have consistent content" id="content-4" />
                <Label htmlFor="content-4" className="font-normal text-sm text-slate-600">
                  We don't have consistent content
                </Label>
              </div>
            </RadioGroup>
            <Textarea
              placeholder="Please describe your content quality..."
              value={formData.content_details}
              onChange={(e) => handleInputChange("content_details", e.target.value)}
              className="border-slate-300 mt-2"
              rows={3}
            />
          </div>

          {/* Question 8: Problem Areas */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-800">
              8. Where do mistakes, delays, or confusion most often happen?
            </h3>
            <p className="text-sm text-slate-600">Select all that apply</p>
            <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
              {[
                "Lead follow-up",
                "Quotation & pricing",
                "Internal communication",
                "Project delivery",
                "Customer after-sales",
                "Reporting & tracking",
                "Other",
              ].map((area) => (
                <div key={area}>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`problem-${area}`}
                      checked={area === "Other" ? otherSelections.problemAreas : formData.problem_areas.includes(area)}
                      onCheckedChange={(checked) => {
                        if (area === "Other") {
                          handleOtherToggle("problemAreas", checked as boolean)
                        } else {
                          handleCheckboxChange("problem_areas", area, checked as boolean)
                        }
                      }}
                    />
                    <Label htmlFor={`problem-${area}`} className="font-normal text-sm text-slate-600">
                      {area}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
            {otherSelections.problemAreas && (
              <div className="mt-2 ml-6">
                <Input
                  placeholder="Please specify other problem areas"
                  value={formData.problem_areas_details}
                  onChange={(e) => handleInputChange("problem_areas_details", e.target.value)}
                  className="border-slate-300"
                />
              </div>
            )}
          </div>

          {/* Question 9: Data/Analytics */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-800">9. Do you have real data to guide business decisions?</h3>
            <RadioGroup
              value={formData.data_analytics}
              onValueChange={(value) => handleInputChange("data_analytics", value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Yes, real-time dashboards" id="data-1" />
                <Label htmlFor="data-1" className="font-normal text-sm text-slate-600">
                  Yes, real-time dashboards
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Some reports but not actionable" id="data-2" />
                <Label htmlFor="data-2" className="font-normal text-sm text-slate-600">
                  Some reports but not actionable
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Data exists but not analyzed" id="data-3" />
                <Label htmlFor="data-3" className="font-normal text-sm text-slate-600">
                  Data exists but not analyzed
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Mostly guessing / experience-based" id="data-4" />
                <Label htmlFor="data-4" className="font-normal text-sm text-slate-600">
                  Mostly guessing / experience-based
                </Label>
              </div>
            </RadioGroup>
            <Textarea
              placeholder="Please provide additional details about your analytics..."
              value={formData.data_details}
              onChange={(e) => handleInputChange("data_details", e.target.value)}
              className="border-slate-300 mt-2"
              rows={3}
            />
          </div>

          {/* Question 10: Solution Openness */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-800">
              10. If the right solution could improve efficiency, clarity, and results, are you open to redesigning
              processes using technology?
            </h3>
            <RadioGroup
              value={formData.solution_openness}
              onValueChange={(value) => handleInputChange("solution_openness", value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Yes, ready to act" id="solution-1" />
                <Label htmlFor="solution-1" className="font-normal text-sm text-slate-600">
                  Yes, ready to act
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Interested but need guidance" id="solution-2" />
                <Label htmlFor="solution-2" className="font-normal text-sm text-slate-600">
                  Interested but need guidance
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Open, but budget/time concern" id="solution-3" />
                <Label htmlFor="solution-3" className="font-normal text-sm text-slate-600">
                  Open, but budget/time concern
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Not ready yet" id="solution-4" />
                <Label htmlFor="solution-4" className="font-normal text-sm text-slate-600">
                  Not ready yet
                </Label>
              </div>
            </RadioGroup>
            <Textarea
              placeholder="Please provide additional details about your openness to solutions..."
              value={formData.solution_details}
              onChange={(e) => handleInputChange("solution_details", e.target.value)}
              className="border-slate-300 mt-2"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-6 border-t border-slate-200">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="ml-auto bg-slate-800 hover:bg-slate-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Survey"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
