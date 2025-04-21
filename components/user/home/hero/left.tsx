"use client";

import React from "react";
import { LuArrowRight } from "react-icons/lu";
import { Chip, Button } from "@heroui/react";
import { GoDotFill } from "react-icons/go";
import { poetsen_one } from "@/config/fonts";
import { useRouter } from "next/navigation";

const Left = () => {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="md:space-y-6">
        <Chip
          className="hidden md:flex"
          startContent={<GoDotFill />}
          variant="bordered"
          color="warning"
        >
          More than 100 active projects, driving innovation and delivering
          excellence!
        </Chip>

        <h1
          className={`text-accent text-5xl sm:text-7xl font-bold leading-tight ${poetsen_one.className}`}
        >
          HIGH QUALITY, <br /> LOWER PRICE
        </h1>
      </div>

      <p className="md:text-lg text-gray-400 leading-relaxed">
        At <strong>Infinitech Advertising Corporation</strong>, we deliver
        high-quality, innovative solutions that enhance your brand while staying
        within your budget. From web development to system solutions, we help
        your business stand out.
      </p>

      <div className="flex flex-wrap gap-4 pt-4">
        <Button
          size="lg"
          variant="solid"
          className="bg-accent text-gray-100 font-medium hover:bg-primary-dark transition"
          endContent={<LuArrowRight size={18} />}
          onPress={() => router.push("/contact")}
        >
          Inquire Now
        </Button>
      </div>
    </div>
  );
};

export default Left;
