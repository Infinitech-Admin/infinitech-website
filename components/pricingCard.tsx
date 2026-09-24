"use client";

import type React from "react";
import { Check } from "lucide-react";
import { useMediaQuery } from "react-responsive";
import {
  type Currency,
  convertPrice,
  formatPrice,
  currencySymbol,
} from "@/lib/currency";

interface Plan {
  name: string;
  description?: string;
  popular: boolean;
  features: string[];
  cta: string;
  badge?: string;
  monthlyPrice?: number; // PHP
  yearlyPrice?: number; // PHP
  usdMonthlyPrice?: number; // optional fixed USD price (overrides conversion)
  usdYearlyPrice?: number; // optional fixed USD price (overrides conversion)
}

interface PricingCardProps {
  plan: Plan;
  billingPeriod: "monthly" | "yearly" | "piece";
  currency: Currency;
  /** Current USD->PHP rate to convert with. Defaults to the fixed fallback rate. */
  rate?: number;
  onAddToCart?: () => void;
  isHovered?: boolean;
  isSmall?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  billingPeriod,
  currency,
  rate,
  onAddToCart,
  isHovered = false,
  isSmall = false,
}) => {
  const getPrice = () => {
    const isYearly = billingPeriod === "yearly";
    const phpAmount = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    const usdOverride = isYearly ? plan.usdYearlyPrice : plan.usdMonthlyPrice;
    return convertPrice(phpAmount, usdOverride, currency, rate);
  };

  const price = getPrice();
  const symbol = currencySymbol(currency);
  const formattedPrice = formatPrice(price, currency);

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
          ${
            plan.popular
              ? "bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-500"
              : "bg-slate-800/50 border border-slate-700"
          }
        w-12 h-[50vh] flex items-center justify-center`}
      >
        <div className="transform -rotate-90 whitespace-nowrap text-center flex items-center gap-3">
          <h3 className="font-bold text-white text-xl">{plan.name}</h3>
          <div className="flex items-baseline gap-0.5">
            <span className="font-semibold text-white text-lg">{symbol}</span>
            <span className="font-medium text-white text-xl">
              {formattedPrice}
            </span>
          </div>
          <span className="text-slate-300 font-medium text-sm">
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
          className={`relative rounded-2xl transition-all duration-500 ease-in-out cursor-pointer ${
            isHovered
              ? "z-20 shadow-2xl shadow-cyan-500/20 scale-105 w-[85vw] max-w-sm md:w-[26rem] md:mx-5"
              : "w-[85vw] max-w-sm md:w-[26rem]"
          } ${
            plan.popular
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

          <div className="p-6 transition-all duration-500 flex flex-col">
            {/* Plan Header */}
            <div className="mb-4">
              <h3
                className={`font-bold text-white transition-all duration-500 ${isHovered ? "text-2xl mb-2" : "text-3xl mb-1"}`}
              >
                {plan.name}
              </h3>
              {plan.badge && (
                <p className="text-slate-300 text-sm leading-snug">
                  {plan.badge}
                </p>
              )}
            </div>

            {/* Features Section */}
            <div className="mb-4 flex-1">
              <h4 className="font-semibold text-white mb-3 text-base">
                What's included:
              </h4>
              <div
                className={`transition-all duration-500 ${isHovered ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 gap-2.5"}`}
              >
                {(isHovered ? plan.features : plan.features.slice(0, 8)).map(
                  (feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <Check
                        className={`flex-shrink-0 mt-0.5 w-4 h-4 ${
                          plan.popular ? "text-cyan-400" : "text-slate-400"
                        }`}
                      />
                      <span className="text-slate-100 text-sm leading-relaxed">
                        {feature}
                      </span>
                    </div>
                  ),
                )}
                {!isHovered && plan.features.length > 8 && (
                  <span className="text-slate-400 text-sm italic pl-6">
                    +{plan.features.length - 8} more
                  </span>
                )}
              </div>
            </div>

            {/* Price & Button (MOBILE) */}
            <div className="flex items-end justify-between gap-3 pt-4 border-t border-slate-700 mt-auto">
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1 mb-1">
                  <span
                    className={`font-black text-white transition-all duration-500 ${isHovered ? "text-2xl" : "text-xl"}`}
                  >
                    {symbol}
                  </span>
                  <span
                    className={`font-black text-white transition-all duration-500 ${isHovered ? "text-3xl" : "text-2xl"}`}
                  >
                    {formattedPrice}
                  </span>
                </div>
                <span className="text-slate-300 font-medium text-sm block truncate">
                  {getBillingText()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDesktopOrLaptop && (
        <div
          className={`relative rounded-2xl transition-all duration-300 h-full flex flex-col ${
            plan.popular
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

          <div className="p-6 flex flex-col h-full">
            {/* Plan Header */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
              {plan.badge && (
                <p className="text-slate-300 text-sm leading-snug">
                  {plan.badge}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="mb-5 pb-5 border-b border-slate-700">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">{symbol}</span>
                <span className="text-3xl font-black text-white">
                  {formattedPrice}
                </span>
                <span className="text-slate-300 font-medium text-sm ml-1">
                  {getBillingText()}
                </span>
              </div>
            </div>

            {/* Features List - single column, full width for readability */}
            <div className="flex flex-col gap-2.5 flex-1">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <Check
                    className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.popular ? "text-cyan-400" : "text-slate-400"}`}
                  />
                  <span className="text-slate-100 text-sm leading-relaxed">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PricingCard;
