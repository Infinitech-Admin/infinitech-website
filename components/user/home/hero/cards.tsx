"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardBody, Link, Button } from "@heroui/react";
import { LuArrowRight } from "react-icons/lu";
import { services } from "@/data/services";

// Reveals its children with a fade+slide-up once scrolled into view.
// Plain IntersectionObserver — no framer-motion dependency required.
function RevealOnScroll({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Subtle 3D tilt following the cursor + a light that tracks mouse position,
// implemented with plain mouse-move math (no react-parallax-tilt needed).
function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / rect.height) * -8;
    const rotateY = ((x - rect.width / 2) / rect.width) * 8;

    setStyle({
      transform: `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`,
      background: `radial-gradient(circle at ${x}px ${y}px, rgba(245,166,35,0.12), transparent 60%)`,
    });
  };

  const handleMouseLeave = () => setStyle({});

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="transition-transform duration-200 ease-out will-change-transform"
      style={style}
    >
      {children}
    </div>
  );
}

const Cards = () => {
  return (
    <div className="py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((service, i) => (
          <RevealOnScroll key={service.name} delay={i * 90}>
            <TiltCard>
              <Card
                className="border border-white/20 bg-white/30
                            backdrop-blur-xs shadow-lg rounded-xl w-full p-4 flex flex-col items-center text-center"
                isBlurred
                as={Link}
                href="/services"
              >
                <CardBody className="items-center">
                  <service.icon className="h-10 w-10 text-accent-light mb-3" />
                  <h3 className="text-lg font-semibold text-gray-100 mb-1">
                    {service.name}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                    {service.description}
                  </p>
                  <span className="flex items-center gap-1 text-xs text-accent-light font-medium">
                    Learn More <LuArrowRight size={14} />
                  </span>
                </CardBody>
              </Card>
            </TiltCard>
          </RevealOnScroll>
        ))}
      </div>

      <div className="flex justify-center pt-8">
        <Button
          as={Link}
          href="/services"
          size="lg"
          variant="bordered"
          className="border-accent text-accent-light font-medium"
          endContent={<LuArrowRight size={18} />}
        >
          Explore All Services
        </Button>
      </div>
    </div>
  );
};

export default Cards;
