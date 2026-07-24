"use client";

import React, { useState } from "react";
import TestimonialForm from "@/components/testimonials/TestimonialForm";
import RequestWebsiteAuditInline from "@/components/RequestWebsiteAuditInline";

type FormTab = "audit" | "testimonial";

const formTabs: { key: FormTab; label: string }[] = [
  { key: "audit", label: "Get a Free Website Audit" },
  { key: "testimonial", label: "Tell Us About Your Challenge" },
];

const Testimonials = () => {
  const [activeTab, setActiveTab] = useState<FormTab>("audit");

  return (
    <section className="bg-slate-50">
      <div className="container mx-auto py-16 lg:py-24 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Toggle navigation */}
          <div className="flex justify-center gap-2 mb-8">
            {formTabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300
                    ${
                      isActive
                        ? "bg-[#0d1b3e] text-white shadow-md"
                        : "bg-white text-gray-500 ring-1 ring-gray-200 hover:bg-gray-50"
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Active form only */}
          <div
            key={activeTab}
            className="animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            {activeTab === "audit" && <RequestWebsiteAuditInline />}
            {activeTab === "testimonial" && (
              <TestimonialForm onSubmitted={() => {}} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
