"use client";
import { useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button, useDisclosure } from "@heroui/react";
import { MdOutlineSpeed } from "react-icons/md";
import { FaMobileAlt } from "react-icons/fa";
import { Button as ShadButton } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import VideoSurveyForm from "@/components/video-survey-form";
import RequestReportModal from "@/components/RequestReportModal";
import RequestWebsiteAuditModal from "@/components/RequestWebsiteAuditModal";
import RequestSocialMediaModal from "@/components/Requestsocialmediamodal ";
import RequestTikTokShopModal from "@/components/Requesttiktokshopmodal";
import RequestJuanTapModal from "@/components/RequestJuanTapModal";
import RequestGraphicDesignModal from "@/components/Requestgraphicdesignmodal";
import RequestPaidAdsModal from "@/components/RequestPaidAdsModal";
import {
  LuArrowRight,
  LuChevronLeft,
  LuChevronRight,
  LuX,
} from "react-icons/lu";
import {
  FaShieldAlt,
  FaBullseye,
  FaChartLine,
  FaLightbulb,
  FaMoneyBillWave,
  FaClock,
  FaHashtag,
  FaCalendarAlt,
  FaChartBar,
  FaBullhorn,
  FaStore,
  FaBoxOpen,
  FaVideo,
  FaEye,
  FaCrosshairs,
  FaSlidersH,
  FaSearchDollar,
  FaAddressCard,
  FaUsers,
  FaPalette,
  FaBolt,
} from "react-icons/fa";

/* ============================================================================
 * TYPES
 * ========================================================================== */
interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}
interface ProblemItem {
  icon: React.ComponentType<IconProps>;
  label: string;
}
interface BenefitItem {
  icon: React.ComponentType<IconProps>;
  title: string;
  description: string;
}
interface ServiceCategory {
  id: number;
  name: string;
  description: string;
}
interface ProcessStep {
  icon: React.ComponentType<IconProps>;
  title: string;
  color: string;
  description: string;
}

interface BenefitsService {
  name: string;
  type: "benefits";
  icon: React.ComponentType<IconProps>;
  color: string;
  tagline: string;
  benefits: BenefitItem[];
  // Optional: use a real photo/graphic as the carousel thumbnail AND as
  // the large image shown when the card expands (mirrors how "detail"
  // cards use `image`).
  thumbnailImage?: string;
  // Optional: show the Free SEO Audit lead-gen form when this card expands.
  showSEOAuditForm?: boolean;
  // Optional: show a lead-gen "Request ..." CTA button when this card
  // expands. Key selects which modal/label to use (see
  // benefitsRequestButtonConfig below).
  requestButtonKey?: BenefitsRequestButtonKey;
  processSteps?: ProcessStep[];
}
interface DetailService {
  name: string;
  type: "detail";
  // Filename under /images/services/, used both as thumbnail and as the
  // large image shown when the card expands.
  image: string;
  subtitle: string;
  description: string;
  categories: ServiceCategory[];
  // Optional CTA button(s) shown under the description when expanded.
  ctas?: readonly ServiceCtaKey[];
  // Optional: show the Free SEO Audit lead-gen form when this card expands.
  showSEOAuditForm?: boolean;
  // Optional: show a lead-gen "Request ..." CTA button when this card
  // expands. Key selects which modal/label to use (see
  // benefitsRequestButtonConfig below).
  requestButtonKey?: BenefitsRequestButtonKey;
}
type BrandingService = BenefitsService | DetailService;

/* ============================================================================
 * DATA — main service blocks (Website Dev / Design / Social Media)
 * NOTE: SEO, Photography & Videography, and JuanTap live only in the
 * Branding & Marketing carousel below — they don't get their own full
 * block here, to avoid duplicates.
 * ========================================================================== */

const services = [
  {
    title: "WEBSITE DEVELOPMENT",
    subtitle: "Why Is Your Website Costing You Sales?",
    description: `Most lost sales don't happen because people don't want your product — they happen because your website loses them first. We fix the issues that quietly drive visitors away, and build fast, mobile-ready websites that turn traffic into paying customers.`,
    image: "web-dev.svg",
    ctas: ["websiteAudit"] as const,
    problems: [
      { icon: MdOutlineSpeed, label: "Slow Loading Speed" },
      { icon: FaMobileAlt, label: "Poor Mobile Responsiveness" },
      { icon: FaEye, label: "Low Search Visibility" },
      { icon: FaSlidersH, label: "Outdated, Confusing Design" },
    ] as ProblemItem[],
  },
];

/* ============================================================================
 * CONFIG — CTA buttons referenced by services[].ctas above.
 * Add a new service here + reference its key in a service's `ctas` array
 * to attach a button to that section — no more guessing by index.
 * ========================================================================== */

type ServiceCtaKey = "websiteAudit" | "videoSurvey";

interface ServiceCtaConfigEntry {
  label: string;
  kind: "primary" | "secondary";
}

const serviceCtaConfig: Record<ServiceCtaKey, ServiceCtaConfigEntry> = {
  videoSurvey: { label: "Take Video Survey", kind: "primary" },
  websiteAudit: {
    label: "Get a Free Website Audit",
    kind: "secondary",
  },
};

// Keys for the lead-gen "Request ..." buttons shown on benefits-type and
// detail-type branding cards (Social Media Management, TikTok Shop
// Opening, JuanTap, Graphic Design, Paid Ads, etc). Add a new key here +
// reference it in a card's `requestButtonKey` to attach a button — the
// actual click handler is passed in from the page.
type BenefitsRequestButtonKey =
  | "socialMedia"
  | "tiktokShop"
  | "juantap"
  | "graphicDesign"
  | "paidAds";

