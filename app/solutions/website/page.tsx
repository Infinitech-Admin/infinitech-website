"use client";
import { useState } from "react";
import { useDisclosure } from "@heroui/react";
import { MdOutlineSpeed } from "react-icons/md";
import {
  FaMobileAlt,
  FaEye,
  FaSlidersH,
  FaExternalLinkAlt,
  FaGlobe,
  FaCalendarCheck,
  FaBriefcase,
  FaShoppingCart,
} from "react-icons/fa";
import { GoCheck } from "react-icons/go";
import RequestWebsiteAuditModal from "@/components/RequestWebsiteAuditModal";

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
  price: string;
  icon: React.ComponentType<IconProps>;
  popular: boolean;
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
 * DATA — Ready-made pricing packages (Option D: equal height + 2-col features)
 * ========================================================================== */
const packages: PricingPackage[] = [
  {
    name: "Standard",
    price: "4,644",
    icon: FaGlobe,
    popular: false,
    features: [
      "Up to 5 pages",
      "Social Media Links integration",
      "Simple Contact Form",
      "Email Alerts for Form Inquiries",
      "1-Year Domain and Hosting",
    ],
  },
  {
    name: "Premium",
    price: "9,999",
    icon: FaCalendarCheck,
    popular: true,
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
 * CONFIG — CTA button referenced by services[].ctas above.
 * ========================================================================== */
type ServiceCtaKey = "websiteAudit";

interface ServiceCtaConfigEntry {
  label: string;
  kind: "primary" | "secondary";
}

const serviceCtaConfig: Record<ServiceCtaKey, ServiceCtaConfigEntry> = {
  websiteAudit: {
    label: "Get a Free Website Audit",
    kind: "secondary",
  },
};

function ServiceCtaButtons({
  ctas,
  onWebsiteAudit,
  className = "mt-6 flex flex-wrap gap-3",
}: {
  ctas: readonly ServiceCtaKey[] | undefined;
  onWebsiteAudit: () => void;
  className?: string;
}) {
  if (!ctas || ctas.length === 0) return null;

  return (
    <div className={className}>
      {ctas.map((ctaKey) => {
        const cta = serviceCtaConfig[ctaKey];
        return (
          <button
            key={ctaKey}
            onClick={onWebsiteAudit}
            className="flex items-center gap-2 rounded-full bg-[#0d1b3e] border-2 border-[#f5a623] px-5 py-2.5 text-sm font-bold text-[#f5a623] transition-all duration-300 hover:bg-[#f5a623] hover:text-[#0d1b3e] hover:shadow-lg"
          >
            {cta.label}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================================
 * COMPONENT — Problem list
 * ========================================================================== */
function ServiceProblemList({ problems }: { problems?: ProblemItem[] }) {
  if (!problems || problems.length === 0) return null;

  return (
    <div className="mt-5">
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

/* ============================================================================
 * COMPONENT — Tier info panel (Best For / Business Purpose)
 * ========================================================================== */
function TierInfoPanel({ tier }: { tier: Tier }) {
  return (
    <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="rounded-xl bg-slate-50 ring-1 ring-gray-200 p-5">
        <span className="text-xs font-bold uppercase tracking-wide text-accent">
          Best For
        </span>
        <p className="mt-2 text-sm font-semibold text-primary">
          {tier.bestForHeading}
        </p>
        <ul className="mt-3 space-y-1.5">
          {tier.bestFor.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-sm text-gray-600"
            >
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl bg-[#0d1b3e] p-5">
        <span className="text-xs font-bold uppercase tracking-wide text-[#f5a623]">
          Business Purpose
        </span>
        <p className="mt-2 text-sm text-gray-200 leading-relaxed">
          {tier.purpose}
        </p>
      </div>
    </div>
  );
}

/* ============================================================================
 * SECTION — Website tier tabs + example sites
 * ========================================================================== */
function WebsiteTiersSection() {
  const [activeTier, setActiveTier] = useState(websiteTiers[0].key);
  const tier = websiteTiers.find((t) => t.key === activeTier)!;

  return (
    <div className="w-full mb-16">
      <div className="max-w-xl mx-auto text-center mb-8">
        <span className="text-xl text-accent font-bold">PACKAGES</span>
        <h1 className="text-3xl text-primary font-bold mt-2 font-['Poetsen_One']">
          Find Your Perfect Fit Among Our 4 Tiers
        </h1>
        <p className="text-lg text-gray-600 mt-4">
          Browse real examples of websites we've built at each tier.
        </p>
      </div>

      {/* Tier buttons */}
      <div className="flex gap-3 mb-8 justify-center flex-wrap">
        {websiteTiers.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTier(t.key)}
            className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300
              ${
                activeTier === t.key
                  ? "bg-[#0d1b3e] text-[#f5a623] ring-2 ring-[#f5a623] shadow-md"
                  : "bg-slate-50 text-gray-600 ring-1 ring-gray-200 hover:bg-slate-100"
              }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Active tier content */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-100">
        <div className="h-1.5 w-full bg-accent" />
        <div className="p-5 sm:p-8">
          <div className="mb-6 text-center">
            <h3 className="text-primary font-bold text-xl mb-1">{tier.name}</h3>
            <p className="text-gray-500 text-sm">{tier.description}</p>
          </div>

          <TierInfoPanel tier={tier} />

          {tier.examples.length === 0 ? (
            <p className="text-center text-sm text-gray-400 italic py-8">
              Example websites coming soon.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
              {tier.examples.map((site) => (
                <a
                  key={site.url}
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-xl overflow-hidden ring-1 ring-gray-200 hover:ring-accent hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={site.image}
                      alt={site.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm font-semibold text-primary">
                      {site.name}
                    </span>
                    <FaExternalLinkAlt className="h-3.5 w-3.5 text-gray-400 group-hover:text-accent transition-colors" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * SECTION — Ready-made pricing packages (Option D layout)
 * ========================================================================== */
function PricingPackagesSection() {
  return (
    <div className="w-full mb-16">
      <div className="max-w-xl mx-auto text-center mb-8">
        <h4 className="text-3xl text-primary font-bold font-['Poetsen_One']">
          Or Choose a Ready-Made Plan
        </h4>
        <p className="text-lg text-gray-600 mt-4">
          Prefer a straightforward monthly plan instead? Pick the tier that
          matches your business size.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {packages.map((pkg) => {
          const useTwoCols = pkg.features.length > 5;
          return (
            <div
              key={pkg.name}
              className={`relative rounded-2xl p-5 flex flex-col h-full transition-all hover:-translate-y-1
                ${
                  pkg.popular
                    ? "bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-accent shadow-xl shadow-accent/20"
                    : "bg-slate-800 border border-slate-700 hover:bg-slate-700"
                }`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-accent to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  Most Popular
                </span>
              )}

              <pkg.icon className="h-7 w-7 text-accent-light mb-2.5 mt-2" />
              <h3 className="text-white font-bold text-base">{pkg.name}</h3>
              <p className="text-xl font-black text-white mt-1 mb-3">
                ₱{pkg.price}
                <span className="text-xs font-medium text-slate-400">
                  /month
                </span>
              </p>

              <div
                className={`flex-1 gap-x-3 gap-y-1.5 ${
                  useTwoCols ? "grid grid-cols-2" : "flex flex-col gap-2"
                }`}
              >
                {pkg.features.map((f) => (
                  <div key={f} className="flex items-start gap-1.5">
                    <GoCheck className="text-accent-light shrink-0 mt-0.5 h-3.5 w-3.5" />
                    <span className="text-slate-300 text-xs leading-snug">
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
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
                        <h1 className="text-3xl text-primary font-bold mt-2 font-['Poetsen_One'] whitespace-pre-line">
                          {service.subtitle}
                        </h1>

                        <ServiceProblemList problems={service.problems} />

                        <ServiceCtaButtons
                          ctas={service.ctas}
                          onWebsiteAudit={openAudit}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <WebsiteTiersSection />

              <PricingPackagesSection />
            </div>
          </div>
        </div>
      </section>

      <RequestWebsiteAuditModal
        isOpen={auditOpen}
        onOpenChange={onAuditOpenChange}
      />
    </div>
  );
}
