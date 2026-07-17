"use client";

import React from "react";
import { LuArrowRight } from "react-icons/lu";
import { Chip, Button } from "@heroui/react";
import { GoDotFill, GoCheck } from "react-icons/go";
import { poetsen_one } from "@/config/fonts";
import { useRouter } from "next/navigation";

const trustPoints = [
  "20+ Projects",
  "All Services, One Team",
  "Fast Turnaround",
  "Affordable Pricing",
];

const Left = () => {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* <Chip
          className="hidden md:flex"
          startContent={<GoDotFill />}
          variant="bordered"
          color="warning"
        >
          Your One-Stop Digital Partner
        </Chip> */}

        <h1
          className={`text-accent text-5xl sm:text-7xl font-bold leading-tight ${poetsen_one.className}`}
        >
          One-Stop Solutions <br /> To Grow Your Business
        </h1>

        <p className="md:text-lg text-gray-400">
          Website • Marketing Research • Branding
        </p>
      </div>

      <div className="flex flex-wrap gap-4 pt-2">
        <Button
          size="lg"
          variant="solid"
          className="bg-accent text-gray-100 font-medium hover:bg-primary-dark transition"
          endContent={<LuArrowRight size={18} />}
          onPress={() => router.push("/contact")}
        >
          Get Free Consultation
        </Button>

        <Button
          size="lg"
          variant="bordered"
          className="border-accent text-accent-light font-medium hover:bg-white/10 transition"
          onPress={() => router.push("/solutions")}
        >
          View Our Work
        </Button>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
        {trustPoints.map((point) => (
          <span
            key={point}
            className="flex items-center gap-1.5 text-sm text-gray-400"
          >
            <GoCheck className="text-accent-light" />
            {point}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Left;
