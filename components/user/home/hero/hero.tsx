"use client";

import Left from "./left";
import Right from "./right";
import TechMarquee from "./tech-marquee";
import { LuCode, LuMegaphone, LuPenTool, LuPlay } from "react-icons/lu";

const Hero = () => {
  return (
    <section
      className="relative w-full overflow-x-hidden"
      style={{ backgroundColor: "#0f1a3d" }}
    >
      {/* Blueprint / schematic dot-grid background — subtle, technical feel.
          Pure CSS radial-gradient dots, no images/libs needed. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Soft glow blobs — slow, ambient movement behind the content */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full blur-3xl opacity-20 animate-[float_10s_ease-in-out_infinite]"
        style={{ backgroundColor: "#f5a623" }}
      />
      <div
        className="pointer-events-none absolute top-1/3 -left-32 h-80 w-80 rounded-full blur-3xl opacity-10 animate-[float_14s_ease-in-out_infinite_reverse]"
        style={{ backgroundColor: "#38bdf8" }}
      />

      <div className="container mx-auto w-full max-w-full pt-5 px-4 relative">
        <div className="flex flex-col py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8">
            <div className="relative min-w-0">
              <Left />
            </div>
            <div className="min-w-0">
              <Right />
            </div>
          </div>

          {/* Full-width feature strip */}

          {/* Tech stack marquee — signals "dev company" at a glance */}
          <TechMarquee />
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-20px, 20px);
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
