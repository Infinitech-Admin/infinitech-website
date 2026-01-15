"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Loader2, Video, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VideoSurveyFormProps {
  onClose?: () => void
  onSubmitSuccess?: () => void
}

export default function VideoSurveyForm({ onClose, onSubmitSuccess }: VideoSurveyFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    company_name: "",
    industry: "",
    q1_competitive_difference: "",
    q2_brand_words: "",
    q3_video_purpose: [] as string[],
    q3_other: "",
    q4_viewer_action: "",
    q5_target_audience: [] as string[],
    q6_matters_most: [] as string[],
    q7_style_preference: [] as string[],
    q7_other: "",
    q8_format: [] as string[],
    q9_content_included: [] as string[],
    q9_other: "",
    q10_video_length: [] as string[],
    q10_other: "",
    q11_video_usage: [] as string[],
    q12_subtitles: [] as string[],
  })

  const [otherSelections, setOtherSelections] = useState({
    videoPurpose: false,
    stylePreference: false,
    contentIncluded: false,
    videoLength: false,
  })

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

  const handleOtherToggle = (
    field: "videoPurpose" | "stylePreference" | "contentIncluded" | "videoLength",
    checked: boolean,
  ) => {
    setOtherSelections((prev) => ({ ...prev, [field]: checked }))

    if (field === "videoPurpose") {
      if (checked) {
        setFormData((prev) => ({
          ...prev,
          q3_video_purpose: [...prev.q3_video_purpose, "Other"],
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          q3_video_purpose: prev.q3_video_purpose.filter((item) => item !== "Other"),
          q3_other: "",
        }))
      }
    } else if (field === "stylePreference") {
      if (checked) {
        setFormData((prev) => ({
          ...prev,
          q7_style_preference: [...prev.q7_style_preference, "Other"],
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          q7_style_preference: prev.q7_style_preference.filter((item) => item !== "Other"),
          q7_other: "",
        }))
      }
    } else if (field === "contentIncluded") {
      if (checked) {
        setFormData((prev) => ({
          ...prev,
          q9_content_included: [...prev.q9_content_included, "Other"],
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          q9_content_included: prev.q9_content_included.filter((item) => item !== "Other"),
          q9_other: "",
        }))
      }
    } else if (field === "videoLength") {
      if (checked) {
        setFormData((prev) => ({
          ...prev,
          q10_video_length: [...prev.q10_video_length, "Other"],
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          q10_video_length: prev.q10_video_length.filter((item) => item !== "Other"),
          q10_other: "",
        }))
      }
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Map frontend field names to backend field names
      const mappedData = {
        company_name: formData.company_name,
        industry: formData.industry,
        company_different: formData.q1_competitive_difference,
        brand_words: formData.q2_brand_words,
        video_purpose: formData.q3_video_purpose,
        video_purpose_other: formData.q3_other,
        viewer_action: formData.q4_viewer_action,
        target_audience: formData.q5_target_audience,
        audience_matters: formData.q6_matters_most,
        preferred_style: formData.q7_style_preference,
        preferred_style_other: formData.q7_other,
        preferred_format: formData.q8_format,
        video_inclusions: formData.q9_content_included,
        video_inclusions_other: formData.q9_other,
        video_length: formData.q10_video_length,
        video_length_other: formData.q10_other,
        video_usage: formData.q11_video_usage,
        subtitles: formData.q12_subtitles,
      }

      const response = await fetch("/api/videoSurvey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mappedData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Video survey submitted successfully! Thank you for your feedback.",
          variant: "default",
        })
        setSubmitted(true)
        
        // Call onSubmitSuccess after a brief delay to show the success message
        setTimeout(() => {
          onSubmitSuccess?.()
        }, 2000)
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
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred while submitting the survey"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
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
            Thank you for completing the Video Project Survey. Your feedback is valuable to us.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-h-[80vh] overflow-y-auto">
      <div className="space-y-6 p-6">
        {/* Header with close button */}
        <div className="flex items-start justify-between pb-4 border-b">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Video Project Survey</h2>
            <p className="text-sm text-slate-600 mt-1">Please answer the following questions about your video project</p>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Company Information */}
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-slate-700">
                Company name
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
              <Label htmlFor="industry" className="text-slate-700">
                Industry
              </Label>
              <Input
                id="industry"
                placeholder="Enter your industry"
                className="border-slate-300"
                value={formData.industry}
                onChange={(e) => handleInputChange("industry", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Q1: What makes your company different? */}
        <div className="space-y-3">
          <Label htmlFor="q1" className="text-slate-800 font-semibold">
            Q1. What makes your company different from your competitors?
          </Label>
          <textarea
            id="q1"
            placeholder="Your answer"
            className="w-full min-h-[100px] px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 resize-y"
            value={formData.q1_competitive_difference}
            onChange={(e) => handleInputChange("q1_competitive_difference", e.target.value)}
          />
        </div>

        {/* Q2: Describe brand in 3 words */}
        <div className="space-y-3">
          <Label htmlFor="q2" className="text-slate-800 font-semibold">
            Q2. If you had to describe your brand in 3 words, what would they be?
          </Label>
          <Input
            id="q2"
            placeholder="Your answer"
            className="border-slate-300"
            value={formData.q2_brand_words}
            onChange={(e) => handleInputChange("q2_brand_words", e.target.value)}
          />
        </div>

        {/* Q3: Main purpose of video */}
        <div className="space-y-3">
          <Label className="text-slate-800 font-semibold">Q3. What is the main purpose of this video?</Label>
          <div className="grid gap-3 grid-cols-2">
            {[
              "Brand awareness",
              "Product promotion",
              "Company introduction",
              "Recruitment",
              "Event promotion",
              "Investor pitch",
              "Other",
            ].map((purpose) => (
              <div key={purpose} className="flex items-center space-x-2">
                <Checkbox
                  id={`q3-${purpose}`}
                  checked={
                    purpose === "Other" ? otherSelections.videoPurpose : formData.q3_video_purpose.includes(purpose)
                  }
                  onCheckedChange={(checked) => {
                    if (purpose === "Other") {
                      handleOtherToggle("videoPurpose", checked as boolean)
                    } else {
                      handleCheckboxChange("q3_video_purpose", purpose, checked as boolean)
                    }
                  }}
                />
                <Label htmlFor={`q3-${purpose}`} className="font-normal text-sm text-slate-600">
                  {purpose}
                </Label>
              </div>
            ))}
          </div>
          {otherSelections.videoPurpose && (
            <div className="mt-2 ml-6">
              <Input
                placeholder="Please specify"
                value={formData.q3_other}
                onChange={(e) => handleInputChange("q3_other", e.target.value)}
                className="border-slate-300"
              />
            </div>
          )}
        </div>

        {/* Q4: Viewer action */}
        <div className="space-y-3">
          <Label htmlFor="q4" className="text-slate-800 font-semibold">
            Q4. After watching this video, what action do you want viewers to take?
          </Label>
          <textarea
            id="q4"
            placeholder="Your answer"
            className="w-full min-h-[100px] px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 resize-y"
            value={formData.q4_viewer_action}
            onChange={(e) => handleInputChange("q4_viewer_action", e.target.value)}
          />
        </div>

        {/* Q5: Target audience age */}
        <div className="space-y-3">
          <Label className="text-slate-800 font-semibold">Q5. Who is your primary target audience?</Label>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
            {["Under 18", "18–24", "25–34", "35–44", "45+"].map((age) => (
              <div key={age} className="flex items-center space-x-2">
                <Checkbox
                  id={`q5-${age}`}
                  checked={formData.q5_target_audience.includes(age)}
                  onCheckedChange={(checked) => handleCheckboxChange("q5_target_audience", age, checked as boolean)}
                />
                <Label htmlFor={`q5-${age}`} className="font-normal text-sm text-slate-600">
                  {age}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Q6: What matters most */}
        <div className="space-y-3">
          <Label className="text-slate-800 font-semibold">Q6. What matters most to your audience?</Label>
          <div className="grid gap-3 grid-cols-2">
            {["Price", "Quality", "Professionalism", "Innovation", "Efficiency", "Customer service"].map((item) => (
              <div key={item} className="flex items-center space-x-2">
                <Checkbox
                  id={`q6-${item}`}
                  checked={formData.q6_matters_most.includes(item)}
                  onCheckedChange={(checked) => handleCheckboxChange("q6_matters_most", item, checked as boolean)}
                />
                <Label htmlFor={`q6-${item}`} className="font-normal text-sm text-slate-600">
                  {item}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Q7: Style preference */}
        <div className="space-y-3">
          <Label className="text-slate-800 font-semibold">Q7. What overall style do you prefer?</Label>
          <div className="grid gap-3 grid-cols-2">
            {[
              "Premium / Luxury",
              "Futuristic / Tech",
              "Young / Energetic",
              "Warm / Emotional",
              "Professional / Corporate",
              "Minimalist",
              "Epic / Cinematic",
              "Other",
            ].map((style) => (
              <div key={style} className="flex items-center space-x-2">
                <Checkbox
                  id={`q7-${style}`}
                  checked={
                    style === "Other"
                      ? otherSelections.stylePreference
                      : formData.q7_style_preference.includes(style)
                  }
                  onCheckedChange={(checked) => {
                    if (style === "Other") {
                      handleOtherToggle("stylePreference", checked as boolean)
                    } else {
                      handleCheckboxChange("q7_style_preference", style, checked as boolean)
                    }
                  }}
                />
                <Label htmlFor={`q7-${style}`} className="font-normal text-sm text-slate-600">
                  {style}
                </Label>
              </div>
            ))}
          </div>
          {otherSelections.stylePreference && (
            <div className="mt-2 ml-6">
              <Input
                placeholder="Please specify"
                value={formData.q7_other}
                onChange={(e) => handleInputChange("q7_other", e.target.value)}
                className="border-slate-300"
              />
            </div>
          )}
        </div>

        {/* Q8: Preferred format */}
        <div className="space-y-3">
          <Label className="text-slate-800 font-semibold">Q8. Preferred format?</Label>
          <div className="grid gap-3 grid-cols-2">
            {["Live-action", "Animation", "Motion graphics", "Mixed"].map((format) => (
              <div key={format} className="flex items-center space-x-2">
                <Checkbox
                  id={`q8-${format}`}
                  checked={formData.q8_format.includes(format)}
                  onCheckedChange={(checked) => handleCheckboxChange("q8_format", format, checked as boolean)}
                />
                <Label htmlFor={`q8-${format}`} className="font-normal text-sm text-slate-600">
                  {format}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Q9: Content to include */}
        <div className="space-y-3">
          <Label className="text-slate-800 font-semibold">Q9. What must be included in the video?</Label>
          <div className="grid gap-3 grid-cols-2">
            {[
              "Company introduction",
              "Product showcase",
              "Use cases / scenarios",
              "Team introduction",
              "Customer testimonials",
              "Data / achievements",
              "Brand story",
              "Other",
            ].map((content) => (
              <div key={content} className="flex items-center space-x-2">
                <Checkbox
                  id={`q9-${content}`}
                  checked={
                    content === "Other"
                      ? otherSelections.contentIncluded
                      : formData.q9_content_included.includes(content)
                  }
                  onCheckedChange={(checked) => {
                    if (content === "Other") {
                      handleOtherToggle("contentIncluded", checked as boolean)
                    } else {
                      handleCheckboxChange("q9_content_included", content, checked as boolean)
                    }
                  }}
                />
                <Label htmlFor={`q9-${content}`} className="font-normal text-sm text-slate-600">
                  {content}
                </Label>
              </div>
            ))}
          </div>
          {otherSelections.contentIncluded && (
            <div className="mt-2 ml-6">
              <Input
                placeholder="Please specify"
                value={formData.q9_other}
                onChange={(e) => handleInputChange("q9_other", e.target.value)}
                className="border-slate-300"
              />
            </div>
          )}
        </div>

        {/* Q10: Preferred video length */}
        <div className="space-y-3">
          <Label className="text-slate-800 font-semibold">Q10. Preferred video length:</Label>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
            {["15 seconds", "30 seconds", "60 seconds", "1–2 minutes", "Other"].map((length) => (
              <div key={length} className="flex items-center space-x-2">
                <Checkbox
                  id={`q10-${length}`}
                  checked={
                    length === "Other" ? otherSelections.videoLength : formData.q10_video_length.includes(length)
                  }
                  onCheckedChange={(checked) => {
                    if (length === "Other") {
                      handleOtherToggle("videoLength", checked as boolean)
                    } else {
                      handleCheckboxChange("q10_video_length", length, checked as boolean)
                    }
                  }}
                />
                <Label htmlFor={`q10-${length}`} className="font-normal text-sm text-slate-600">
                  {length}
                </Label>
              </div>
            ))}
          </div>
          {otherSelections.videoLength && (
            <div className="mt-2 ml-6">
              <Input
                placeholder="Please specify"
                value={formData.q10_other}
                onChange={(e) => handleInputChange("q10_other", e.target.value)}
                className="border-slate-300"
              />
            </div>
          )}
        </div>

        {/* Q11: Where will this video be used */}
        <div className="space-y-3">
          <Label className="text-slate-800 font-semibold">Q11. Where will this video be used?</Label>
          <div className="grid gap-3 grid-cols-2">
            {[
              "Website",
              "FB & Instagram",
              "TikTok",
              "YouTube",
              "LinkedIn",
              "Trade shows / Events",
              "Internal use",
            ].map((place) => (
              <div key={place} className="flex items-center space-x-2">
                <Checkbox
                  id={`q11-${place}`}
                  checked={formData.q11_video_usage.includes(place)}
                  onCheckedChange={(checked) => handleCheckboxChange("q11_video_usage", place, checked as boolean)}
                />
                <Label htmlFor={`q11-${place}`} className="font-normal text-sm text-slate-600">
                  {place}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Q12: Subtitles needed */}
        <div className="space-y-3">
          <Label className="text-slate-800 font-semibold">Q12. Subtitles needed?</Label>
          <div className="grid gap-3 grid-cols-2">
            {["English", "Chinese", "Bilingual", "Not needed"].map((subtitle) => (
              <div key={subtitle} className="flex items-center space-x-2">
                <Checkbox
                  id={`q12-${subtitle}`}
                  checked={formData.q12_subtitles.includes(subtitle)}
                  onCheckedChange={(checked) => handleCheckboxChange("q12_subtitles", subtitle, checked as boolean)}
                />
                <Label htmlFor={`q12-${subtitle}`} className="font-normal text-sm text-slate-600">
                  {subtitle}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Video className="w-4 h-4 mr-2" />
                Submit Video Survey
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
