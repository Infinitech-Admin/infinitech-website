'use client'
import React, { useState, useRef, useEffect } from 'react';
import { ExternalLink, Eye, ChevronRight, Code, Palette, Zap, Globe } from 'lucide-react';

interface Solution {
  id: number;
  project: string;
  description: string;
  link: string;
  image: string;
  category: string;
  technologies: string[];
}

// All 15 websites from your portfolio
const solutionsdata: Solution[] = [
  {
    id: 1,
    project: "Eurotel Hotel Management System",
    description: "Complete hotel management system with booking, room management, guest services and billing functionality for seamless operations.",
    link: "https://example.com",
    image: "/websites/eurotel.png",
    category: "Hotel Management",
    technologies: ["Next.js", "Laravel", "MySQL", "TypeScript", "Tailwind CSS"]
  },
  {
    id: 2,
    project: "ABIC Consultancy Website",
    description: "Professional consultancy website with service showcase, client portal and consultation booking system for business growth.",
    link: "https://abicconsultancy.vercel.app/",
    image: "/websites/abicconsultancy.png",
    category: "Corporate Website",
    technologies: ["Next.js", "TypeScript", "Laravel", "MySQL", "Hero UI"]
  },
  {
    id: 3,
    project: "ABIC Manpower Services",
    description: "Comprehensive hiring and manpower platform with job matching and recruitment management across the Philippines.",
    link: "https://abicmanpower.com/",
    image: "/websites/abicmanpower.png",
    category: "Recruitment Platform",
    technologies: ["Laravel", "Node.js", "MySQL", "Tailwind CSS", "TypeScript"]
  },
  {
    id: 4,
    project: "ABIC Realty Platform",
    description: "Real estate website with property listings, virtual tours and comprehensive client management system.",
    link: "https://abicrealtyph.com/",
    image: "/websites/abicrealty.png",
    category: "Real Estate",
    technologies: ["Next.js", "Laravel", "MySQL", "Shadcn/ui", "TypeScript"]
  },
  {
    id: 5,
    project: "Oppane E-Commerce",
    description: "Full-featured e-commerce platform with inventory management, payment integration and comprehensive analytics dashboard.",
    link: "https://example.com",
    image: "/websites/oppane.png",
    category: "E-Commerce",
    technologies: ["Next.js", "Laravel", "MySQL", "Node.js", "Tailwind CSS"]
  },
  {
    id: 6,
    project: "Unakichi E-Commerce",
    description: "Modern e-commerce solution with product catalog, shopping cart and advanced order management system.",
    link: "https://example.com",
    image: "/websites/unakichi.png",
    category: "E-Commerce",
    technologies: ["TypeScript", "Laravel", "MySQL", "Hero UI", "Node.js"]
  },
  {
    id: 7,
    project: "Anilao Scuba Diving Center",
    description: "Diving center booking system with equipment rental, course scheduling and certification tracking features.",
    link: "https://example.com",
    image: "/websites/anilao.png",
    category: "Booking System",
    technologies: ["Next.js", "Laravel", "MySQL", "Shadcn/ui", "TypeScript"]
  },
  {
    id: 8,
    project: "Yamaaraw E-Commerce",
    description: "E-commerce platform with multi-vendor support, payment gateway integration and inventory management system.",
    link: "https://yamaaraw-ecom-shopph.vercel.app/",
    image: "/websites/yamaaraw.png",
    category: "E-Commerce",
    technologies: ["Laravel", "Node.js", "MySQL", "Tailwind CSS", "TypeScript"]
  },
  {
    id: 9,
    project: "DMCI Real Estate Portal",
    description: "Corporate real estate platform with property showcase, investment tracking and comprehensive client portal.",
    link: "https://dmci-agent-website.vercel.app/",
    image: "/websites/dmci.png",
    category: "Real Estate",
    technologies: ["Next.js", "TypeScript", "Laravel", "MySQL", "Hero UI"]
  },
  {
    id: 10,
    project: "Joe Property Specialist",
    description: "Personal real estate portfolio showcasing luxury properties and professional real estate services with client management.",
    link: "https://example.com",
    image: "/websites/joe.png",
    category: "Property Specialist",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "MySQL", "Laravel"]
  },
  {
    id: 11,
    project: "Kaila Property Specialist",
    description: "Professional property consultant website with comprehensive property listings and advanced client management tools.",
    link: "https://example.com",
    image: "/websites/kaila.png",
    category: "Property Specialist",
    technologies: ["React", "Laravel", "MySQL", "Tailwind CSS", "TypeScript"]
  },
  {
    id: 12,
    project: "Angely Property Specialist",
    description: "Real estate specialist platform featuring premium properties and personalized client services with virtual tours.",
    link: "https://example.com",
    image: "/websites/angely.png",
    category: "Property Specialist",
    technologies: ["Next.js", "Laravel", "MySQL", "Shadcn/ui", "TypeScript"]
  },
  {
    id: 13,
    project: "Jayvee Property Specialist",
    description: "Commercial and residential property specialist with advanced search functionality and inquiry management system.",
    link: "https://example.com",
    image: "/websites/jayvee.png",
    category: "Property Specialist",
    technologies: ["Next.js", "TypeScript", "Laravel", "MySQL", "Hero UI"]
  },
  {
    id: 14,
    project: "Lloyd Property Specialist",
    description: "Professional real estate consultant website with property showcase and comprehensive lead generation tools.",
    link: "https://example.com",
    image: "/websites/lloyd.png",
    category: "Property Specialist",
    technologies: ["React", "Laravel", "MySQL", "Tailwind CSS", "Node.js"]
  },
  {
    id: 15,
    project: "Janina Property Specialist",
    description: "Luxury property specialist platform with virtual tours and comprehensive property management features.",
    link: "https://example.com",
    image: "/websites/janina.png",
    category: "Property Specialist",
    technologies: ["Next.js", "Laravel", "MySQL", "Shadcn/ui", "TypeScript"]
  }
];

const SolutionsPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
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

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(solutionsdata.map(item => item.category)))];

  // Filter solutions based on active filter
  const filteredSolutions = activeFilter === 'All' 
    ? solutionsdata 
    : solutionsdata.filter(item => item.category === activeFilter);

  const SolutionCard = ({ solution, index }: { solution: Solution; index: number }) => (
    <div
      className={`group cursor-pointer transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={() => setHoveredCard(solution.id)}
      onMouseLeave={() => setHoveredCard(null)}
    >
      <div className="relative h-[500px] sm:h-[550px] lg:h-[600px] rounded-2xl lg:rounded-3xl overflow-hidden bg-white shadow-xl border border-slate-100 group-hover:shadow-2xl group-hover:shadow-cyan-500/20 transition-all duration-500 group-hover:scale-[1.02] touch-manipulation">
        
        {/* Image Section */}
        <div className="relative w-full h-[60%] sm:h-[55%] overflow-hidden">
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
          
          {/* Dark Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          
          {/* Category Badge */}
          <div className="absolute top-3 sm:top-4 lg:top-6 left-3 sm:left-4 lg:left-6 px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 bg-gradient-to-r from-blue-600 to-cyan-500 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm font-bold shadow-lg border border-white/20">
            {solution.category}
          </div>
          
          {/* External Link Icon */}
          <div className={`absolute top-3 sm:top-4 lg:top-6 right-3 sm:right-4 lg:right-6 transition-all duration-300 ${
            hoveredCard === solution.id ? 'opacity-100 scale-100 rotate-12' : 'opacity-80 scale-90'
          }`}>
            <div className="p-2 sm:p-2.5 lg:p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30 shadow-lg">
              <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </div>

          {/* Tech Stack Overlay on Hover - Hidden on mobile for performance */}
          <div className={`hidden sm:block absolute bottom-0 left-0 right-0 p-4 lg:p-6 transition-all duration-300 ${
            hoveredCard === solution.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="flex flex-wrap gap-1.5 lg:gap-2">
              {solution.technologies.slice(0, 4).map((tech, i) => (
                <span
                  key={i}
                  className="px-2 lg:px-3 py-1 bg-white/25 backdrop-blur-sm text-white text-xs rounded-full border border-white/30 font-medium"
                >
                  {tech}
                </span>
              ))}
              {solution.technologies.length > 4 && (
                <span className="px-2 lg:px-3 py-1 bg-white/20 backdrop-blur-sm text-white/80 text-xs rounded-full border border-white/20">
                  +{solution.technologies.length - 4}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Section - White Background */}
        <div className="absolute bottom-0 left-0 right-0 h-[40%] sm:h-[45%] bg-white p-4 sm:p-5 lg:p-6 flex flex-col justify-between border-t-2 lg:border-t-4 border-slate-200">
          <div className="flex-1">
            <h3 className={`text-slate-800 font-bold text-base sm:text-lg lg:text-xl mb-2 transition-all duration-300 line-clamp-2 ${
              hoveredCard === solution.id ? 'text-blue-600' : ''
            }`}>
              {solution.project}
            </h3>
            
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-2 sm:mb-3">
              {solution.description}
            </p>
            
            <div className="flex items-center text-xs text-slate-500 mb-2 sm:mb-3">
              <Globe className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span>Live Website Available</span>
            </div>

            {/* Tech Stack for Mobile - Always visible */}
            <div className="sm:hidden flex flex-wrap gap-1 mb-3">
              {solution.technologies.slice(0, 3).map((tech, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium"
                >
                  {tech}
                </span>
              ))}
              {solution.technologies.length > 3 && (
                <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-full">
                  +{solution.technologies.length - 3}
                </span>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-auto relative z-20">
            <a
              href={solution.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full inline-flex items-center justify-center px-4 sm:px-5 lg:px-6 py-3 sm:py-3.5 lg:py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold sm:font-black text-sm sm:text-base rounded-lg sm:rounded-xl transition-all duration-300 shadow-xl sm:shadow-2xl border-2 border-orange-400 hover:border-red-400 transform hover:scale-[1.02] cursor-pointer active:scale-95 touch-manipulation ${
                hoveredCard === solution.id ? 'animate-pulse scale-[1.02]' : ''
              }`}
              style={{
                boxShadow: '0 4px 16px rgba(249, 115, 22, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                WebkitTapHighlightColor: 'transparent'
              }}
              onClick={(e) => {
                e.preventDefault();
                window.open(solution.link, '_blank', 'noopener,noreferrer');
              }}
            >
              <span>VIEW LIVE SITE</span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        {/* Glow Border on Hover */}
        <div className={`absolute inset-0 rounded-2xl lg:rounded-3xl border-2 transition-all duration-300 ${
          hoveredCard === solution.id 
            ? 'border-cyan-400/60 shadow-xl lg:shadow-2xl shadow-cyan-400/30' 
            : 'border-transparent'
        }`}></div>
      </div>
    </div>
  );

  return (
    <>
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(60px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Prevent horizontal scroll and dragging */
        html, body {
          overflow-x: hidden;
          width: 100%;
          max-width: 100vw;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        /* Hide scrollbars */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Prevent text selection on touch devices */
        .touch-manipulation {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
          -webkit-tap-highlight-color: transparent;
        }

        /* iOS Safari specific fixes */
        @supports (-webkit-touch-callout: none) {
          .min-h-screen {
            min-height: -webkit-fill-available;
          }
        }
      `}</style>

      <div 
        ref={sectionRef} 
        className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-8 sm:py-12 lg:py-16 px-3 sm:px-6 lg:px-8 relative overflow-hidden"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y pinch-zoom',
          maxWidth: '100vw'
        }}
      >
        {/* Background Elements - Reduced on mobile */}
        <div className="absolute inset-0 opacity-20 sm:opacity-40">
          <div className="absolute top-1/4 left-1/4 w-[300px] sm:w-[500px] lg:w-[600px] h-[300px] sm:h-[500px] lg:h-[600px] bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0s', animationDuration: '8s'}}></div>
          <div className="absolute bottom-1/4 right-1/4 w-[250px] sm:w-[400px] lg:w-[500px] h-[250px] sm:h-[400px] lg:h-[500px] bg-cyan-400/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s', animationDuration: '10s'}}></div>
        </div>

        <div className="w-full max-w-none mx-auto relative z-10 px-0">
          {/* Header */}
          <div className={`text-center mb-6 sm:mb-8 lg:mb-16 transition-all duration-1000 px-2 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="inline-flex items-center px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-md border border-orange-300/30 rounded-full text-slate-700 font-bold mb-6 sm:mb-8 shadow-xl">
              <Code className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3 text-orange-600" />
              <span className="text-sm sm:text-base">SOLUTIONS</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl lg:text-6xl xl:text-7xl font-black text-slate-800 mb-3 sm:mb-4 lg:mb-6 animate-fade-in-up leading-tight px-2" style={{animationDelay: '0.2s'}}>
              Beautiful, Functional Websites
            </h1>
            
            <p className="text-sm sm:text-base lg:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed animate-fade-in-up mb-6 sm:mb-8 lg:mb-12 px-3 sm:px-4" style={{animationDelay: '0.4s'}}>
              From concept to completion - we craft beautiful, functional websites that help your business thrive online
            </p>

            {/* Category Filters - Scrollable on mobile */}
            <div className={`mb-6 sm:mb-8 lg:mb-12 transition-all duration-1000 delay-500 px-2 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className="flex sm:flex-wrap sm:justify-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveFilter(category)}
                    className={`flex-shrink-0 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-semibold transition-all duration-300 text-xs sm:text-sm lg:text-base touch-manipulation whitespace-nowrap ${
                      activeFilter === category
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg scale-105'
                        : 'bg-white/70 text-slate-600 hover:bg-white hover:text-slate-800 border border-slate-200 hover:scale-105 active:scale-95'
                    }`}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Solutions Grid */}
          <div className="w-full px-2 sm:px-4 lg:px-8 xl:px-16 2xl:px-24">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 xl:gap-8 mb-6 sm:mb-8 lg:mb-16">
              {filteredSolutions.map((solution, index) => (
                <SolutionCard key={solution.id} solution={solution} index={index} />
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className={`text-center transition-all duration-1000 delay-1000 px-2 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 max-w-4xl mx-auto">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20 hover:scale-105 transition-transform duration-300 touch-manipulation">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4 shadow-lg">
                  <Palette className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800 mb-1 sm:mb-2">{solutionsdata.length}</h3>
                <p className="text-slate-600 font-semibold text-xs sm:text-sm lg:text-base">Live Websites</p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20 hover:scale-105 transition-transform duration-300 touch-manipulation">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4 shadow-lg">
                  <Code className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800 mb-1 sm:mb-2">100%</h3>
                <p className="text-slate-600 font-semibold text-xs sm:text-sm lg:text-base">Custom Built</p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20 hover:scale-105 transition-transform duration-300 touch-manipulation">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4 shadow-lg">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800 mb-1 sm:mb-2">Fast</h3>
                <p className="text-slate-600 font-semibold text-xs sm:text-sm lg:text-base">Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SolutionsPage;
