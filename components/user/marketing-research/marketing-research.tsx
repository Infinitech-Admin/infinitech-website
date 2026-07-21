"use client";
import { Button, useDisclosure } from "@heroui/react";
import RequestReportModal from "@/components/RequestReportModal";
import { LuArrowRight } from "react-icons/lu";
import {
  FaShieldAlt,
  FaBullseye,
  FaChartLine,
  FaLightbulb,
  FaMoneyBillWave,
  FaClock,
  FaSearchDollar,
} from "react-icons/fa";

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
 * COMPONENT — Illustration
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

/* ============================================================================
 * SECTION: Market Research
 * ========================================================================== */
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
 * MAIN COMPONENT
 * ========================================================================== */
export default function MarketingResearch() {
  const {
    isOpen: reportOpen,
    onOpen: openReport,
    onOpenChange: onReportOpenChange,
  } = useDisclosure();

  return (
    <div className="w-full bg-white flex flex-col justify-center items-center">
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 bg-white">
        <MarketResearchSection onRequestReport={openReport} />
      </section>

      <RequestReportModal
        isOpen={reportOpen}
        onOpenChange={onReportOpenChange}
      />
    </div>
  );
}
