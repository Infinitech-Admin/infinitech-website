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
      <div className="relative h-[380px] sm:h-[420px] md:h-[460px] lg:h-[480px] xl:h-[500px] rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-[1.02] border border-gray-200">
        
        {/* Image Section */}
        <div className="relative w-full h-[55%] overflow-hidden">
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
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 backdrop-blur-sm rounded-full text-white text-xs font-bold shadow-lg border border-white/20">
            {solution.category}
          </div>

          {/* Tech Stack Overlay on Hover */}
          <div className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${
            hoveredCard === solution.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="flex flex-wrap gap-1.5">
              {solution.technologies.slice(0, 3).map((tech, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-white/25 backdrop-blur-sm text-white text-xs rounded-full border border-white/30 font-medium"
                >
                  {tech}
                </span>
              ))}
              {solution.technologies.length > 3 && (
                <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white/80 text-xs rounded-full border border-white/20">
                  +{solution.technologies.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-white p-4 flex flex-col justify-between">
          <div className="flex-1">
            <h3 className={`text-slate-800 font-bold text-base md:text-lg mb-2 transition-all duration-300 line-clamp-2 ${
              hoveredCard === solution.id ? 'text-blue-600' : ''
            }`}>
              {solution.project}
            </h3>
            
            <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 mb-3">
              {solution.description}
            </p>
            
            <div className="flex items-center text-xs text-slate-500 mb-3">
              <Globe className="w-3 h-3 mr-2" />
              <span>Live Website Available</span>
            </div>
          </div>

          {/* Action Button - Same color as badge */}
          <div className="mt-auto">
            <a
              href={solution.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-sm rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 ${
                hoveredCard === solution.id ? 'animate-pulse scale-[1.02]' : ''
              }`}
            >
              <span>VIEW LIVE SITE</span>
              <ChevronRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        {/* Glow Border on Hover */}
        <div className={`absolute inset-0 rounded-2xl border-2 transition-all duration-300 ${
          hoveredCard === solution.id 
            ? 'border-cyan-400/60 shadow-xl shadow-cyan-400/30' 
            : 'border-transparent'
        }`}></div>
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
        className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-12 lg:py-20"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-30 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[400px] lg:w-[600px] h-[400px] lg:h-[600px] bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{animationDuration: '8s'}}></div>
          <div className="absolute bottom-1/4 right-1/4 w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-cyan-400/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s', animationDuration: '10s'}}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className={`text-center mb-12 lg:mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
           
            
            <h1 className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-black text-slate-800 mb-6 animate-fade-in-up leading-tight">
              Beautiful, Functional Websites
            </h1>
            
            <p className="text-base lg:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed animate-fade-in-up mb-12" style={{animationDelay: '0.2s'}}>
              From concept to completion - we craft beautiful, functional websites that help your business thrive online
            </p>

            {/* Category Filters */}
            <div className={`mb-12 transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveFilter(category)}
                    className={`px-4 lg:px-6 py-2 lg:py-3 rounded-full font-semibold transition-all duration-300 text-sm lg:text-base ${
                      activeFilter === category
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg scale-105'
                        : 'bg-white/70 text-slate-600 hover:bg-white hover:text-slate-800 border border-slate-200 hover:scale-105'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Solutions Grid - Fixed to 4 cards per row */}
          <div className="mb-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {filteredSolutions.map((solution, index) => (
                <SolutionCard key={solution.id} solution={solution} index={index} />
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className={`text-center transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Palette className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-2">{solutionsdata.length}</h3>
                <p className="text-slate-600 font-semibold">Live Websites</p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Code className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-2">100%</h3>
                <p className="text-slate-600 font-semibold">Custom Built</p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-2">Fast</h3>
                <p className="text-slate-600 font-semibold">Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SolutionsPage;
