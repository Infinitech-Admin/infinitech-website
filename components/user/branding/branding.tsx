"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useDisclosure } from "@heroui/react";
import { Button as ShadButton } from "@/components/ui/button";
import { Loader2, Search, ZoomIn, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import VideoSurveyForm from "@/components/video-survey-form";
import RequestSocialMediaModal from "@/components/Requestsocialmediamodal ";
import RequestTikTokShopModal from "@/components/Requesttiktokshopmodal";
import RequestJuanTapModal from "@/components/RequestJuanTapModal";
import RequestGraphicDesignModal from "@/components/Requestgraphicdesignmodal";
import RequestPaidAdsModal from "@/components/RequestPaidAdsModal";
import { LuChevronLeft, LuChevronRight, LuX } from "react-icons/lu";
import {
  FaHashtag,
  FaCalendarAlt,
  FaChartBar,
  FaBullseye,
  FaClock,
  FaStore,
  FaBoxOpen,
  FaVideo,
  FaChartLine,
  FaAddressCard,
  FaUsers,
  FaPalette,
  FaBolt,
  FaBullhorn,
  FaEye,
  FaCrosshairs,
  FaSlidersH,
  FaSearchMinus,
  FaMapMarkerAlt,
  FaLink,
  FaGlobe,
} from "react-icons/fa";

/* ============================================================================
 * TYPES
 * ========================================================================== */
interface IconProps {
  className?: string;
  style?: React.CSSProperties;
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

// CTA keys used by detail-type branding cards (currently only Photography &
// Videography's "Take Video Survey" button).
type ServiceCtaKey = "videoSurvey";

interface ServiceCtaConfigEntry {
  label: string;
  kind: "primary" | "secondary";
}

const serviceCtaConfig: Record<ServiceCtaKey, ServiceCtaConfigEntry> = {
  videoSurvey: { label: "Take Video Survey", kind: "primary" },
};

interface BenefitsService {
  name: string;
  type: "benefits";
  icon: React.ComponentType<IconProps>;
  color: string;
  tagline: string;
  benefits: BenefitItem[];
  thumbnailImage?: string; // image OR video (.mp4/.webm/.mov) src
  showSEOAuditForm?: boolean;
  requestButtonKey?: BenefitsRequestButtonKey;
  processSteps?: ProcessStep[];
  // Optional supporting photo shown under the circular process diagram
  // (currently used by Social Media Management's "Behind the Scenes" shot).
  behindTheScenesImage?: string;
}
// A single item in a detail-service's extra media gallery. `src` can be an
// image or a video (.mp4/.webm/.mov) — detected automatically via
// isVideoFile, same convention as thumbnailImage.
interface GalleryItem {
  src: string;
  alt: string;
}

interface DetailService {
  name: string;
  type: "detail";
  image: string;
  subtitle: string;
  description: string;
  categories: ServiceCategory[];
  ctas?: readonly ServiceCtaKey[];
  showSEOAuditForm?: boolean;
  requestButtonKey?: BenefitsRequestButtonKey;
  // Optional "why this matters" pain-point callouts (currently used by SEO).
  painPointsHeading?: string;
  painPoints?: BenefitItem[];
  // Optional guarantee/results banner (currently used by SEO).
  guaranteeHeading?: string;
  guaranteeText?: string;
  // Optional extra photo/video gallery shown as a thumbnail grid, each item
  // opens full-size in the shared MediaLightbox.
  gallery?: GalleryItem[];
}
type BrandingService = BenefitsService | DetailService;

// Detail-service `image` values are either a root-relative path (starts with
// "/", e.g. "/product-shoot.jpg" living directly in /public) or a bare
// filename that lives in /public/images/services/ (e.g. "seo.svg"). This
// resolves either form to the correct final src, avoiding double-slash /
// wrong-folder bugs.
function resolveDetailImage(image: string): string {
  return image.startsWith("/") ? image : `/images/services/${image}`;
}

// Detects whether a thumbnail src is a video file so it renders with <video>
// instead of <img>.
function isVideoFile(src: string): boolean {
  return /\.(mp4|webm|mov)$/i.test(src);
}

type BenefitsRequestButtonKey =
  | "socialMedia"
  | "tiktokShop"
  | "juantap"
  | "graphicDesign"
  | "paidAds";

const benefitsRequestButtonConfig: Record<
  BenefitsRequestButtonKey,
  {
    label: string;
    className: string;
  }
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

// Renders a detail-card's CTA button(s) — currently just the video survey CTA.
function ServiceCtaButtons({
  ctas,
  onVideoSurvey,
  className = "mt-6 flex flex-wrap gap-3",
}: {
  ctas: readonly ServiceCtaKey[] | undefined;
  onVideoSurvey: () => void;
  className?: string;
}) {
  if (!ctas || ctas.length === 0) return null;

  return (
    <div className={className}>
      {ctas.map((ctaKey) => {
        const cta = serviceCtaConfig[ctaKey];
        return (
          <ShadButton
            key={ctaKey}
            onClick={onVideoSurvey}
            className="bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
          >
            {cta.label}
          </ShadButton>
        );
      })}
    </div>
  );
}

// Wraps an <img> so it's clickable to open a full-size preview. Shows a
// subtle zoom affordance on hover so it's clear the image is interactive.
function ZoomableImage({
  src,
  alt,
  className,
  onZoom,
}: {
  src: string;
  alt: string;
  className?: string;
  onZoom: (src: string, alt: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onZoom(src, alt)}
      className="group relative block w-full cursor-zoom-in overflow-hidden rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      aria-label={`View larger image of ${alt}`}
    >
      <img src={src} alt={alt} className={className} />
      <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/30">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100">
          <ZoomIn className="h-4 w-4 text-primary" />
        </span>
      </span>
    </button>
  );
}

// Full-screen preview shown when a ZoomableImage or GalleryThumb is clicked.
// Renders a <video> with controls when the src is a video file, otherwise an
// <img>. Click the backdrop, press Escape, or hit the close button to
// dismiss.
//
// Rendered via a portal directly into document.body. This is deliberate:
// if any ancestor in the page (layout wrappers, page-transition containers,
// etc.) has a CSS `transform`, `filter`, or `will-change` set, it becomes
// the containing block for descendant `position: fixed` elements — so the
// "fullscreen" overlay ends up clipped/sized to that ancestor instead of
// the real viewport. Portaling to <body> sidesteps that entirely.
function MediaLightbox({
  media,
  onClose,
}: {
  media: { src: string; alt: string } | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!media) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [media, onClose]);

  if (!mounted || !media) return null;

  const isVideo = isVideoFile(media.src);

  return createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-4 sm:p-8 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={media.alt}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label="Close preview"
      >
        <LuX size={22} />
      </button>
      {isVideo ? (
        <video
          src={media.src}
          className="max-h-[85vh] max-w-[85vw] rounded-xl shadow-2xl"
          controls
          autoPlay
          playsInline
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <img
          src={media.src}
          alt={media.alt}
          className="max-h-[85vh] max-w-[85vw] object-contain rounded-xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>,
    document.body,
  );
}

// A single thumbnail in a detail-service's gallery grid. Videos preview as
// a silent looping clip with a play badge; images get the zoom badge.
// Either way, clicking opens the full media in MediaLightbox.
function GalleryThumb({
  item,
  onOpen,
}: {
  item: GalleryItem;
  onOpen: (src: string, alt: string) => void;
}) {
  const isVideo = isVideoFile(item.src);
  return (
    <button
      type="button"
      onClick={() => onOpen(item.src, item.alt)}
      className="group relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-lg ring-1 ring-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      aria-label={`View larger ${isVideo ? "video" : "image"}: ${item.alt}`}
    >
      {isVideo ? (
        <video
          src={item.src}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
      ) : (
        <img
          src={item.src}
          alt={item.alt}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/30">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100">
          {isVideo ? (
            <Play className="h-3.5 w-3.5 fill-primary text-primary" />
          ) : (
            <ZoomIn className="h-3.5 w-3.5 text-primary" />
          )}
        </span>
      </span>
    </button>
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

// Pain points shown under the SEO detail card — why prospects can't find the
// business today.
const seoPainPoints: BenefitItem[] = [
  {
    icon: FaSearchMinus,
    title: "Buried in Search Results",
    description:
      "Your competitors show up on page 1 of Google — your site doesn't.",
  },
  {
    icon: FaMapMarkerAlt,
    title: "Invisible in Local Search",
    description:
      'Nearby customers searching "near me" can\'t find you on Google Maps.',
  },
  {
    icon: FaLink,
    title: "Weak Backlink Profile",
    description:
      "Low authority signals tell Google your site isn't trustworthy yet.",
  },
  {
    icon: FaGlobe,
    title: "Outdated, Unoptimized Content",
    description:
      "Missing keywords and technical issues keep Google from ranking you.",
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
    behindTheScenesImage: "/behind-the-scene.jpg",
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
    image: "/product-shoot.jpg",
    subtitle: "Capturing Moments That Tell Your Story",
    description: `Our professional photography and videography services bring your brand to life through compelling visual content. From product shoots to promotional videos, we create stunning media that resonates with your audience and elevates your brand presence.`,
    ctas: ["videoSurvey"] as const,
    gallery: [
      { src: "/product-shoot1.jpg", alt: "Product photography sample 1" },
      { src: "/product-shoot2.jpg", alt: "Product photography sample 2" },
      { src: "/product-shoot3.jpg", alt: "Product photography sample 3" },
      { src: "/studio-shoot1.jpg", alt: "Studio shoot sample 1" },
      { src: "/studio-shoot2.jpg", alt: "Studio shoot sample 2" },
      { src: "/studio-shoot3.jpg", alt: "Studio shoot sample 3" },
      {
        src: "/IZAKAYA-SOFT-OPENING-2.mp4",
        alt: "Photography & videography showreel",
      },
    ],
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
    painPointsHeading: "Why Can't People Find You?",
    painPoints: seoPainPoints,
    guaranteeHeading: "Our Guarantee",
    guaranteeText:
      "We improve your on-page SEO, technical SEO, and backlink profile so Google can find, trust, and rank your site. Most clients see first-page rankings for their target keywords within 4–5 months — and we keep optimizing until you get there.",
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
    thumbnailImage: "/demo.mp4",
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
    image: "/graphic-demo.jpg",
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
 * SECTION: SEO Audit Banner (inline lead-gen form, only shown under SEO)
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
 * SECTION: Branding & Marketing carousel
 * ========================================================================== */
function BrandingSection({
  onVideoSurvey,
  onRequestButtonClick,
}: {
  onVideoSurvey: () => void;
  onRequestButtonClick: (key: BenefitsRequestButtonKey) => void;
}) {
  const [selectedService, setSelectedService] = useState<string | null>(
    brandingServices[0]?.name ?? null,
  );
  const [lightboxMedia, setLightboxMedia] = useState<{
    src: string;
    alt: string;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const openLightbox = (src: string, alt: string) =>
    setLightboxMedia({ src, alt });

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
        {/* <span className="text-xl text-accent font-bold">BRANDING</span> */}
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
                  isVideoFile(service.thumbnailImage) ? (
                    <video
                      src={service.thumbnailImage}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={service.thumbnailImage}
                      alt={service.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )
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
                    src={resolveDetailImage(service.image)}
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
                  <>
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
                            Performance reports so you always know what's
                            working.
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

                    {activeService.behindTheScenesImage && (
                      <div className="mt-6">
                        <h4 className="text-primary font-semibold text-sm mb-2 text-center lg:text-left">
                          Behind the Scenes
                        </h4>
                        <div className="mx-auto lg:mx-0 max-w-md">
                          <ZoomableImage
                            src={activeService.behindTheScenesImage}
                            alt={`${activeService.name} — behind the scenes`}
                            className="h-48 w-full object-cover rounded-xl"
                            onZoom={openLightbox}
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : activeService.thumbnailImage ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-2">
                    {isVideoFile(activeService.thumbnailImage) ? (
                      <video
                        src={activeService.thumbnailImage}
                        className="w-full h-56 object-contain rounded-lg bg-slate-900"
                        controls
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <ZoomableImage
                        src={activeService.thumbnailImage}
                        alt={activeService.name}
                        className="w-full h-56 object-contain"
                        onZoom={openLightbox}
                      />
                    )}
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
                  <ZoomableImage
                    src={resolveDetailImage(activeService.image)}
                    alt={activeService.name}
                    className="w-full h-56 object-contain"
                    onZoom={openLightbox}
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

                {/* Extra photo/video gallery (currently used by Photography & Videography) */}
                {activeService.gallery && activeService.gallery.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-primary font-bold text-base mb-3">
                      Gallery
                    </h4>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                      {activeService.gallery.map((item) => (
                        <GalleryThumb
                          key={item.src}
                          item={item}
                          onOpen={openLightbox}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Why can't people find you — SEO pain points */}
                {activeService.painPoints && (
                  <div className="mb-6">
                    {activeService.painPointsHeading && (
                      <h4 className="text-primary font-bold text-base mb-3">
                        {activeService.painPointsHeading}
                      </h4>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeService.painPoints.map((point) => (
                        <div
                          key={point.title}
                          className="flex items-start gap-3 rounded-lg bg-red-50 p-3 ring-1 ring-red-100"
                        >
                          <point.icon className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-gray-700">
                              {point.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {point.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Guarantee / expected results banner */}
                {activeService.guaranteeText && (
                  <div
                    className="mb-6 rounded-xl p-5"
                    style={{
                      background:
                        "linear-gradient(135deg, #0d1b3e 0%, #1a306e 100%)",
                    }}
                  >
                    {activeService.guaranteeHeading && (
                      <span
                        className="text-xs font-bold uppercase tracking-wide"
                        style={{ color: "#f5a623" }}
                      >
                        {activeService.guaranteeHeading}
                      </span>
                    )}
                    <p className="mt-2 text-sm text-gray-200 leading-relaxed">
                      {activeService.guaranteeText}
                    </p>
                  </div>
                )}

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

      <MediaLightbox
        media={lightboxMedia}
        onClose={() => setLightboxMedia(null)}
      />
    </div>
  );
}

/* ============================================================================
 * MAIN PAGE
 * ========================================================================== */
export default function Branding() {
  const [videoSurveyOpen, setVideoSurveyOpen] = useState(false);
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
        <BrandingSection
          onVideoSurvey={() => setVideoSurveyOpen(true)}
          onRequestButtonClick={handleRequestButtonClick}
        />
      </section>

      <Dialog open={videoSurveyOpen} onOpenChange={setVideoSurveyOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 [&>button]:hidden">
          <VideoSurveyForm
            onClose={() => setVideoSurveyOpen(false)}
            onSubmitSuccess={() => setVideoSurveyOpen(false)}
          />
        </DialogContent>
      </Dialog>

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
    </div>
  );
}
