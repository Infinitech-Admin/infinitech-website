"use client"
import { useState } from "react"
import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, Loader2, X, Plus, Trash2, Building2, Target, Sparkles, Globe, MapPin, TrendingUp, ShoppingCart, Users, Eye, BarChart, Megaphone, Globe2, Gauge } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ClientAssessmentFormProps {
  onClose?: () => void
  onSubmitSuccess?: () => void
}

export default function ClientAssessmentForm({ onClose, onSubmitSuccess }: ClientAssessmentFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    // Basic Company Information
    business_name: "",
    industry_niche: "",
    industry_niche_other: "",
    business_type: "", // B2B, B2C, Both
    years_in_operation: "",
    company_size: "", // Startup, Small, Medium, Enterprise
    company_size_other: "",
    branches_locations: "",
    geographic_scope: "", // Local, National, Regional
    geographic_scope_other: "",
    has_physical_stores: false,
    has_online_presence: false,
    business_logo: null as File | null,
    
    // Website & Digital Assets
    website_url: "",
    website_type: "", // Informational, E-commerce, Booking, Other
    website_type_other: "",
    website_condition: "", // Updated, Needs improvement, Outdated
    page_speed: "", // slow, average, fast
    mobile_responsive: false,
    clear_cta: false,
    
    // Search Visibility (SEO)
    google_brand_search: false,
    non_brand_keywords: false,
    has_blog_content: false,
    meta_optimized: false,
    seo_opportunity_level: "", // Low, Medium, High
    seo_notes: "",
    
    // Google Ads / Paid Ads
    google_ads_running: false,
    search_ads_visible: false,
    shopping_ads_visible: false,
    display_ads_visible: false,
    ad_quality: "", // Strong, Average, Weak
    paid_ads_opportunity: "", // Setup, Optimization, Scaling, Retargeting
    paid_ads_opportunity_other: "",
    
    // Social Media Presence
    facebook_status: "", // Active, Inactive, None
    instagram_status: "", // Active, Inactive, None
    tiktok_status: "", // Active, Inactive, None
    linkedin_status: "", // Active, Inactive, None
    other_social: "",
    posting_frequency: "", // Daily, Weekly, Occasional, Rare
    posting_frequency_other: "",
    engagement_level: "", // High, Medium, Low
    
    // E-commerce / Sales Funnel
    online_purchasing_enabled: "",
    payment_gateways_visible: "",
    product_pages_optimized: "",
    has_reviews_testimonials: "",
    funnel_health: "", // Needs setup, Needs optimization, Ready to scale
    funnel_health_other: "",
    
    // Client Intent
    likely_client_intent: {
      lead_generation: false,
      online_sales_growth: false,
      brand_visibility: false,
      website_traffic_increase: false,
      market_expansion: false,
      other: false,
      other_text: "",
    },
    
    inquiry_source: "",
    inquiry_source_other: "",
    
    // Social Media Links
    social_media_links: [""],
    
    // Recommended Services - Primary
    primary_recommendation: {
      website_development: false,
      mobile_app_development: false,
      seo: false,
      google_ads: false,
      seo_google_ads_bundle: false,
      website_redesign: false,
      analytics_conversion_tracking: false,
      multimedia_services: false,
      other: false,
      other_text: "",
    },
    
    // Recommended Services - Secondary
    secondary_recommendations: {
      landing_pages: false,
      google_shopping_ads: false,
      remarketing: false,
      content_creation: false,
      other: false,
      other_text: "",
    },
    
    // Additional Notes
    contact_info: "",
    location: "",
    additional_notes: "",
  })

  const validateStep = (step: number): boolean => {
    setFieldErrors({})
    
    if (step === 1) {
      const errors: Record<string, boolean> = {}
      if (!formData.business_name.trim()) {
        errors.business_name = true
        toast({ title: "Required Field Missing", description: "Please enter the business name", variant: "destructive" })
        setFieldErrors(errors)
        return false
      }
      if (!formData.industry_niche.trim()) {
        errors.industry_niche = true
        toast({ title: "Required Field Missing", description: "Please enter the industry/niche", variant: "destructive" })
        setFieldErrors(errors)
        return false
      }
      if (!formData.business_type.trim()) {
        errors.business_type = true
        toast({ title: "Required Field Missing", description: "Please select business type", variant: "destructive" })
        setFieldErrors(errors)
        return false
      }
      if (!formData.years_in_operation.trim()) {
        errors.years_in_operation = true
        toast({ title: "Required Field Missing", description: "Please enter years in operation", variant: "destructive" })
        setFieldErrors(errors)
        return false
      }
      if (!formData.company_size.trim()) {
        errors.company_size = true
        toast({ title: "Required Field Missing", description: "Please select company size", variant: "destructive" })
        setFieldErrors(errors)
        return false
      }
      if (formData.company_size === 'Other' && !formData.company_size_other.trim()) {
        errors.company_size_other = true
        toast({ title: "Required Field Missing", description: "Please specify company size", variant: "destructive" })
        setFieldErrors(errors)
        return false
      }
      if (!formData.contact_info.trim()) {
        errors.contact_info = true
        toast({ title: "Required Field Missing", description: "Please enter contact information", variant: "destructive" })
        setFieldErrors(errors)
        return false
      }
      return true
    }

    if (step === 2) {
      const errors: Record<string, boolean> = {}
      if (!formData.website_url.trim()) {
        errors.website_url = true
        toast({ title: "Required Field Missing", description: "Please enter website URL", variant: "destructive" })
        setFieldErrors(errors)
        return false
      }
      if (!formData.website_type.trim()) {
        errors.website_type = true
        toast({ title: "Required Field Missing", description: "Please select website type", variant: "destructive" })
        setFieldErrors(errors)
        return false
      }
      if (formData.website_type === 'Other' && !formData.website_type_other.trim()) {
        errors.website_type_other = true
        toast({ title: "Required Field Missing", description: "Please specify website type", variant: "destructive" })
        setFieldErrors(errors)
        return false
      }
      return true
    }

    if (step === 3) {
      const errors: Record<string, boolean> = {}
      if (!formData.google_ads_running && !formData.facebook_status && !formData.instagram_status) {
        errors.digital_presence = true
        toast({ title: "Required Field Missing", description: "Please indicate digital marketing presence", variant: "destructive" })
        setFieldErrors(errors)
        return false
      }
      return true
    }

    if (step === 4) {
      const errors: Record<string, boolean> = {}
      const hasIntent = Object.entries(formData.likely_client_intent).some(
        ([key, value]) => key !== 'other_text' && value === true
      )
      if (!hasIntent) {
        errors.likely_client_intent = true
        toast({ title: "Required Field Missing", description: "Please select at least one client intent", variant: "destructive" })
        setFieldErrors(errors)
        return false
      }
      if (formData.likely_client_intent.other && !formData.likely_client_intent.other_text.trim()) {
        errors.likely_client_intent_other = true
        toast({ title: "Required Field Missing", description: "Please specify other client intent", variant: "destructive" })
        setFieldErrors(errors)
        return false
      }
      const hasPrimary = Object.entries(formData.primary_recommendation).some(
        ([key, value]) => key !== 'other_text' && value === true
      )
      if (!hasPrimary) {
        errors.primary_recommendation = true
        toast({ title: "Required Field Missing", description: "Please select at least one service recommendation", variant: "destructive" })
        setFieldErrors(errors)
        return false
      }
      if (formData.primary_recommendation.other && !formData.primary_recommendation.other_text.trim()) {
        errors.primary_recommendation_other = true
        toast({ title: "Required Field Missing", description: "Please specify other service recommendation", variant: "destructive" })
        setFieldErrors(errors)
        return false
      }
      return true
    }

    return true
  }

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: checked }))
  }

  const handleNestedCheckboxChange = (section: string, field: string, checked: boolean) => {
  setFormData((prev) => {
    const currentSection = prev[section as keyof typeof prev];
    
    return {
      ...prev,
      [section]: {
        ...(typeof currentSection === 'object' && currentSection !== null ? currentSection : {}),
        [field]: checked,
      },
    };
  });
};

