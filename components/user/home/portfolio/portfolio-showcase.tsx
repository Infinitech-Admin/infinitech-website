"use client"
import React, { useState, useRef, useEffect } from 'react';
import { ExternalLink, Eye, ChevronRight } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  url?: string;
  technologies: string[];
  category: string;
}

// Your actual completed projects
const projects: Project[] = [
  {
    id: 1,
    title: "Eurotel Hotel Management System",
    description: "Complete hotel management system with booking, room management, guest services and billing",
    image: "/websites/eurotel.png",
    url: "https://example.com",
    technologies: ["Next.js", "Laravel", "MySQL", "TypeScript", "Tailwind CSS"],
    category: "Hotel Management"
  },
  {
    id: 2,
    title: "ABIC Consultancy Website",
    description: "Professional consultancy website with service showcase, client portal and consultation booking",
    image: "/websites/abicconsultancy.png",
    url: "https://example.com",
    technologies: ["Next.js", "TypeScript", "Laravel", "MySQL", "Hero UI"],
    category: "Corporate Website"
  },
  {
    id: 3,
    title: "ABIC Manpower Services",
    description: "Comprehensive hiring and manpower platform with job matching and recruitment management",
    image: "/websites/abicmanpower.png",
    url: "https://example.com",
    technologies: ["Laravel", "Node.js", "MySQL", "Tailwind CSS", "TypeScript"],
    category: "Recruitment Platform"
  },
  {
    id: 4,
    title: "ABIC Realty Platform",
    description: "Real estate website with property listings, virtual tours and client management system",
    image: "/websites/abicrealty.png",
    url: "https://example.com",
    technologies: ["Next.js", "Laravel", "MySQL", "Shadcn/ui", "TypeScript"],
    category: "Real Estate"
  },
  {
    id: 5,
    title: "Oppane E-Commerce",
    description: "Full-featured e-commerce platform with inventory management, payment integration and analytics",
    image: "/websites/oppane.png",
    url: "https://example.com",
    technologies: ["Next.js", "Laravel", "MySQL", "Node.js", "Tailwind CSS"],
    category: "E-Commerce"
  },
  {
    id: 6,
    title: "Unakichi E-Commerce",
    description: "Modern e-commerce solution with product catalog, shopping cart and order management",
    image: "/websites/unakichi.png",
    url: "https://example.com",
    technologies: ["TypeScript", "Laravel", "MySQL", "Hero UI", "Node.js"],
    category: "E-Commerce"
  },
  {
    id: 7,
    title: "Anilao Scuba Diving Center",
    description: "Diving center booking system with equipment rental, course scheduling and certification tracking",
    image: "/websites/anilao.png",
    url: "https://example.com",
    technologies: ["Next.js", "Laravel", "MySQL", "Shadcn/ui", "TypeScript"],
    category: "Booking System"
  },
  {
    id: 8,
    title: "Yamaaraw E-Commerce",
    description: "E-commerce platform with multi-vendor support, payment gateway and inventory management",
    image: "/websites/yamaaraw.png",
    url: "https://example.com",
    technologies: ["Laravel", "Node.js", "MySQL", "Tailwind CSS", "TypeScript"],
    category: "E-Commerce"
  },
  {
    id: 9,
    title: "DMCI Real Estate Portal",
    description: "Corporate real estate platform with property showcase, investment tracking and client portal",
    image: "/websites/dmci.png",
    url: "https://example.com",
    technologies: ["Next.js", "TypeScript", "Laravel", "MySQL", "Hero UI"],
    category: "Real Estate"
  },
  {
    id: 10,
    title: "Joe Property Specialist",
    description: "Personal real estate portfolio showcasing luxury properties and professional real estate services",
    image: "/websites/joe.png",
    url: "https://example.com",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "MySQL", "Laravel"],
    category: "Property Specialist"
  },
  {
    id: 11,
    title: "Kaila Property Specialist",
    description: "Professional property consultant website with property listings and client management tools",
    image: "/websites/kaila.png",
    url: "https://example.com",
    technologies: ["React", "Laravel", "MySQL", "Tailwind CSS", "TypeScript"],
    category: "Property Specialist"
  },
  {
    id: 12,
    title: "Angely Property Specialist",
    description: "Real estate specialist platform featuring premium properties and personalized client services",
    image: "/websites/angely.png",
    url: "https://example.com",
    technologies: ["Next.js", "Laravel", "MySQL", "Shadcn/ui", "TypeScript"],
    category: "Property Specialist"
  },
  {
    id: 13,
    title: "Jayvee Property Specialist",
    description: "Commercial and residential property specialist with advanced search and inquiry management",
    image: "/websites/jayvee.png",
    url: "https://example.com",
    technologies: ["Next.js", "TypeScript", "Laravel", "MySQL", "Hero UI"],
    category: "Property Specialist"
  },
  {
    id: 14,
    title: "Lloyd Property Specialist",
    description: "Professional real estate consultant website with property showcase and lead generation tools",
    image: "/websites/lloyd.png",
    url: "https://example.com",
    technologies: ["React", "Laravel", "MySQL", "Tailwind CSS", "Node.js"],
    category: "Property Specialist"
  },
  {
    id: 15,
    title: "Janina Property Specialist",
    description: "Luxury property specialist platform with virtual tours and comprehensive property management",
    image: "/websites/janina.png",
    url: "https://example.com",
    technologies: ["Next.js", "Laravel", "MySQL", "Shadcn/ui", "TypeScript"],
    category: "Property Specialist"
  }
];

