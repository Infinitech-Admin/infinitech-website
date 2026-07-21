"use client";
import { useState } from "react";
import { useDisclosure } from "@heroui/react";
import { MdOutlineSpeed } from "react-icons/md";
import {
  FaMobileAlt,
  FaEye,
  FaSlidersH,
  FaExternalLinkAlt,
} from "react-icons/fa";
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
  image: string; // full image URL (online placeholder for now, or your own hosted screenshot)
}

interface Tier {
  key: string;
  name: string;
  description: string;
  examples: ExampleSite[];
}

/* ============================================================================
 * DATA — Website Development
 * ========================================================================== */
const services = [
  {
    title: "WEBSITE DEVELOPMENT",
    subtitle: "Why is your website losing you money instead of making it?",
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
 * Placeholder images are used below (via placehold.co) just so cards render
 * with something visible. Swap `image` for your real screenshot URL (or a
 * hosted path like /images/services/websites/your-file.jpg) and `url` for
 * the live site link whenever you're ready.
 * ========================================================================== */
const websiteTiers: Tier[] = [
  {
    key: "standard",
    name: "Standard",
    description: "A clean, professional site to establish your presence.",
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

      //   {
      //     name: "Lumè Bean & Bar",
      //     url: "https://lume-bean-bar.vercel.app/",
      //     image: "/websites/lumebeanbar.png",
      //   },
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
    examples: [
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
    examples: [
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
      //   {
      //     name: "Eurotel Hotel Management System",
      //     url: "https://eurotel-makati.vercel.app",
      //     image: "/websites/eurotel.png",
      //   },
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
    examples: [
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
          Choose the Right Fit for Your Business
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
                        <h1 className="text-3xl text-primary font-bold mt-2 font-['Poetsen_One']">
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
