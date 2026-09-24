"use client";

import { useState } from "react";
import PricingCard from "@/components/pricingCard";
import ToggleSwitch from "@/components/ToggleSwitch";
import { X, ShoppingCart, Mail, Loader2, Phone } from "lucide-react";
import { useMediaQuery } from "react-responsive";
import Link from "next/link";
import {
  type Currency,
  convertPrice,
  formatPrice,
  currencySymbol,
} from "@/lib/currency";

interface CartItem {
  planName: string;
  service: string;
  price: number;
  currency: Currency;
  billingPeriod: "monthly" | "yearly" | "piece";
}

const PricingPage = () => {
  const [activeService, setActiveService] = useState("website");
  const [billingPeriod, setBillingPeriod] = useState<
    "monthly" | "yearly" | "piece"
  >("monthly");
  const [currency, setCurrency] = useState<Currency>("PHP");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clientEmail, setClientEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(
    null,
  );

  const services = {
    website: {
      title: "Website / Web App With Mobile App",
      description:
        "Professional website solutions with mobile app and advanced features",
      plans: [
        {
          name: "Standard",
          monthlyPrice: 4643.5, // 55,722 ÷ 12
          yearlyPrice: 55722, // 888 × 62.75
          usdMonthlyPrice: 74, // 888 ÷ 12
          usdYearlyPrice: 888,
          features: [
            "Up to 5 pages",
            "Social Media Links integration",
            "Simple Contact Form",
            "Email Alerts for Form Inquiries",
            "1-Year Domain and Hosting",
          ],
          popular: false,
          cta: "Get Started",
        },
        {
          name: "Premium",
          monthlyPrice: 9999,
          yearlyPrice: 119988,
          features: [
            "Everything in Standard, plus:",
            "Up to 10 Website Pages",
            "Dashboard Login for Clients",
            "Traffic Insights & Analytics",
            "Enhanced Site Customization",
            "Smart Chat System",
            "Design Upgrade",
          ],
          popular: true,
          cta: "Choose Plan",
        },
        {
          name: "Business",
          monthlyPrice: 14999,
          yearlyPrice: 179988,
          features: [
            "SEO Pro Setup +",
            "Dashboard Reports",
            "eCommerce - Ready Products Catalog",
            "Admin Staff & Client Management",
            "Upgraded Motion & Animation Website",
            "Lead Form With Dashboard Tracking",
            "Video Testimonials Section",
          ],
          popular: false,
          cta: "Contact Sales",
        },
        {
          name: "Commerce",
          monthlyPrice: 21999,
          yearlyPrice: 263988,
          features: [
            "Advanced Conversion Tracking",
            "Full eCommerce System",
            "Booking Calendar & Tools",
            "Real-Time Notifications System",
            "VIP Priority Support (Phone, Chat, Email)",
            "Dashboard for Clients",
          ],
          popular: false,
          cta: "Contact Sales",
        },
      ],
    },
    juantap: {
      title: "JuanTap - Modern NFC Card",
      description:
        "Digital business cards with NFC technology (per piece pricing)",
      plans: [
        {
          name: "Standard",
          monthlyPrice: 588,
          yearlyPrice: 588,
          features: [
            "Editable and customizable design",
            "QR Code for non-NFC phones",
            "Simple card design (logo and name in background)",
            "Name on front, Logo or QR on back",
            "Click-to-call, click-to-email",
            "Lifetime reusable",
          ],
          popular: false,
          cta: "Get Started",
          badge: "BEST FOR Freelancers, individuals, basic use",
        },
        {
          name: "Premium",
          monthlyPrice: 888,
          yearlyPrice: 888,
          features: [
            "Full-Color Premium Design",
            "Choose your style (Silver, Laser, Leather)",
            "Personal info (Name, Title, Company, Contact)",
            "QR Code for non-NFC phones",
            "Business location Maps + Save Contact Button",
            "Social media & website links",
            "Online dashboard (edit anytime)",
            "File upload (PDF / Portfolio)",
            "Lifetime reusable",
          ],
          popular: true,
          cta: "Choose Plan",
          badge: "BEST FOR Small business owners, entrepreneurs",
        },
        {
          name: "Elite",
          monthlyPrice: 1288,
          yearlyPrice: 1288,
          features: [
            "Premium card design (laser printed logo and name)",
            "Premium metal finish",
            "Personal info (Name, Title, Company, Contact)",
            "Business location Maps + Save Contact Button",
            "Analytics (taps/views counts)",
            "Multiple profile support (Business & Personal)",
            "Full-color creative design",
            "File upload (PDF / Portfolio)",
            "QR Code for non-NFC phones",
            "Editable and customizable design",
          ],
          popular: false,
          cta: "Contact Sales",
          badge: "BEST FOR VIP clients, brokers, executives",
        },
      ],
    },
    multimedia: {
      title: "Multimedia Advertising",
      description:
        "Professional multimedia content creation and advertising packages",
      plans: [
        {
          name: "Standard",
          monthlyPrice: 4950,
          yearlyPrice: 59400,
          features: [
            "Product or Corporate Photo Shoot (up to 10 items or 5 pax)",
            "1 Short Promo Video (30–60s)",
            "Basic Editing (Photo + Video)",
            "Background Music",
            "20 Edited Photos",
            "1 Export Format (Web-optimized)",
          ],
          popular: false,
          cta: "Get Started",
        },
        {
          name: "Business Growth",
          monthlyPrice: 14750,
          yearlyPrice: 177000,
          features: [
            "Product + Lifestyle + Corporate Photography (up to 30 items / 8 pax)",
            "1 Full Promo Video (1–3 mins) + 3 Social Media Shorts",
            "Event Coverage (up to 4 hrs)",
            "Scriptwriting & Concept",
            "50 Edited Photos",
            "Subtitles & Captions",
            "Optimized for TikTok, IG, FB & Website",
          ],
          popular: true,
          cta: "Choose Plan",
        },
        {
          name: "Business",
          monthlyPrice: 29500,
          yearlyPrice: 354000,
          features: [
            "Full Product + Corporate + Lifestyle Coverage (unlimited products/team)",
            "Full Event Coverage (up to 8 hrs)",
            "On-site Interviews + Voice-over",
            "Scriptwriting & Storyboarding",
            "1 Main Video (3–5 mins) + 5 Social Media Shorts",
            "Full Color Grading + Advanced Retouching + Creative Branding Overlays",
            "1 Export Format (Web-optimized)",
          ],
          popular: false,
          cta: "Contact Sales",
        },
      ],
    },
    socialmedia: {
      title: "Social Media Management",
      description:
        "Complete social media management and content creation packages",
      plans: [
        {
          name: "Starter",
          monthlyPrice: 5999,
          yearlyPrice: 71988,
          features: [
            "1-2 Social Media Platforms",
            "4 Posts per Month",
            "Basic Content Calendar",
            "Hashtag Research",
            "Community Engagement",
            "Monthly Performance Report",
          ],
          popular: false,
          cta: "Get Started",
        },
        {
          name: "Growth",
          monthlyPrice: 12999,
          yearlyPrice: 155988,
          features: [
            "2-3 Social Media Platforms",
            "8 Posts per Month",
            "Advanced Content Calendar",
            "Hashtag & Keyword Optimization",
            "Daily Community Engagement",
            "Monthly Analytics Report",
            "Content Strategy Consultation",
          ],
          popular: true,
          cta: "Choose Plan",
        },
        {
          name: "Premium",
          monthlyPrice: 24999,
          yearlyPrice: 299988,
          features: [
            "4+ Social Media Platforms",
            "20 Posts per Month",
            "Professional Content Creation",
            "Influencer Coordination",
            "Paid Ads Management",
            "Weekly Engagement Reports",
            "Brand Strategy & Consulting",
            "Crisis Management Support",
          ],
          popular: false,
          cta: "Contact Sales",
        },
      ],
    },
  };

  const currentService = services[activeService as keyof typeof services];
  const currentPlans = currentService.plans;

  const removeFromCart = (planName: string, service: string) => {
    setCart(
      cart.filter(
        (item) => !(item.planName === planName && item.service === service),
      ),
    );
  };

  const getServiceTitle = (serviceKey: string) => {
    const titles: Record<string, string> = {
      website: "Website",
      juantap: "JuanTap",
      multimedia: "Multimedia",
      socialmedia: "Social Media",
    };
    return titles[serviceKey] || serviceKey;
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
  const cartHasMixedCurrencies = cart.some(
    (item) => item.currency !== currency,
  );

  const handleAddToCart = (plan: any) => {
    const isYearly = billingPeriod === "yearly";
    const phpAmount = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    const usdOverride = isYearly ? plan.usdYearlyPrice : plan.usdMonthlyPrice;
    const price = convertPrice(phpAmount, usdOverride, currency);

    setCart([
      ...cart,
      {
        planName: plan.name,
        service: activeService,
        price,
        currency,
        billingPeriod: activeService === "juantap" ? "piece" : billingPeriod,
      },
    ]);
  };

  const isDesktopOrLaptop = useMediaQuery({
    query: "(min-width: 1000px)",
  });
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 999px)" });

  // Shared billing/currency toggle row (reused in both layouts below).
  // Now sliding switches instead of button pairs, and pulled in tighter
  // right above the plan cards.
  const controlsRow = (
    <div className="flex justify-start items-center gap-5 flex-wrap">
      {activeService !== "juantap" && (
        <>
          <ToggleSwitch
            leftLabel="Monthly"
            rightLabel="Yearly"
            checked={billingPeriod === "yearly"}
            onChange={(checked) =>
              setBillingPeriod(checked ? "yearly" : "monthly")
            }
          />
          <div className="w-px h-6 bg-slate-700" />
        </>
      )}
      <ToggleSwitch
        leftLabel="PHP"
        rightLabel="USD"
        checked={currency === "USD"}
        onChange={(checked) => setCurrency(checked ? "USD" : "PHP")}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white py-16">
      {/* Header Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-4 lg:mb-6 mt-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl text-accent font-bold tracking-tight mb-4 uppercase">
            Our Pricing Plans
          </h1>
          <p className="text-base sm:text-lg text-slate-300 mb-6 leading-relaxed">
            Choose the perfect plan for your business. All plans include support
            and updates.
          </p>

          {/* Service Selector */}
          <div className="flex justify-center gap-2 mb-6 overflow-x-auto pb-2 flex-wrap md:flex-nowrap">
            {Object.entries(services).map(([key, service]) => (
              <button
                key={key}
                onClick={() => {
                  setActiveService(key);
                  setSelectedCardIndex(null);
                  if (key === "juantap") {
                    setBillingPeriod("piece");
                  } else if (billingPeriod === "piece") {
                    setBillingPeriod("monthly");
                  }
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap text-sm ${
                  activeService === key
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {key === "website" && "Website"}
                {key === "juantap" && "JuanTap"}
                {key === "multimedia" && "Multimedia"}
                {key === "socialmedia" && "Social Media"}
              </button>
            ))}
          </div>

          <p className="text-slate-400 text-sm">{currentService.description}</p>
        </div>
      </section>

      {/* Consultation CTA Section - only for Social Media */}
      {activeService === "socialmedia" && (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-8 max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Phone className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Custom Solutions?
              </h2>
            </div>
            <p className="text-slate-300 mb-6 text-lg">
              Need a tailored package? Schedule a consultation with our team to
              discuss your specific needs and requirements.
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all"
            >
              Schedule Consultation
            </Link>
            <p className="text-slate-400 text-sm mt-4">
              <strong>Price Range:</strong>{" "}
              {currency === "USD"
                ? `$${formatPrice(convertPrice(10000, undefined, "USD"), "USD")} - $${formatPrice(convertPrice(150000, undefined, "USD"), "USD")}+`
                : "₱10,000 - ₱150,000+"}
            </p>
          </div>
        </section>
      )}

      {isTabletOrMobile && activeService !== "socialmedia" && (
        <section className="mx-auto px-6 flex flex-col pb-10 items-center">
          {/* Controls row now sits directly above the cards, left-aligned */}
          <div className="w-full mb-5">{controlsRow}</div>

          <div className="flex-1">
            <div className="relative">
              <div className="py-8" onClick={() => setSelectedCardIndex(null)}>
                <div
                  className={
                    selectedCardIndex === null
                      ? "flex justify-center gap-6 flex-wrap transition-all duration-300"
                      : "flex items-stretch justify-center gap-4 transition-all duration-500"
                  }
                >
                  {currentPlans.map((plan, index) => {
                    const isSelected = selectedCardIndex === index;
                    const isCollapsed =
                      selectedCardIndex !== null && index !== selectedCardIndex;

                    return (
                      <div
                        key={index}
                        className={`
                          transition-all duration-500
                          ${isSelected ? "z-20" : ""}
                          ${isCollapsed ? "z-10 flex flex-col" : ""}
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCardIndex(isSelected ? null : index);
                        }}
                      >
                        <PricingCard
                          plan={plan}
                          billingPeriod={
                            activeService === "juantap"
                              ? "piece"
                              : billingPeriod
                          }
                          currency={currency}
                          onAddToCart={() => handleAddToCart(plan)}
                          isHovered={isSelected}
                          isSmall={isCollapsed}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-80 lg:fixed lg:right-8 lg:top-24 lg:h-fit">
            <div
              id="order-summary"
              className="bg-slate-800/70 border border-slate-700 rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Order Summary</h3>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Your cart is empty</p>
                  <p className="text-slate-500 text-xs mt-1">
                    Add plans to get started
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {cart.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-2 bg-slate-700/50 rounded-lg p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium text-sm truncate">
                            {item.planName}
                          </p>
                          <p className="text-slate-400 text-xs">
                            {getServiceTitle(item.service)}
                          </p>
                          <p className="text-cyan-400 text-xs font-semibold">
                            {currencySymbol(item.currency)}
                            {formatPrice(item.price, item.currency)}
                            {item.billingPeriod === "piece"
                              ? " / piece"
                              : ` / ${item.billingPeriod === "yearly" ? "year" : "mo"}`}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            removeFromCart(item.planName, item.service)
                          }
                          className="text-slate-400 hover:text-red-400 transition-colors p-1 flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-600 pt-4">
                    {cartHasMixedCurrencies && (
                      <p className="text-amber-400 text-xs mb-2">
                        Cart has items in different currencies — total below
                        mixes them.
                      </p>
                    )}
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-slate-300 font-semibold">
                        Total:
                      </span>
                      <span className="text-2xl font-bold text-cyan-400">
                        {currencySymbol(currency)}
                        {formatPrice(cartTotal, currency)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="email"
                        placeholder="Client email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 text-sm"
                      />
                      <button
                        onClick={() => {}}
                        disabled={isSending}
                        className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        {isSending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4" />
                            Send Summary
                          </>
                        )}
                      </button>

                      {emailStatus && (
                        <div
                          className={`p-3 rounded-lg text-sm ${
                            emailStatus.type === "success"
                              ? "bg-green-500/20 text-green-300 border border-green-500/50"
                              : "bg-red-500/20 text-red-300 border border-red-500/50"
                          }`}
                        >
                          {emailStatus.message}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {isDesktopOrLaptop && activeService !== "socialmedia" && (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Controls row now sits directly above the cards */}
          <div className="mb-6">{controlsRow}</div>

          <div className="grid grid-cols-4 gap-6">
            {currentPlans.map((plan, index) => (
              <PricingCard
                key={index}
                plan={plan}
                billingPeriod={
                  activeService === "juantap" ? "piece" : billingPeriod
                }
                currency={currency}
                onAddToCart={() => handleAddToCart(plan)}
                isHovered={false}
                isSmall={false}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default PricingPage;
