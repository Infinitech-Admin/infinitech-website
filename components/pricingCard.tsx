"use client"

import type React from "react"
import { Check } from "lucide-react"

interface Plan {
  name: string
  description?: string
  popular: boolean
  features: string[]
  cta: string
  badge?: string
  monthlyPrice?: number
  yearlyPrice?: number
}

interface PricingCardProps {
  plan: Plan
  billingPeriod: "monthly" | "yearly"
  price: number
  currency?: string
  onCtaClick?: () => void
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, billingPeriod, price, currency = "$", onCtaClick }) => {
  return (
    <div
      className={`relative rounded-2xl transition-all duration-300 h-full ${
        plan.popular
          ? "md:scale-105 bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/20"
          : "bg-slate-800/50 border border-slate-700 hover:bg-slate-800/70"
      }`}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-block px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-bold rounded-full">
            Most Popular
          </span>
        </div>
      )}

      <div className="p-6 flex flex-col h-full">
        {/* Plan Header */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
          {plan.badge && <p className="text-xs text-slate-400 mb-4">{plan.badge}</p>}

          {/* Price */}
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-black text-white">{currency}</span>
            <span className="text-4xl font-black text-white">
              {price.toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="text-slate-400 font-semibold text-sm">
              /{billingPeriod === "yearly" ? "year" : "month"}
            </span>
          </div>
        </div>

        {/* CTA Button */}
        {/* <button
          onClick={onCtaClick}
          className={`w-full py-2.5 px-4 rounded-lg font-bold text-sm mb-6 transition-all duration-300 ${
            plan.popular
              ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-xl"
              : "bg-slate-700 text-white hover:bg-slate-600 border border-slate-600"
          }`}
        >
          {plan.cta}
        </button> */}

        {/* Features List */}
        <div className="space-y-3 flex-1">
          {plan.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2.5">
              <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.popular ? "text-cyan-400" : "text-slate-400"}`} />
              <span className="text-slate-300 text-xs leading-relaxed">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PricingCard
