"use client";

import React from "react";
import { Image } from "@heroui/react";
import { motion } from "framer-motion";

const Right = () => {
  return (
    <div className="hidden relative lg:flex justify-center items-center">
      <Image
        alt="Logo"
        src="/images/logo-white.jpg"
        className="rounded-full border-[24px] border-l-accent border-t-accent-light border-b-primary border-r-primary-light w-[31.25rem] h-[31.25rem]"
      />
      <motion.div
        className="absolute top-8 right-16 z-10"
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Image
          alt="Image"
          src="/images/seo.png"
          width={120}
          height={120}
        />
      </motion.div>

      <motion.div
        className="absolute bottom-0 left-24 z-10"
        animate={{
          y: [0, -30, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Image
          alt="Image"
          src="/images/portfolio.png"
          width={120}
          height={120}
        />
      </motion.div>

      <motion.div
        className="absolute top-24 left-5 z-10"
        animate={{
          y: [0, -25, 0],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Image
          alt="Image"
          src="/images/responsive.png"
          width={150}
          height={150}
        />
      </motion.div>

      <motion.div
        className="absolute bottom-12 right-16 z-10"
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Image
          alt="Image"
          src="/images/web-dev.png"
          width={120}
          height={120}
        />
      </motion.div>
    </div>
  );
};

export default Right;