const benefitsRequestButtonConfig: Record<
  BenefitsRequestButtonKey,
  { label: string; className: string }
> = {
  socialMedia: {
    label: "Request Social Media Management",
    className:
      "bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg w-fit",
  },
  tiktokShop: {
    label: "Request TikTok Shop Opening",
    className:
      "bg-[#f5a623] hover:bg-[#e0951a] text-white px-6 py-3 rounded-full font-bold transition-all duration-300 shadow-md hover:shadow-lg w-fit",
  },
  juantap: {
    label: "Apply for JuanTap",
    className:
      "bg-[#f5a623] hover:bg-[#e0951a] text-white px-6 py-3 rounded-full font-bold transition-all duration-300 shadow-md hover:shadow-lg w-fit",
  },
  graphicDesign: {
    label: "Request Graphic Design",
    className:
      "bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg w-fit",
  },
  paidAds: {
    label: "Request Paid Ads",
    className:
      "bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg w-fit",
  },
};

// Renders a service's CTA buttons (if it has any). Shared by the main
// services loop and the Branding & Marketing detail panel so both stay
// visually consistent and there's only one place to update the styling.
function ServiceCtaButtons({
  ctas,
  onVideoSurvey,
  onWebsiteAudit,
  className = "mt-6 flex flex-wrap gap-3",
}: {
  ctas: readonly ServiceCtaKey[] | undefined;
  onVideoSurvey: () => void;
  onWebsiteAudit: () => void;
  className?: string;
}) {
  if (!ctas || ctas.length === 0) return null;

  return (
    <div className={className}>
      {ctas.map((ctaKey) => {
        const cta = serviceCtaConfig[ctaKey];
        if (ctaKey === "videoSurvey") {
          return (
            <ShadButton
              key={ctaKey}
              onClick={onVideoSurvey}
              className="bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
            >
              {cta.label}
            </ShadButton>
          );
        }
        if (ctaKey === "websiteAudit") {
          return (
            <button
              key={ctaKey}
              onClick={onWebsiteAudit}
              className="flex items-center gap-2 rounded-full bg-[#0d1b3e] border-2 border-[#f5a623] px-5 py-2.5 text-sm font-bold text-[#f5a623] transition-all duration-300 hover:bg-[#f5a623] hover:text-[#0d1b3e] hover:shadow-lg"
            >
              {cta.label}
            </button>
          );
        }
        return null;
      })}
    </div>
  );
}

/* ============================================================================
 * COMPONENT — Problem list (used on Website Development block)
 * ========================================================================== */

