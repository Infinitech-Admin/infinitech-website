"use client"

import { useState } from "react"
import PricingCard from "@/components/pricingCard"
import ContactModal from "@/components/contact-modal"

const PricingPage = () => {
  const [activeService, setActiveService] = useState("website")
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("")

  const services = {
    website: {
      title: "Website / Web App With Mobile App",
      description: "Professional website solutions with mobile app and advanced features",
      plans: [
        {
          name: "Standard",
          monthlyPrice: 5999,
          yearlyPrice: 265980,
          features: [
            "Up to 5 pages",
            "Social Media Links integration",
            "Simple Contact Form",
            "Email Alerts for Form Inquiries",
            "Basic Mobile App (iOS/Android)",
            "Downloadable APK",
            "App Appears on Google Play",
            "1-Year Domain and Hosting",
          ],
          popular: false,
          cta: "Get Started",
        },
        {
          name: "Premium",
          monthlyPrice: 9999,
          yearlyPrice: 319988,
          features: [
            "Everything in Standard, plus:",
            "Up to 10 Website Pages",
            "Dashboard Login for Clients",
            "Traffic Insights & Analytics",
            "Enhanced Site Customization",
            "Smart Chat System",
            "Design Upgrade",
          ],
          popular: true,
          cta: "Choose Plan",
        },
        {
          name: "Business",
          monthlyPrice: 14999,
          yearlyPrice: 379988,
          features: [
            "Google Play Store Mobile App",
            "SEO Pro Setup +",
            "Dashboard Reports",
            "eCommerce - Ready Products Catalog",
            "Admin Staff & Client Management",
            "Upgraded Motion & Animation Website",
            "Lead Form With Dashboard Tracking",
            "Video Testimonials Section",
          ],
          popular: false,
          cta: "Contact Sales",
        },
        {
          name: "Commerce",
          monthlyPrice: 21999,
          yearlyPrice: 463988,
          features: [
            "Google Play + Apple App Release",
            "Advanced Conversion Tracking",
            "Full eCommerce System",
            "Booking Calendar & Tools",
            "Real-Time Notifications System",
            "VIP Priority Support (Phone, Chat, Email)",
            "Dashboard for Clients",
          ],
          popular: false,
          cta: "Contact Sales",
        },
      ],
    },
    juantap: {
      title: "JuanTap - Modern NFC Card",
      description: "Digital business cards with NFC technology",
      plans: [
        {
          name: "Standard",
          monthlyPrice: 588,
          yearlyPrice: 1588,
          features: [
            "Editable and customizable design",
            "QR Code for non-NFC phones",
            "Simple card design (logo and name in background)",
            "Name on front, Logo or QR on back",
            "Click-to-call, click-to-email",
            "Lifetime reusable",
          ],
          popular: false,
          cta: "Get Started",
          badge: "BEST FOR Freelancers, individuals, basic use",
        },
        {
          name: "Premium",
          monthlyPrice: 888,
          yearlyPrice: 1888,
          features: [
            "Full-Color Premium Design",
            "Choose your style (Silver, Laser, Leather)",
            "Personal info (Name, Title, Company, Contact)",
            "QR Code for non-NFC phones",
            "Business location Maps + Save Contact Button",
            "Social media & website links",
            "Online dashboard (edit anytime)",
            "File upload (PDF / Portfolio)",
            "Lifetime reusable",
          ],
          popular: true,
          cta: "Choose Plan",
          badge: "BEST FOR Small business owners, entrepreneurs",
        },
        {
          name: "Elite",
          monthlyPrice: 1288,
          yearlyPrice: 2288,
          features: [
            "Premium card design (laser printed logo and name)",
            "Premium metal finish",
            "Personal info (Name, Title, Company, Contact)",
            "Business location Maps + Save Contact Button",
            "Analytics (taps/views counts)",
            "Multiple profile support (Business & Personal)",
            "Full-color creative design",
            "File upload (PDF / Portfolio)",
            "QR Code for non-NFC phones",
            "Editable and customizable design",
          ],
          popular: false,
          cta: "Contact Sales",
          badge: "BEST FOR VIP clients, brokers, executives",
        },
      ],
    },
    socialmedia: {
      title: "Social Media Management",
      description: "Complete social media management and content creation services",
      plans: [
        {
          name: "Standard",
          monthlyPrice: 11993,
          yearlyPrice: 74979,
          features: [
            "Account Setup (FB+IG+TikTok)",
            "Branding (Profile & Cover)",
            "8 Posts / Month",
            "2 Reels / Month",
            "Monthly Insights Report",
          ],
          popular: false,
          cta: "Get Started",
        },
        {
          name: "Growth",
          monthlyPrice: 18973,
          yearlyPrice: 98919,
          features: [
            "Everything in Standard, plus:",
            "Account Setup (FB+IG+TikTok)",
            "Branding (Profile & Cover)",
            "12-15 Posts / Month",
            "4 Reels / Month",
            "Content Calendar",
            "Monthly Insights Report",
          ],
          popular: true,
          cta: "Choose Plan",
        },
        {
          name: "Premium",
          monthlyPrice: 32947,
          yearlyPrice: 143841,
          features: [
            "Account Setup (FB+IG+TikTok)",
            "Branding (Profile & Cover)",
            "20-25 Posts / Month",
            "2 Reels / Month",
            "Captions & Hashtags",
            "Monthly Insights Report",
          ],
          popular: false,
          cta: "Contact Sales",
        },
        {
          name: "Corporate",
          monthlyPrice: 47973,
          yearlyPrice: 179919,
          features: [
            "Account Setup (FB+IG+TikTok)",
            "Branding (Profile & Cover)",
            "8 Posts / Month",
            "2 Reels / Month",
            "Captions & Hashtags",
            "Monthly Insights Report",
            "30+ Posts / Month",
          ],
          popular: false,
          cta: "Contact Sales",
        },
      ],
    },
    multimedia: {
      title: "Multimedia Advertising",
      description: "Professional multimedia content creation and advertising packages",
      plans: [
        {
          name: "Standard",
          monthlyPrice: 4950,
          yearlyPrice: 14950,
          features: [
            "Product or Corporate Photo Shoot (up to 10 items or 5 pax)",
            "1 Short Promo Video (30–60s)",
            "Basic Editing (Photo + Video)",
            "Background Music",
            "20 Edited Photos",
            "1 Export Format (Web-optimized)",
          ],
          popular: false,
          cta: "Get Started",
        },
        {
          name: "Business Growth",
          monthlyPrice: 14750,
          yearlyPrice: 24750,
          features: [
            "Product + Lifestyle + Corporate Photography (up to 30 items / 8 pax)",
            "1 Full Promo Video (1–3 mins) + 3 Social Media Shorts",
            "Event Coverage (up to 4 hrs)",
            "Scriptwriting & Concept",
            "50 Edited Photos",
            "Subtitles & Captions",
            "Optimized for TikTok, IG, FB & Website",
          ],
          popular: true,
          cta: "Choose Plan",
        },
        {
          name: "Business",
          monthlyPrice: 29500,
          yearlyPrice: 39500,
          features: [
            "Full Product + Corporate + Lifestyle Coverage (unlimited products/team)",
            "Full Event Coverage (up to 8 hrs)",
            "On-site Interviews + Voice-over",
            "Scriptwriting & Storyboarding",
            "1 Main Video (3–5 mins) + 5 Social Media Shorts",
            "Full Color Grading + Advanced Retouching + Creative Branding Overlays",
            "1 Export Format (Web-optimized)",
          ],
          popular: false,
          cta: "Contact Sales",
        },
      ],
    },
  }

  const currentService = services[activeService as keyof typeof services]
  const getPrice = (plan: any) => (billingPeriod === "yearly" ? plan.yearlyPrice : plan.monthlyPrice)

  const handleChoosePlan = (planName: string) => {
    setSelectedPlan(planName)
    setIsModalOpen(true)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 lg:py-20">
      {/* Header Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16 lg:mb-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Our Pricing Plans
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 mb-8 leading-relaxed">
            Choose the perfect plan for your business. All plans include support and updates.
          </p>

          {/* Service Selector */}
          <div className="flex justify-center gap-2 mb-8 overflow-x-auto pb-2">
            {Object.entries(services).map(([key, service]) => (
              <button
                key={key}
                onClick={() => setActiveService(key)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
                  activeService === key
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {key === "website" && "Website"}
                {key === "juantap" && "JuanTap"}
                {key === "socialmedia" && "Social Media"}
                {key === "multimedia" && "Multimedia"}
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-2 mb-8">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                billingPeriod === "monthly"
                  ? "bg-cyan-500 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                billingPeriod === "yearly" ? "bg-cyan-500 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              Yearly
            </button>
          </div>

          <p className="text-slate-400 text-sm">{currentService.description}</p>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {currentService.plans.map((plan, index) => (
            <PricingCard
              key={index}
              plan={plan}
              billingPeriod={billingPeriod}
              price={getPrice(plan)}
              currency="₱"
              onCtaClick={() => handleChoosePlan(plan.name)}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 border-t border-slate-700">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12 text-center">What's Included</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              "Free consultation before project start",
              "Simple admin panel - easy to update without coding",
              "Training after launch (optional)",
              "Support through chat, phone, or Zoom",
              "Option to upgrade anytime",
              "Post-launch support",
              "Backup & Security Setup",
              "Separate hosting for API and frontend",
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <span className="text-yellow-400 text-xl mt-0.5">◆</span>
                <span className="text-slate-200">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-slate-300 mb-6">Ready to get started? Contact us today for a free consultation.</p>
        <button className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:shadow-lg transition-shadow">
          Schedule Consultation
        </button>
      </section>

      {/* Contact Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planName={selectedPlan}
        service={activeService}
      />
    </main>
  )
}

export default PricingPage
