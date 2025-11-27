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
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const TOTAL_STEPS = 6

const stepTitles = ["Company & Contact", "Current Systems", "Challenges", "Hidden Needs", "Customization", "Feedback"]

export default function SurveyForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Complete form data state matching database fields
  const [formData, setFormData] = useState({
    // Step 1: Company & Contact
    company_name: "",
    location: "",
    industries: [] as string[],
    industry_other: "",
    contact_person: "",
    role: "",
    email: "",
    phone: "",

    // Step 2: Current Systems
    current_systems: [] as string[],
    current_system_other: "",
    satisfaction_level: "",

    // Step 3: Operational Challenges
    system_performance_issues: [] as string[],
    process_workflow_issues: [] as string[],
    reporting_data_issues: [] as string[],
    hr_payroll_issues: [] as string[],
    customer_sales_issues: [] as string[],
    inventory_supply_chain_issues: [] as string[],
    digital_marketing_issues: [] as string[],

    // Step 4: Hidden Needs
    daily_situations: [] as string[],
    improvement_areas: [] as string[],

    // Step 5: System Customization
    systems_of_interest: [] as string[],
    system_of_interest_other: "",
    preferred_features: [] as string[],

    // Step 6: Open Feedback
    pain_points: "",
    ideal_system: "",
    additional_comments: "",
  })

  const [errors, setErrors] = useState({
    email: "",
    phone: "",
  })

  const [otherSelections, setOtherSelections] = useState({
    industry: false,
    system: false,
    interest: false,
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

  const handleOtherToggle = (field: "industry" | "system" | "interest", checked: boolean) => {
    setOtherSelections((prev) => ({ ...prev, [field]: checked }))
    
    // Add or remove "Other" from the respective array
    if (field === "industry") {
      if (checked) {
        setFormData((prev) => ({ 
          ...prev, 
          industries: [...prev.industries, "Other"]
        }))
      } else {
        setFormData((prev) => ({ 
          ...prev, 
          industries: prev.industries.filter(item => item !== "Other"),
          industry_other: "" 
        }))
      }
    }
    
    if (field === "system") {
      if (checked) {
        setFormData((prev) => ({ 
          ...prev, 
          current_systems: [...prev.current_systems, "Other"]
        }))
      } else {
        setFormData((prev) => ({ 
          ...prev, 
          current_systems: prev.current_systems.filter(item => item !== "Other"),
          current_system_other: "" 
        }))
      }
    }
    
    if (field === "interest") {
      if (checked) {
        setFormData((prev) => ({ 
          ...prev, 
          systems_of_interest: [...prev.systems_of_interest, "Other"]
        }))
      } else {
        setFormData((prev) => ({ 
          ...prev, 
          systems_of_interest: prev.systems_of_interest.filter(item => item !== "Other"),
          system_of_interest_other: "" 
        }))
      }
    }
  }

  const handleNext = () => {
    if (currentStep === 1) {
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
      if (hasErrors) return
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
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
        setSubmitted(true)
      } else {
        console.error("Failed to submit survey:", data)
        alert("Failed to submit survey. Please try again.")
      }
    } catch (error) {
      console.error("Error submitting survey:", error)
      alert("An error occurred. Please try again.")
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
    <div className="w-full">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {stepTitles.map((title, index) => (
            <div
              key={title}
              className={cn(
                "flex flex-col items-center flex-1",
                index + 1 === currentStep && "text-orange-400",
                index + 1 < currentStep && "text-emerald-400",
                index + 1 > currentStep && "text-blue-300/50",
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors",
                  index + 1 === currentStep && "bg-orange-500 text-white border-orange-500",
                  index + 1 < currentStep && "bg-emerald-500 text-white border-emerald-500",
                  index + 1 > currentStep && "bg-slate-800 border-blue-400/30 text-blue-300/50",
                )}
              >
                {index + 1 < currentStep ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
              </div>
              <span className="text-xs mt-1 hidden md:block">{title}</span>
            </div>
          ))}
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <Card className="mb-6 bg-white/95 backdrop-blur shadow-2xl border-0">
        {/* Step 1: Company & Contact */}
        {currentStep === 1 && (
          <>
            <CardHeader>
              <CardTitle className="text-slate-800">Company & Contact Information</CardTitle>
              <CardDescription>Tell us about your organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <Label htmlFor="location" className="text-slate-700">
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="Enter location"
                    className="border-slate-300"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-slate-700">Industry</Label>
                <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
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
                            industry === "Other"
                              ? otherSelections.industry
                              : formData.industries.includes(industry)
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

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson" className="text-slate-700">
                    Contact Person
                  </Label>
                  <Input
                    id="contactPerson"
                    placeholder="Enter name"
                    className="border-slate-300"
                    value={formData.contact_person}
                    onChange={(e) => handleInputChange("contact_person", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-slate-700">
                    Role / Position
                  </Label>
                  <Input
                    id="role"
                    placeholder="Enter role"
                    className="border-slate-300"
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">
                    Email
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
                    Phone
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
            </CardContent>
          </>
        )}

        {/* Step 2: Current Systems */}
        {currentStep === 2 && (
          <>
            <CardHeader>
              <CardTitle className="text-slate-800">Current System Overview</CardTitle>
              <CardDescription>What systems are you currently using?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-slate-700">Select all that apply</Label>
                <div className="grid gap-3 grid-cols-2">
                  {[
                    "ERP",
                    "CRM",
                    "HR / Payroll System",
                    "Inventory Management",
                    "POS System",
                    "E-commerce / Ordering System",
                    "Excel / Manual Records",
                    "Booking System",
                    "Other",
                  ].map((system) => (
                    <div key={system}>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`system-${system}`}
                          checked={
                            system === "Other"
                              ? otherSelections.system
                              : formData.current_systems.includes(system)
                          }
                          onCheckedChange={(checked) => {
                            if (system === "Other") {
                              handleOtherToggle("system", checked as boolean)
                            } else {
                              handleCheckboxChange("current_systems", system, checked as boolean)
                            }
                          }}
                        />
                        <Label htmlFor={`system-${system}`} className="font-normal text-sm text-slate-600">
                          {system}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
                {otherSelections.system && (
                  <div className="mt-2 ml-6">
                    <Input
                      placeholder="Please specify your system"
                      value={formData.current_system_other}
                      onChange={(e) => handleInputChange("current_system_other", e.target.value)}
                      className="border-slate-300"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-slate-700">How satisfied are you with your current systems?</Label>
                <RadioGroup
                  value={formData.satisfaction_level}
                  onValueChange={(value) => handleInputChange("satisfaction_level", value)}
                  className="space-y-2"
                >
                  {["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"].map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <RadioGroupItem value={level.toLowerCase().replace(" ", "-")} id={`satisfaction-${level}`} />
                      <Label htmlFor={`satisfaction-${level}`} className="font-normal text-sm text-slate-600">
                        {level}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </>
        )}

        {/* Step 3: Operational Challenges */}
        {currentStep === 3 && (
          <>
            <CardHeader>
              <CardTitle className="text-slate-800">Operational Challenges</CardTitle>
              <CardDescription>Indicate the problems you currently face</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  title: "System Performance Issues",
                  field: "system_performance_issues",
                  items: [
                    "Slow system response",
                    "Frequent system downtime",
                    "System crashes or bugs",
                    "Poor user interface",
                    "Difficult navigation",
                  ],
                },
                {
                  title: "Process & Workflow",
                  field: "process_workflow_issues",
                  items: [
                    "Manual data entry",
                    "Repetitive tasks",
                    "Inefficient approval process",
                    "Data duplication",
                    "Lack of automation",
                  ],
                },
                {
                  title: "Reporting & Data",
                  field: "reporting_data_issues",
                  items: [
                    "Inaccurate reports",
                    "Delayed reporting",
                    "Difficult to extract data",
                    "No real-time dashboard",
                    "Limited analytics",
                  ],
                },
                {
                  title: "Human Resources / Payroll",
                  field: "hr_payroll_issues",
                  items: [
                    "Payroll errors",
                    "Late salary processing",
                    "Leave management issues",
                    "Attendance tracking problems",
                    "Compliance issues",
                  ],
                },
                {
                  title: "Customer & Sales Management",
                  field: "customer_sales_issues",
                  items: [
                    "Poor customer tracking",
                    "Delayed order processing",
                    "Lost sales data",
                    "No CRM system",
                    "Lack of customer insights",
                  ],
                },
                {
                  title: "Inventory & Supply Chain",
                  field: "inventory_supply_chain_issues",
                  items: [
                    "Stock shortages",
                    "Overstocking",
                    "Inaccurate stock levels",
                    "Poor supplier tracking",
                    "Manual stock updates",
                  ],
                },
                {
                  title: "Digital Marketing & Online Presence",
                  field: "digital_marketing_issues",
                  items: [
                    "Low online visibility",
                    "Ineffective social media",
                    "Poor website performance",
                    "Low lead generation",
                    "Lack of campaign tracking",
                  ],
                },
              ].map((section) => (
                <div key={section.title} className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-800">{section.title}</Label>
                  <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
                    {section.items.map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox
                          id={`challenge-${item}`}
                          checked={
                            (formData[section.field as keyof typeof formData] as string[])?.includes(item) || false
                          }
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(section.field as keyof typeof formData, item, checked as boolean)
                          }
                        />
                        <Label htmlFor={`challenge-${item}`} className="font-normal text-sm text-slate-600">
                          {item}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </>
        )}

        {/* Step 4: Hidden Needs Discovery */}
        {currentStep === 4 && (
          <>
            <CardHeader>
              <CardTitle className="text-slate-800">Hidden Needs Discovery</CardTitle>
              <CardDescription>Even if you have not identified issues, please consider the following</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-slate-700">Which of these situations occur in your daily operations?</Label>
                <div className="space-y-2">
                  {[
                    "Employees spend too much time on manual tasks",
                    "Difficulty tracking overall business performance",
                    "Delayed decision-making due to lack of data",
                    "Multiple systems not integrated",
                    "Customer complaints due to operational delays",
                  ].map((situation) => (
                    <div key={situation} className="flex items-center space-x-2">
                      <Checkbox
                        id={`situation-${situation}`}
                        checked={formData.daily_situations.includes(situation)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("daily_situations", situation, checked as boolean)
                        }
                      />
                      <Label htmlFor={`situation-${situation}`} className="font-normal text-sm text-slate-600">
                        {situation}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-slate-700">Which areas would you like to improve?</Label>
                <div className="grid gap-2 grid-cols-2">
                  {[
                    "Speed of operations",
                    "Cost reduction",
                    "Accuracy of data",
                    "Customer satisfaction",
                    "Employee productivity",
                    "Branding",
                  ].map((area) => (
                    <div key={area} className="flex items-center space-x-2">
                      <Checkbox
                        id={`improve-${area}`}
                        checked={formData.improvement_areas.includes(area)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("improvement_areas", area, checked as boolean)
                        }
                      />
                      <Label htmlFor={`improve-${area}`} className="font-normal text-sm text-slate-600">
                        {area}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </>
        )}

        {/* Step 5: System Customization Interest */}
        {currentStep === 5 && (
          <>
            <CardHeader>
              <CardTitle className="text-slate-800">System Customization Interest</CardTitle>
              <CardDescription>What solutions are you looking for?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-slate-700">Which systems are you interested in improving or implementing?</Label>
                <div className="grid gap-2 grid-cols-2">
                  {[
                    "Payroll System",
                    "HR Management",
                    "CRM",
                    "Inventory System",
                    "E-commerce / Ordering System",
                    "Project Management",
                    "Automated Reporting",
                    "Custom Workflow",
                    "Other",
                  ].map((system) => (
                    <div key={system}>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`interest-${system}`}
                          checked={
                            system === "Other"
                              ? otherSelections.interest
                              : formData.systems_of_interest.includes(system)
                          }
                          onCheckedChange={(checked) => {
                            if (system === "Other") {
                              handleOtherToggle("interest", checked as boolean)
                            } else {
                              handleCheckboxChange("systems_of_interest", system, checked as boolean)
                            }
                          }}
                        />
                        <Label htmlFor={`interest-${system}`} className="font-normal text-sm text-slate-600">
                          {system}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
                {otherSelections.interest && (
                  <div className="mt-2 ml-6">
                    <Input
                      placeholder="Please specify the system you're interested in"
                      value={formData.system_of_interest_other}
                      onChange={(e) => handleInputChange("system_of_interest_other", e.target.value)}
                      className="border-slate-300"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-slate-700">Preferred features (Select all that apply)</Label>
                <div className="grid gap-2 grid-cols-2">
                  {[
                    "Cloud-based access",
                    "Mobile access",
                    "Automated reporting",
                    "System integration",
                    "Multi-user roles",
                    "Real-time alerts",
                  ].map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox
                        id={`feature-${feature}`}
                        checked={formData.preferred_features.includes(feature)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("preferred_features", feature, checked as boolean)
                        }
                      />
                      <Label htmlFor={`feature-${feature}`} className="font-normal text-sm text-slate-600">
                        {feature}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </>
        )}

        {/* Step 6: Open Feedback */}
        {currentStep === 6 && (
          <>
            <CardHeader>
              <CardTitle className="text-slate-800">Open Feedback</CardTitle>
              <CardDescription>Share your thoughts and requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="painPoints" className="text-slate-700">
                  What are your main operational pain points?
                </Label>
                <Textarea
                  id="painPoints"
                  placeholder="Describe your main challenges..."
                  rows={3}
                  className="border-slate-300"
                  value={formData.pain_points}
                  onChange={(e) => handleInputChange("pain_points", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="idealSystem" className="text-slate-700">
                  What would an ideal system look like for your company?
                </Label>
                <Textarea
                  id="idealSystem"
                  placeholder="Describe your ideal solution..."
                  rows={3}
                  className="border-slate-300"
                  value={formData.ideal_system}
                  onChange={(e) => handleInputChange("ideal_system", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments" className="text-slate-700">
                  Any additional comments or suggestions?
                </Label>
                <Textarea
                  id="comments"
                  placeholder="Additional feedback..."
                  rows={3}
                  className="border-slate-300"
                  value={formData.additional_comments}
                  onChange={(e) => handleInputChange("additional_comments", e.target.value)}
                />
              </div>
            </CardContent>
          </>
        )}
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="gap-2 bg-transparent border-blue-400/30 text-blue-200 hover:bg-blue-900/50 hover:text-white disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        {currentStep < TOTAL_STEPS ? (
          <Button
            onClick={handleNext}
            className="gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
        )}
      </div>
    </div>
  )
}