const PortfolioShowcase: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
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

  // Function to shuffle array to avoid duplicates appearing together
  const shuffleArray = (array: Project[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Group projects by category for better organization
  const ecommerceProjects = [projects[4], projects[5], projects[7]]; // Oppane, Unakichi, Yamaaraw
  const realEstateProjects = [projects[3], projects[8], projects[9], projects[10], projects[11], projects[12], projects[13], projects[14]]; // ABIC Realty, DMCI, Joe, Kaila, Angely, Jayvee, Lloyd, Janina
  const businessProjects = [projects[0], projects[1], projects[2], projects[6]]; // Hotel, Consultancy, Manpower, Anilao

  // Create 3 diverse rows
  const row1Projects = [...ecommerceProjects, ...businessProjects.slice(0, 2)]; // E-commerce + Hotel + Consultancy
  const row2Projects = [...realEstateProjects.slice(0, 5)]; // Real Estate specialists
  const row3Projects = [...realEstateProjects.slice(5), ...businessProjects.slice(2)]; // More Real Estate + Manpower + Anilao

  const ProjectCard = ({ project, index }: { project: Project; index: number }) => (
    <div
      className="flex-shrink-0 w-[420px] mx-6 group cursor-pointer"
      onMouseEnter={() => setHoveredProject(project.id)}
      onMouseLeave={() => setHoveredProject(null)}
    >
      <div className="relative h-[320px] rounded-3xl overflow-hidden bg-white/95 backdrop-blur-sm border border-slate-200 shadow-2xl group-hover:shadow-cyan-500/25 transition-all duration-500 group-hover:scale-105">
        
        {/* Project Image */}
        <div className="relative w-full h-[60%] overflow-hidden">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Light Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 backdrop-blur-sm rounded-full text-white text-sm font-bold border border-white/20 shadow-lg">
            {project.category}
          </div>
          
          {/* View Button */}
          <div className={`absolute top-4 right-4 transition-all duration-300 ${
            hoveredProject === project.id ? 'opacity-100 scale-100' : 'opacity-70 scale-90'
          }`}>
            <button className="p-3 bg-white/90 backdrop-blur-md rounded-full border border-white/40 hover:bg-white transition-colors duration-200 shadow-lg">
              <ExternalLink className="w-5 h-5 text-slate-700" />
            </button>
          </div>
        </div>

        {/* Content Section with White Background */}
        <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-white p-6">
          <h3 className={`text-slate-800 font-bold text-xl mb-2 transition-all duration-300 ${
            hoveredProject === project.id ? 'text-blue-600 scale-105' : ''
          }`}>
            {project.title}
          </h3>
          
          <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
            {project.description}
          </p>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.technologies.slice(0, 3).map((tech, i) => (
              <span
                key={i}
                className={`px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full border border-slate-200 transition-all duration-300 font-medium ${
                  hoveredProject === project.id ? 'bg-blue-100 text-blue-700 border-blue-200' : ''
                }`}
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 3 && (
              <span className="px-3 py-1 bg-slate-50 text-slate-500 text-xs rounded-full border border-slate-200 font-medium">
                +{project.technologies.length - 3}
              </span>
            )}
          </div>

          {/* Action Button */}
          <div className={`transition-all duration-300 ${
            hoveredProject === project.id ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-2'
          }`}>
            <button className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all duration-200 shadow-lg">
              <span>View Project</span>
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>

        {/* Glow Border on Hover */}
        <div className={`absolute inset-0 rounded-3xl border-2 transition-all duration-300 ${
          hoveredProject === project.id 
            ? 'border-cyan-400/60 shadow-2xl shadow-cyan-400/30' 
            : 'border-transparent'
        }`}></div>
      </div>
    </div>
  );

  return (
    <>
      <style jsx>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        
        @keyframes marquee-right {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
        }
        
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
        
        @keyframes glow-pulse {
          0%, 100% { 
            box-shadow: 0 0 40px rgba(6, 182, 212, 0.3);
          }
          50% { 
            box-shadow: 0 0 60px rgba(6, 182, 212, 0.5);
          }
        }
        
        .marquee-left {
          animation: marquee-left 35s linear infinite;
        }
        
        .marquee-right {
          animation: marquee-right 40s linear infinite;
        }
        
        .marquee-left-slow {
          animation: marquee-left 45s linear infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }
        
        .animate-glow-pulse {
          animation: glow-pulse 3s ease-in-out infinite;
        }
        
        .marquee-container {
          mask-image: linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%);
        }
      `}</style>

      <section ref={sectionRef} className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-12 px-4 overflow-hidden relative">
        {/* Light Animated Background matching logo colors */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0s', animationDuration: '8s'}}></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-400/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s', animationDuration: '10s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-blue-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '6s', animationDuration: '12s'}}></div>
        </div>

        {/* Header */}
        <div className={`text-center mb-16 relative z-10 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 backdrop-blur-md border border-blue-300/30 rounded-full text-slate-700 font-bold mb-8 shadow-xl">
            <Eye className="w-6 h-6 mr-3 text-blue-600" />
            PORTFOLIO SHOWCASE
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-slate-800 mb-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            Our Work
          </h1>
          
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            Explore our collection of custom-built websites and powerful web systems crafted from scratch or redesigned to perfection
          </p>
        </div>

        {/* 3 Organized Rows by Category */}
        <div className="space-y-12 relative z-10">
          {/* Row 1 - E-Commerce & Business Systems */}
          <div className="marquee-container">
            <div className="flex marquee-left">
              {Array.from({length: 3}, (_, i) => 
                row1Projects.map((project, index) => (
                  <ProjectCard key={`row1-${i}-${index}`} project={project} index={index} />
                ))
              ).flat()}
            </div>
          </div>

          {/* Row 2 - Real Estate & Property Specialists */}
          <div className="marquee-container">
            <div className="flex marquee-right">
              {Array.from({length: 3}, (_, i) => 
                row2Projects.map((project, index) => (
                  <ProjectCard key={`row2-${i}-${index}`} project={project} index={index} />
                ))
              ).flat()}
            </div>
          </div>

          {/* Row 3 - Property Specialists & Services */}
          <div className="marquee-container">
            <div className="flex marquee-left-slow">
              {Array.from({length: 3}, (_, i) => 
                row3Projects.map((project, index) => (
                  <ProjectCard key={`row3-${i}-${index}`} project={project} index={index} />
                ))
              ).flat()}
            </div>
          </div>
        </div>

        {/* Call to Action with logo-matching colors */}
        <div className={`text-center mt-20 relative z-10 transition-all duration-1000 delay-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <a href="/solutions" className="group inline-flex items-center px-12 py-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xl rounded-2xl hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 transform hover:scale-110 shadow-2xl">
            <Eye className="w-8 h-8 mr-4 group-hover:animate-bounce" />
            View All Solutions
            <div className="ml-4 p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors duration-300">
              <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </a>
          
          <div className="mt-10 flex flex-wrap justify-center items-center gap-8 text-slate-600">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mr-3 animate-pulse"></div>
              <span className="text-lg font-semibold">{projects.length} Live Systems</span>
            </div>
            <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mr-3 animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <span className="text-lg font-semibold">Conversion Optimized</span>
            </div>
            <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full mr-3 animate-pulse" style={{animationDelay: '1s'}}></div>
              <span className="text-lg font-semibold">High Performance</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PortfolioShowcase;
