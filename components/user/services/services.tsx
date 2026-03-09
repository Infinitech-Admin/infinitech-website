"use client"
import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import VideoSurveyForm from "@/components/video-survey-form"

const services = [
  {
    title: "WEBSITE DEVELOPMENT",
    subtitle: "Crafting Custom Websites Tailored to Your Needs",
    description: `We create visually stunning and highly functional websites that capture attention, convey your brand's message, and give you a competitive edge. Share your vision with us, and we'll take care of the rest.`,
    image: "web-dev.svg",
    categories: [
      { id: 1, name: "Hotel Management", description: "Websites designed for hotels, resorts, and hospitality businesses with booking and management features." },
      { id: 2, name: "Corporate Website", description: "Professional websites for companies to showcase services, portfolios, and corporate identity." },
      { id: 3, name: "Manpower Platform", description: "Platforms for recruitment, staffing, and workforce management with user-friendly interfaces." },
      { id: 4, name: "Real Estate", description: "Property listing and management websites tailored for real estate agencies and brokers." },
      { id: 5, name: "E-Commerce", description: "Online stores with secure payment gateways, product catalogs, and shopping cart functionality." },
      { id: 6, name: "Booking System", description: "Websites with integrated booking and scheduling systems for services and events." },
    ],
  },
  {
    title: "SEARCH ENGINE OPTIMIZATION",
    subtitle: "Boost Your Online Visibility with SEO",
    description: `Our SEO strategies help improve your website's search engine rankings, driving more organic traffic and increasing your online presence. Let us optimize your site and ensure it reaches the right audience.`,
    image: "seo.svg",
    hasSEOForm: true,
    categories: [
      { id: 1, name: "On-Page SEO", description: "Optimizing content, meta tags, and site structure for better rankings." },
      { id: 2, name: "Off-Page SEO", description: "Building backlinks and authority through external strategies." },
      { id: 3, name: "Local SEO", description: "Improving visibility for businesses in local search results." },
    ],
  },
  {
    title: "GRAPHIC DESIGN",
    subtitle: "Bringing Your Brand to Life with Stunning Designs",
    description: `Our creative team designs visually appealing graphics that reflect your brand identity, making a lasting impression on your audience. From logos to promotional materials, we've got you covered.`,
    image: "design.svg",
    categories: [
      { id: 1, name: "Logo Design", description: "Unique logos that capture your brand identity." },
      { id: 2, name: "Marketing Collateral", description: "Brochures, flyers, and promotional materials." },
      { id: 3, name: "Digital Assets", description: "Social media graphics, banners, and ads." },
    ],
  },
  {
    title: "SOCIAL MEDIA MARKETING",
    subtitle: "Maximize Engagement Through Social Media",
    description: `We develop and manage engaging social media campaigns that build brand awareness, increase customer engagement, and drive business growth. Let us help you connect with your audience effectively.`,
    image: "marketing.svg",
    categories: [
      { id: 1, name: "Campaign Strategy", description: "Tailored strategies to maximize reach and engagement." },
      { id: 2, name: "Content Creation", description: "Engaging posts, videos, and graphics for social platforms." },
      { id: 3, name: "Analytics & Reporting", description: "Tracking performance and optimizing campaigns." },
    ],
  },
  {
    title: "PHOTOGRAPHY & VIDEOGRAPHY",
    subtitle: "Capturing Moments That Tell Your Story",
    description: `Our professional photography and videography services bring your brand to life through compelling visual content. From product shoots to promotional videos, we create stunning media that resonates with your audience and elevates your brand presence.`,
    image: "photo_video.png",
    categories: [
      { id: 1, name: "Wedding", description: "Capturing the beauty and emotions of weddings with timeless, cinematic imagery." },
      { id: 2, name: "Portrait", description: "Professional portraits that highlight personality, style, and character." },
      { id: 3, name: "Event", description: "Coverage of corporate, social, and private events with storytelling visuals." },
      { id: 4, name: "Product", description: "High-quality product photography for e-commerce, catalogs, and marketing campaigns." },
      { id: 5, name: "Commercial & Branding", description: "Visuals that strengthen brand identity and support marketing strategies." },
      { id: 6, name: "Headshots", description: "Clean, professional headshots for business, LinkedIn, and personal branding." },
    ],
  },
  {
    title: "JUANTAP DIGITAL BUSINESS CARD",
    subtitle: "Modern Networking Made Simple",
    description: `Transform the way you network with JuanTap, our innovative digital business card solution. Share your contact information instantly with a single tap, making connections effortless and eco-friendly. Stand out in the digital age while keeping all your professional details accessible anytime, anywhere.`,
    image: "juantap.png",
    categories: [
      { id: 1, name: "Personal Profiles", description: "Digital cards for individuals to share contact info instantly." },
      { id: 2, name: "Corporate Teams", description: "Centralized business card solutions for organizations." },
      { id: 3, name: "Custom Branding", description: "Tailored designs to match your brand identity." },
    ],
  },
]

