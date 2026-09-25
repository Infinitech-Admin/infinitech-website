"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button, useDisclosure } from "@heroui/react";
import { Button as ShadButton } from "@/components/ui/button";
import { Loader2, Search, ZoomIn, Play } from "lucide-react";
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
  FaSearchMinus,
  FaMapMarkerAlt,
  FaLink,
  FaAddressCard,
  FaUsers,
  FaPalette,
  FaBolt,
  FaGlobe,
  FaCalendarCheck,
  FaBriefcase,
  FaShoppingCart,
} from "react-icons/fa";
import { GoCheck } from "react-icons/go";

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
interface ProblemItem {
  icon?: React.ComponentType<IconProps>;
  image?: string; // path under /public, e.g. "/images/services/problems/slow-loading.svg"
  label: string;
  consequence?: string; // one-line "why this costs you" copy shown under the label
  stat?: string; // short supporting stat shown as a pill badge
}
interface ProcessStep {
  icon: React.ComponentType<IconProps>;
  title: string;
  color: string;
  description: string;
}
interface ServiceCategory {
  id: number;
  name: string;
  description: string;
}
// A single item in a detail-service's extra media gallery. `src` can be an
// image or a video (.mp4/.webm/.mov) — detected automatically via
// isVideoFile, same convention as thumbnailImage.
interface GalleryItem {
  src: string;
  alt: string;
}
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
interface ServiceBlock {
  title: string;
  subtitle: string;
  ctas?: readonly ServiceCtaKey[];
  problems: ProblemItem[];
}
interface DetailService {
  name: string;
  type: "detail";
  image: string;
  subtitle: string;
  description: string;
  categories: ServiceCategory[];
  ctas?: readonly ServiceCtaKey[];
  problems?: ProblemItem[];
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

/* ============================================================================
 * DATA — Website Solutions pricing packages
 *
 * NOTE: `features` is kept here in case other parts of the app still read
 * it (e.g. a comparison table elsewhere), but PricingCard below no longer
 * renders it — cards now only show name, price, and `bestFor`.
 * ========================================================================== */

const packages = [
  {
    name: "Standard",
    price: "5,523",
    icon: FaGlobe,
    popular: false,
    bestFor:
      "New businesses that need a clean, professional site live online fast.",
    features: [
      "Up to 5 pages",
      "Social Media Links integration",
      "Simple Contact Form",
      "Email Alerts for Form Inquiries",
      "1-Year Domain and Hosting",
      "5GB Storage (Upgradeable to 50GB or 100GB",
      "Mobile-Responsive Design",
      "Basic On-Page SEO Setup",
      "Free SSL Security Certificate",
      "30 Days of Free Minor Revisions",
    ],
  },
  {
    name: "Premium",
    price: "9,999",
    icon: FaCalendarCheck,
    popular: true,
    bestFor:
      "Growing businesses that want a client dashboard, analytics, and a more polished look.",
    features: [
      "Everything in Standard, plus:",
      "Up to 10 Website Pages",
      "Dashboard Login for Clients",
      "Traffic Insights & Analytics",
      "Enhanced Site Customization",
      "Smart Chat System",
      "Design Upgrade",
    ],
  },
  {
    name: "Business",
    price: "14,999",
    icon: FaBriefcase,
    popular: false,
    bestFor:
      "Established businesses ready to rank on Google and manage leads with a real admin system.",
    features: [
      "SEO Pro Setup + Dashboard Reports",
      "eCommerce-Ready Products Catalog",
      "Admin Staff & Client Management",
      "Upgraded Motion & Animation Website",
      "Lead Form With Dashboard Tracking",
      "Video Testimonials Section",
    ],
  },
  {
    name: "Commerce",
    price: "21,999",
    icon: FaShoppingCart,
    popular: false,
    bestFor:
      "Businesses selling online that need full eCommerce, bookings, and VIP support.",
    features: [
      "Advanced Conversion Tracking",
      "Full eCommerce System",
      "Booking Calendar & Tools",
      "Real-Time Notifications System",
      "VIP Priority Support (Phone, Chat, Email)",
      "Dashboard for Clients",
    ],
  },
];

/* ============================================================================
 * DATA — main service blocks (Website Dev / Design / Social Media)
 * ========================================================================== */

const services: ServiceBlock[] = [
  {
    title: "WEBSITE DEVELOPMENT",
    subtitle: "Why is your website losing\nyour money instead of making it?",
    problems: [
      {
        image: "/images/services/problems/slow-loading.png",
        label: "Slow Loading Speed",
        consequence: "Visitors leave before your page even finishes loading.",
        stat: "53% bounce after 3s",
      },
      {
        image: "/images/services/problems/mobile-responsiveness.png",
        label: "Poor Mobile Responsiveness",
        consequence: "Broken layouts turn mobile shoppers away for good.",
        stat: "60% of traffic is mobile",
      },
      {
        image: "/images/services/problems/search-visibility.png",
        label: "Low Search Visibility",
        consequence: "Buried past page one means invisible to new customers.",
        stat: "75% never click page 2",
      },
      {
        image: "/images/services/problems/outdated-design.png",
        label: "Outdated, Confusing Design",
        consequence:
          "Visitors judge credibility in seconds based on design alone.",
        stat: "75% judge trust by design",
      },
    ] as ProblemItem[],
  },
];

/* ============================================================================
 * CONFIG — CTA buttons
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
 * COMPONENT — Problem list (Website Solutions section)
 *
 * UPDATED: now a single row of 4 on larger screens (grid-cols-2 on small
 * screens so cards don't get crushed on mobile, sm:grid-cols-4 from the
 * small breakpoint up). Sized to its own content only — do NOT add h-full /
 * self-stretch here.
 * ========================================================================== */

function ServiceProblemList({ problems }: { problems?: ProblemItem[] }) {
  if (!problems || problems.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {problems.map((problem) => (
        <div key={problem.label} className="group h-44 [perspective:1200px]">
          <div className="relative h-full w-full transition-transform duration-500 ease-out [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
            {/* Front face — icon + copy, same layout as before */}
            <div className="absolute inset-0 flex items-start gap-3.5 rounded-xl bg-white ring-1 ring-red-100 p-4 shadow-sm [backface-visibility:hidden]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
                {problem.image ? (
                  <img
                    src={problem.image}
                    alt=""
                    className="h-6 w-6 object-contain"
                  />
                ) : problem.icon ? (
                  <problem.icon className="h-5 w-5 text-red-600" />
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-primary mb-1">
                  {problem.label}
                </p>
                {problem.consequence && (
                  <p className="text-xs text-gray-500 leading-relaxed mb-2">
                    {problem.consequence}
                  </p>
                )}
                {problem.stat && (
                  <span className="inline-block rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700">
                    {problem.stat}
                  </span>
                )}
              </div>
            </div>

            {/* Back face — the actual image, revealed when the card flips on hover */}
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white ring-1 ring-red-100 p-4 shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)]">
              {problem.image ? (
                <img
                  src={problem.image}
                  alt={problem.label}
                  className="h-24 w-24 object-contain"
                />
              ) : problem.icon ? (
                <problem.icon className="h-20 w-20 text-red-500" />
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================================
 * COMPONENT — Decorative SVG graphic for the Website Development hero (fills
 * the space left behind by the removed illustration image, reinforcing the
 * "audit / diagnose your site" theme).
 * ========================================================================== */

function WebsiteDiagnosticGraphic() {
  return (
    <svg viewBox="0 0 200 160" className="h-14 w-16 shrink-0">
      <rect x="10" y="10" width="140" height="100" rx="10" fill="#0d1b3e" />
      <rect x="22" y="26" width="70" height="8" rx="4" fill="#f5a623" />
      <rect
        x="22"
        y="42"
        width="100"
        height="6"
        rx="3"
        fill="#ffffff"
        opacity="0.35"
      />
      <rect
        x="22"
        y="56"
        width="85"
        height="6"
        rx="3"
        fill="#ffffff"
        opacity="0.25"
      />
      <rect
        x="22"
        y="70"
        width="60"
        height="6"
        rx="3"
        fill="#ffffff"
        opacity="0.25"
      />
      <circle
        cx="150"
        cy="95"
        r="34"
        fill="#ffffff"
        stroke="#f5a623"
        strokeWidth="7"
      />
      <circle
        cx="150"
        cy="95"
        r="22"
        fill="none"
        stroke="#0d1b3e"
        strokeWidth="2"
        opacity="0.5"
      />
      <line
        x1="174"
        y1="119"
        x2="196"
        y2="141"
        stroke="#f5a623"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M138 95 l8 8 l16 -18"
        fill="none"
        stroke="#0d1b3e"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ============================================================================
 * COMPONENT — Zoomable image + full-screen media lightbox + gallery thumb
 * (shared by the advanced Branding & Marketing section)
 * ========================================================================== */

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

/* ============================================================================
 * COMPONENT — Circular process diagram
 * ========================================================================== */

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
 * DATA — Social Media Management process cycle
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

/* ============================================================================
 * DATA — Branding & marketing carousel (advanced version, w/ gallery + video)
 * ========================================================================== */

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
];

/* ============================================================================
 * SECTION: SEO Audit Banner
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
 * COMPONENT — Compact pricing card (Website Solutions section)
 *
 * SIMPLIFIED: no more feature list. Card shows icon + name, price, and the
 * one-line "best for" explanation only. `features` in the data array is no
 * longer read here (kept in `packages` in case something else uses it).
 * ========================================================================== */

function PricingCard({ pkg }: { pkg: (typeof packages)[number] }) {
  return (
    <div
      className={`relative rounded-2xl p-4 flex flex-col transition-all hover:-translate-y-1
        ${
          pkg.popular
            ? "bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-accent shadow-xl shadow-accent/20"
            : "bg-slate-800 border border-slate-700 hover:bg-slate-700"
        }`}
    >
      {pkg.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-accent to-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
          Most Popular
        </span>
      )}

      <div className="flex items-center gap-2 mt-1.5 mb-1">
        <pkg.icon className="h-5 w-5 text-accent-light" />
        <h3 className="text-white font-bold text-sm">{pkg.name}</h3>
      </div>

      <p className="text-lg font-black text-white mt-0.5 mb-1.5">
        ₱{pkg.price}
        <span className="text-[10px] font-medium text-slate-300">/month</span>
      </p>

      <p className="text-slate-300 text-[11px] leading-relaxed">
        {pkg.bestFor}
      </p>
    </div>
  );
}

/* ============================================================================
 * COMPONENT — Mini "Which Plan Is Right For Me" FAQ
 *
 * Sits under the pricing header banner, above the pricing row.
 * ========================================================================== */

interface PlanFaqItem {
  question: string;
  answer: string;
}

const planFaqItems: PlanFaqItem[] = [
  {
    question: "I'm just starting out — which plan fits?",
    answer:
      "Go with Standard. You get a clean 5-page site live fast, without paying for features you don't need yet.",
  },
  {
    question: "I want a dashboard and better design — what then?",
    answer:
      "Premium is built for that: client login, traffic analytics, and a design upgrade — our most popular pick.",
  },
  {
    question: "I want to rank on Google and manage leads properly.",
    answer:
      "Business adds SEO Pro setup, a products catalog, and admin/lead tracking for teams ready to scale.",
  },
  {
    question: "I sell products online and need bookings too.",
    answer:
      "Commerce gives you full eCommerce, a booking calendar, and VIP support — built for active online sellers.",
  },
];

function PlanFaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div
      className="rounded-2xl p-5 sm:p-6"
      style={{
        background: "linear-gradient(135deg, #0d1b3e 0%, #1a306e 100%)",
        boxShadow: "0 8px 30px rgba(13,27,62,0.35)",
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <FaSearchDollar className="h-4 w-4" style={{ color: "#f5a623" }} />
        <p className="text-white font-bold text-sm sm:text-base">
          Which Plan Is Right For Me?
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {planFaqItems.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={item.question}
              className="rounded-xl bg-white/5 ring-1 ring-white/10 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <span className="text-white text-xs sm:text-sm font-semibold">
                  {item.question}
                </span>
                <span
                  className="shrink-0 text-xs font-bold transition-transform duration-200"
                  style={{
                    color: "#f5a623",
                    transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                  }}
                >
                  +
                </span>
              </button>
              {isOpen && (
                <div className="px-4 pb-3">
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================================
 * SECTION: Website Solutions
 *
 * RESTRUCTURED: problems are now a single full-width row (2-across on
 * mobile, 4-across from `sm` up), stacked directly above a single full-width
 * pricing row (also 2-across on mobile, 4-across from `sm` up), with the
 * "Which Plan Is Right For Me" FAQ sitting between the pricing header and
 * the pricing row. This replaces the previous two-column
 * (problems+FAQ left / pricing right) layout.
 * ========================================================================== */

function WebsiteSolutionsSection({
  onVideoSurvey,
  onWebsiteAudit,
}: {
  onVideoSurvey: () => void;
  onWebsiteAudit: () => void;
}) {
  return (
    <div className="w-full">
      {services.map((service, serviceIndex) => (
        <div key={`${service.title}-${serviceIndex}`} className="w-full">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <WebsiteDiagnosticGraphic />
              <span className="text-xl text-accent font-bold">
                {service.title}
              </span>
            </div>
            <h1 className="text-3xl text-primary font-bold mt-2 font-['Poetsen_One']">
              {service.subtitle}
            </h1>

            {/* Row 1: problems — single row */}
            <div className="mt-5">
              <ServiceProblemList problems={service.problems} />
            </div>

            {/* Row 2: FAQ on the left, the 4 pricing tiers on the right — one row */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <PlanFaqAccordion />

              <div className="grid grid-cols-2 gap-4">
                {packages.map((pkg) => (
                  <PricingCard key={pkg.name} pkg={pkg} />
                ))}
              </div>
            </div>

            <ServiceCtaButtons
              ctas={service.ctas}
              onVideoSurvey={onVideoSurvey}
              onWebsiteAudit={onWebsiteAudit}
            />
          </div>
        </div>
      ))}
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
    <div className="w-full">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 rounded-2xl bg-slate-50 p-4 sm:p-6 items-stretch">
        {researchBenefits.map((benefit) => (
          <div
            key={benefit.title}
            className="rounded-xl bg-white p-3.5 h-full flex flex-col text-center shadow-sm ring-1 ring-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all"
          >
            <div
              className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: `${benefit.color}1a` }}
            >
              <benefit.icon
                className="h-4.5 w-4.5"
                style={{ color: benefit.color }}
              />
            </div>
            <h3 className="text-primary font-semibold text-xs mb-1">
              {benefit.title}
            </h3>
            <p className="text-gray-500 text-[11px] leading-snug">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
 * SECTION: Branding & Marketing — advanced version (scrollable carousel,
 * photo/video gallery, full-screen lightbox, SEO pain points + guarantee).
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
    <div className="w-full">
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
                      className="absolute inset-0 h-full w-full object-cover"
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
                    ? `${activeService.name} — From Strategy to Growth`
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

                    {/* {activeService.behindTheScenesImage && (
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
                    )} */}
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

                    <ServiceProblemList problems={activeService.problems} />

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
 * SECTION: Category card + its details, side-by-side (card is sticky on the
 * left, its own section content sits directly beside it on the right — not
 * stacked below a separate row of cards).
 * ========================================================================== */

interface MainSectionCardData {
  title: string;
  description: string;
  icon: React.ComponentType<IconProps>;
  color: string;
}

const mainSectionCards: MainSectionCardData[] = [
  {
    title: "Website Solutions",
    description: "Custom websites & ready-made plans",
    icon: FaGlobe,
    color: "#10b981",
  },
  {
    title: "Marketing Research",
    description: "Data-backed insights for smarter decisions",
    icon: FaSearchDollar,
    color: "#0ea5e9",
  },
  {
    title: "Branding",
    description: "Grow your brand across every channel",
    icon: FaPalette,
    color: "#8b5cf6",
  },
];

function CategoryCard({ card }: { card: MainSectionCardData }) {
  return (
    <div className="flex flex-col items-center text-center rounded-2xl bg-white p-10 shadow-md ring-1 ring-gray-100 md:sticky md:top-24">
      <div
        className="flex h-24 w-24 items-center justify-center rounded-3xl mb-6"
        style={{
          background: `linear-gradient(135deg, ${card.color}, ${card.color}cc)`,
        }}
      >
        <card.icon className="h-10 w-10 text-white" />
      </div>
      <h3 className="text-primary font-bold text-2xl">{card.title}</h3>
      <p className="text-gray-500 text-sm mt-3 leading-relaxed">
        {card.description}
      </p>
      <span
        className="mt-6 h-1.5 w-full max-w-[160px] rounded-full opacity-60"
        style={{ backgroundColor: card.color }}
      />
    </div>
  );
}

function CategoryBlock({
  card,
  children,
}: {
  card: MainSectionCardData;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6 md:gap-10 items-start mb-16 last:mb-0">
      <CategoryCard card={card} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/* ============================================================================
 * SECTION: All page modals
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
 * MAIN PAGE — renders Website, Market Research, and Branding (advanced
 * carousel/gallery/lightbox version) sections one after another.
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
    <section className="container mx-auto px-4 py-12 lg:py-16">
      {/* Header */}
      <div className="max-w-xl mx-auto text-center mb-12">
        <h1 className="font-bold text-accent text-4xl">OUR SERVICES</h1>
        <p className="text-gray-500 mt-2">
          Solutions built to grow your business.
        </p>
      </div>

      <CategoryBlock card={mainSectionCards[0]}>
        <WebsiteSolutionsSection
          onVideoSurvey={() => setVideoSurveyOpen(true)}
          onWebsiteAudit={openAudit}
        />
      </CategoryBlock>

      <CategoryBlock card={mainSectionCards[1]}>
        <MarketResearchSection onRequestReport={openReport} />
      </CategoryBlock>

      <CategoryBlock card={mainSectionCards[2]}>
        <BrandingSection
          onVideoSurvey={() => setVideoSurveyOpen(true)}
          onWebsiteAudit={openAudit}
          onRequestButtonClick={handleRequestButtonClick}
        />
      </CategoryBlock>

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
    </section>
  );
}
