"use client"
import { useState } from "react"
import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Loader2, X, Plus, Trash2, Building2, Palette, Users, Target, Sparkles, Globe, MapPin, Image as ImageIcon, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DemoRequirementsFormProps {
  onClose?: () => void
  onSubmitSuccess?: () => void
}

export default function DemoRequirementsForm({ onClose, onSubmitSuccess }: DemoRequirementsFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    business_name: "",
    business_type: "",
    business_logo: null as File | null,
    tagline: "",
    contact_info: "",
    primary_purposes: [] as string[],
    primary_purposes_other: "",
    target_audience: "",
    key_features: [] as string[],
    key_features_other: "",
    product_image_sources: [""],
    color_style: "",
    social_media_links: [""],
    location: "",
  })

  const [otherSelections, setOtherSelections] = useState({
    purposes: false,
    features: false,
  })

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, business_logo: file }))
    }
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

  const handleOtherToggle = (field: "purposes" | "features", checked: boolean) => {
    setOtherSelections((prev) => ({ ...prev, [field]: checked }))

    if (field === "purposes") {
      if (checked) {
        setFormData((prev) => ({
          ...prev,
          primary_purposes: [...prev.primary_purposes, "Other"],
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          primary_purposes: prev.primary_purposes.filter((item) => item !== "Other"),
          primary_purposes_other: "",
        }))
      }
    } else if (field === "features") {
      if (checked) {
        setFormData((prev) => ({
          ...prev,
          key_features: [...prev.key_features, "Other"],
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          key_features: prev.key_features.filter((item) => item !== "Other"),
          key_features_other: "",
        }))
      }
    }
  }

  const addProductImageSource = () => {
    setFormData((prev) => ({
      ...prev,
      product_image_sources: [...prev.product_image_sources, ""],
    }))
  }

  const removeProductImageSource = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      product_image_sources: prev.product_image_sources.filter((_, i) => i !== index),
    }))
  }

  const updateProductImageSource = (index: number, value: string) => {
    setFormData((prev) => {
      const newSources = [...prev.product_image_sources]
      newSources[index] = value
      return { ...prev, product_image_sources: newSources }
    })
  }

  const addSocialMediaLink = () => {
    setFormData((prev) => ({
      ...prev,
      social_media_links: [...prev.social_media_links, ""],
    }))
  }

  const removeSocialMediaLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      social_media_links: prev.social_media_links.filter((_, i) => i !== index),
    }))
  }

  const updateSocialMediaLink = (index: number, value: string) => {
    setFormData((prev) => {
      const newLinks = [...prev.social_media_links]
      newLinks[index] = value
      return { ...prev, social_media_links: newLinks }
    })
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.business_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Business name is required",
        variant: "destructive",
      })
      return
    }
    if (!formData.business_type.trim()) {
      toast({
        title: "Validation Error",
        description: "Business type is required",
        variant: "destructive",
      })
      return
    }
    if (!formData.contact_info.trim()) {
      toast({
        title: "Validation Error",
        description: "Contact info is required",
        variant: "destructive",
      })
      return
    }
    if (formData.primary_purposes.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one primary purpose",
        variant: "destructive",
      })
      return
    }
    if (!formData.target_audience.trim()) {
      toast({
        title: "Validation Error",
        description: "Target audience is required",
        variant: "destructive",
      })
      return
    }
    if (formData.key_features.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one key feature",
        variant: "destructive",
      })
      return
    }
    if (!formData.color_style.trim()) {
      toast({
        title: "Validation Error",
        description: "Color style preference is required",
        variant: "destructive",
      })
      return
    }
    if (formData.social_media_links.filter((link) => link.trim()).length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one social media link",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("business_name", formData.business_name)
      formDataToSend.append("business_type", formData.business_type)
      formDataToSend.append("tagline", formData.tagline)
      formDataToSend.append("contact_info", formData.contact_info)
      formDataToSend.append("primary_purposes", JSON.stringify(formData.primary_purposes))
      formDataToSend.append("primary_purposes_other", formData.primary_purposes_other)
      formDataToSend.append("target_audience", formData.target_audience)
      formDataToSend.append("key_features", JSON.stringify(formData.key_features))
      formDataToSend.append("key_features_other", formData.key_features_other)
      formDataToSend.append("product_image_sources", JSON.stringify(formData.product_image_sources.filter((s) => s.trim())))
      formDataToSend.append("color_style", formData.color_style)
      formDataToSend.append("social_media_links", JSON.stringify(formData.social_media_links.filter((l) => l.trim())))
      formDataToSend.append("location", formData.location)

      if (formData.business_logo) {
        formDataToSend.append("business_logo", formData.business_logo)
      }

      const response = await fetch("/api/demoRequirements", {
        method: "POST",
        body: formDataToSend,
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Website demo requirements submitted successfully! Thank you.",
          variant: "default",
        })
        setSubmitted(true)

        setTimeout(() => {
          onSubmitSuccess?.()
        }, 2000)
      } else {
        const errorMessage = data.message || "Failed to submit requirements"
        toast({
          title: "Submission Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    { number: 1, title: "Business Info", icon: Building2 },
    { number: 2, title: "Purpose & Audience", icon: Target },
    { number: 3, title: "Features & Design", icon: Sparkles },
    { number: 4, title: "Media & Final", icon: Globe },
  ]

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/95 via-purple-900/95 to-indigo-900/95 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-lg bg-white shadow-2xl border-0 rounded-3xl overflow-hidden">
          <CardContent className="pt-16 pb-16 text-center px-8">
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <CheckCircle2 className="w-24 h-24 text-emerald-500 relative z-10" strokeWidth={1.5} />
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-4 text-slate-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Thank You!
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-2">
              Your website demo requirements have been submitted successfully.
            </p>
            <p className="text-slate-500 text-base">
              Our team will review and contact you soon.
            </p>
            <div className="mt-8 flex justify-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#2B4C9F]/15 to-[#3B5FAF]/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#FBBF24]/10 to-[#F59E0B]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-[#2B4C9F]/10 to-[#FBBF24]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Header with close button */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-[#FBBF24] via-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent leading-tight">
              Let's Build Your Dream Website
            </h1>
            <p className="text-slate-600 text-lg">Tell us about your vision and we'll bring it to life</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="hover:bg-white/80 rounded-full p-2.5 transition-all shadow-md bg-white border border-slate-200"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between relative">
              {/* Progress bar background */}
              <div className="absolute top-6 left-0 right-0 h-1 bg-slate-200 rounded-full" style={{ zIndex: 0 }}></div>
              {/* Progress bar fill */}
              <div 
                className="absolute top-6 left-0 h-1 bg-gradient-to-r from-[#2B4C9F] to-[#FBBF24] rounded-full transition-all duration-500"
                style={{ 
                  width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                  zIndex: 1
                }}
              ></div>
              
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = currentStep === step.number
                const isCompleted = currentStep > step.number
                
                return (
                  <div key={step.number} className="flex flex-col items-center relative z-10" style={{ flex: 1 }}>
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                      ${isActive ? 'bg-gradient-to-br from-[#2B4C9F] to-[#3B5FAF] shadow-lg scale-110' : ''}
                      ${isCompleted ? 'bg-gradient-to-br from-[#FBBF24] to-[#F59E0B]' : ''}
                      ${!isActive && !isCompleted ? 'bg-white border-2 border-slate-300' : ''}
                    `}>
                      <Icon className={`w-5 h-5 ${isActive || isCompleted ? 'text-white' : 'text-slate-400'}`} />
                    </div>
                    <span className={`text-xs font-medium text-center hidden sm:block ${isActive ? 'text-[#2B4C9F]' : 'text-slate-500'}`}>
                      {step.title}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
          <CardContent className="p-8 md:p-12">
            
            {/* Step 1: Business Information */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2B4C9F] to-[#3B5FAF] mb-4 shadow-lg">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Business Information</h2>
                  <p className="text-slate-600">Let's start with the basics about your business</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <Label htmlFor="businessName" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#2B4C9F]"></span>
                      Business Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="businessName"
                      placeholder="Enter your business name"
                      className="h-12 border-2 border-slate-200 focus:border-[#2B4C9F] focus:ring-4 focus:ring-[#2B4C9F]/20 rounded-xl transition-all bg-white"
                      value={formData.business_name}
                      onChange={(e) => handleInputChange("business_name", e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="businessType" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#FBBF24]"></span>
                      Business Type <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="businessType"
                      placeholder="e.g., Restaurant, Retail, Service"
                      className="h-12 border-2 border-slate-200 focus:border-[#2B4C9F] focus:ring-4 focus:ring-[#2B4C9F]/20 rounded-xl transition-all bg-white"
                      value={formData.business_type}
                      onChange={(e) => handleInputChange("business_type", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <Label htmlFor="businessLogo" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#FBBF24]" />
                      Business Logo <span className="text-slate-500 font-normal">(optional)</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="businessLogo"
                        type="file"
                        accept="image/*"
                        className="h-12 border-2 border-dashed border-slate-300 hover:border-pink-400 rounded-xl cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-pink-50 file:text-pink-600 file:font-semibold hover:file:bg-pink-100 transition-all bg-white"
                        onChange={handleFileChange}
                      />
                    </div>
                    {formData.business_logo && (
                      <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="font-medium">{formData.business_logo.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="tagline" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#FBBF24]" />
                      Tagline/Slogan <span className="text-slate-500 font-normal">(optional)</span>
                    </Label>
                    <Input
                      id="tagline"
                      placeholder="Your business tagline"
                      className="h-12 border-2 border-slate-200 focus:border-[#FBBF24] focus:ring-4 focus:ring-[#2B4C9F]/20 rounded-xl transition-all bg-white"
                      value={formData.tagline}
                      onChange={(e) => handleInputChange("tagline", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="contactInfo" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2B4C9F]"></span>
                    Contact Information <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contactInfo"
                    placeholder="Email, phone, or website"
                    className="h-12 border-2 border-slate-200 focus:border-[#2B4C9F] focus:ring-4 focus:ring-[#2B4C9F]/20 rounded-xl transition-all bg-white"
                    value={formData.contact_info}
                    onChange={(e) => handleInputChange("contact_info", e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Purpose & Audience */}
            {currentStep === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2B4C9F] to-[#FBBF24] mb-4 shadow-lg">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Purpose & Audience</h2>
                  <p className="text-slate-600">What do you want to achieve and who are you targeting?</p>
                </div>

                <div className="space-y-6">
                  <Label className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#2B4C9F]"></span>
                    Primary Purpose(s) <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      { value: "Booking", icon: "📅" },
                      { value: "Menu/Catalogue Display", icon: "📋" },
                      { value: "Portfolio", icon: "🎨" },
                      { value: "Service Showcase", icon: "⭐" },
                      { value: "Online Store/E-commerce", icon: "🛍️" },
                      { value: "Lead Generation", icon: "🎯" },
                    ].map((purpose) => (
                      <div
                        key={purpose.value}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.primary_purposes.includes(purpose.value)
                            ? 'border-[#2B4C9F] bg-[#2B4C9F]/10 shadow-md'
                            : 'border-slate-200 hover:border-[#2B4C9F]/50 hover:bg-[#2B4C9F]/5'
                        }`}
                        onClick={() => {
                          const isChecked = formData.primary_purposes.includes(purpose.value)
                          handleCheckboxChange("primary_purposes", purpose.value, !isChecked)
                        }}
                      >
                        <Checkbox
                          id={`purpose-${purpose.value}`}
                          checked={formData.primary_purposes.includes(purpose.value)}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("primary_purposes", purpose.value, checked as boolean)
                          }
                          className="w-5 h-5"
                        />
                        <span className="text-2xl">{purpose.icon}</span>
                        <Label htmlFor={`purpose-${purpose.value}`} className="font-medium text-slate-700 cursor-pointer flex-1">
                          {purpose.value}
                        </Label>
                      </div>
                    ))}
                    <div
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        otherSelections.purposes
                          ? 'border-[#2B4C9F] bg-[#2B4C9F]/10 shadow-md'
                          : 'border-slate-200 hover:border-[#2B4C9F]/50 hover:bg-[#2B4C9F]/5'
                      }`}
                      onClick={() => handleOtherToggle("purposes", !otherSelections.purposes)}
                    >
                      <Checkbox
                        id="purpose-other"
                        checked={otherSelections.purposes}
                        onCheckedChange={(checked) => handleOtherToggle("purposes", checked as boolean)}
                        className="w-5 h-5"
                      />
                      <span className="text-2xl">✨</span>
                      <Label htmlFor="purpose-other" className="font-medium text-slate-700 cursor-pointer flex-1">
                        Other
                      </Label>
                    </div>
                  </div>
                  {otherSelections.purposes && (
                    <div className="ml-4 animate-in fade-in slide-in-from-top-2">
                      <Input
                        placeholder="Please specify your purpose"
                        value={formData.primary_purposes_other}
                        onChange={(e) => handleInputChange("primary_purposes_other", e.target.value)}
                        className="h-12 border-2 border-[#2B4C9F]/30 focus:border-[#2B4C9F] focus:ring-4 focus:ring-[#2B4C9F]/20 rounded-xl bg-white"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Label htmlFor="targetAudience" className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#FBBF24]" />
                    Target Audience <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    id="targetAudience"
                    placeholder="Describe your target audience (e.g., age group, interests, profession, demographics)"
                    className="w-full min-h-[140px] px-5 py-4 border-2 border-slate-200 rounded-xl focus:border-[#FBBF24] focus:ring-4 focus:ring-[#2B4C9F]/20 resize-none placeholder-slate-400 bg-white transition-all"
                    value={formData.target_audience}
                    onChange={(e) => handleInputChange("target_audience", e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Features & Design */}
            {currentStep === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2B4C9F] to-[#FBBF24] mb-4 shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Features & Design</h2>
                  <p className="text-slate-600">Choose the features and style for your website</p>
                </div>

                <div className="space-y-6">
                  <Label className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#2B4C9F]"></span>
                    Key Features <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      { value: "Reservation Form", icon: "📝" },
                      { value: "Gallery", icon: "🖼️" },
                      { value: "Product Catalogue", icon: "📦" },
                      { value: "Contact Form", icon: "📧" },
                      { value: "Testimonials", icon: "💬" },
                      { value: "Blog", icon: "📰" },
                    ].map((feature) => (
                      <div
                        key={feature.value}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.key_features.includes(feature.value)
                            ? 'border-[#2B4C9F] bg-[#2B4C9F]/10 shadow-md'
                            : 'border-slate-200 hover:border-[#2B4C9F]/50 hover:bg-[#2B4C9F]/5'
                        }`}
                        onClick={() => {
                          const isChecked = formData.key_features.includes(feature.value)
                          handleCheckboxChange("key_features", feature.value, !isChecked)
                        }}
                      >
                        <Checkbox
                          id={`feature-${feature.value}`}
                          checked={formData.key_features.includes(feature.value)}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("key_features", feature.value, checked as boolean)
                          }
                          className="w-5 h-5"
                        />
                        <span className="text-2xl">{feature.icon}</span>
                        <Label htmlFor={`feature-${feature.value}`} className="font-medium text-slate-700 cursor-pointer flex-1">
                          {feature.value}
                        </Label>
                      </div>
                    ))}
                    <div
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        otherSelections.features
                          ? 'border-[#2B4C9F] bg-[#2B4C9F]/10 shadow-md'
                          : 'border-slate-200 hover:border-[#2B4C9F]/50 hover:bg-[#2B4C9F]/5'
                      }`}
                      onClick={() => handleOtherToggle("features", !otherSelections.features)}
                    >
                      <Checkbox
                        id="feature-other"
                        checked={otherSelections.features}
                        onCheckedChange={(checked) => handleOtherToggle("features", checked as boolean)}
                        className="w-5 h-5"
                      />
                      <span className="text-2xl">⚡</span>
                      <Label htmlFor="feature-other" className="font-medium text-slate-700 cursor-pointer flex-1">
                        Other
                      </Label>
                    </div>
                  </div>
                  {otherSelections.features && (
                    <div className="ml-4 animate-in fade-in slide-in-from-top-2">
                      <Input
                        placeholder="Please specify your feature"
                        value={formData.key_features_other}
                        onChange={(e) => handleInputChange("key_features_other", e.target.value)}
                        className="h-12 border-2 border-indigo-200 focus:border-[#2B4C9F] focus:ring-4 focus:ring-[#2B4C9F]/20 rounded-xl bg-white"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Label htmlFor="colorStyle" className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-[#FBBF24]" />
                    Color Style Preference <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="colorStyle"
                    placeholder="e.g., Gradient Blue, Modern Minimalist, Warm Earth Tones"
                    className="h-12 border-2 border-slate-200 focus:border-[#FBBF24] focus:ring-4 focus:ring-[#2B4C9F]/20 rounded-xl transition-all bg-white"
                    value={formData.color_style}
                    onChange={(e) => handleInputChange("color_style", e.target.value)}
                  />
                  <p className="text-sm text-slate-500 flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    Examples: "Bold & Vibrant", "Elegant & Minimal", "Corporate Blue", "Nature-inspired Green"
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Media & Final */}
            {currentStep === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] mb-4 shadow-lg">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Media & Final Details</h2>
                  <p className="text-slate-600">Add your images, social links, and location</p>
                </div>

                <div className="space-y-4">
                  <Label className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-emerald-500" />
                    Sample Product Image Sources
                  </Label>
                  <p className="text-sm text-slate-500">Provide links to sample images you'd like to use</p>
                  <div className="space-y-3">
                    {formData.product_image_sources.map((source, index) => (
                      <div key={index} className="flex gap-3 items-center group">
                        <div className="flex-1 relative">
                          <Input
                            placeholder="https://example.com/image.jpg"
                            value={source}
                            onChange={(e) => updateProductImageSource(index, e.target.value)}
                            className="h-12 border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl pl-10 bg-white"
                          />
                          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        </div>
                        {formData.product_image_sources.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeProductImageSource(index)}
                            className="border-2 border-red-200 hover:bg-red-50 hover:border-red-400 text-red-600 h-12 w-12 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addProductImageSource}
                      className="w-full border-2 border-dashed border-emerald-300 hover:bg-emerald-50 hover:border-emerald-500 text-emerald-600 h-12 rounded-xl font-semibold"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add Another Image
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-500" />
                    Social Media Links <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-sm text-slate-500">Add your social media profiles</p>
                  <div className="space-y-3">
                    {formData.social_media_links.map((link, index) => (
                      <div key={index} className="flex gap-3 items-center group">
                        <div className="flex-1 relative">
                          <Input
                            placeholder="https://instagram.com/yourbusiness"
                            value={link}
                            onChange={(e) => updateSocialMediaLink(index, e.target.value)}
                            className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl pl-10 bg-white"
                          />
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        </div>
                        {formData.social_media_links.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeSocialMediaLink(index)}
                            className="border-2 border-red-200 hover:bg-red-50 hover:border-red-400 text-red-600 h-12 w-12 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addSocialMediaLink}
                      className="w-full border-2 border-dashed border-[#FBBF24]/50 hover:bg-[#2B4C9F]/5 hover:border-blue-500 text-[#2B4C9F] h-12 rounded-xl font-semibold"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add Another Link
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="location" className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#FBBF24]" />
                    Location <span className="text-slate-500 font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="location"
                    placeholder="City, Country"
                    className="h-12 border-2 border-slate-200 focus:border-[#FBBF24] focus:ring-4 focus:ring-[#2B4C9F]/20 rounded-xl transition-all bg-white"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-12 pt-8 border-t-2 border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose?.()}
                className="flex-1 h-12 border-2 border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl"
              >
                {currentStep === 1 ? 'Cancel' : 'Previous'}
              </Button>
              
              {currentStep < 4 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="flex-1 h-12 bg-gradient-to-r from-[#2B4C9F] to-[#3B5FAF] hover:from-blue-600 hover:to-purple-600 text-white font-bold shadow-lg hover:shadow-xl transition-all rounded-xl"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 h-12 bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] hover:from-emerald-600 hover:to-teal-600 text-white font-bold shadow-lg hover:shadow-xl transition-all rounded-xl"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Submit Requirements
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer note */}
        <div className="text-center mt-8 text-sm text-slate-500">
          <p>Step {currentStep} of {steps.length} • Your information is secure and confidential</p>
        </div>
      </div>
    </div>
  )
}