"use client";

import React from "react";
import { Button } from "@heroui/react";
import { ArrowDown, ShieldCheck } from "lucide-react";
import { PORTALS } from "./portal-data";

const HIGHLIGHTS = [
  { value: `${PORTALS.length}`, label: "Industry workspaces" },
  { value: "4+", label: "Role perspectives each" },
  { value: "0", label: "Sign-ups required" },
];

const DashboardPreview = () => (
  <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#11182b] shadow-2xl shadow-black/40">
    {/* window chrome */}
    <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
      <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
      <span className="ml-2 flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        INFINITECH Business Portal
      </span>
      <span className="ml-auto rounded-md border border-white/10 px-2 py-0.5 text-[10px] text-slate-300">
        Owner / Executive
      </span>
    </div>

    {/* body */}
    <div className="flex bg-slate-100">
      {/* sidebar */}
      <div className="hidden w-16 flex-col gap-2 bg-[#0b1120] p-3 sm:flex">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="h-1.5 w-full rounded-full bg-white/10" />
        ))}
      </div>

      {/* main */}
      <div className="flex-1 space-y-3 p-4">
        <div className="space-y-1">
          <p className="text-[10px] font-medium text-sky-600">
            Operations overview
          </p>
          <p className="text-sm font-semibold text-slate-800">Dashboard</p>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 rounded-md bg-white shadow-sm" />
          ))}
        </div>

        <div className="grid grid-cols-[2fr_1fr] gap-1.5">
          <div className="space-y-1.5 rounded-md bg-white p-2.5 shadow-sm">
            <span className="block h-2 w-2/3 rounded-full bg-slate-200" />
            <span className="block h-1.5 w-full rounded-full bg-slate-100" />
            <span className="block h-1.5 w-4/5 rounded-full bg-slate-100" />
          </div>
          <div className="space-y-1.5 rounded-md bg-white p-2.5 shadow-sm">
            <span className="block h-2 w-3/4 rounded-full bg-slate-200" />
            <span className="block h-1.5 w-full rounded-full bg-slate-100" />
          </div>
        </div>

        <div className="space-y-1.5 rounded-md bg-white p-2.5 shadow-sm">
          <span className="block h-2 w-2/5 rounded-full bg-slate-200" />
          <span className="block h-1.5 w-full rounded-full bg-slate-100" />
          <span className="block h-1.5 w-11/12 rounded-full bg-slate-100" />
        </div>
      </div>
    </div>

    {/* footer */}
    <div className="flex items-center justify-between border-t border-white/10 bg-[#0b1120] px-4 py-2 text-[10px] text-slate-400">
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Demo system operational
      </span>
      <span className="text-sky-300">Browser-local fictional data</span>
    </div>
  </div>
);

export const PortalHero = () => {
  const scrollToGrid = () => {
    document
      .getElementById("portal-grid")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-[#0b1120] text-white">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-sky-500/30 to-violet-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-gradient-to-tr from-emerald-500/20 to-transparent blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-4 py-16 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2 text-xs font-medium text-sky-300">
            <ShieldCheck className="h-4 w-4" />
            Interactive, no-signup product demos
          </div>

          <div className="max-w-xl space-y-4">
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              See the admin portal your business would actually run on.
            </h1>
            <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
              Pick an industry, step into a role, and explore a working
              dashboard built around that team&apos;s day-to-day &mdash; leads,
              jobs, orders, bookings, or projects, all wired up with sample data
              you can click through.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button
              as="a"
              href="#portal-grid"
              color="primary"
              endContent={<ArrowDown className="h-4 w-4" />}
              onPress={scrollToGrid}
            >
              Browse the portals
            </Button>
            <p className="text-xs text-slate-400">
              Every workspace below is a live, clickable sample.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6 sm:max-w-md">
            {HIGHLIGHTS.map((h) => (
              <div key={h.label}>
                <p className="text-xl font-semibold">{h.value}</p>
                <p className="text-xs text-slate-400">{h.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
};
