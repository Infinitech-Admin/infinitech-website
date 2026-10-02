"use client";

import React from "react";
import { LuBriefcaseBusiness, LuFolderCheck } from "react-icons/lu";

const glass = "border border-white/10 bg-white/[0.04] backdrop-blur-md";

const stats = [
  { icon: LuBriefcaseBusiness, v: "2 years", l: "Driving growth" },
  { icon: LuFolderCheck, v: "20+", l: "Projects completed" },
];

const Hero = () => {
  return (
    <div className="grid items-center gap-14 pb-12 pt-28 lg:grid-cols-2">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#f5a623]/30 bg-[#f5a623]/10 px-3 py-1 font-mono text-xs text-[#f5a623]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f5a623]" />
          ABOUT US
        </span>
        <h1 className="mt-5 font-['Poetsen_One'] text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-[3.2rem]">
          Building the right growth system
        </h1>
        <p className="mt-5 max-w-xl text-[#8a97bd]">
          We are aiming to build the right growth system through web and mobile
          app development, strategic content planning, high-quality content
          creation, data-driven analytical reports, and continuous
          optimization—helping your business achieve sustainable growth and
          long-term success.
        </p>

        <div
          className={`${glass} mt-8 grid max-w-xl grid-cols-2 divide-x divide-white/10 rounded-2xl`}
        >
          {stats.map((s) => (
            <div key={s.l} className="flex flex-col gap-2 px-5 py-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#38bdf8]/10 text-[#38bdf8] shadow-[0_0_24px_rgba(56,189,248,0.25)]">
                <s.icon size={20} />
              </span>
              <p className="font-mono text-2xl font-bold text-[#f5a623] sm:text-3xl">
                {s.v}
              </p>
              <p className="text-sm text-[#b8c3e6]">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-xl">
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/about.jpg"
            alt="Infinitech Advertising Corporation team"
            className="h-auto w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
