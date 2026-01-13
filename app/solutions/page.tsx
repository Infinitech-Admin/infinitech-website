"use client"
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import Solutions from "@/components/user/solutions/solutions"
import Services from "@/components/user/services/services"

type Tab = "services" | "solutions"

const Page = () => {
  const [activeTab, setActiveTab] = useState<Tab>("services")
  return (
    <div className=" pt-20 md:pt-24 min-h-screen bg-gradient-to-br from-slate-900 via-blue-700 to-slate-900">
      {/* Header */}
      <section className="max-w-3xl mx-auto text-center mb-12 px-6">
        <h1 className="text-4xl md:text-5xl text-accent font-bold tracking-tight mb-4 uppercase">Services & Solutions</h1>
        <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
          Explore our tailored services designed to elevate your brand, and discover innovative solutions that solve complex challenges. Whether
          you’re building, scaling, or refining, we bring clarity and creativity to every step.
        </p>
      </section>

      {/* Tabs */}
      <div className="flex gap-8 mb-10 justify-center">
        {["services", "solutions"].map((tab) => (
          <Button
            key={tab}
            onClick={() => setActiveTab(tab as Tab)}
            variant="ghost"
            className={`relative text-lg font-semibold tracking-wide transition-colors p-5 bg-transparent hover:bg-transparent focus:bg-transparent
              ${activeTab === tab ? "text-white" : "text-slate-400 hover:text-slate-200"}`}
          >
            <span className="flex flex-col items-center">
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && <span className="mt-1 h-0.5 w-full bg-gradient-to-r from-blue-400 to-blue-900 transition-all" />}
            </span>
          </Button>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {activeTab === "services" && <Services />}
        {activeTab === "solutions" && <Solutions />}
      </div>
    </div>
  )
}

export default Page