function ServiceProblemList({ problems }: { problems?: ProblemItem[] }) {
  if (!problems || problems.length === 0) return null;

  return (
    <div className="mt-5">
      <p className="text-xs font-extrabold tracking-widest uppercase text-red-500 mb-2">
        Common Reasons Sales Are Slipping Away
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
        {problems.map((problem) => (
          <div
            key={problem.label}
            className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-gray-700 ring-1 ring-red-100"
          >
            <problem.icon className="h-4 w-4 text-red-500 shrink-0" />
            <span>{problem.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CircularProcessDiagram({ steps }: { steps: ProcessStep[] }) {
  const total = steps.length;
  const size = 440;
  const radius = 36;
  const gapDeg = 8;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  return (
    <div
      className="relative mx-auto"
      style={{ width: size, height: size, maxWidth: "100%" }}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <defs>
          <marker
            id="processArrow"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8" />
          </marker>
        </defs>

        {steps.map((_, i) => {
          const angleStart = -90 + (i * 360) / total + gapDeg;
          const angleEnd = -90 + ((i + 1) * 360) / total - gapDeg;
          const x1 = 50 + radius * Math.cos(toRad(angleStart));
          const y1 = 50 + radius * Math.sin(toRad(angleStart));
          const x2 = 50 + radius * Math.cos(toRad(angleEnd));
          const y2 = 50 + radius * Math.sin(toRad(angleEnd));
          return (
            <path
              key={`arc-${i}`}
              d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="1.2"
              markerEnd="url(#processArrow)"
            />
          );
        })}
      </svg>

      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center"
        style={{ padding: "0 60px" }}
      >
        <span className="text-[9px] font-extrabold tracking-widest uppercase text-slate-400">
          Continuous Cycle
        </span>
        <span className="text-primary font-bold text-sm mt-1 leading-tight">
          Strategy to Growth
        </span>
      </div>

      {steps.map((step, i) => {
        const angle = -90 + (i * 360) / total;
        const left = 50 + radius * Math.cos(toRad(angle));
        const top = 50 + radius * Math.sin(toRad(angle));
        return (
          <div
            key={step.title}
            className="absolute flex flex-col items-center text-center"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              transform: "translate(-50%, -50%)",
              width: "84px",
            }}
          >
            <div
              className="relative flex items-center justify-center rounded-full text-white shadow-md ring-2 ring-white"
              style={{ backgroundColor: step.color, width: 36, height: 36 }}
            >
              <step.icon style={{ width: 15, height: 15 }} />
              <span
                className="absolute flex items-center justify-center rounded-full bg-white font-bold ring-1 ring-gray-200"
                style={{
                  top: -5,
                  right: -5,
                  width: 16,
                  height: 16,
                  fontSize: "9px",
                  color: step.color,
                }}
              >
                {i + 1}
              </span>
            </div>
            <span
              className="mt-1.5 font-semibold text-primary leading-tight"
              style={{ fontSize: "11px" }}
            >
              {step.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}
/* ============================================================================
 * DATA — Market research benefits
 * ========================================================================== */

const researchBenefits = [
  {
    title: "Avoid Costly Mistakes",
    description: "Know your market before you spend on it.",
    icon: FaShieldAlt,
    color: "#ef4444",
  },
  {
    title: "Know Your Audience",
    description: "Understand who's buying and why.",
    icon: FaBullseye,
    color: "#0ea5e9",
  },
  {
    title: "Outsmart Competitors",
    description: "See what's working for others in your space.",
    icon: FaChartLine,
    color: "#f59e0b",
  },
  {
    title: "Make Confident Decisions",
    description: "Back your next move with real data.",
    icon: FaLightbulb,
    color: "#8b5cf6",
  },
  {
    title: "Save Money Long-Term",
    description: "Invest only where the data says it pays off.",
    icon: FaMoneyBillWave,
    color: "#10b981",
  },
  {
    title: "Move Faster",
    description: "Skip guesswork and launch with clarity.",
    icon: FaClock,
    color: "#f43f5e",
  },
];

/* ============================================================================
 * DATA — Branding & marketing carousel
 * ========================================================================== */
const socialMediaProcessSteps: ProcessStep[] = [
  {
    icon: FaUsers,
    title: "Initial Consultation",
    color: "#0ea5e9",
    description: "We learn your brand, goals, and target audience.",
  },
  {
    icon: FaChartLine,
    title: "Research & Planning",
    color: "#6366f1",
    description: "We map out content pillars and a posting strategy.",
  },
  {
    icon: FaPalette,
    title: "Content Creation",
    color: "#8b5cf6",
    description: "We design graphics, captions, and creative assets.",
  },
  {
    icon: FaVideo,
    title: "Production",
    color: "#f59e0b",
    description: "We shoot and edit photos and videos for your pages.",
  },
  {
    icon: FaBullhorn,
    title: "Publishing",
    color: "#ef4444",
    description: "We schedule and post content at optimal times.",
  },
  {
    icon: FaChartBar,
    title: "Analysis",
    color: "#14b8a6",
    description: "We track performance and audience engagement.",
  },
  {
    icon: FaSlidersH,
    title: "Optimization",
    color: "#22c55e",
    description: "We refine strategy based on what the data shows.",
  },
  {
    icon: FaBolt,
    title: "Continuous Growth",
    color: "#ec4899",
    description: "We repeat the cycle to keep growing your brand.",
  },
];
const brandingServices: BrandingService[] = [
  {
    name: "Social Media Management",
    type: "benefits",
    icon: FaHashtag,
    color: "#0ea5e9",
    tagline: "Consistent content, real engagement.",
    thumbnailImage: "/images/services/marketing.svg",
    requestButtonKey: "socialMedia",
    processSteps: socialMediaProcessSteps,
    benefits: [
      {
        icon: FaCalendarAlt,
        title: "Content Calendar",
        description: "Planned posts so your pages never go quiet.",
      },
      {
        icon: FaChartBar,
        title: "Analytics & Reporting",
        description: "See what's working with monthly performance reports.",
      },
      {
        icon: FaBullseye,
        title: "Better Engagement",
        description: "Content built to get likes, shares, and comments.",
      },
      {
        icon: FaClock,
        title: "Save Your Time",
        description: "We handle posting so you can focus on the business.",
      },
    ],
  },
  {
    name: "TikTok Shop Opening",
    type: "benefits",
    icon: FaStore,
    color: "#f43f5e",
    tagline: "Get your shop live and selling fast.",
    thumbnailImage: "/tiktokshop.png",
    requestButtonKey: "tiktokShop",
    benefits: [
      {
        icon: FaStore,
        title: "Fast Store Setup",
        description: "We register and configure your shop end-to-end.",
      },
      {
        icon: FaBoxOpen,
        title: "Product Listing Optimization",
        description: "Titles, photos, and pricing built to convert.",
      },
      {
        icon: FaVideo,
        title: "Live Selling Guidance",
        description: "Learn how to run live selling sessions that sell.",
      },
      {
        icon: FaChartBar,
        title: "Sales Tracking",
        description: "Monitor orders and performance from day one.",
      },
    ],
  },
  {
    name: "Photography & Videography",
    type: "detail",
    image: "photo_video.png",
    subtitle: "Capturing Moments That Tell Your Story",
    description: `Our professional photography and videography services bring your brand to life through compelling visual content. From product shoots to promotional videos, we create stunning media that resonates with your audience and elevates your brand presence.`,
    ctas: ["videoSurvey"] as const,
    categories: [
      {
        id: 1,
        name: "Wedding",
        description:
          "Capturing the beauty and emotions of weddings with timeless, cinematic imagery.",
      },
      {
        id: 2,
        name: "Portrait",
        description:
          "Professional portraits that highlight personality, style, and character.",
      },
      {
        id: 3,
        name: "Event",
        description:
          "Coverage of corporate, social, and private events with storytelling visuals.",
      },
      {
        id: 4,
        name: "Product",
        description:
          "High-quality product photography for e-commerce, catalogs, and marketing campaigns.",
      },
      {
        id: 5,
        name: "Commercial & Branding",
        description:
          "Visuals that strengthen brand identity and support marketing strategies.",
      },
      {
        id: 6,
        name: "Headshots",
        description:
          "Clean, professional headshots for business, LinkedIn, and personal branding.",
      },
    ],
  },
  {
    name: "SEO",
    type: "detail",
    image: "seo.svg",
    subtitle: "Boost Your Online Visibility with SEO",
    description: `Our SEO strategies help improve your website's search engine rankings, driving more organic traffic and increasing your online presence. Let us optimize your site and ensure it reaches the right audience.`,
    showSEOAuditForm: true,
    categories: [
      {
        id: 1,
        name: "On-Page SEO",
        description:
          "Optimizing content, meta tags, and site structure for better rankings.",
      },
      {
        id: 2,
        name: "Off-Page SEO",
        description:
          "Building backlinks and authority through external strategies.",
      },
      {
        id: 3,
        name: "Local SEO",
        description:
          "Improving visibility for businesses in local search results.",
      },
    ],
  },
  {
    name: "JuanTap",
    type: "benefits",
    icon: FaAddressCard,
    color: "#6366f1",
    tagline: "Share your info with a single tap.",
    thumbnailImage: "/images/services/juantap.png",
    requestButtonKey: "juantap",
    benefits: [
      {
        icon: FaAddressCard,
        title: "Personal Profiles",
        description:
          "Digital cards for individuals to share contact info instantly.",
      },
      {
        icon: FaUsers,
        title: "Corporate Teams",
        description: "Centralized business card solutions for organizations.",
      },
      {
        icon: FaPalette,
        title: "Custom Branding",
        description: "Tailored designs to match your brand identity.",
      },
      {
        icon: FaBolt,
        title: "Instant Tap Sharing",
        description: "Share your details in a single tap — no app required.",
      },
    ],
  },
  {
    name: "Paid Ads",
    type: "benefits",
    icon: FaBullhorn,
    color: "#f59e0b",
    tagline: "Put your brand in front of the right people, fast.",
    thumbnailImage: "/paidads.png",
    requestButtonKey: "paidAds",
    benefits: [
      {
        icon: FaEye,
        title: "Immediate Visibility",
        description: "Get seen the moment your campaign goes live.",
      },
      {
        icon: FaCrosshairs,
        title: "Targeted Reach",
        description: "Ads shown to the audience most likely to buy.",
      },
      {
        icon: FaChartBar,
        title: "Measurable ROI",
        description: "Track every peso spent against real results.",
      },
      {
        icon: FaSlidersH,
        title: "Scalable Budget Control",
        description: "Start small and scale up what performs.",
      },
    ],
  },
  {
    name: "Graphic Design",
    type: "detail",
    image: "design.svg",
    subtitle: "Bringing Your Brand to Life with Stunning Designs",
    description: `Our creative team designs visually appealing graphics that reflect your brand identity, making a lasting impression on your audience. From logos to promotional materials, we've got you covered.`,
    requestButtonKey: "graphicDesign",
    categories: [
      {
        id: 1,
        name: "Logo Design",
        description: "Unique logos that capture your brand identity.",
      },
      {
        id: 2,
        name: "Marketing Collateral",
        description: "Brochures, flyers, and promotional materials.",
      },
      {
        id: 3,
        name: "Digital Assets",
        description: "Social media graphics, banners, and ads.",
      },
    ],
  },
];

/* ============================================================================
 * SECTION: SEO Audit Banner (inline lead-gen form, only shown under SEO service)
 * ========================================================================== */

function SEOAuditBanner() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    website_url: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    mobile: "",
    website_url: "",
  });

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const validateUrl = (v: string) => {
    try {
      new URL(v.startsWith("http") ? v : `https://${v}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    const newErrors = { email: "", mobile: "", website_url: "" };
    let hasErr = false;
    if (!form.full_name.trim()) {
      toast({ title: "Full name is required", variant: "destructive" });
      return;
    }
    if (!form.email || !validateEmail(form.email)) {
      newErrors.email = "Valid email required";
      hasErr = true;
    }
    if (!form.mobile.trim()) {
      newErrors.mobile = "Mobile required";
      hasErr = true;
    }
    if (!form.website_url.trim() || !validateUrl(form.website_url)) {
      newErrors.website_url = "Valid URL required";
      hasErr = true;
    }
    setErrors(newErrors);
    if (hasErr) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        website_url: form.website_url.startsWith("http")
          ? form.website_url
          : `https://${form.website_url}`,
      };
      const res = await fetch("/api/seo-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        toast({
          title: "Error",
          description: data.message || "Submission failed.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="w-full rounded-2xl overflow-hidden my-8"
      style={{
        background:
          "linear-gradient(135deg, #0d1b3e 0%, #1a306e 50%, #0d1b3e 100%)",
        boxShadow:
          "0 8px 40px rgba(13,27,62,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <div
        className="h-1 w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #f5a623 30%, #f5a623 70%, transparent 100%)",
        }}
      />

      <div className="px-6 pt-5 pb-3 text-center">
        <p
          className="text-xs font-extrabold tracking-[0.3em] uppercase mb-1"
          style={{ color: "#f5a623" }}
        >
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
            Our SEO specialists will analyze your site and reach out within
            24–48 business hours.
          </p>
        </div>
      ) : (
        <div className="px-4 md:px-8 pb-5">
          <div className="flex flex-col md:flex-row gap-3 items-start">
            <div className="flex-1 min-w-0">
              <input
                type="text"
                placeholder="Full Name"
                value={form.full_name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, full_name: e.target.value }))
                }
                className="w-full bg-white/5 border border-white/20 rounded-full px-5 py-[11px] text-white text-sm placeholder:text-slate-400 outline-none focus:border-yellow-400 focus:bg-white/10 transition-all"
              />
            </div>

            <div className="flex-1 min-w-0">
              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => {
                  setForm((p) => ({ ...p, email: e.target.value }));
                  setErrors((p) => ({ ...p, email: "" }));
                }}
                className={`w-full bg-white/5 border rounded-full px-5 py-[11px] text-white text-sm placeholder:text-slate-400 outline-none transition-all focus:bg-white/10 ${errors.email ? "border-red-400" : "border-white/20 focus:border-yellow-400"}`}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1 pl-4">{errors.email}</p>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <input
                type="tel"
                placeholder="Mobile Number"
                value={form.mobile}
                onChange={(e) => {
                  setForm((p) => ({
                    ...p,
                    mobile: e.target.value.replace(/[a-zA-Z]/g, ""),
                  }));
                  setErrors((p) => ({ ...p, mobile: "" }));
                }}
                className={`w-full bg-white/5 border rounded-full px-5 py-[11px] text-white text-sm placeholder:text-slate-400 outline-none transition-all focus:bg-white/10 ${errors.mobile ? "border-red-400" : "border-white/20 focus:border-yellow-400"}`}
              />
              {errors.mobile && (
                <p className="text-red-400 text-xs mt-1 pl-4">
                  {errors.mobile}
                </p>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <input
                type="url"
                placeholder="Website URL"
                value={form.website_url}
                onChange={(e) => {
                  setForm((p) => ({ ...p, website_url: e.target.value }));
                  setErrors((p) => ({ ...p, website_url: "" }));
                }}
                className={`w-full bg-white/5 border rounded-full px-5 py-[11px] text-white text-sm placeholder:text-slate-400 outline-none transition-all focus:bg-white/10 ${errors.website_url ? "border-red-400" : "border-white/20 focus:border-yellow-400"}`}
              />
              {errors.website_url && (
                <p className="text-red-400 text-xs mt-1 pl-4">
                  {errors.website_url}
                </p>
              )}
            </div>

            <div className="w-full md:w-auto flex-shrink-0 md:self-start">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full md:w-auto whitespace-nowrap flex items-center justify-center gap-2 font-bold text-sm text-white rounded-full px-6 py-[11px] transition-all duration-200 active:scale-95 disabled:opacity-70"
                style={{
                  background:
                    "linear-gradient(135deg, #e8220a 0%, #b91c0c 100%)",
                  boxShadow: "0 4px 20px rgba(232,34,10,0.5)",
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting)
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 6px 28px rgba(232,34,10,0.7)";
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting)
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 4px 20px rgba(232,34,10,0.5)";
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" /> Get My Free Quote Now!
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-center text-slate-500 text-xs mt-4">
            🔒 Your information is secure and will never be shared.
          </p>
        </div>
      )}

      <div
        className="h-px w-full opacity-30"
        style={{
          background:
            "linear-gradient(90deg, transparent, #f5a623, transparent)",
        }}
      />
    </div>
  );
}

/* ============================================================================
 * SECTION: Market Research
 * ========================================================================== */
const MarketResearchIllustration = () => (
  <div className="w-full aspect-video rounded-xl overflow-hidden">
    <svg viewBox="0 0 640 360" className="w-full h-full block">
      <rect width="640" height="360" fill="#0d1b3e" />

      <rect
        x="40"
        y="45"
        width="370"
        height="270"
        rx="14"
        fill="#ffffff"
        opacity="0.06"
      />
      <rect
        x="40"
        y="45"
        width="370"
        height="270"
        rx="14"
        fill="none"
        stroke="#f5a623"
        strokeWidth="1.5"
        opacity="0.4"
      />

      <rect x="70" y="195" width="30" height="95" rx="5" fill="#38bdf8" />
      <rect
        x="115"
        y="165"
        width="30"
        height="125"
        rx="5"
        fill="#38bdf8"
        opacity="0.8"
      />
      <rect x="160" y="120" width="30" height="170" rx="5" fill="#f5a623" />
      <rect
        x="205"
        y="150"
        width="30"
        height="140"
        rx="5"
        fill="#38bdf8"
        opacity="0.8"
      />
      <rect x="250" y="95" width="30" height="195" rx="5" fill="#f5a623" />
      <rect
        x="295"
        y="115"
        width="30"
        height="175"
        rx="5"
        fill="#38bdf8"
        opacity="0.8"
      />

      <polyline
        points="85,185 130,155 175,110 220,135 265,85 310,100"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
      <circle cx="310" cy="100" r="5" fill="#ffffff" />

      <circle
        cx="345"
        cy="240"
        r="38"
        fill="#0d1b3e"
        stroke="#f5a623"
        strokeWidth="6"
      />
      <circle
        cx="345"
        cy="240"
        r="27"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        opacity="0.5"
      />
      <line
        x1="371"
        y1="266"
        x2="400"
        y2="295"
        stroke="#f5a623"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <text x="333" y="247" fontSize="22" fill="#ffffff" fontWeight="bold">
        $
      </text>

      <rect
        x="430"
        y="45"
        width="170"
        height="110"
        rx="12"
        fill="#ffffff"
        opacity="0.06"
      />
      <text x="452" y="95" fontSize="30" fontWeight="bold" fill="#f5a623">
        +142%
      </text>
      <text x="452" y="120" fontSize="14" fill="#ffffff" opacity="0.7">
        Market Growth
      </text>

      <rect
        x="430"
        y="170"
        width="170"
        height="110"
        rx="12"
        fill="#ffffff"
        opacity="0.06"
      />
      <text x="452" y="220" fontSize="30" fontWeight="bold" fill="#38bdf8">
        3.2x
      </text>
      <text x="452" y="245" fontSize="14" fill="#ffffff" opacity="0.7">
        Audience Insight
      </text>
    </svg>
  </div>
);
function MarketResearchSection({
  onRequestReport,
}: {
  onRequestReport: () => void;
}) {
  return (
    <div className="w-full mb-16">
      <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-100 mb-10">
        <div className="h-1.5 w-full bg-accent" />
        <div className="p-5 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <MarketResearchIllustration />
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-extrabold tracking-widest uppercase text-accent mb-2">
                <FaSearchDollar className="h-4 w-4" />
                Market Research
              </span>
              <h3 className="text-primary font-bold text-2xl mb-3">
                Market Research Report
              </h3>
              <p className="text-gray-500 text-sm">
                Data-backed insights on your market, competitors, and audience —
                so every decision you make is backed by real numbers, not
                guesswork.
              </p>
              <div className="mt-6">
                <Button
                  className="bg-accent text-white font-medium"
                  endContent={<LuArrowRight size={18} />}
                  onPress={onRequestReport}
                >
                  Request a Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mb-6">
        <h4 className="text-primary font-bold text-lg">
          As Our Client, Here's What You Gain
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 rounded-2xl bg-slate-50 p-4 sm:p-6">
        {researchBenefits.map((benefit) => (
          <div
            key={benefit.title}
            className="rounded-xl bg-white p-5 text-center shadow-sm ring-1 ring-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all"
          >
            <div
              className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: `${benefit.color}1a` }}
            >
              <benefit.icon
                className="h-6 w-6"
                style={{ color: benefit.color }}
              />
            </div>
            <h3 className="text-primary font-semibold text-sm mb-1">
              {benefit.title}
            </h3>
            <p className="text-gray-500 text-xs">{benefit.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
 * SECTION: Branding & Marketing carousel
 * ========================================================================== */

function BrandingSection({
  onVideoSurvey,
  onWebsiteAudit,
  onRequestButtonClick,
}: {
  onVideoSurvey: () => void;
  onWebsiteAudit: () => void;
  onRequestButtonClick: (key: BenefitsRequestButtonKey) => void;
}) {
  const [selectedService, setSelectedService] = useState<string | null>(
    brandingServices[0]?.name ?? null,
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -280 : 280,
      behavior: "smooth",
    });
  };

  const activeService = brandingServices.find(
    (s) => s.name === selectedService,
  );

  return (
    <div className="w-full mb-16">
      <div className="max-w-xl mx-auto text-center mb-8">
        <span className="text-xl text-accent font-bold">
          BRANDING & MARKETING
        </span>
        <h1 className="text-3xl text-primary font-bold mt-2 font-['Poetsen_One']">
          Grow Your Brand Across Every Channel
        </h1>
        <p className="text-lg text-gray-600 mt-4">
          From social media to paid ads, we build the presence that gets you
          noticed.
        </p>
      </div>

      <div className="relative overflow-hidden">
        <button
          onClick={() => scroll("left")}
          className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200 shadow-md hover:bg-gray-50"
          aria-label="Scroll left"
        >
          <LuChevronLeft className="text-primary" size={20} />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 px-2 sm:px-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {brandingServices.map((service) => {
            const isSelected = selectedService === service.name;
            return (
              <div
                key={service.name}
                className={`group relative shrink-0 w-[220px] h-32 snap-start overflow-hidden rounded-xl cursor-pointer shadow-md transition-all
                  ${isSelected ? "ring-2 ring-accent ring-offset-2" : "ring-1 ring-gray-200 hover:shadow-lg"}`}
                onClick={() =>
                  setSelectedService(isSelected ? null : service.name)
                }
              >
                {service.type === "benefits" && service.thumbnailImage ? (
                  <img
                    src={service.thumbnailImage}
                    alt={service.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : service.type === "benefits" ? (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${service.color}, ${service.color}cc)`,
                    }}
                  >
                    <service.icon className="h-10 w-10 text-white/90" />
                  </div>
                ) : (
                  <img
                    src={`/images/services/${service.image}`}
                    alt={service.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
                <span className="absolute bottom-3 left-3 text-white font-semibold text-sm drop-shadow">
                  {service.name}
                </span>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => scroll("right")}
          className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200 shadow-md hover:bg-gray-50"
          aria-label="Scroll right"
        >
          <LuChevronRight className="text-primary" size={20} />
        </button>
      </div>

      {activeService && (
        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
          <div
            className="h-1.5 w-full"
            style={{
              background:
                activeService.type === "benefits"
                  ? activeService.color
                  : "#f59e0b",
            }}
          />
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {activeService.type === "benefits" && (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full shrink-0"
                    style={{ backgroundColor: `${activeService.color}1a` }}
                  >
                    <activeService.icon
                      className="h-5 w-5"
                      style={{ color: activeService.color }}
                    />
                  </div>
                )}
                <h3 className="text-primary font-bold text-lg">
                  {activeService.type === "benefits"
                    ? `${activeService.name} — What You Get`
                    : activeService.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="text-gray-400 hover:text-gray-600 shrink-0"
                aria-label="Close"
              >
                <LuX size={20} />
              </button>
            </div>

            {activeService.type === "benefits" ? (
              <div>
                {activeService.tagline && (
                  <p className="text-gray-500 text-sm mb-4">
                    {activeService.tagline}
                  </p>
                )}

                {activeService.processSteps ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                    <div className="hidden lg:flex flex-col gap-3">
                      <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-gray-100">
                        <p className="text-primary font-bold text-2xl">
                          8-Step
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          Proven, repeatable process from strategy to growth.
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-gray-100">
                        <p className="text-primary font-bold text-2xl">
                          Monthly
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          Performance reports so you always know what's working.
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-center lg:col-span-1">
                      <CircularProcessDiagram
                        steps={activeService.processSteps}
                      />
                    </div>

                    <div className="hidden lg:flex flex-col gap-3">
                      <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-gray-100">
                        <p className="text-primary font-bold text-2xl">
                          Data-Backed
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          Every step is optimized using real engagement data.
                        </p>
                      </div>
                      {activeService.requestButtonKey && (
                        <ShadButton
                          onClick={() =>
                            onRequestButtonClick(
                              activeService.requestButtonKey!,
                            )
                          }
                          className={
                            benefitsRequestButtonConfig[
                              activeService.requestButtonKey
                            ].className + " w-full"
                          }
                        >
                          {
                            benefitsRequestButtonConfig[
                              activeService.requestButtonKey
                            ].label
                          }
                        </ShadButton>
                      )}
                    </div>
                  </div>
                ) : activeService.thumbnailImage ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-2">
                    <img
                      src={activeService.thumbnailImage}
                      alt={activeService.name}
                      className="w-full h-56 object-contain"
                    />
                    <div className="grid grid-cols-1 gap-4">
                      {activeService.benefits.map((benefit) => (
                        <div
                          key={benefit.title}
                          className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 ring-1 ring-gray-100 hover:ring-gray-200 transition-all"
                        >
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-full shrink-0"
                            style={{
                              backgroundColor: `${activeService.color}1a`,
                            }}
                          >
                            <benefit.icon
                              className="h-4.5 w-4.5"
                              style={{ color: activeService.color }}
                            />
                          </div>
                          <div>
                            <h4 className="text-primary font-semibold text-sm">
                              {benefit.title}
                            </h4>
                            <p className="text-gray-500 text-xs mt-0.5">
                              {benefit.description}
                            </p>
                          </div>
                        </div>
                      ))}

                      {activeService.requestButtonKey && (
                        <ShadButton
                          onClick={() =>
                            onRequestButtonClick(
                              activeService.requestButtonKey!,
                            )
                          }
                          className={
                            benefitsRequestButtonConfig[
                              activeService.requestButtonKey
                            ].className
                          }
                        >
                          {
                            benefitsRequestButtonConfig[
                              activeService.requestButtonKey
                            ].label
                          }
                        </ShadButton>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeService.benefits.map((benefit) => (
                      <div
                        key={benefit.title}
                        className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 ring-1 ring-gray-100 hover:ring-gray-200 transition-all"
                      >
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-full shrink-0"
                          style={{
                            backgroundColor: `${activeService.color}1a`,
                          }}
                        >
                          <benefit.icon
                            className="h-4.5 w-4.5"
                            style={{ color: activeService.color }}
                          />
                        </div>
                        <div>
                          <h4 className="text-primary font-semibold text-sm">
                            {benefit.title}
                          </h4>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    ))}

                    {activeService.requestButtonKey && (
                      <div className="sm:col-span-2">
                        <ShadButton
                          onClick={() =>
                            onRequestButtonClick(
                              activeService.requestButtonKey!,
                            )
                          }
                          className={
                            benefitsRequestButtonConfig[
                              activeService.requestButtonKey
                            ].className
                          }
                        >
                          {
                            benefitsRequestButtonConfig[
                              activeService.requestButtonKey
                            ].label
                          }
                        </ShadButton>
                      </div>
                    )}
                  </div>
                )}

                {activeService.showSEOAuditForm && <SEOAuditBanner />}
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-6">
                  <img
                    src={`/images/services/${activeService.image}`}
                    alt={activeService.name}
                    className="w-full h-56 object-contain"
                  />
                  <div>
                    <h4 className="text-primary font-bold text-base mb-2">
                      {activeService.subtitle}
                    </h4>
                    <p className="text-gray-500 text-sm">
                      {activeService.description}
                    </p>
                    <ServiceCtaButtons
                      ctas={activeService.ctas}
                      onVideoSurvey={onVideoSurvey}
                      onWebsiteAudit={onWebsiteAudit}
                      className="mt-4 flex flex-wrap gap-3"
                    />
                    {activeService.requestButtonKey && (
                      <div className="mt-4">
                        <ShadButton
                          onClick={() =>
                            onRequestButtonClick(
                              activeService.requestButtonKey!,
                            )
                          }
                          className={
                            benefitsRequestButtonConfig[
                              activeService.requestButtonKey
                            ].className
                          }
                        >
                          {
                            benefitsRequestButtonConfig[
                              activeService.requestButtonKey
                            ].label
                          }
                        </ShadButton>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeService.categories.map((category) => (
                    <div
                      key={category.id}
                      className="rounded-xl bg-slate-50 p-4 ring-1 ring-gray-100 hover:ring-gray-200 transition-all"
                    >
                      <h4 className="text-primary font-semibold text-sm">
                        {category.name}
                      </h4>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {category.description}
                      </p>
                    </div>
                  ))}
                </div>
                {activeService.showSEOAuditForm && <SEOAuditBanner />}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 * SECTION: All page modals, in one place
 * ========================================================================== */

interface ServiceModalsProps {
  videoSurveyOpen: boolean;
  onVideoSurveyOpenChange: (open: boolean) => void;
  reportOpen: boolean;
  onReportOpenChange: (open: boolean) => void;
  auditOpen: boolean;
  onAuditOpenChange: (open: boolean) => void;
  socialMediaOpen: boolean;
  onSocialMediaOpenChange: (open: boolean) => void;
  tiktokShopOpen: boolean;
  onTiktokShopOpenChange: (open: boolean) => void;
  juantapOpen: boolean;
  onJuantapOpenChange: (open: boolean) => void;
  graphicDesignOpen: boolean;
  onGraphicDesignOpenChange: (open: boolean) => void;
  paidAdsOpen: boolean;
  onPaidAdsOpenChange: (open: boolean) => void;
}

function ServiceModals({
  videoSurveyOpen,
  onVideoSurveyOpenChange,
  reportOpen,
  onReportOpenChange,
  auditOpen,
  onAuditOpenChange,
  socialMediaOpen,
  onSocialMediaOpenChange,
  tiktokShopOpen,
  onTiktokShopOpenChange,
  juantapOpen,
  onJuantapOpenChange,
  graphicDesignOpen,
  onGraphicDesignOpenChange,
  paidAdsOpen,
  onPaidAdsOpenChange,
}: ServiceModalsProps) {
  return (
    <>
      <Dialog open={videoSurveyOpen} onOpenChange={onVideoSurveyOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 [&>button]:hidden">
          <VideoSurveyForm
            onClose={() => onVideoSurveyOpenChange(false)}
            onSubmitSuccess={() => onVideoSurveyOpenChange(false)}
          />
        </DialogContent>
      </Dialog>

      <RequestReportModal
        isOpen={reportOpen}
        onOpenChange={onReportOpenChange}
      />

      <RequestWebsiteAuditModal
        isOpen={auditOpen}
        onOpenChange={onAuditOpenChange}
      />

      <RequestSocialMediaModal
        isOpen={socialMediaOpen}
        onOpenChange={onSocialMediaOpenChange}
      />

      <RequestTikTokShopModal
        isOpen={tiktokShopOpen}
        onOpenChange={onTiktokShopOpenChange}
      />

      <RequestJuanTapModal
        isOpen={juantapOpen}
        onOpenChange={onJuantapOpenChange}
      />

      <RequestGraphicDesignModal
        isOpen={graphicDesignOpen}
        onOpenChange={onGraphicDesignOpenChange}
      />

      <RequestPaidAdsModal
        isOpen={paidAdsOpen}
        onOpenChange={onPaidAdsOpenChange}
      />
    </>
  );
}

/* ============================================================================
 * MAIN PAGE
 * ========================================================================== */

export default function Services() {
  const [videoSurveyOpen, setVideoSurveyOpen] = useState(false);
  const {
    isOpen: reportOpen,
    onOpen: openReport,
    onOpenChange: onReportOpenChange,
  } = useDisclosure();
  const {
    isOpen: auditOpen,
    onOpen: openAudit,
    onOpenChange: onAuditOpenChange,
  } = useDisclosure();
  const {
    isOpen: socialMediaOpen,
    onOpen: openSocialMedia,
    onOpenChange: onSocialMediaOpenChange,
  } = useDisclosure();
  const {
    isOpen: tiktokShopOpen,
    onOpen: openTiktokShop,
    onOpenChange: onTiktokShopOpenChange,
  } = useDisclosure();
  const {
    isOpen: juantapOpen,
    onOpen: openJuantap,
    onOpenChange: onJuantapOpenChange,
  } = useDisclosure();
  const {
    isOpen: graphicDesignOpen,
    onOpen: openGraphicDesign,
    onOpenChange: onGraphicDesignOpenChange,
  } = useDisclosure();
  const {
    isOpen: paidAdsOpen,
    onOpen: openPaidAds,
    onOpenChange: onPaidAdsOpenChange,
  } = useDisclosure();

  const handleRequestButtonClick = (key: BenefitsRequestButtonKey) => {
    if (key === "socialMedia") openSocialMedia();
    if (key === "tiktokShop") openTiktokShop();
    if (key === "juantap") openJuantap();
    if (key === "graphicDesign") openGraphicDesign();
    if (key === "paidAds") openPaidAds();
  };

  return (
    <div className="w-full bg-white flex flex-col justify-center items-center">
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 bg-white">
        <div className="flex flex-col justify-center items-center">
          <div className="w-full xl:py-8">
            <div className="flex flex-col justify-center items-center">
              {services.map((service, serviceIndex) => (
                <div
                  key={`${service.title}-${serviceIndex}`}
                  className="w-full"
                >
                  {/* Image + Text row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 mb-8">
                    <div
                      className={
                        serviceIndex % 2 === 0 ? "md:order-2" : "md:order-1"
                      }
                    >
                      <img
                        className="w-full h-[28rem] object-contain"
                        alt={service.title}
                        src={`/images/services/${service.image}`}
                      />
                    </div>

                    <div
                      className={
                        serviceIndex % 2 === 0 ? "md:order-1" : "md:order-2"
                      }
                    >
                      <div className="max-w-lg">
                        <span className="text-xl text-accent font-bold">
                          {service.title}
                        </span>
                        <h1 className="text-3xl text-primary font-bold mt-2 font-['Poetsen_One']">
                          {service.subtitle}
                        </h1>
                        <p className="text-lg text-gray-600 mt-4">
                          {service.description}
                        </p>

                        <ServiceProblemList problems={service.problems} />

                        <ServiceCtaButtons
                          ctas={service.ctas}
                          onVideoSurvey={() => setVideoSurveyOpen(true)}
                          onWebsiteAudit={openAudit}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <MarketResearchSection onRequestReport={openReport} />
              <BrandingSection
                onVideoSurvey={() => setVideoSurveyOpen(true)}
                onWebsiteAudit={openAudit}
                onRequestButtonClick={handleRequestButtonClick}
              />
            </div>
          </div>
        </div>
      </section>

      <ServiceModals
        videoSurveyOpen={videoSurveyOpen}
        onVideoSurveyOpenChange={setVideoSurveyOpen}
        reportOpen={reportOpen}
        onReportOpenChange={onReportOpenChange}
        auditOpen={auditOpen}
        onAuditOpenChange={onAuditOpenChange}
        socialMediaOpen={socialMediaOpen}
        onSocialMediaOpenChange={onSocialMediaOpenChange}
        tiktokShopOpen={tiktokShopOpen}
        onTiktokShopOpenChange={onTiktokShopOpenChange}
        juantapOpen={juantapOpen}
        onJuantapOpenChange={onJuantapOpenChange}
        graphicDesignOpen={graphicDesignOpen}
        onGraphicDesignOpenChange={onGraphicDesignOpenChange}
        paidAdsOpen={paidAdsOpen}
        onPaidAdsOpenChange={onPaidAdsOpenChange}
      />
    </div>
  );
}
