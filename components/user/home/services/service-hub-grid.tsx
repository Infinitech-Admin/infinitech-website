"use client";
import React from "react";
import {
  FaGlobe,
  FaSearchDollar,
  FaHashtag,
  FaStore,
  FaCamera,
  FaPalette,
  FaSearch,
  FaAddressCard,
  FaBullhorn,
  FaCode,
  FaChartLine,
  FaShoppingBag,
  FaVideo,
  FaPaintBrush,
  FaMapMarkerAlt,
  FaWifi,
  FaAd,
} from "react-icons/fa";
import { LuArrowRight } from "react-icons/lu";

/* ============================================================================
 * Hub items — one card per service. `tab` + `service` tell the parent which
 * panel to show, using the SAME values your Services page already uses:
 *   tab     -> "Website Solutions" | "Marketing Research" | "Branding"
 *   service -> a brandingServices[].name (only for tab === "Branding")
 * ========================================================================== */

export interface HubItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  ghost: React.ComponentType<{ className?: string }>; // faint background art
  tab: "Website Solutions" | "Marketing Research" | "Branding";
  service?: string;
}

export const hubItems: HubItem[] = [
  {
    id: "website",
    title: "Website Development",
    description:
      "Fast, responsive websites that represent your brand and turn visitors into customers.",
    icon: FaGlobe,
    ghost: FaCode,
    tab: "Website Solutions",
  },
  {
    id: "research",
    title: "Market Research",
    description:
      "Data-backed reports on your market, competitors, and audience.",
    icon: FaSearchDollar,
    ghost: FaChartLine,
    tab: "Marketing Research",
  },
  {
    id: "seo",
    title: "SEO (Search Engine Optimization)",
    description:
      "Rank higher on Google, attract the right audience, and get found by nearby customers.",
    icon: FaSearch,
    ghost: FaMapMarkerAlt,
    tab: "Branding",
    service: "SEO",
  },
  {
    id: "social",
    title: "Social Media Management",
    description:
      "Consistent content, real engagement, and monthly performance reports.",
    icon: FaHashtag,
    ghost: FaBullhorn,
    tab: "Branding",
    service: "Social Media Management",
  },
  {
    id: "tiktok",
    title: "TikTok Shop Opening",
    description:
      "We set up your shop, optimize your listings, and get you selling fast.",
    icon: FaStore,
    ghost: FaShoppingBag,
    tab: "Branding",
    service: "TikTok Shop Opening",
  },
  {
    id: "ads",
    title: "Paid Ads",
    description:
      "Put your brand in front of the right people and track every peso spent.",
    icon: FaBullhorn,
    ghost: FaAd,
    tab: "Branding",
    service: "Paid Ads",
  },
  {
    id: "photo",
    title: "Photography & Videography",
    description:
      "High-quality visuals that tell your story and showcase your brand at its best.",
    icon: FaCamera,
    ghost: FaVideo,
    tab: "Branding",
    service: "Photography & Videography",
  },
  {
    id: "graphic",
    title: "Graphic Design",
    description:
      "Logos, marketing collateral, and digital assets that make a lasting impression.",
    icon: FaPalette,
    ghost: FaPaintBrush,
    tab: "Branding",
    service: "Graphic Design",
  },
  {
    id: "juantap",
    title: "JuanTap NFC Business Card",
    description:
      "The smarter way to connect. Share your details instantly with just a tap.",
    icon: FaAddressCard,
    ghost: FaWifi,
    tab: "Branding",
    service: "JuanTap",
  },
];

/* ============================================================================
 * ServiceHubGrid
 * ========================================================================== */

export default function ServiceHubGrid({
  activeId,
  onSelect,
}: {
  activeId: string | null;
  onSelect: (item: HubItem) => void;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl p-5 sm:p-8 lg:p-10"
      style={{
        background:
          "radial-gradient(120% 90% at 0% 0%, #16306b 0%, #0d1b3e 55%, #081229 100%)",
        boxShadow: "0 20px 60px rgba(13,27,62,0.35)",
      }}
    >
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <span className="text-[11px] font-bold tracking-[0.25em] text-cyan-300">
              WHAT WE OFFER
            </span>
            <span className="h-px w-10 bg-cyan-300/60" />
          </div>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Our <span style={{ color: "#f5a623" }}>Services</span>
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-slate-300 md:text-right">
          From beautiful websites to powerful marketing campaigns, we offer a
          full range of digital services to bring your ideas to life.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {hubItems.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              aria-pressed={isActive}
              className={`group relative flex min-h-[200px] flex-col overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5a623] ${
                isActive
                  ? "border border-[#f5a623] bg-white/[0.08] shadow-[0_0_0_1px_#f5a623,0_10px_40px_rgba(245,166,35,0.18)]"
                  : "border border-white/10 bg-white/[0.04] hover:-translate-y-0.5 hover:border-[#f5a623]/60 hover:bg-white/[0.07]"
              }`}
            >
              {/* Faint background illustration — hidden on small screens */}
              <item.ghost className="pointer-events-none absolute -right-4 -top-2 hidden h-28 w-28 text-cyan-200/[0.07] transition-opacity duration-300 group-hover:text-cyan-200/[0.12] sm:block" />

              {/* Icon tile */}
              <div
                className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl border"
                style={{
                  backgroundColor: "rgba(245,166,35,0.12)",
                  borderColor: "rgba(245,166,35,0.35)",
                }}
              >
                <item.icon className="h-5 w-5 text-[#f5a623]" />
              </div>

              <h3 className="relative mb-1.5 text-base font-semibold leading-snug text-white">
                {item.title}
              </h3>
              <p className="relative max-w-[26ch] text-[13px] leading-relaxed text-slate-300 sm:max-w-none">
                {item.description}
              </p>

              {/* Arrow */}
              <span
                className={`relative mt-auto flex h-8 w-8 items-center justify-center self-start rounded-full border transition-all duration-300 ${
                  isActive
                    ? "border-[#f5a623] bg-[#f5a623] text-[#0d1b3e]"
                    : "border-cyan-300/50 text-cyan-200 group-hover:border-[#f5a623] group-hover:bg-[#f5a623] group-hover:text-[#0d1b3e]"
                }`}
                style={{ marginTop: "auto" }}
              >
                <LuArrowRight size={15} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
