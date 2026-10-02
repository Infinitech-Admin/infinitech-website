"use client";
import { useState } from "react";
import { useDisclosure } from "@heroui/react";
import { MdOutlineSpeed } from "react-icons/md";
import {
  FaMobileAlt,
  FaEye,
  FaSlidersH,
  FaExternalLinkAlt,
  FaPlus,
} from "react-icons/fa";
import { GoCheck } from "react-icons/go";
import RequestWebsiteAuditModal from "@/components/RequestWebsiteAuditModal";

/* ============================================================================
 * THEME TOKENS (dark / techy)
 * base #070d1f · surface #0d1630 · raised #121e40 · line #1f2d57
 * amber #f5a623 (brand) · cyan #38bdf8 (secondary) · text #e6ecff · muted #8a97bd
 * ========================================================================== */
const GRID_BG: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(56,189,248,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.06) 1px, transparent 1px)",
  backgroundSize: "40px 40px",
  maskImage: "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
  WebkitMaskImage:
    "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
};

/* ---- Pricing assumptions (change to your real values) ---- */
const USD_RATE = 58; // PHP per 1 USD
const YEARLY_DISCOUNT = 0.2; // 20% off when billed yearly
const STORAGE = "7GB";

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
interface ExampleSite {
  name: string;
  url: string;
  image: string;
}
interface Tier {
  key: string;
  name: string;
  description: string;
  bestForHeading: string;
  bestFor: string[];
  purpose: string;
  examples: ExampleSite[];
}
interface PricingPackage {
  name: string;
  price: number;
  popular: boolean;
  extendsFrom?: string;
  features: string[];
}

/* ============================================================================
 * DATA — Website Development
 * ========================================================================== */
