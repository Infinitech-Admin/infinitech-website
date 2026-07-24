"use client";

import React from "react";
import { LuArrowRight } from "react-icons/lu";
import { Button } from "@heroui/react";
import { GoCheck } from "react-icons/go";
import { poetsen_one } from "@/config/fonts";
import { useRouter } from "next/navigation";

const whyChooseUs = [
  "Convenient One-Stop Shop",
  "Affordable Pricing",
  "Personalized Support",
  "Trusted Quality",
];

// TODO: Replace "__" with your real team member count before deploying
const stats = [
  { value: "2+", label: "Years in Business" },
  // { value: "20+", label: "Projects Completed" },
  { value: "10+", label: "Services Offered" },
  { value: "15+", label: "Team Members" },
];

const Left = () => {
  const router = useRouter();

  return (
    <div className="relative space-y-6 z-10">
      <div className="space-y-4">
        <h1
          className={`text-accent text-5xl sm:text-7xl font-bold leading-tight ${poetsen_one.className}`}
        >
          Why Choose Us
        </h1>

        <ul className="space-y-2 pt-2">
          {whyChooseUs.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 text-lg text-gray-300"
            >
              <GoCheck className="text-accent-light shrink-0" />
              {item}
            </li>
          ))}
        </ul>
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-4 text-center"
          >
            <div className="text-2xl font-bold text-accent">{stat.value}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Left;
