"use client";
import React, { useState, useRef, useEffect } from "react";
import { ExternalLink, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  url?: string;
  category: string;
}

// Your actual completed projects
const projects: Project[] = [
  {
    id: 1,
    title: "Eurotel Hotel Management System",
    description:
      "Complete hotel management system with booking, room management, guest services and billing",
    image: "/websites/eurotel.png",
    url: "https://eurotel-makati.vercel.app/",
    category: "Hotel Management",
  },
  {
    id: 2,
    title: "ABIC Consultancy Website",
    description:
      "Professional consultancy website with service showcase, client portal and consultation booking",
    image: "/websites/abicconsultancy.png",
    url: "https://abicconsultancy.vercel.app/",
    category: "Corporate Website",
  },
  {
    id: 3,
    title: "ABIC Manpower Services",
    description:
      "Comprehensive hiring and manpower platform with job matching and recruitment management",
    image: "/websites/abicmanpower.png",
    url: "https://abicmanpower.com/",
    category: "Recruitment Platform",
  },
  {
    id: 4,
    title: "ABIC Realty Platform",
    description:
      "Real estate website with property listings, virtual tours and client management system",
    image: "/websites/abicrealty.png",
    url: "https://abicrealtyph.com/",
    category: "Real Estate",
  },
  {
    id: 5,
    title: "Oppane E-Commerce",
    description:
      "Full-featured e-commerce platform with inventory management, payment integration and analytics",
    image: "/websites/oppane.png",
    url: "https://oppane.vercel.app/",
    category: "E-Commerce",
  },
  {
    id: 6,
    title: "Unakichi E-Commerce",
    description:
      "Modern e-commerce solution with product catalog, shopping cart and order management",
    image: "/websites/unakichi.png",
    url: "https://unakichi.vercel.app/",
    category: "E-Commerce",
  },
  {
    id: 7,
    title: "Anilao Scuba Diving Center",
    description:
      "Diving center booking system with equipment rental, course scheduling and certification tracking",
    image: "/websites/anilao.png",
    url: "https://anilaoscubadivingcenter.vercel.app/",
    category: "Booking System",
  },
  {
    id: 8,
    title: "Yamaaraw E-Commerce",
    description:
      "E-commerce platform with multi-vendor support, payment gateway and inventory management",
    image: "/websites/yamaaraw.png",
    url: "https://yamaaraw-ecom-shopph.vercel.app/",
    category: "E-Commerce",
  },
  {
    id: 9,
    title: "DMCI Real Estate Portal",
    description:
      "Corporate real estate platform with property showcase, investment tracking and client portal",
    image: "/websites/dmci.png",
    url: "https://dmci-agent-website-main.vercel.app/",
    category: "Real Estate",
  },
  // {
  //   id: 10,
  //   title: "Joe Property Specialist",
  //   description:
  //     "Personal real estate portfolio showcasing luxury properties and professional real estate services",
  //   image: "/websites/joe.png",
  //   url: "https://abicrealtyphjoe.com/",
  //   category: "Property Specialist",
  // },
  // {
  //   id: 11,
  //   title: "Kaila Property Specialist",
  //   description:
  //     "Professional property consultant website with property listings and client management tools",
  //   image: "/websites/kaila.png",
  //   url: "https://abicrealtyphkaila.com/",
  //   category: "Property Specialist",
  // },
  // {
  //   id: 12,
  //   title: "Angely Property Specialist",
  //   description:
  //     "Real estate specialist platform featuring premium properties and personalized client services",
  //   image: "/websites/angely.png",
  //   url: "https://abicrealtyphangely.com/",
  //   category: "Property Specialist",
  // },
  // {
  //   id: 13,
  //   title: "Jayvee Property Specialist",
  //   description:
  //     "Commercial and residential property specialist with advanced search and inquiry management",
  //   image: "/websites/jayvee.png",
  //   url: "https://abicrealtyphjayvee.com/",
  //   category: "Property Specialist",
  // },
  // {
  //   id: 14,
  //   title: "Lloyd Property Specialist",
  //   description:
  //     "Professional real estate consultant website with property showcase and lead generation tools",
  //   image: "/websites/lloyd.png",
  //   url: "https://abicrealtyphlloyd.com/",
  //   category: "Property Specialist",
  // },
  // {
  //   id: 15,
  //   title: "Janina Property Specialist",
  //   description:
  //     "Luxury property specialist platform with virtual tours and comprehensive property management",
  //   image: "/websites/janina.png",
  //   url: "https://abicrealtyphjanina.com/",
  //   category: "Property Specialist",
  // },
];

