"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronRight, Globe } from "lucide-react";
import { Tooltip } from "react-tooltip";
import TestimonialsSlider from "@/components/testimonials-slider";
import { solutionsTestimonials } from "@/data/testimonials-solutions";

interface Solution {
  id: number;
  project: string;
  description: string;
  link: string;
  image: string;
  category: string;
  technologies: string[];
}

// Active portfolio websites (disabled/retired entries removed — see git history to restore)
const solutionsdata: Solution[] = [
  {
    id: 1,
    project: "Eurotel Hotel Management System",
    description:
      "Complete hotel management system with booking, room management, guest services and billing functionality for seamless operations.",
    link: "https://eurotel-makati.vercel.app",
    image: "/websites/eurotel.png",
    category: "Hotel Management",
    technologies: ["Next.js", "Laravel", "MySQL", "TypeScript", "Tailwind CSS"],
  },
  {
    id: 2,
    project: "ABIC Consultancy Website",
    description:
      "Professional consultancy website with service showcase, client portal and consultation booking system for business growth.",
    link: "https://abicconsultancy.vercel.app/",
    image: "/websites/abicconsultancy.png",
    category: "Corporate Website",
    technologies: ["Next.js", "TypeScript", "Laravel", "MySQL", "Hero UI"],
  },
  {
    id: 3,
    project: "ABIC Manpower Services",
    description:
      "Comprehensive hiring and manpower platform with job matching and recruitment management across the Philippines.",
    link: "https://abicmanpower.com/",
    image: "/websites/abicmanpower.png",
    category: "Manpower Platform",
    technologies: ["Laravel", "Node.js", "MySQL", "Tailwind CSS", "TypeScript"],
  },
  {
    id: 4,
    project: "ABIC Realty Platform",
    description:
      "Real estate website with property listings, virtual tours and comprehensive client management system.",
    link: "https://abicrealtyph.com/",
    image: "/websites/abicrealty.png",
    category: "Real Estate",
    technologies: ["Next.js", "Laravel", "MySQL", "Shadcn/ui", "TypeScript"],
  },
  {
    id: 7,
    project: "Anilao Scuba Diving Center",
    description:
      "Diving center booking system with equipment rental, course scheduling and certification tracking features.",
    link: "https://anilaoscubadivingcenter.vercel.app/",
    image: "/websites/anilao.png",
    category: "Booking System",
    technologies: ["Next.js", "Laravel", "MySQL", "Shadcn/ui", "TypeScript"],
  },
  {
    id: 8,
    project: "Yamaaraw E-Commerce",
    description:
      "E-commerce platform with multi-vendor support, payment gateway integration and inventory management system.",
    link: "https://yamaaraw-ecom-shopph.vercel.app/",
    image: "/websites/yamaaraw.png",
    category: "E-Commerce",
    technologies: ["Laravel", "Node.js", "MySQL", "Tailwind CSS", "TypeScript"],
  },
  {
    id: 9,
    project: "DMCI Real Estate Portal",
    description:
      "Corporate real estate platform with property showcase, investment tracking and comprehensive client portal.",
    link: "https://dmci-agent-website.vercel.app/",
    image: "/websites/dmci.png",
    category: "Real Estate",
    technologies: ["Next.js", "TypeScript", "Laravel", "MySQL", "Hero UI"],
  },
  {
    id: 16,
    project: "Izakaya Tori Ichizu",
    description:
      "E-commerce website for a Japanese restaurant featuring an online menu, ordering system, and seamless customer experience.",
    link: "https://izakayatoriichizu.com/",
    image: "/websites/izakaya.png",
    category: "E-Commerce",
    technologies: ["Next.js", "Laravel", "MySQL", "Shadcn/ui", "TypeScript"],
  },
  {
    id: 17,
    project: "Alfima Realty Inc.",
    description:
      "Professional real estate company website showcasing property listings, realty services, and client inquiry management for Alfima Realty Inc.",
    link: "https://alfimarealtyinc.com/",
    image: "/websites/alfima.png",
    category: "Real Estate",
    technologies: ["Next.js", "Laravel", "MySQL", "Tailwind CSS", "TypeScript"],
  },
  {
    id: 18,
    project: "G-Limit Studio",
    description:
      "Photography and videography studio website showcasing portfolio galleries, service packages, and booking inquiries for creative shoots.",
    link: "https://www.g-limitstudio.com/",
    image: "/websites/g-limit.png",
    category: "Photography & Videography",
    technologies: ["Next.js", "Laravel", "MySQL", "Tailwind CSS", "TypeScript"],
  },
  {
    id: 19,
    project: "Hilee Tumbler",
    description:
      "E-commerce store for premium insulated tumblers featuring a product catalog, customization options, and online ordering for a Philippine drinkware brand.",
    link: "https://hilee-tumbler.vercel.app/",
    image: "/websites/hilee.png",
    category: "E-Commerce",
    technologies: ["Next.js", "Laravel", "MySQL", "Tailwind CSS", "TypeScript"],
  },
  {
    id: 20,
    project: "Ipponyari Japanese Restaurant",
    description:
      "Multi-branch Japanese restaurant website with menu showcase, table reservations, and location details for authentic yakitori, sushi, and ramen dining.",
    link: "https://ipponyari-japanese-restaurant.vercel.app/",
    image: "/websites/ipponyari.png",
    category: "Restaurant",
    technologies: ["Next.js", "Laravel", "MySQL", "Tailwind CSS", "TypeScript"],
  },
  {
    id: 21,
    project: "Vencio's Garden Hotel & Restaurant",
    description:
      "Luxury hotel reservation website featuring 360° virtual room tours, amenities showcase, and online booking for a garden retreat destination.",
    link: "https://vencios.vercel.app/",
    image: "/websites/vencios.png",
    category: "Hotel Management",
    technologies: ["Next.js", "Laravel", "MySQL", "Tailwind CSS", "TypeScript"],
  },
  {
    id: 22,
    project: "Whole Love",
    description:
      "High-quality, affordable sanitary napkins and wet wipes designed for comfort, cleanliness, and confidence — every moment of the month.",
    link: "https://wholeloveph.com/",
    image: "/websites/wholelove.png",
    category: "E-Commerce",
    technologies: ["Next.js", "Laravel", "MySQL", "Tailwind CSS", "TypeScript"],
  },
  {
    id: 23,
    project: "Hi Beauty Spa",
    description:
      "Luxury spa and wellness website showcasing treatment packages, pricing, client testimonials, and location details for a Makati-based spa retreat.",
    link: "https://www.hibeautyspaph.com/",
    image: "/websites/hibeautyspa.png",
    category: "Booking System",
    technologies: ["Next.js", "Laravel", "MySQL", "Tailwind CSS", "TypeScript"],
  },
  {
    id: 24,
    project: "YH eSIM",
    description:
      "Global eSIM connectivity platform offering instant digital SIM activation, destination-based data plans, and coverage across 190+ countries for travelers.",
    link: "https://yh-esim.vercel.app/",
    image: "/websites/yhesim.png",
    category: "E-Commerce",
    technologies: ["Next.js", "Laravel", "MySQL", "Tailwind CSS", "TypeScript"],
  },
  {
    id: 25,
    project: "Lumè Bean & Bar",
    description:
      "Premium coffee shop and cocktail bar website featuring a menu showcase, table reservations, and blog content for a café-by-day, bar-by-night concept.",
    link: "https://lume-bean-bar.vercel.app/",
    image: "/websites/lumebeanbar.png",
    category: "Restaurant",
    technologies: ["Next.js", "Laravel", "MySQL", "Tailwind CSS", "TypeScript"],
  },
  {
    id: 26,
    project: "MDS Dental & Aesthetic Clinic",
    description:
      "Dental and aesthetic clinic website featuring service showcase, facilities overview, and appointment booking for general dentistry and skin treatments in Batangas.",
    link: "https://mds-dental.vercel.app/",
    image: "/websites/mdsdental.png",
    category: "Booking System",
    technologies: ["Next.js", "Laravel", "MySQL", "Tailwind CSS", "TypeScript"],
  },
  {
    id: 27,
    project: "Barangay Pamplona Tres",
    description:
      "Official barangay government website providing resident services, certificate requests, announcements, and contact information for local officials in Las Piñas City.",
    link: "https://pamplonatres.vercel.app/",
    image: "/websites/pamplonatres.png",
    category: "Government",
    technologies: ["Next.js", "Laravel", "MySQL", "Tailwind CSS", "TypeScript"],
  },
  {
    id: 28,
    project: "JuanTap",
    description:
      "Digital business card platform enabling instant profile sharing via QR code and NFC, with customizable templates, social media integration, and analytics.",
    link: "https://www.juantap.info/",
    image: "/websites/juantap.png",
    category: "Digital Business Card",
    technologies: ["Next.js", "Laravel", "MySQL", "Tailwind CSS", "TypeScript"],
  },
  {
    id: 29,
    project: "Verdant Homeowners Portal",
    description:
      "Homeowners association platform providing residents with community announcements, billing, and service requests for a subdivision community management system.",
    link: "https://verdant-home-owner.vercel.app/",
    image: "/websites/verdant.png",
    category: "Community Management",
    technologies: ["Next.js", "Laravel", "MySQL", "Tailwind CSS", "TypeScript"],
  },
];

const SolutionsPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(8);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const handleExternalLink = (url: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const SolutionCard = ({
    solution,
    index,
  }: {
    solution: Solution;
    index: number;
  }) => (
    <div
      className={`bg-white group cursor-pointer transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`}
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={() => setHoveredCard(solution.id)}
      onMouseLeave={() => setHoveredCard(null)}
      onClick={() => handleExternalLink(solution.link)}
    >
      <div className="relative flex flex-col rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-[1.02] border border-gray-200">
        {/* Image Section */}
        <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden">
          <img
            src={solution.image}
            alt={solution.project}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://via.placeholder.com/600x400/e2e8f0/64748b?text=${encodeURIComponent(solution.project)}`;
            }}
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

          {/* Category Badge */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 backdrop-blur-sm rounded-full text-white text-[10px] sm:text-xs font-bold shadow-lg border border-white/20">
            {solution.category}
          </div>

          {/* Tech Stack Overlay on Hover */}
          <div
            className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 transition-all duration-300 ${
              hoveredCard === solution.id
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <div className="flex flex-wrap gap-1 sm:gap-1.5">
              {solution.technologies.slice(0, 3).map((tech, i) => (
                <span
                  key={i}
                  className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white/25 backdrop-blur-sm text-white text-[10px] sm:text-xs rounded-full border border-white/30 font-medium"
                >
                  {tech}
                </span>
              ))}
              {solution.technologies.length > 3 && (
                <span
                  data-tooltip-id={`my-tooltip-${solution.id}`}
                  data-tooltip-content={solution.technologies
                    .slice(3)
                    .join(", ")}
                  className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white/20 backdrop-blur-sm text-white/80 text-[10px] 
                    sm:text-xs rounded-full border border-white/20"
                >
                  +{solution.technologies.length - 3}
                </span>
              )}

              <Tooltip id={`my-tooltip-${solution.id}`} />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-1 p-3 sm:p-5">
          <div className="flex-1 min-h-0">
            <h3
              className={`h-[55px] text-slate-800 font-bold text-base sm:text-lg md:text-xl mb-2 transition-all duration-300 line-clamp-2 ${
                hoveredCard === solution.id ? "text-blue-600" : ""
              }`}
            >
              {solution.project}
            </h3>

            <p className="h-[40px] text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-2 sm:mb-3">
              {solution.description}
            </p>

            <div className="flex items-center text-[10px] sm:text-xs text-slate-500 mb-2 sm:mb-3">
              <Globe className="w-3 h-3 mr-1.5" />
              <span>Live Website Available</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-auto pt-2">
            <button
              onClick={(e) => handleExternalLink(solution.link, e)}
              className={`w-full inline-flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-xs sm:text-sm rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 ${
                hoveredCard === solution.id ? "animate-pulse scale-[1.02]" : ""
              }`}
            >
              <span className="whitespace-nowrap">VIEW LIVE SITE</span>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* Glow Border on Hover */}
        <div
          className={`absolute inset-0 rounded-2xl border-2 transition-all duration-300 pointer-events-none ${
            hoveredCard === solution.id
              ? "border-cyan-400/60 shadow-xl shadow-cyan-400/30"
              : "border-transparent"
          }`}
        ></div>
      </div>
    </div>
  );

  return (
    <>
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
      `}</style>

      <div
        ref={sectionRef}
        className="relative min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-12 lg:py-20"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-30 overflow-hidden">
          <div
            className="absolute top-1/4 left-1/4 w-[400px] lg:w-[600px] h-[400px] lg:h-[600px] bg-blue-400/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: "8s" }}
          ></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-cyan-400/15 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "3s", animationDuration: "10s" }}
          ></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Solutions Grid */}
          <div className="mb-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {solutionsdata.slice(0, visibleCount).map((solution, index) => (
                <SolutionCard
                  key={solution.id}
                  solution={solution}
                  index={index}
                />
              ))}
            </div>

            {visibleCount < solutionsdata.length && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setVisibleCount((c) => c + 8)}
                  className="px-8 py-3 rounded-full font-bold text-sm bg-white/80 text-slate-700 border border-slate-200 hover:bg-white hover:scale-105 transition-all duration-300 shadow-md"
                >
                  Load More ({solutionsdata.length - visibleCount} more)
                </button>
              </div>
            )}
          </div>

          {/* Testimonials */}
          <div className="w-full mt-12">
            <div className="flex flex-col justify-center text-center">
              <h2 className="text-3xl text-primary uppercase font-bold">
                Every project tells a story
              </h2>
              <p className="text-lg text-gray-700">
                Here’s what our clients have to say about theirs.
              </p>
            </div>

            <TestimonialsSlider testimonials={solutionsTestimonials} />
          </div>
        </div>
      </div>
    </>
  );
};

export default SolutionsPage;
