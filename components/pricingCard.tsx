"use client";

import type React from "react";
import { Check, ShoppingCart, Plus } from "lucide-react";
import { useMediaQuery } from "react-responsive";

interface Plan {
  name: string;
  description?: string;
  popular: boolean;
  features: string[];
  cta: string;
  badge?: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
}

interface PricingCardProps {
  plan: Plan;
  billingPeriod: "monthly" | "yearly" | "piece";
  onAddToCart?: () => void;
  isHovered?: boolean;
  isSmall?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  billingPeriod,
  onAddToCart,
  isHovered = false,
  isSmall = false,
}) => {
  const getPrice = () => {
    if (billingPeriod === "yearly") {
      return plan.yearlyPrice || 0;
    }
    return plan.monthlyPrice || 0;
  };

  const price = getPrice();

  const getBillingText = () => {
    if (billingPeriod === "piece") return "/piece";
    return billingPeriod === "yearly" ? "/year" : "/month";
  };

  const isDesktopOrLaptop = useMediaQuery({
    query: "(min-width: 1000px)",
  });
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 999px)" });

  // Collapsed state - show only title and price vertically (when another card is clicked)
  if (isSmall) {
    return (
      <div
        className={`relative rounded-2xl transition-all duration-500 ease-in-out
          ${plan.popular
            ? "bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-500"
            : "bg-slate-800/50 border border-slate-700"}
        w-10 h-[50vh] flex items-center justify-center`}
      >
        <div className="transform -rotate-90 whitespace-nowrap text-center flex items-center gap-2">
          <h3 className="font-bold text-white text-xl md:text-base">
            {plan.name}
          </h3>
          <div className="flex items-baseline gap-0.5">
            <span className="font-semibold text-white text-lg">₱</span>
            <span className="font-medium text-white text-xl">
              {price.toLocaleString("en-PH", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
          <span className="text-slate-400 font-medium text-xs">
            {getBillingText()}
          </span>
        </div>
      </div>
    );
  }

  // Default/Normal state - show full card details
  return (
    <>
      {isTabletOrMobile && (
        <div
          className={`relative rounded-2xl transition-all duration-500 ease-in-out cursor-pointer ${isHovered
              ? "z-20 shadow-2xl shadow-cyan-500/20 scale-105 w-[30vh] md:w-[40vh] md:mx-5"
              : "w-[40vh]"
            } ${plan.popular
              ? "bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/40"
              : "bg-slate-800/50 border border-slate-700 hover:bg-slate-800/70 hover:shadow-lg"
            }`}
        >
          {plan.popular && (
            <div className="absolute -top-3 left-6 z-20">
              <span className="inline-block px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold rounded-full">
                Most Popular
              </span>
            </div>
          )}

          <div
            className={`p-5 lg:p-6 transition-all duration-500 flex flex-col ${isHovered ? "" : ""}`}
          >
            {/* Plan Header */}
            <div className="mb-4">
              <h3
                className={`font-bold text-white transition-all duration-500 ${isHovered ? "text-2xl mb-2" : "text-3xl mb-1"}`}
              >
                {plan.name}
              </h3>
              {plan.badge && (
                <p
                  className={`text-slate-400 transition-all duration-500 ${isHovered ? "text-xs" : "text-xs"}`}
                >
                  {plan.badge}
                </p>
              )}
            </div>

            {/* Features Section */}
            <div className="mb-4 flex-1">
              <h4
                className={`font-semibold text-white mb-3 transition-all duration-500 ${isHovered ? "text-md" : "text-md"}`}
              >
                What's included:
              </h4>
              <div
                className={`transition-all duration-500 ${isHovered ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 gap-1"}`}
              >
                {(isHovered ? plan.features : plan.features.slice(0, 8)).map(
                  (feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check
                        className={`flex-shrink-0 transition-all duration-500 ${plan.popular ? "text-cyan-400" : "text-slate-400"
                          } ${isHovered ? "w-5 h-5 mt-0.5" : "w-3 h-3 mt-0.5"}`}
                      />
                      <span
                        className={`text-slate-200 transition-all duration-500 ${isHovered ? "text-sm" : "text-sm"}`}
                      >
                        {feature}
                      </span>
                    </div>
                  )
                )}
                {!isHovered && plan.features.length > 8 && (
                  <span className="text-slate-400 text-xs italic">
                    +{plan.features.length - 8} more
                  </span>
                )}
              </div>
            </div>

            {/* Price & Button */}
            <div className="flex items-end justify-between gap-3 pt-4 border-t border-slate-700 mt-auto">
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1 mb-1">
                  <span
                    className={`font-black text-white transition-all duration-500 ${isHovered ? "text-2xl" : "text-xl"}`}
                  >
                    ₱
                  </span>
                  <span
                    className={`font-black text-white transition-all duration-500 ${isHovered ? "text-3xl" : "text-2xl"}`}
                  >
                    {price.toLocaleString("en-PH", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <span className="text-slate-400 font-medium text-sm block truncate">
                  {getBillingText()}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart?.();
                }}
                className={`p-2.5 rounded-xl transition-all duration-300 flex-shrink-0 ${plan.popular
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-xl"
                    : "bg-slate-700 text-white hover:bg-slate-600 border border-slate-600"
                  }`}
                title="Add to cart"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {isDesktopOrLaptop && (
        <div
          className={`relative rounded-2xl transition-all duration-300 ${plan.popular
              ? "bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/20"
              : "bg-slate-800/50 border border-slate-700 hover:bg-slate-800/70"
            }`}
        >
          {/* Popular Badge */}
          {plan.popular && (
            <div className="absolute -top-3 left-6">
              <span className="inline-block px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold rounded-full">
                Most Popular
              </span>
            </div>
          )}

          <div className="p-5 flex flex-row gap-6">
            {/* Left: Plan Info & Features */}
            <div className="flex-1 min-w-0">
              {/* Plan Header */}
              <div className="mb-3">
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                {plan.badge && (
                  <p className="text-xs text-slate-400">{plan.badge}</p>
                )}
              </div>

              {/* Features List - Two columns */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check
                      className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${plan.popular ? "text-cyan-400" : "text-slate-400"}`}
                    />
                    <span className="text-slate-300 text-xs leading-relaxed">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Price & Cart Button */}
            <div className="flex flex-col items-end justify-between shrink-0">
              {/* Price */}
              <div className="text-right">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-black text-white">₱</span>
                  <span className="text-2xl font-black text-white">
                    {price.toLocaleString("en-PH", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <span className="text-slate-400 font-medium text-xs">
                  {getBillingText()}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart?.();
                }}
                className={`p-2.5 rounded-xl transition-all duration-300 flex-shrink-0 ${plan.popular
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-xl"
                    : "bg-slate-700 text-white hover:bg-slate-600 border border-slate-600"
                  }`}
                title="Add to cart"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PricingCard;
