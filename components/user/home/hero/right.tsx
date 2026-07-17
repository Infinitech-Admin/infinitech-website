"use client";

import React from "react";
import { Image } from "@heroui/react";
import { motion } from "framer-motion";

const floatItems = [
  {
    src: "/images/seo.png",
    alt: "SEO",
    className: "top-8 right-16",
    size: 90,
    duration: 3,
    offset: -20,
  },
  {
    src: "/images/portfolio.png",
    alt: "Portfolio",
    className: "bottom-0 left-24",
    size: 90,
    duration: 4,
    offset: -30,
  },
  {
    src: "/images/responsive.png",
    alt: "Responsive Design",
    className: "top-24 left-5",
    size: 100,
    duration: 3.5,
    offset: -25,
  },
  {
    src: "/images/web-dev.png",
    alt: "Web Development",
    className: "bottom-12 right-16",
    size: 90,
    duration: 5,
    offset: -20,
  },
];

const Right = () => {
  return (
    <div className="hidden relative lg:flex justify-center items-center">
      <Image
        alt="Logo"
        src="/images/logo-white.jpg"
        className="rounded-full border-[24px] border-l-accent border-t-accent-light border-b-primary border-r-primary-light w-[31.25rem] h-[31.25rem]"
      />

      {floatItems.map(({ src, alt, className, size, duration, offset }) => (
        <motion.div
          key={src}
          className={`absolute z-10 flex items-center justify-center rounded-2xl
                      bg-white/30 backdrop-blur-xs border border-white/20 shadow-lg p-3 ${className}`}
          animate={{ y: [0, offset, 0] }}
          transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            alt={alt}
            src={src}
            width={size}
            height={size}
            className="object-contain"
          />
        </motion.div>
      ))}
    </div>
  );
};

export default Right;