// ─── Inline SEO Audit Banner ───────────────────────────────────────────────
function SEOAuditBanner() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ full_name: "", email: "", mobile: "", website_url: "" })
  const [errors, setErrors] = useState({ email: "", mobile: "", website_url: "" })

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  const validateUrl = (v: string) => {
    try { new URL(v.startsWith("http") ? v : `https://${v}`); return true } catch { return false }
  }

  const handleSubmit = async () => {
    const newErrors = { email: "", mobile: "", website_url: "" }
    let hasErr = false
    if (!form.full_name.trim()) {
      toast({ title: "Full name is required", variant: "destructive" })
      return
    }
    if (!form.email || !validateEmail(form.email)) { newErrors.email = "Valid email required"; hasErr = true }
    if (!form.mobile.trim()) { newErrors.mobile = "Mobile required"; hasErr = true }
    if (!form.website_url.trim() || !validateUrl(form.website_url)) { newErrors.website_url = "Valid URL required"; hasErr = true }
    setErrors(newErrors)
    if (hasErr) return

    setIsSubmitting(true)
    try {
      const payload = {
        ...form,
        website_url: form.website_url.startsWith("http") ? form.website_url : `https://${form.website_url}`,
      }
      const res = await fetch("/api/seo-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
      } else {
        toast({ title: "Error", description: data.message || "Submission failed.", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="w-full rounded-2xl overflow-hidden my-8"
      style={{
        background: "linear-gradient(135deg, #0d1b3e 0%, #1a306e 50%, #0d1b3e 100%)",
        boxShadow: "0 8px 40px rgba(13,27,62,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {/* Top orange accent bar */}
      <div
        className="h-1 w-full"
        style={{ background: "linear-gradient(90deg, transparent 0%, #f5a623 30%, #f5a623 70%, transparent 100%)" }}
      />

      {/* Heading */}
      <div className="px-6 pt-5 pb-3 text-center">
        <p className="text-xs font-extrabold tracking-[0.3em] uppercase mb-1" style={{ color: "#f5a623" }}>
          ✦ Free Service ✦
        </p>
        <h2 className="text-white font-bold text-lg md:text-xl leading-snug">
          Get your Free SEO Audit from us.{" "}
          <span style={{ color: "#f5a623" }}>Fill up the form below.</span>
        </h2>
      </div>

      {submitted ? (
        <div className="px-6 py-8 text-center">
          <div className="text-5xl mb-3">🎉</div>
          <p className="text-white font-bold text-lg">Request Received!</p>
          <p className="text-slate-300 text-sm mt-2">
            Our SEO specialists will analyze your site and reach out within 24–48 business hours.
          </p>
        </div>
      ) : (
        <div className="px-4 md:px-8 pb-5">
          {/* Horizontal form */}
          <div className="flex flex-col md:flex-row gap-3 items-start">
            {/* Full Name */}
            <div className="flex-1 min-w-0">
              <input
                type="text"
                placeholder="Full Name"
                value={form.full_name}
                onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                className="w-full bg-white/5 border border-white/20 rounded-full px-5 py-[11px] text-white text-sm placeholder:text-slate-400 outline-none focus:border-yellow-400 focus:bg-white/10 transition-all"
              />
            </div>

            {/* Email */}
            <div className="flex-1 min-w-0">
              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => { setForm((p) => ({ ...p, email: e.target.value })); setErrors((p) => ({ ...p, email: "" })) }}
                className={`w-full bg-white/5 border rounded-full px-5 py-[11px] text-white text-sm placeholder:text-slate-400 outline-none transition-all focus:bg-white/10 ${errors.email ? "border-red-400" : "border-white/20 focus:border-yellow-400"}`}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1 pl-4">{errors.email}</p>}
            </div>

            {/* Mobile */}
            <div className="flex-1 min-w-0">
              <input
                type="tel"
                placeholder="Mobile Number"
                value={form.mobile}
                onChange={(e) => { setForm((p) => ({ ...p, mobile: e.target.value.replace(/[a-zA-Z]/g, "") })); setErrors((p) => ({ ...p, mobile: "" })) }}
                className={`w-full bg-white/5 border rounded-full px-5 py-[11px] text-white text-sm placeholder:text-slate-400 outline-none transition-all focus:bg-white/10 ${errors.mobile ? "border-red-400" : "border-white/20 focus:border-yellow-400"}`}
              />
              {errors.mobile && <p className="text-red-400 text-xs mt-1 pl-4">{errors.mobile}</p>}
            </div>

            {/* Website URL */}
            <div className="flex-1 min-w-0">
              <input
                type="url"
                placeholder="Website URL"
                value={form.website_url}
                onChange={(e) => { setForm((p) => ({ ...p, website_url: e.target.value })); setErrors((p) => ({ ...p, website_url: "" })) }}
                className={`w-full bg-white/5 border rounded-full px-5 py-[11px] text-white text-sm placeholder:text-slate-400 outline-none transition-all focus:bg-white/10 ${errors.website_url ? "border-red-400" : "border-white/20 focus:border-yellow-400"}`}
              />
              {errors.website_url && <p className="text-red-400 text-xs mt-1 pl-4">{errors.website_url}</p>}
            </div>

            {/* Submit Button */}
            <div className="w-full md:w-auto flex-shrink-0 md:self-start">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full md:w-auto whitespace-nowrap flex items-center justify-center gap-2 font-bold text-sm text-white rounded-full px-6 py-[11px] transition-all duration-200 active:scale-95 disabled:opacity-70"
                style={{
                  background: "linear-gradient(135deg, #e8220a 0%, #b91c0c 100%)",
                  boxShadow: "0 4px 20px rgba(232,34,10,0.5)",
                }}
                onMouseEnter={(e) => { if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 28px rgba(232,34,10,0.7)" }}
                onMouseLeave={(e) => { if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(232,34,10,0.5)" }}
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                ) : (
                  <><Search className="w-4 h-4" /> Get My Free Quote Now!</>
                )}
              </button>
            </div>
          </div>

          <p className="text-center text-slate-500 text-xs mt-4">
            🔒 Your information is secure and will never be shared.
          </p>
        </div>
      )}

      {/* Bottom fade line */}
      <div
        className="h-px w-full opacity-30"
        style={{ background: "linear-gradient(90deg, transparent, #f5a623, transparent)" }}
      />
    </div>
  )
}

// ─── Main Services Page ────────────────────────────────────────────────────
export default function Services() {
  const [openSurveyModal, setOpenSurveyModal] = useState(false)

  return (
    <div className="mx-4 flex flex-col justify-center items-center">
      <section className="container mx-auto px-4 lg:px-8 mb-12 bg-white">
        <div className="flex flex-col justify-center items-center">
          <div className="xl:py-8">
            <div className="flex flex-col justify-center items-center">
              {services.map((service, serviceIndex) => (
                <div key={`${service.title}-${serviceIndex}`} className="w-full">
                  {/* Image + Text row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 mb-8">
                    <div className={serviceIndex % 2 === 0 ? "md:order-2" : "md:order-1"}>
                      <img
                        className="w-full h-[28rem] object-contain"
                        alt={service.title}
                        src={`/images/services/${service.image}`}
                      />
                    </div>

                    <div className={serviceIndex % 2 === 0 ? "md:order-1" : "md:order-2"}>
                      <div className="max-w-lg">
                        <span className="text-xl text-accent font-bold">{service.title}</span>
                        <h1 className="text-3xl text-primary font-bold mt-2 font-['Poetsen_One']">
                          {service.subtitle}
                        </h1>
                        <p className="text-lg text-gray-600 mt-4">{service.description}</p>

                        {serviceIndex === 0 && (
                          <div className="mt-6">
                            <Button
                              onClick={() => setOpenSurveyModal(true)}
                              className="bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                              Take Video Survey
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SEO Audit Banner — only for SEO service */}
                  {"hasSEOForm" in service && service.hasSEOForm && <SEOAuditBanner />}

                  {/* Category cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                    {service.categories.map((category, catIndex) => (
                      <div
                        key={`service-${serviceIndex}-category-${category.id ?? catIndex}`}
                        className={`rounded-lg p-4 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-blue-400/50
                          ${catIndex % 2 === 0
                            ? "bg-gradient-to-r from-slate-50 via-primary/20 to-accent/10 hover:to-primary/50"
                            : "bg-gradient-to-r from-accent/10 via-accent/30 to-primary/10 hover:to-primary/50"
                          }`}
                      >
                        <h3 className="text-primary font-bold text-lg">{category.name}</h3>
                        <p className="text-gray-600 text-base mt-2">{category.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Video Survey Modal */}
      <Dialog open={openSurveyModal} onOpenChange={setOpenSurveyModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 [&>button]:hidden">
          <VideoSurveyForm
            onClose={() => setOpenSurveyModal(false)}
            onSubmitSuccess={() => setOpenSurveyModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