const services = [
  {
    title: "WEBSITE Solutions",
    subtitle: "Why is your website losing\nyour money instead of making it?",
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
 * DATA — Website tiers + example sites
 * ========================================================================== */
const websiteTiers: Tier[] = [
  {
    key: "standard",
    name: "Standard",
    description: "A clean, professional site to establish your presence.",
    bestForHeading: "Startups & Small Businesses",
    bestFor: ["Freelancers", "Local shops", "Restaurants, clinics"],
    purpose:
      "Build an online presence and allow customers to find and contact the business professionally.",
    examples: [
      {
        name: "Anilao Scuba Diving Center",
        url: "https://anilaoscubadivingcenter.vercel.app/",
        image: "/websites/anilao.png",
      },
      {
        name: "Whole Love",
        url: "https://wholeloveph.com/",
        image: "/websites/wholelove.png",
      },
      {
        name: "Hi Beauty Spa",
        url: "https://www.hibeautyspaph.com/",
        image: "/websites/hibeautyspa.png",
      },
      {
        name: "Barangay Pamplona Tres",
        url: "https://pamplonatres.vercel.app/",
        image: "/websites/pamplonatres.png",
      },
    ],
  },
  {
    key: "premium",
    name: "Premium",
    description: "More pages and features for growing businesses.",
    bestForHeading: "Growing SMEs",
    bestFor: [
      "Professional services",
      "Construction firms",
      "Consulting companies",
      "Manpower agencies",
      "Schools",
    ],
    purpose:
      "Improve customer engagement, provide better user experience, and gain valuable visitor insights for business growth.",
    examples: [
      {
        name: "Dr. Dental",
        url: "https://dr-dental-alpha.vercel.app/",
        image: "/websites/drdental.png",
      },
      {
        name: "ABIC Manpower Services",
        url: "https://abicmanpower.com/",
        image: "/websites/abicmanpower.png",
      },
      {
        name: "ABIC Consultancy Website",
        url: "https://abicconsultancy.vercel.app/",
        image: "/websites/abicconsultancy.png",
      },
      {
        name: "JuanTap",
        url: "https://www.juantap.info/",
        image: "/websites/juantap.png",
      },
      {
        name: "MDS Dental & Aesthetic Clinic",
        url: "https://mds-dental.vercel.app/",
        image: "/websites/mdsdental.png",
      },
    ],
  },
  {
    key: "business",
    name: "Business",
    description: "A full-featured site with custom functionality.",
    bestForHeading: "Medium-sized Enterprises",
    bestFor: [
      "Manufacturing, distributors",
      "Real estate",
      "Logistics",
      "Hospitals",
      "Corporate companies",
    ],
    purpose:
      "Generate qualified leads, improve Google visibility, manage customer information efficiently, and strengthen brand credibility.",
    examples: [
      {
        name: "Quanta",
        url: "https://staging-quanta.vercel.app/",
        image: "/websites/quanta.png",
      },
      {
        name: "DMCI Real Estate Portal",
        url: "https://dmci-agent-website.vercel.app/",
        image: "/websites/dmci.png",
      },
      {
        name: "Alfima Realty Inc.",
        url: "https://alfimarealtyinc.com/",
        image: "/websites/alfima.png",
      },
      {
        name: "G-Limit Studio",
        url: "https://www.g-limitstudio.com/",
        image: "/websites/g-limit.png",
      },
      {
        name: "Vencio's Garden Hotel & Restaurant",
        url: "https://vencios.vercel.app/",
        image: "/websites/vencios.png",
      },
      {
        name: "ABIC Realty Platform",
        url: "https://abicrealtyph.com/",
        image: "/websites/abicrealty.png",
      },
      {
        name: "Verdant Homeowners Portal",
        url: "https://verdant-home-owner.vercel.app/",
        image: "/websites/verdant.png",
      },
    ],
  },
  {
    key: "commerce",
    name: "Commerce",
    description: "A complete online store, built to sell.",
    bestForHeading: "Large Enterprises & eCommerce Brands",
    bestFor: [
      "Retail chains",
      "Wholesalers",
      "Online stores",
      "Franchise businesses",
      "Import/export companies",
    ],
    purpose:
      "Create a complete digital sales ecosystem that automates sales, customer management, reporting, and online transactions.",
    examples: [
      {
        name: "Tissue Market",
        url: "https://www.tissuemarket.com/",
        image: "/websites/tissuemarket.png",
      },
      {
        name: "Yamaaraw E-Commerce",
        url: "https://yamaaraw-ecom-shopph.vercel.app/",
        image: "/websites/yamaaraw.png",
      },
      {
        name: "Izakaya Tori Ichizu",
        url: "https://izakayatoriichizu.com/",
        image: "/websites/izakaya.png",
      },
      {
        name: "Hilee Tumbler",
        url: "https://hilee-tumbler.vercel.app/",
        image: "/websites/hilee.png",
      },
      {
        name: "YH eSIM",
        url: "https://yh-esim.vercel.app/",
        image: "/websites/yhesim.png",
      },
    ],
  },
];

/* ============================================================================
 * DATA — Ready-made pricing packages
 * ========================================================================== */
const packages: PricingPackage[] = [
  {
    name: "Standard",
    price: 5523,
    popular: false,
    features: [
      "Up to 5 pages",
      "Social Media Links integration",
      "Simple Contact Form",
      "Email Alerts for Form Inquiries",
      "1-Year Domain and Hosting",
      "5GB Storage (Upgradeable to 50GB or 100GB)",
      "Mobile-Responsive Design",
      "Basic On-Page SEO Setup",
      "Free SSL Security Certificate",
      "30 Days of Free Minor Revisions",
    ],
  },
  {
    name: "Premium",
    price: 9999,
    popular: true,
    extendsFrom: "Standard",
    features: [
      "Up to 10 Website Pages",
      "Dashboard Login for Clients",
      "Traffic Insights & Analytics",
      "Enhanced Site Customization",
      "Smart Chat System",
      "Design Upgrade",
      "Free Maintenance (while your contract is active)",
    ],
  },
  {
    name: "Business",
    price: 14999,
    popular: false,
    extendsFrom: "Premium",
    features: [
      "SEO Pro Setup +",
      "Dashboard Reports",
      "eCommerce - Ready Products Catalog",
      "Admin Staff & Client Management",
      "Upgraded Motion & Animation Website",
      "Lead Form With Dashboard Tracking",
      "Video Testimonials Section",
      "Free Maintenance (while your contract is active)",
    ],
  },
  {
    name: "Commerce",
    price: 21999,
    popular: false,
    extendsFrom: "Business",
    features: [
      "Advanced Conversion Tracking",
      "Full eCommerce System",
      "Booking Calendar & Tools",
      "Real-Time Notifications System",
      "VIP Priority Support (Phone, Chat, Email)",
      "Dashboard for Clients",
      "Free Maintenance (while your contract is active)",
    ],
  },
];

/* ============================================================================
 * UI — rich dark theme: glow, glass, motion (marquee + scan line only)
 * ========================================================================== */
const mono = "font-mono";
const allSites = websiteTiers.flatMap((t) =>
  t.examples.map((e) => ({ ...e, tier: t.name })),
);

const css = `
@keyframes marquee { to { transform: translateX(-50%); } }
@keyframes scan { 0% { top: 0; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
@keyframes floaty { 50% { transform: translateY(-8px); } }
.wd-marquee { animation: marquee 70s linear infinite; }
.wd-marquee:hover { animation-play-state: paused; }
.wd-scan { animation: scan 4s ease-in-out infinite; }
.wd-float { animation: floaty 6s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .wd-marquee, .wd-scan, .wd-float { animation: none; } }
`;

const grad = (dir: string, ...stops: string[]): React.CSSProperties => ({
  backgroundImage: `linear-gradient(${dir}, ${stops.join(", ")})`,
});

const glass = "border border-white/10 bg-white/[0.04] backdrop-blur-md";

function Dots() {
  return (
    <span className="flex gap-1.5">
      <i className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
      <i className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
      <i className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
    </span>
  );
}

function domain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function AuditButton({
  onClick,
  label = "Get a Free Website Audit",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg bg-[#f5a623] px-6 py-3 text-sm font-bold text-[#070d1f] shadow-[0_0_30px_rgba(245,166,35,0.45)] transition hover:bg-[#ffb93f] hover:shadow-[0_0_44px_rgba(245,166,35,0.7)] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38bdf8]"
    >
      {label}
    </button>
  );
}

function SectionHead({
  tag,
  title,
  text,
}: {
  tag: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <span
        className={`${mono} inline-block rounded-full border border-[#38bdf8]/30 bg-[#38bdf8]/10 px-3 py-1 text-xs text-[#38bdf8]`}
      >
        {tag}
      </span>
      <h2 className="mt-4 text-3xl font-bold text-white font-['Poetsen_One'] sm:text-4xl">
        {title}
      </h2>
      {text && <p className="mt-4 text-[#8a97bd]">{text}</p>}
    </div>
  );
}

/* ---- HERO ---- */
const chipPos = [
  "left-0 top-6 md:-left-6",
  "right-0 top-16 md:-right-6",
  "left-2 bottom-20 md:-left-10",
  "right-2 bottom-6 md:-right-4",
];

function Hero({ onAudit }: { onAudit: () => void }) {
  const s = services[0];
  const stats = [
    { v: String(allSites.length), l: "live sites built" },
    { v: String(websiteTiers.length), l: "tiers to choose from" },
    {
      v: `₱${packages[0].price.toLocaleString("en-US")}`,
      l: "starting monthly price",
    },
  ];
  return (
    <div className="mb-8 w-full">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <div>
          <span
            className={`${mono} inline-flex items-center gap-2 rounded-full border border-[#f5a623]/30 bg-[#f5a623]/10 px-3 py-1 text-xs text-[#f5a623]`}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f5a623]" />
            {s.title}
          </span>
          <h1 className="mt-5 whitespace-pre-line text-4xl font-bold leading-[1.1] text-white font-['Poetsen_One'] sm:text-5xl lg:text-[3.4rem]">
            {s.subtitle}
          </h1>
          <p className="mt-5 max-w-md text-[#8a97bd]">
            Most slow, dated sites quietly turn visitors away. Find out what is
            holding yours back, then fix it with a build that fits your
            business.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <AuditButton onClick={onAudit} />
            <a
              href="#work"
              className={`${glass} rounded-lg px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10`}
            >
              See our work
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg">
          <div
            aria-hidden
            className="absolute -inset-10 rounded-full"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(56,189,248,0.28), transparent 65%)",
            }}
          />
          <div
            className={`${glass} relative overflow-hidden rounded-2xl shadow-[0_0_80px_rgba(56,189,248,0.15)]`}
          >
            <div className="relative p-6">
              <img
                className="h-72 w-full object-contain"
                alt={s.title}
                src={`/images/services/${s.image}`}
              />
              <div
                aria-hidden
                className="wd-scan pointer-events-none absolute inset-x-0 h-16"
                style={grad(
                  "to bottom",
                  "transparent",
                  "rgba(56,189,248,0.25)",
                  "transparent",
                )}
              />
            </div>
          </div>
          {s.problems.map((p, i) => (
            <div
              key={p.label}
              className={`wd-float absolute ${chipPos[i]} flex items-center gap-2 rounded-lg border border-[#ef4444]/50 bg-[#2a1020] px-3 py-2 text-xs font-semibold text-[#ffe4e6] shadow-lg`}
              style={{ animationDelay: `${i * 0.8}s` }}
            >
              <p.icon className="h-3.5 w-3.5 text-[#f87171]" />
              {p.label}
            </div>
          ))}
        </div>
      </div>

      <div
        className={`${glass} mt-16 grid grid-cols-3 divide-x divide-white/10 rounded-2xl`}
      >
        {stats.map((x) => (
          <div key={x.l} className="px-3 py-6 text-center">
            <p
              className={`${mono} text-2xl font-bold text-[#f5a623] sm:text-4xl`}
            >
              {x.v}
            </p>
            <p className="mt-1 text-xs text-[#b8c3e6] sm:text-sm">{x.l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- MARQUEE of real sites ---- */
function Marquee() {
  const row = [...allSites, ...allSites];
  return (
    <div
      className="relative -mx-4 mb-24 overflow-hidden py-4 sm:-mx-6 lg:-mx-8"
      style={{
        maskImage:
          "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <div className="wd-marquee flex w-max gap-5">
        {row.map((site, i) => (
          <a
            key={`${site.url}-${i}`}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-hidden={i >= allSites.length}
            tabIndex={i >= allSites.length ? -1 : 0}
            className="group relative block w-72 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#0a1226]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={site.image}
              alt={site.name}
              className="aspect-video w-full object-cover object-top opacity-80 transition group-hover:opacity-100"
            />
            <div
              className="absolute inset-x-0 bottom-0 px-3 pb-2.5 pt-8 text-sm font-semibold text-white"
              style={grad("to top", "#070d1f", "transparent")}
            >
              {site.name}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ---- PRICING TOGGLE ---- */
function Toggle({
  left,
  right,
  value,
  onChange,
}: {
  left: string;
  right: string;
  value: "left" | "right";
  onChange: (v: "left" | "right") => void;
}) {
  return (
    <div className="flex items-center gap-3 text-sm font-semibold">
      <span className={value === "left" ? "text-white" : "text-[#8a97bd]"}>
        {left}
      </span>
      <button
        role="switch"
        aria-checked={value === "right"}
        aria-label={`${left} / ${right}`}
        onClick={() => onChange(value === "left" ? "right" : "left")}
        className="relative h-6 w-11 rounded-full bg-gradient-to-r from-[#38bdf8] to-[#2563eb] shadow-[0_0_16px_rgba(56,189,248,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38bdf8]"
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${value === "right" ? "left-[22px]" : "left-0.5"}`}
        />
      </button>
      <span className={value === "right" ? "text-white" : "text-[#8a97bd]"}>
        {right}
      </span>
    </div>
  );
}

/* ---- PRICING ---- */
function Pricing() {
  const [billing, setBilling] = useState<"left" | "right">("left"); // left = monthly
  const [currency, setCurrency] = useState<"left" | "right">("left"); // left = PHP

  const formatPrice = (php: number) => {
    const monthly = billing === "right" ? php * (1 - YEARLY_DISCOUNT) : php;
    if (currency === "left")
      return `₱${Math.round(monthly).toLocaleString("en-US")}`;
    return `$${Math.round(monthly / USD_RATE).toLocaleString("en-US")}`;
  };

  return (
    <div className="mb-28 w-full">
      <SectionHead
        tag="PACKAGES"
        title="Four tiers. One that fits your business."
        text="Plans that grow with you, from a simple online presence to a full online store."
      />

      <div className="mb-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        <Toggle
          left="Monthly"
          right="Yearly"
          value={billing}
          onChange={setBilling}
        />
        <Toggle
          left="PHP"
          right="USD"
          value={currency}
          onChange={setCurrency}
        />
      </div>

      <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {packages.map((pkg) => (
          <div key={pkg.name} className="flex flex-col">
            <div
              className={`relative flex flex-1 flex-col rounded-2xl p-6 transition duration-300 hover:-translate-y-1 ${
                pkg.popular
                  ? "border-2 border-[#38bdf8] bg-[#0b1530] shadow-[0_0_45px_rgba(56,189,248,0.35),inset_0_0_30px_rgba(56,189,248,0.08)]"
                  : "border border-white/10 bg-[#0b1530]/80 hover:border-[#38bdf8]/40 hover:shadow-[0_0_35px_rgba(56,189,248,0.15)]"
              }`}
            >
              {/* glowing top line */}
              <span
                aria-hidden
                className="absolute -top-px left-8 h-[2px] w-36 rounded-full bg-gradient-to-r from-transparent via-[#38bdf8] to-transparent opacity-70 shadow-[0_0_14px_rgba(56,189,248,0.9)]"
              />

              {pkg.popular && (
                <span className="absolute -top-3.5 left-4 rounded-full bg-[#38bdf8] px-3 py-1 text-xs font-bold text-[#070d1f] shadow-[0_0_20px_rgba(56,189,248,0.8)]">
                  Most Popular
                </span>
              )}

              <h3 className="mt-2 text-xl font-bold text-white">{pkg.name}</h3>

              <p className="mt-6 flex items-baseline gap-2 text-white">
                <span className="text-4xl font-extrabold">
                  {formatPrice(pkg.price)}
                </span>
                <span className="text-sm text-[#b8c3e6]">/month</span>
              </p>

              <div className="my-5 h-px bg-white/10" />

              {pkg.extendsFrom ? (
                <div className="mb-4 flex min-h-[3.5rem] items-center gap-3 rounded-lg border border-[#38bdf8]/60 bg-[#38bdf8]/5 px-3 py-2 text-sm font-bold text-white shadow-[0_0_18px_rgba(56,189,248,0.15)]">
                  <FaPlus className="h-3 w-3 shrink-0 text-[#38bdf8]" />
                  Everything in {pkg.extendsFrom}, plus:
                </div>
              ) : (
                <div
                  aria-hidden
                  className="mb-4 hidden min-h-[3.5rem] lg:block"
                />
              )}

              <ul className="space-y-3">
                {pkg.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 text-sm leading-snug text-[#e6ecff]"
                  >
                    <GoCheck
                      className={`mt-0.5 h-4 w-4 shrink-0 ${pkg.popular ? "text-[#38bdf8]" : "text-[#8a97bd]"}`}
                    />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-3 px-1 text-xs text-[#8a97bd]">
              Storage:{" "}
              <span className="font-semibold text-[#b8c3e6]">{STORAGE}</span>{" "}
              (included)
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- WORK BY TIER ---- */
function Work() {
  const [active, setActive] = useState(websiteTiers[0].key);
  const tier = websiteTiers.find((t) => t.key === active)!;
  return (
    <div id="work" className="mb-28 w-full scroll-mt-24">
      <SectionHead
        tag="OUR WORK"
        title="Real sites, built at every tier"
        text="Pick a tier to see who it is for and the websites we have launched on it."
      />
      <div
        role="tablist"
        className={`${glass} mx-auto mb-8 flex w-fit max-w-full flex-wrap justify-center gap-1 rounded-xl p-1.5`}
      >
        {websiteTiers.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={active === t.key}
            onClick={() => setActive(t.key)}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#38bdf8] ${active === t.key ? "bg-[#f5a623] text-[#070d1f] shadow-[0_0_22px_rgba(245,166,35,0.4)]" : "text-[#b8c3e6] hover:text-white"}`}
          >
            {t.name}
            <span
              className={`${mono} rounded-full px-1.5 text-[10px] ${active === t.key ? "bg-[#070d1f]/20" : "bg-white/10"}`}
            >
              {t.examples.length}
            </span>
          </button>
        ))}
      </div>

      <div
        className={`${glass} mb-6 grid gap-6 rounded-2xl p-6 md:grid-cols-[1fr_1fr_1.4fr]`}
      >
        <div>
          <p className={`${mono} text-xs text-[#38bdf8]`}>best for</p>
          <p className="mt-1 font-semibold text-white">{tier.bestForHeading}</p>
        </div>
        <ul className="flex flex-wrap content-start gap-1.5">
          {tier.bestFor.map((b) => (
            <li
              key={b}
              className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-[#c5cff0]"
            >
              {b}
            </li>
          ))}
        </ul>
        <p className="border-l-2 border-[#f5a623] pl-4 text-sm leading-relaxed text-[#c5cff0]">
          {tier.purpose}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tier.examples.map((site) => (
          <a
            key={site.url}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a1226] transition hover:-translate-y-1 hover:border-[#38bdf8]/60 hover:shadow-[0_0_40px_rgba(56,189,248,0.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#38bdf8]"
          >
            <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
              <Dots />
              <span className={`${mono} truncate text-[11px] text-[#8a97bd]`}>
                {domain(site.url)}
              </span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={site.image}
              alt={site.name}
              className="aspect-video w-full object-cover object-top transition duration-500 group-hover:scale-105"
            />
            <div
              className="absolute inset-x-0 bottom-0 flex items-center justify-between px-4 pb-3 pt-10"
              style={grad(
                "to top",
                "#070d1f",
                "rgba(7,13,31,0.8)",
                "transparent",
              )}
            >
              <span className="text-sm font-semibold text-white">
                {site.name}
              </span>
              <FaExternalLinkAlt className="h-3.5 w-3.5 text-[#8a97bd] transition group-hover:text-[#38bdf8]" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ---- CLOSING CTA ---- */
function ClosingCta({ onAudit }: { onAudit: () => void }) {
  return (
    <div
      className="relative mb-8 overflow-hidden rounded-3xl border border-[#f5a623]/30 px-6 py-14 text-center"
      style={grad("135deg", "#16204a", "#0d1630", "#1a1630")}
    >
      <div
        aria-hidden
        className="absolute -top-24 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-[#f5a623]/20 blur-3xl"
      />
      <div className="relative">
        <h2 className="text-3xl font-bold text-white font-['Poetsen_One'] sm:text-4xl">
          Not sure which tier fits?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[#c5cff0]">
          Start with a free audit of your current website and we will point you
          to the right build.
        </p>
        <div className="mt-7">
          <AuditButton onClick={onAudit} />
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * MAIN COMPONENT
 * ========================================================================== */
export default function WebsiteDevelopment() {
  const {
    isOpen: auditOpen,
    onOpen: openAudit,
    onOpenChange: onAuditOpenChange,
  } = useDisclosure();

  return (
    <div className="relative flex w-full flex-col items-center overflow-hidden bg-[#070d1f]">
      <style>{css}</style>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[44rem]"
        style={GRID_BG}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#38bdf8]/15 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-[60rem] h-96 w-96 rounded-full bg-[#f5a623]/10 blur-[120px]"
      />
      <section className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        <Hero onAudit={openAudit} />
        <div className="h-16" />
        <Marquee />
        <Pricing />
        <Work />
        <ClosingCta onAudit={openAudit} />
      </section>
      <RequestWebsiteAuditModal
        isOpen={auditOpen}
        onOpenChange={onAuditOpenChange}
      />
    </div>
  );
}