const PortfolioShowcase: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  const handleProjectClick = (project: Project) => {
    if (project.url) {
      window.open(project.url, "_blank", "noopener,noreferrer");
    }
  };

  const handleViewAllSolutions = () => {
    router.push("/solutions");
  };

  const row1Projects = [
    projects[0],
    projects[1],
    projects[4],
    projects[5],
    projects[6],
  ];
  const row2Projects = [
    projects[2],
    projects[3],
    projects[7],
    projects[8],
    projects[9],
  ];

  const ProjectCard = ({
    project,
    index,
  }: {
    project: Project;
    index: number;
  }) => (
    <div
      className="flex-shrink-0 w-[340px] md:w-[420px] mx-3 md:mx-6 group cursor-pointer"
      onMouseEnter={() => setHoveredProject(project.id)}
      onMouseLeave={() => setHoveredProject(null)}
      onClick={() => handleProjectClick(project)}
    >
      <div className="relative h-[320px] md:h-[380px] rounded-3xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl group-hover:shadow-accent-light/25 transition-all duration-500 group-hover:scale-105">
        {/* Project Image */}
        <div className="relative w-full h-[55%] overflow-hidden">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

          {/* Vignette behind badge so it's readable over any screenshot */}
          <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black/70 to-transparent pointer-events-none"></div>

          {/* Category Badge */}
          <div className="absolute top-3 md:top-4 left-3 md:left-4 px-3 md:px-4 py-1.5 md:py-2 bg-accent rounded-full text-gray-100 text-xs md:text-sm font-bold shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            {project.category}
          </div>

          {/* External link icon - visual only, card itself is the click target */}
          <div
            className={`absolute top-3 md:top-4 right-3 md:right-4 p-2 md:p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30 shadow-lg transition-all duration-300 ${
              hoveredProject === project.id
                ? "opacity-100 scale-100"
                : "opacity-70 scale-90"
            }`}
          >
            <ExternalLink className="w-4 md:w-5 h-4 md:h-5 text-gray-100" />
          </div>
        </div>

        {/* Content Section - dark glass footer */}
        <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-white/10 backdrop-blur-md p-4 md:p-6 border-t border-white/10">
          <h3
            className={`text-gray-100 font-bold text-lg md:text-xl mb-2 md:mb-3 transition-all duration-300 leading-tight ${
              hoveredProject === project.id ? "text-accent-light scale-105" : ""
            }`}
          >
            {project.title}
          </h3>

          <p className="text-gray-400 text-sm md:text-base leading-relaxed font-medium line-clamp-2">
            {project.description}
          </p>

          {/* Subtle click hint - no button, card itself is clickable */}
          <div
            className={`flex items-center gap-1 mt-3 text-accent-light text-xs md:text-sm font-bold transition-all duration-300 ${
              hoveredProject === project.id
                ? "opacity-100 translate-x-1"
                : "opacity-60"
            }`}
          >
            <span>Visit site</span>
            <ChevronRight className="w-3 md:w-4 h-3 md:h-4" />
          </div>
        </div>

        {/* Glow Border on Hover */}
        <div
          className={`absolute inset-0 rounded-3xl border-2 transition-all duration-300 pointer-events-none ${
            hoveredProject === project.id
              ? "border-accent-light/60 shadow-2xl shadow-accent-light/30"
              : "border-transparent"
          }`}
        ></div>
      </div>
    </div>
  );

  return (
    <>
      <style jsx>{`
        @keyframes marquee-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        @keyframes marquee-right {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(0);
          }
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

        @media (min-width: 768px) {
          .marquee-left {
            animation: marquee-left 35s linear infinite;
          }
          .marquee-right {
            animation: marquee-right 40s linear infinite;
          }
          .marquee-container:hover .marquee-left,
          .marquee-container:hover .marquee-right {
            animation-play-state: paused;
          }
        }

        @media (max-width: 767px) {
          .marquee-left {
            animation: marquee-left 15s linear infinite;
          }
          .marquee-right {
            animation: marquee-right 18s linear infinite;
          }
          .marquee-container:hover .marquee-left,
          .marquee-container:hover .marquee-right {
            animation-play-state: running;
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }

        .marquee-container {
          mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 15%,
            black 85%,
            transparent 100%
          );
          -webkit-mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 15%,
            black 85%,
            transparent 100%
          );
        }
      `}</style>

      <section
        ref={sectionRef}
        className="min-h-screen bg-primary py-12 px-4 overflow-hidden relative"
      >
        {/* Ambient glow blobs matching hero palette */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-accent/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "0s", animationDuration: "8s" }}
          ></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent-light/15 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "3s", animationDuration: "10s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-primary-light/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "6s", animationDuration: "12s" }}
          ></div>
        </div>

        {/* Header */}
        <div
          className={`text-center mb-16 relative z-10 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h1
            className="text-4xl md:text-6xl lg:text-8xl font-black text-accent mb-6 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Our Work
          </h1>

          <p
            className="text-lg md:text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            Real projects, live and running. Click any card to visit the site.
          </p>
        </div>

        {/* 2 Rows */}
        <div className="space-y-12 relative z-10">
          <div className="marquee-container">
            <div className="flex marquee-left">
              {Array.from({ length: 3 }, (_, i) =>
                row1Projects.map((project, index) => (
                  <ProjectCard
                    key={`row1-${i}-${index}`}
                    project={project}
                    index={index}
                  />
                )),
              ).flat()}
            </div>
          </div>

          <div className="marquee-container">
            <div className="flex marquee-right">
              {Array.from({ length: 3 }, (_, i) =>
                row2Projects.map((project, index) => (
                  <ProjectCard
                    key={`row2-${i}-${index}`}
                    project={project}
                    index={index}
                  />
                )),
              ).flat()}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          className={`text-center mt-20 relative z-10 transition-all duration-1000 delay-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <button
            onClick={handleViewAllSolutions}
            className="group inline-flex items-center px-6 py-3 bg-accent text-gray-100 font-bold text-base rounded-xl hover:bg-primary-dark transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <span>View All Solutions</span>
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </button>

          {/* <div className="mt-10 flex flex-wrap justify-center items-center gap-x-16 gap-y-4 text-gray-400">
            <span className="text-lg font-semibold">
              {projects.length} Live Systems
            </span>
            <span className="text-lg font-semibold">Conversion Optimized</span>
            <span className="text-lg font-semibold">High Performance</span>
          </div> */}
        </div>
      </section>
    </>
  );
};

export default PortfolioShowcase;
