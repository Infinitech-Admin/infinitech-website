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
    link: "https://eurotel-makati.vercel.app/",
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
    technologies: ["Laravel", "Bootstrap", "MySQL"]
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
    link: "https://oppane.vercel.app/",
    image: "/websites/oppane.png",
    category: "E-Commerce",
    technologies: ["Next.js", "Laravel", "MySQL", "Node.js", "Tailwind CSS"]
  },
  {
    id: 6,
    project: "Unakichi E-Commerce",
    description: "Modern e-commerce solution with product catalog, shopping cart and advanced order management system.",
    link: "https://unakichi.vercel.app/",
    image: "/websites/unakichi.png",
    category: "E-Commerce",
    technologies: ["TypeScript", "Laravel", "MySQL", "Hero UI", "Node.js"]
  },
  {
    id: 7,
    project: "Anilao Scuba Diving Center",
    description: "Diving center booking system with equipment rental, course scheduling and certification tracking features.",
    link: "https://anilaoscubadivingcenter.vercel.app/",
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
    link: "https://www.abicrealtyphjoe.com/",
    image: "/websites/joe.png",
    category: "Property Specialist",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "MySQL", "Laravel"]
  },
  {
    id: 11,
    project: "Kaila Property Specialist",
    description: "Professional property consultant website with comprehensive property listings and advanced client management tools.",
    link: "https://www.abicrealtyphkaila.com/",
    image: "/websites/kaila.png",
    category: "Property Specialist",
    technologies: ["React", "Laravel", "MySQL", "Tailwind CSS", "TypeScript"]
  },
  {
    id: 12,
    project: "Angely Property Specialist",
    description: "Real estate specialist platform featuring premium properties and personalized client services with virtual tours.",
    link: "https://www.abicrealtyphangely.com/",
    image: "/websites/angely.png",
    category: "Property Specialist",
    technologies: ["Next.js", "Laravel", "MySQL", "Shadcn/ui", "TypeScript"]
  },
  {
    id: 13,
    project: "Jayvee Property Specialist",
    description: "Commercial and residential property specialist with advanced search functionality and inquiry management system.",
    link: "https://www.abicrealtyphjayvee.com/",
    image: "/websites/jayvee.png",
    category: "Property Specialist",
    technologies: ["Next.js", "TypeScript", "Laravel", "MySQL", "Hero UI"]
  },
  {
    id: 14,
    project: "Lloyd Property Specialist",
    description: "Professional real estate consultant website with property showcase and comprehensive lead generation tools.",
    link: "https://www.abicrealtyphlloyd.com/",
    image: "/websites/lloyd.png",
    category: "Property Specialist",
    technologies: ["React", "Laravel", "MySQL", "Tailwind CSS", "Node.js"]
  },
  {
    id: 15,
    project: "Janina Property Specialist",
    description: "Luxury property specialist platform with virtual tours and comprehensive property management features.",
    link: "https://www.abicrealtyphjanina.com/",
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
      <div className="relative h-[600px] rounded-3xl overflow-hidden bg-white shadow-xl border border-slate-100 group-hover:shadow-2xl group-hover:shadow-cyan-500/20 transition-all duration-500 group-hover:scale-[1.02]">
        
        {/* Image Section */}
        <div className="relative w-full h-[55%] overflow-hidden">
          <img
            src={solution.image}
            alt={solution.project}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Dark Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          
          {/* Category Badge */}
          <div className="absolute top-6 left-6 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 backdrop-blur-sm rounded-full text-white text-sm font-bold shadow-lg border border-white/20">
            {solution.category}
          </div>
          
          {/* External Link Icon */}
          <div className={`absolute top-6 right-6 transition-all duration-300 ${
            hoveredCard === solution.id ? 'opacity-100 scale-100 rotate-12' : 'opacity-80 scale-90'
          }`}>
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30 shadow-lg">
              <ExternalLink className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Tech Stack Overlay on Hover */}
          <div className={`absolute bottom-0 left-0 right-0 p-6 transition-all duration-300 ${
            hoveredCard === solution.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="flex flex-wrap gap-2">
              {solution.technologies.slice(0, 4).map((tech, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-white/25 backdrop-blur-sm text-white text-xs rounded-full border border-white/30 font-medium"
                >
                  {tech}
                </span>
              ))}
              {solution.technologies.length > 4 && (
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white/80 text-xs rounded-full border border-white/20">
                  +{solution.technologies.length - 4}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Section - White Background */}
        <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-white p-6 flex flex-col justify-between border-t-4 border-slate-200">
          <div className="flex-1">
            <h3 className={`text-slate-800 font-bold text-lg mb-2 transition-all duration-300 line-clamp-2 ${
              hoveredCard === solution.id ? 'text-blue-600' : ''
            }`}>
              {solution.project}
            </h3>
            
            <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 mb-3">
              {solution.description}
            </p>
            
            <div className="flex items-center text-xs text-slate-500 mb-3">
              <Globe className="w-4 h-4 mr-2" />
              <span>Live Website Available</span>
            </div>
          </div>

          {/* Super Prominent Action Button */}
          <div className="mt-auto">
            <a
              href={solution.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black text-base rounded-xl transition-all duration-300 shadow-2xl border-3 border-orange-400 hover:border-red-400 transform hover:scale-[1.02] ${
                hoveredCard === solution.id ? 'animate-pulse scale-[1.02]' : ''
              }`}
              style={{
                boxShadow: '0 6px 24px rgba(249, 115, 22, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}
            >
              <span>VIEW LIVE SITE</span>
              <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        {/* Glow Border on Hover */}
        <div className={`absolute inset-0 rounded-3xl border-2 transition-all duration-300 ${
          hoveredCard === solution.id 
            ? 'border-cyan-400/60 shadow-2xl shadow-cyan-400/30' 
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
      `}</style>

      <div ref={sectionRef} className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-16 px-4">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0s', animationDuration: '8s'}}></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-400/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s', animationDuration: '10s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 backdrop-blur-md border border-blue-300/30 rounded-full text-slate-700 font-bold mb-8 shadow-xl">
              <Code className="w-6 h-6 mr-3 text-blue-600" />
              SOLUTIONS
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-slate-800 mb-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              We design & build your custom website
            </h1>
            
            <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed animate-fade-in-up mb-12" style={{animationDelay: '0.4s'}}>
              From concept to completion - we craft beautiful, functional websites that help your business thrive online
            </p>

            {/* Category Filters */}
            <div className={`flex flex-wrap justify-center gap-3 mb-12 transition-all duration-1000 delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
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

          {/* Solutions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
            {filteredSolutions.map((solution, index) => (
              <SolutionCard key={solution.id} solution={solution} index={index} />
            ))}
          </div>

          {/* Stats Section */}
          <div className={`text-center transition-all duration-1000 delay-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
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
