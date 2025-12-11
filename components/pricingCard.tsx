"use client"

import type React from "react"
import { Check, ShoppingCart, Plus, X } from "lucide-react"

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
  billingPeriod: "monthly" | "yearly" | "piece"
  price: number
  currency?: string
  onAddToCart?: () => void
  isInCart?: boolean
  isExpanded?: boolean
  isOtherExpanded?: boolean
  onExpandChange?: (expanded: boolean) => void
}

const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  billingPeriod,
  price,
  currency = "$",
  onAddToCart,
  isInCart,
  isExpanded = false,
  isOtherExpanded = false,
  onExpandChange,
}) => {
  const getBillingText = () => {
    if (billingPeriod === "piece") return "per piece"
    return billingPeriod === "yearly" ? "/year" : "/month"
  }

  return (
    <>
      {/* Normal Card */}
      <div
        onMouseEnter={() => onExpandChange?.(true)}
        className={`relative rounded-2xl transition-all duration-500 ease-in-out ${
          isExpanded ? "opacity-0 invisible" : ""
        } ${
          isOtherExpanded ? "opacity-0 scale-75 pointer-events-none" : "opacity-100"
        } ${
          plan.popular
            ? "bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/20"
            : "bg-slate-800/50 border border-slate-700 hover:bg-slate-800/70"
        }`}
      >
        {/* Popular Badge */}
        {plan.popular && (
          <div className="absolute -top-3 left-6 z-20">
            <span className="inline-block px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold rounded-full">
              Most Popular
            </span>
          </div>
        )}

        <div className="p-5">
          <div className="flex flex-row gap-6">
            {/* Left: Plan Info & Features */}
            <div className="flex-1 min-w-0">
              {/* Plan Header */}
              <div className="mb-3">
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                {plan.badge && <p className="text-xs text-slate-400">{plan.badge}</p>}
              </div>

              {/* Features List - Two columns */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {plan.features.slice(0, 6).map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check
                      className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${plan.popular ? "text-cyan-400" : "text-slate-400"}`}
                    />
                    <span className="text-slate-300 text-xs leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
              {plan.features.length > 6 && (
                <p className="text-cyan-400 text-xs mt-2 font-medium">
                  +{plan.features.length - 6} more features...
                </p>
              )}
            </div>

            {/* Right: Price & Cart Button */}
            <div className="flex flex-col items-end justify-between shrink-0">
              {/* Price */}
              <div className="text-right">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-black text-white">{currency}</span>
                  <span className="text-2xl font-black text-white">
                    {price.toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                </div>
                <span className="text-slate-400 font-medium text-xs">
                  {getBillingText()}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onAddToCart?.()
                }}
                className={`relative p-3 rounded-xl transition-all duration-300 ${
                  isInCart
                    ? "bg-green-500 text-white"
                    : plan.popular
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-xl"
                      : "bg-slate-700 text-white hover:bg-slate-600 border border-slate-600"
                }`}
                title={isInCart ? "Added to cart" : "Add to cart"}
              >
                <ShoppingCart className="w-5 h-5" />
                {!isInCart && <Plus className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full p-0.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Card - Centered Modal */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
          onMouseLeave={() => onExpandChange?.(false)}
        >
          <div
            className={`relative w-full max-w-5xl rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300 ${
              plan.popular
                ? "bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-500 shadow-cyan-500/30"
                : "bg-slate-800 border-2 border-slate-700"
            }`}
          >
            {/* Close Button */}
            <button
              onClick={() => onExpandChange?.(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-colors z-30"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-4 left-8">
                <span className="inline-block px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-bold rounded-full shadow-lg">
                  Most Popular
                </span>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-8">
              {/* Left: Plan Details */}
              <div className="flex-1">
                <div className="mb-6">
                  <h2 className="text-4xl font-bold text-white mb-2">{plan.name}</h2>
                  {plan.badge && <p className="text-sm text-slate-400">{plan.badge}</p>}
                </div>

                {/* Features List - Two column grid */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white mb-4">What's Included:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check
                          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${plan.popular ? "text-cyan-400" : "text-slate-400"}`}
                        />
                        <span className="text-slate-200 text-base leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Price & Action */}
              <div className="md:w-80 flex flex-col items-center justify-center text-center space-y-6 shrink-0">
                {/* Price Display */}
                <div>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-4xl font-black text-white">{currency}</span>
                    <span className="text-6xl font-black text-white">
                      {price.toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <span className="text-slate-400 font-medium text-lg">
                    {getBillingText()}
                  </span>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onAddToCart?.()
                  }}
                  className={`w-full py-4 px-8 rounded-xl transition-all duration-300 font-bold text-lg flex items-center justify-center gap-3 ${
                    isInCart
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : plan.popular
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-xl"
                        : "bg-slate-700 text-white hover:bg-slate-600 border-2 border-slate-600"
                  }`}
                >
                  <ShoppingCart className="w-6 h-6" />
                  {isInCart ? "Added to Cart" : "Add to Cart"}
                </button>

                <p className="text-slate-400 text-sm">
                  {isInCart ? "Item is in your cart" : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PricingCard
