"use client";

import React from "react";
import { LuArrowRight } from "react-icons/lu";
import { Button } from "@heroui/react";
import { poetsen_one } from "@/config/fonts";
import { useRouter } from "next/navigation";

const eyebrow = ["Web", "Marketing", "Branding", "Content"];

const Left = () => {
  const router = useRouter();

  return (
    <div className="relative space-y-6 z-10">
      <div className="space-y-4">
        <p className="text-accent-light text-sm font-semibold tracking-widest uppercase">
          {eyebrow.join(" · ")}
        </p>

        <h1
          className={`text-5xl sm:text-7xl font-bold leading-tight ${poetsen_one.className}`}
        >
          <span className="text-gray-100">Your Digital Growth</span>
          <br />
          <span className="text-accent-light">Partner</span>
        </h1>

        <p className="text-lg text-gray-300 max-w-xl">
          We create modern websites, strategic marketing, strong branding, and
          engaging content — all designed to help your business grow.
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
          Get a Free Consultation
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
    </div>
  );
};

export default Left;