const handleNestedInputChange = (section: string, field: string, value: string) => {
  setFormData((prev) => {
    const currentSection = prev[section as keyof typeof prev];
    
    return {
      ...prev,
      [section]: {
        ...(typeof currentSection === 'object' && currentSection !== null ? currentSection : {}),
        [field]: value,
      },
    };
  });
};

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, business_logo: file }))
    }
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
    for (let step = 1; step <= 4; step++) {
      if (!validateStep(step)) {
        setCurrentStep(step)
        return
      }
    }

    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'business_logo') {
          if (value instanceof File) {
            formDataToSend.append(key, value)
          }
        } else if (typeof value === 'object' && value !== null && !(value instanceof File)) {
          formDataToSend.append(key, JSON.stringify(value))
        } else if (typeof value === 'boolean') {
          formDataToSend.append(key, value ? '1' : '0')
        } else {
          formDataToSend.append(key, String(value || ''))
        }
      })

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/client-assessment`, {
        method: "POST",
        body: formDataToSend,
      })

      const data = await response.json()

      if (data.success) {
        toast({ title: "Success", description: "Client assessment submitted successfully!", variant: "default" })
        setSubmitted(true)
        setTimeout(() => { onSubmitSuccess?.() }, 2000)
      } else {
        toast({ title: "Submission Error", description: data.message || "Failed to submit assessment", variant: "destructive" })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseSuccess = () => {
    setSubmitted(false)
    onClose?.()
  }

  const steps = [
    { number: 1, title: "Business Info", icon: Building2 },
    { number: 2, title: "Website & SEO", icon: Globe2 },
    { number: 3, title: "Digital Presence", icon: Megaphone },
    { number: 4, title: "Intent & Services", icon: Target },
  ]

  if (submitted) {
    return (
      <div 
        className="fixed inset-0 bg-gradient-to-br from-[#2B4C9F]/95 via-[#1E3A8A]/95 to-[#2B4C9F]/95 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={handleCloseSuccess}
      >
        <Card 
          className="w-full max-w-lg bg-white shadow-2xl border-0 rounded-3xl overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={handleCloseSuccess}
            className="absolute top-4 right-4 hover:bg-slate-100 rounded-full p-2 transition-all z-10"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
          <CardContent className="pt-16 pb-16 text-center px-8">
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[#FBBF24] rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <CheckCircle2 className="w-24 h-24 text-[#FBBF24] relative z-10" strokeWidth={1.5} />
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-4 text-slate-900 bg-gradient-to-r from-[#2B4C9F] to-[#FBBF24] bg-clip-text text-transparent">
              Assessment Complete!
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-2">Client assessment submitted successfully.</p>
            <div className="mt-8 flex justify-center gap-2">
              <div className="w-2 h-2 bg-[#FBBF24] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-[#FBBF24] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-[#FBBF24] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <Button 
              onClick={handleCloseSuccess}
              className="mt-8 bg-gradient-to-r from-[#2B4C9F] to-[#3B5FAF] hover:opacity-90 text-white px-8"
            >
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-blue-50">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#2B4C9F]/15 to-[#3B5FAF]/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#FBBF24]/10 to-[#F59E0B]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl mt-10 font-bold mb-3 bg-gradient-to-r from-[#FBBF24] via-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent leading-tight">
              Client Assessment Form
            </h1>
            <p className="text-slate-600 text-lg">Complete background check for pre-sales discovery</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="hover:bg-white/80 rounded-full p-2.5 transition-all shadow-md bg-white border border-slate-200">
              <X className="h-5 w-5 text-slate-600" />
            </button>
          )}
        </div>

        <div className="mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-6 left-0 right-0 h-1 bg-slate-200 rounded-full" style={{ zIndex: 0 }}></div>
              <div className="absolute top-6 left-0 h-1 bg-gradient-to-r from-[#2B4C9F] to-[#FBBF24] rounded-full transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`, zIndex: 1 }}></div>
              
              {steps.map((step) => {
                const Icon = step.icon
                const isActive = currentStep === step.number
                const isCompleted = currentStep > step.number
                
                return (
                  <div key={step.number} className="flex flex-col items-center relative z-10" style={{ flex: 1 }}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                      ${isActive ? 'bg-gradient-to-br from-[#2B4C9F] to-[#3B5FAF] shadow-lg scale-110' : ''}
                      ${isCompleted ? 'bg-gradient-to-br from-[#FBBF24] to-[#F59E0B]' : ''}
                      ${!isActive && !isCompleted ? 'bg-white border-2 border-slate-300' : ''}`}>
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

        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-visible">
          <CardContent className="p-8 md:p-12" style={{ position: 'relative' }}>
            
            {/* Step 1: Business Information */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-slate-700 font-semibold">Company Name *</Label>
                    <Input placeholder="Enter company name" value={formData.business_name} onChange={(e) => handleInputChange('business_name', e.target.value)} className={fieldErrors.business_name ? 'border-red-500' : ''} />
                  </div>
                  <div>
                    <Label className="text-slate-700 font-semibold">Industry / Niche *</Label>
                    <Input placeholder="e.g., E-commerce, SaaS, Services" value={formData.industry_niche} onChange={(e) => handleInputChange('industry_niche', e.target.value)} className={fieldErrors.industry_niche ? 'border-red-500' : ''} />
                  </div>
                  <div>
                    <Label className="text-slate-700 font-semibold">Business Type *</Label>
                    <Select value={formData.business_type} onValueChange={(value) => handleInputChange('business_type', value)}>
                      <SelectTrigger className={fieldErrors.business_type ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent position="popper" sideOffset={5} className="bg-blue-50 border-slate-200 z-[9999]">
                        <SelectItem value="B2B">B2B</SelectItem>
                        <SelectItem value="B2C">B2C</SelectItem>
                        <SelectItem value="Both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-700 font-semibold">Years in Operation *</Label>
                    <Input placeholder="e.g., 5" value={formData.years_in_operation} onChange={(e) => handleInputChange('years_in_operation', e.target.value)} className={fieldErrors.years_in_operation ? 'border-red-500' : ''} />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-slate-700 font-semibold">Company Size *</Label>
                    <Select value={formData.company_size} onValueChange={(value) => handleInputChange('company_size', value)}>
                      <SelectTrigger className={fieldErrors.company_size ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-50 border-slate-200 z-[9999]">
                        <SelectItem value="Startup">Startup</SelectItem>
                        <SelectItem value="Small">Small (1-50)</SelectItem>
                        <SelectItem value="Medium">Medium (51-250)</SelectItem>
                        <SelectItem value="Enterprise">Enterprise (250+)</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.company_size === 'Other' && (
                      <Input 
                        placeholder="Please specify company size" 
                        value={formData.company_size_other} 
                        onChange={(e) => handleInputChange('company_size_other', e.target.value)} 
                        className={`mt-2 ${fieldErrors.company_size_other ? 'border-red-500' : ''}`}
                      />
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-slate-700 font-semibold">Geographic Scope</Label>
                    <Select value={formData.geographic_scope} onValueChange={(value) => handleInputChange('geographic_scope', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select scope" />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-50 border-slate-200 z-[9999]">
                        <SelectItem value="Local">Local</SelectItem>
                        <SelectItem value="National">National</SelectItem>
                        <SelectItem value="Regional">Regional</SelectItem>
                        <SelectItem value="International">International</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.geographic_scope === 'Other' && (
                      <Input 
                        placeholder="Please specify geographic scope" 
                        value={formData.geographic_scope_other} 
                        onChange={(e) => handleInputChange('geographic_scope_other', e.target.value)} 
                        className="mt-2"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-slate-700 font-semibold">Locations & Store Info</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="physical" checked={formData.has_physical_stores} onCheckedChange={(checked) => handleCheckboxChange('has_physical_stores', Boolean(checked))} />
                      <Label htmlFor="physical" className="cursor-pointer">Physical Stores</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="online" checked={formData.has_online_presence} onCheckedChange={(checked) => handleCheckboxChange('has_online_presence', Boolean(checked))} />
                      <Label htmlFor="online" className="cursor-pointer">Online Presence</Label>
                    </div>
                  </div>
                  <Input placeholder="Branches/Locations (e.g., '3 locations in CA')" value={formData.branches_locations} onChange={(e) => handleInputChange('branches_locations', e.target.value)} />
                </div>

                <div>
                  <Label className="text-slate-700 font-semibold">Contact Information *</Label>
                  <Input placeholder="Email or phone" value={formData.contact_info} onChange={(e) => handleInputChange('contact_info', e.target.value)} className={fieldErrors.contact_info ? 'border-red-500' : ''} />
                </div>

                <div>
                  <Label className="text-slate-700 font-semibold">Business Logo</Label>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#2B4C9F] hover:file:bg-blue-100" />
                  {formData.business_logo && <p className="text-sm text-slate-600 mt-2">✓ {formData.business_logo.name}</p>}
                </div>
              </div>
            )}

            {/* Step 2: Website & SEO */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div>
                  <Label className="text-slate-700 font-semibold">Website URL *</Label>
                  <Input placeholder="https://example.com" value={formData.website_url} onChange={(e) => handleInputChange('website_url', e.target.value)} className={fieldErrors.website_url ? 'border-red-500' : ''} />
                </div>

                <div>
                  <Label className="text-slate-700 font-semibold">Website Type *</Label>
                  <Select value={formData.website_type} onValueChange={(value) => handleInputChange('website_type', value)}>
                    <SelectTrigger className={fieldErrors.website_type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-blue-50 border-slate-200 z-[9999]">
                      <SelectItem value="Informational">Informational</SelectItem>
                      <SelectItem value="E-commerce">E-commerce</SelectItem>
                      <SelectItem value="Booking">Booking/Service</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.website_type === 'Other' && (
                    <Input 
                      placeholder="Please specify website type" 
                      value={formData.website_type_other} 
                      onChange={(e) => handleInputChange('website_type_other', e.target.value)} 
                      className={`mt-2 ${fieldErrors.website_type_other ? 'border-red-500' : ''}`}
                    />
                  )}
                </div>

                <div>
                  <Label className="text-slate-700 font-semibold mb-3 block">Website Condition</Label>
                  <div className="flex flex-wrap gap-4">
                    {["Updated", "Needs improvement", "Outdated"].map((condition) => (
                      <div key={condition} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`condition-${condition}`}
                          checked={formData.website_condition === condition}
                          onCheckedChange={(checked) => handleInputChange('website_condition', checked ? condition : '')}
                        />
                        <Label htmlFor={`condition-${condition}`} className="cursor-pointer text-sm">{condition}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-slate-700 font-semibold">Quick Observations</Label>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-slate-600 block mb-2">Page Speed</Label>
                      <div className="flex flex-wrap gap-3">
                        {["Fast", "Average", "Slow"].map((speed) => (
                          <div key={speed} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`speed-${speed}`}
                              checked={formData.page_speed === speed}
                              onCheckedChange={(checked) => handleInputChange('page_speed', checked ? speed : '')}
                            />
                            <Label htmlFor={`speed-${speed}`} className="cursor-pointer text-sm">{speed}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="mobile" checked={formData.mobile_responsive} onCheckedChange={(checked) => handleCheckboxChange('mobile_responsive', Boolean(checked))} />
                      <Label htmlFor="mobile" className="cursor-pointer">Mobile Responsive</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="cta" checked={formData.clear_cta} onCheckedChange={(checked) => handleCheckboxChange('clear_cta', Boolean(checked))} />
                      <Label htmlFor="cta" className="cursor-pointer">Clear CTA</Label>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <Label className="text-slate-700 font-semibold">Search Visibility (SEO)</Label>
                  <div className="space-y-3 mt-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="brand" checked={formData.google_brand_search} onCheckedChange={(checked) => handleCheckboxChange('google_brand_search', Boolean(checked))} />
                      <Label htmlFor="brand" className="cursor-pointer">Appears in Google brand search</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="nonbrand" checked={formData.non_brand_keywords} onCheckedChange={(checked) => handleCheckboxChange('non_brand_keywords', Boolean(checked))} />
                      <Label htmlFor="nonbrand" className="cursor-pointer">Appears for non-brand keywords</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="blog" checked={formData.has_blog_content} onCheckedChange={(checked) => handleCheckboxChange('has_blog_content', Boolean(checked))} />
                      <Label htmlFor="blog" className="cursor-pointer">Blog/Content section present</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="meta" checked={formData.meta_optimized} onCheckedChange={(checked) => handleCheckboxChange('meta_optimized', Boolean(checked))} />
                      <Label htmlFor="meta" className="cursor-pointer">Meta titles/descriptions optimized</Label>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label className="text-slate-600">SEO Opportunity Level</Label>
                      <Select value={formData.seo_opportunity_level} onValueChange={(value) => handleInputChange('seo_opportunity_level', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent className="bg-blue-50 border-slate-200 z-[9999]">
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Digital Presence */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div>
                  <Label className="text-slate-700 font-semibold">Google Ads / Paid Ads</Label>
                  <div className="space-y-3 mt-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="google-ads" checked={formData.google_ads_running} onCheckedChange={(checked) => handleCheckboxChange('google_ads_running', Boolean(checked))} />
                      <Label htmlFor="google-ads" className="cursor-pointer">Google Ads currently running</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="search" checked={formData.search_ads_visible} onCheckedChange={(checked) => handleCheckboxChange('search_ads_visible', Boolean(checked))} />
                      <Label htmlFor="search" className="cursor-pointer">Search Ads visible</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="shopping" checked={formData.shopping_ads_visible} onCheckedChange={(checked) => handleCheckboxChange('shopping_ads_visible', Boolean(checked))} />
                      <Label htmlFor="shopping" className="cursor-pointer">Shopping Ads visible</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="display" checked={formData.display_ads_visible} onCheckedChange={(checked) => handleCheckboxChange('display_ads_visible', Boolean(checked))} />
                      <Label htmlFor="display" className="cursor-pointer">Display Ads visible</Label>
                    </div>
                  </div>

                  <div className="space-y-4 mt-4">
                    <div>
                      <Label className="text-slate-600 block mb-2">Ad Quality</Label>
                      <div className="flex flex-wrap gap-3">
                        {["Strong", "Average", "Weak"].map((quality) => (
                          <div key={quality} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`quality-${quality}`}
                              checked={formData.ad_quality === quality}
                              onCheckedChange={(checked) => handleInputChange('ad_quality', checked ? quality : '')}
                            />
                            <Label htmlFor={`quality-${quality}`} className="cursor-pointer text-sm">{quality}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-slate-600">Paid Ads Opportunity</Label>
                      <Select value={formData.paid_ads_opportunity} onValueChange={(value) => handleInputChange('paid_ads_opportunity', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select opportunity" />
                        </SelectTrigger>
                        <SelectContent className="bg-blue-50 border-slate-200 z-[9999]">
                          <SelectItem value="Setup">Setup</SelectItem>
                          <SelectItem value="Optimization">Optimization</SelectItem>
                          <SelectItem value="Scaling">Scaling</SelectItem>
                          <SelectItem value="Retargeting">Retargeting</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {formData.paid_ads_opportunity === 'Other' && (
                        <Input 
                          placeholder="Please specify opportunity" 
                          value={formData.paid_ads_opportunity_other} 
                          onChange={(e) => handleInputChange('paid_ads_opportunity_other', e.target.value)} 
                          className="mt-2"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <Label className="text-slate-700 font-semibold">Social Media Presence</Label>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label className="text-slate-600">Facebook</Label>
                      <Select value={formData.facebook_status} onValueChange={(value) => handleInputChange('facebook_status', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-blue-50 border-slate-200 z-[9999]">
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                          <SelectItem value="None">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-600">Instagram</Label>
                      <Select value={formData.instagram_status} onValueChange={(value) => handleInputChange('instagram_status', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-blue-50 border-slate-200 z-[9999]">
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                          <SelectItem value="None">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-600">TikTok</Label>
                      <Select value={formData.tiktok_status} onValueChange={(value) => handleInputChange('tiktok_status', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-blue-50 border-slate-200 z-[9999]">
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                          <SelectItem value="None">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-600">LinkedIn</Label>
                      <Select value={formData.linkedin_status} onValueChange={(value) => handleInputChange('linkedin_status', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-blue-50 border-slate-200 z-[9999]">
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                          <SelectItem value="None">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label className="text-slate-600">Posting Frequency</Label>
                      <Select value={formData.posting_frequency} onValueChange={(value) => handleInputChange('posting_frequency', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent className="bg-blue-50 border-slate-200 z-[9999]">
                          <SelectItem value="Daily">Daily</SelectItem>
                          <SelectItem value="Weekly">Weekly</SelectItem>
                          <SelectItem value="Occasional">Occasional</SelectItem>
                          <SelectItem value="Rare">Rare</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {formData.posting_frequency === 'Other' && (
                        <Input 
                          placeholder="Please specify frequency" 
                          value={formData.posting_frequency_other} 
                          onChange={(e) => handleInputChange('posting_frequency_other', e.target.value)} 
                          className="mt-2"
                        />
                      )}
                    </div>
                    <div>
                      <Label className="text-slate-600">Engagement Level</Label>
                      <Select value={formData.engagement_level} onValueChange={(value) => handleInputChange('engagement_level', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent className="bg-blue-50 border-slate-200 z-[9999]">
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <Label className="text-slate-700 font-semibold">E-commerce / Sales Funnel Check (If Applicable)</Label>
                  <div className="space-y-4 mt-3">
                    <div>
                      <Label className="text-slate-600 mb-2 block">Online purchasing enabled?</Label>
                      <RadioGroup value={formData.online_purchasing_enabled} onValueChange={(value) => handleInputChange('online_purchasing_enabled', value)}>
                        <div className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Yes" id="purchasing-yes" />
                            <Label htmlFor="purchasing-yes" className="cursor-pointer">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="No" id="purchasing-no" />
                            <Label htmlFor="purchasing-no" className="cursor-pointer">No</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-slate-600 mb-2 block">Payment gateways visible?</Label>
                      <RadioGroup value={formData.payment_gateways_visible} onValueChange={(value) => handleInputChange('payment_gateways_visible', value)}>
                        <div className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Yes" id="payment-yes" />
                            <Label htmlFor="payment-yes" className="cursor-pointer">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="No" id="payment-no" />
                            <Label htmlFor="payment-no" className="cursor-pointer">No</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-slate-600 mb-2 block">Product pages optimized?</Label>
                      <RadioGroup value={formData.product_pages_optimized} onValueChange={(value) => handleInputChange('product_pages_optimized', value)}>
                        <div className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Yes" id="product-yes" />
                            <Label htmlFor="product-yes" className="cursor-pointer">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="No" id="product-no" />
                            <Label htmlFor="product-no" className="cursor-pointer">No</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-slate-600 mb-2 block">Reviews / testimonials present?</Label>
                      <RadioGroup value={formData.has_reviews_testimonials} onValueChange={(value) => handleInputChange('has_reviews_testimonials', value)}>
                        <div className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Yes" id="reviews-yes" />
                            <Label htmlFor="reviews-yes" className="cursor-pointer">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="No" id="reviews-no" />
                            <Label htmlFor="reviews-no" className="cursor-pointer">No</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Label className="text-green-600 font-semibold block mb-2">Funnel Health:</Label>
                    <div className="flex flex-wrap gap-3">
                      {["Needs setup", "Needs optimization", "Ready to scale"].map((health) => (
                        <div key={health} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`health-${health}`}
                            checked={formData.funnel_health === health}
                            onCheckedChange={(checked) => handleInputChange('funnel_health', checked ? health : '')}
                          />
                          <Label htmlFor={`health-${health}`} className="cursor-pointer text-sm">{health}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Intent & Services */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div>
                  <Label className="text-slate-700 font-semibold">Client Intent *</Label>
                  <div className="space-y-3 mt-3">
                    {[
                      { key: 'lead_generation', label: 'Lead Generation' },
                      { key: 'online_sales_growth', label: 'Online Sales Growth' },
                      { key: 'brand_visibility', label: 'Brand Visibility' },
                      { key: 'website_traffic_increase', label: 'Website Traffic Increase' },
                      { key: 'market_expansion', label: 'Market Expansion' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox id={key} checked={formData.likely_client_intent[key as keyof typeof formData.likely_client_intent] as boolean} onCheckedChange={(checked) => handleNestedCheckboxChange('likely_client_intent', key, Boolean(checked))} />
                        <Label htmlFor={key} className="cursor-pointer">{label}</Label>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <Checkbox id="intent-other" checked={formData.likely_client_intent.other} onCheckedChange={(checked) => handleNestedCheckboxChange('likely_client_intent', 'other', Boolean(checked))} />
                      <Label htmlFor="intent-other" className="cursor-pointer">Other</Label>
                    </div>
                    {formData.likely_client_intent.other && (
                      <Input 
                        placeholder="Specify other intent" 
                        value={formData.likely_client_intent.other_text} 
                        onChange={(e) => handleNestedInputChange('likely_client_intent', 'other_text', e.target.value)} 
                        className={`ml-6 ${fieldErrors.likely_client_intent_other ? 'border-red-500' : ''}`}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-slate-700 font-semibold">Primary Service Recommendations *</Label>
                  <div className="space-y-3 mt-3">
                    {[
                      { key: 'website_development', label: 'Website Development' },
                      { key: 'mobile_app_development', label: 'Mobile App Development' },
                      { key: 'seo', label: 'SEO' },
                      { key: 'google_ads', label: 'Google Ads' },
                      { key: 'seo_google_ads_bundle', label: 'SEO + Google Ads Bundle' },
                      { key: 'website_redesign', label: 'Website Redesign' },
                      { key: 'analytics_conversion_tracking', label: 'Analytics & Conversion Tracking' },
                      { key: 'multimedia_services', label: 'Multimedia Services' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox id={key} checked={formData.primary_recommendation[key as keyof typeof formData.primary_recommendation] as boolean} onCheckedChange={(checked) => handleNestedCheckboxChange('primary_recommendation', key, Boolean(checked))} />
                        <Label htmlFor={key} className="cursor-pointer">{label}</Label>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <Checkbox id="primary-other" checked={formData.primary_recommendation.other} onCheckedChange={(checked) => handleNestedCheckboxChange('primary_recommendation', 'other', Boolean(checked))} />
                      <Label htmlFor="primary-other" className="cursor-pointer">Other</Label>
                    </div>
                    {formData.primary_recommendation.other && (
                      <Input 
                        placeholder="Specify other service" 
                        value={formData.primary_recommendation.other_text} 
                        onChange={(e) => handleNestedInputChange('primary_recommendation', 'other_text', e.target.value)} 
                        className={`ml-6 ${fieldErrors.primary_recommendation_other ? 'border-red-500' : ''}`}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-slate-700 font-semibold">Secondary Service Recommendations</Label>
                  <div className="space-y-3 mt-3">
                    {[
                      { key: 'landing_pages', label: 'Landing Pages' },
                      { key: 'google_shopping_ads', label: 'Google Shopping Ads' },
                      { key: 'remarketing', label: 'Remarketing' },
                      { key: 'content_creation', label: 'Content Creation' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox id={`secondary-${key}`} checked={formData.secondary_recommendations[key as keyof typeof formData.secondary_recommendations] as boolean} onCheckedChange={(checked) => handleNestedCheckboxChange('secondary_recommendations', key, Boolean(checked))} />
                        <Label htmlFor={`secondary-${key}`} className="cursor-pointer">{label}</Label>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <Checkbox id="secondary-other" checked={formData.secondary_recommendations.other} onCheckedChange={(checked) => handleNestedCheckboxChange('secondary_recommendations', 'other', Boolean(checked))} />
                      <Label htmlFor="secondary-other" className="cursor-pointer">Other</Label>
                    </div>
                    {formData.secondary_recommendations.other && (
                      <Input 
                        placeholder="Specify other service" 
                        value={formData.secondary_recommendations.other_text} 
                        onChange={(e) => handleNestedInputChange('secondary_recommendations', 'other_text', e.target.value)} 
                        className="ml-6"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-slate-700 font-semibold">Additional Notes</Label>
                  <textarea placeholder="Add any additional observations..." value={formData.additional_notes} onChange={(e) => handleInputChange('additional_notes', e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 min-h-24 focus:outline-none focus:ring-2 focus:ring-[#2B4C9F]" />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4 mt-8 pt-8 border-t border-slate-200">
              <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)} disabled={currentStep === 1} className="px-6">
                Previous
              </Button>
              {currentStep < steps.length ? (
                <Button onClick={handleNextStep} className="px-6 bg-gradient-to-r from-[#2B4C9F] to-[#3B5FAF] hover:opacity-90">
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting} className="px-6 bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] hover:opacity-90">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
