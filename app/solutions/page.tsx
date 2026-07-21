"use client";
import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import WebsiteDevelopment from "@/components/user/website-development/website-development";
import MarketingResearch from "@/components/user/marketing-research/marketing-research";
import Branding from "@/components/user/branding/branding";

type Tab = "website" | "marketing-research" | "branding";

const tabs: { key: Tab; label: string }[] = [
  { key: "website", label: "Website Solutions" },
  { key: "marketing-research", label: "Marketing Research" },
  { key: "branding", label: "Branding" },
];

const ServicesContent = () => {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("website");

  useEffect(() => {
    const tabParam = searchParams.get("tab") as Tab | null;
    if (tabParam && tabs.some((t) => t.key === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  return (
    <div className="pt-20 md:pt-24 min-h-screen bg-gradient-to-br from-slate-900 via-blue-700 to-slate-900">
      {/* Header */}
      <section className="max-w-3xl mx-auto text-center mb-12 px-6">
        <h1 className="text-4xl md:text-5xl text-accent font-bold tracking-tight mb-4 uppercase">
          Services
        </h1>
        {/* <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
          Website Solutions, Marketing Research, and Branding — Everything You
          Need to Power Your Digital Growth.
        </p> */}
      </section>

      {/* Tabs */}
      <div className="flex gap-8 mb-10 justify-center flex-wrap">
        {tabs.map(({ key, label }) => (
          <Button
            key={key}
            onClick={() => setActiveTab(key)}
            variant="ghost"
            className={`relative text-lg font-semibold tracking-wide transition-colors p-5 bg-transparent hover:bg-transparent focus:bg-transparent
              ${activeTab === key ? "text-white" : "text-slate-400 hover:text-slate-200"}`}
          >
            <span className="flex flex-col items-center">
              {label}
              {activeTab === key && (
                <span className="mt-1 h-0.5 w-full bg-gradient-to-r from-blue-400 to-blue-900 transition-all" />
              )}
            </span>
          </Button>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {activeTab === "website" && <WebsiteDevelopment />}
        {activeTab === "marketing-research" && <MarketingResearch />}
        {activeTab === "branding" && <Branding />}
      </div>
    </div>
  );
};

// 👉 Suspense wrapper is required for useSearchParams() in App Router
const Page = () => {
  return (
    <Suspense fallback={null}>
      <ServicesContent />
    </Suspense>
  );
};

export default Page;
