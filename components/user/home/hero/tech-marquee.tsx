"use client";

import React from "react";
import {
  LuRocket,
  LuHeadset,
  LuBadgeCheck,
  LuClock,
  LuShieldCheck,
  LuThumbsUp,
} from "react-icons/lu";

const highlights = [
  { icon: LuRocket, label: "Fast Turnaround" },
  { icon: LuBadgeCheck, label: "Free Consultation" },
  { icon: LuHeadset, label: "24/7 Support" },
  { icon: LuClock, label: "On-Time Delivery" },
  { icon: LuShieldCheck, label: "Secure & Reliable" },
  { icon: LuThumbsUp, label: "100% Satisfaction" },
];

// Duplicated once so the CSS marquee loops seamlessly.
const loopHighlights = [...highlights, ...highlights];

const TechMarquee = () => {
  return (
    <div className="mt-8 pt-6 border-t border-white/10 overflow-hidden">
      <div className="relative w-full overflow-hidden">
        <div className="flex gap-10 w-max animate-[marquee_22s_linear_infinite]">
          {loopHighlights.map((item, i) => (
            <div
              key={`${item.label}-${i}`}
              className="flex items-center gap-2 shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            >
              <item.icon className="text-accent-light" size={20} />
              <span className="text-sm text-gray-300 whitespace-nowrap">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};

export default TechMarquee;
