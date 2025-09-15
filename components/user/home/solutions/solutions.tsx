"use client";

import React from "react";
import { poetsen_one } from "@/config/fonts";
import { Button } from "@heroui/react";
import { LuArrowRight } from "react-icons/lu";
import List from "./list";
import { useRouter } from "next/navigation";

const Solutions = () => {
  const router = useRouter();

  return (
    <section className="bg-blue-950 py-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center px-6">
        
        {/* LEFT SIDE - TEXT */}
        <div className="space-y-6">
          <span className="text-gray-400 text-2xl font-bold">OUR SOLUTIONS</span>
          <h1 className={`text-4xl md:text-5xl text-accent ${poetsen_one.className}`}>
            We design & build your custom website
          </h1>
          <p className="text-lg text-gray-100 leading-snug">
            Explore some of our latest projects showcasing innovative designs, 
            cutting-edge technology, and tailored solutions that meet our clients’ needs. 
            Each project highlights our commitment to delivering high-quality results.
          </p>
          <Button
            endContent={<LuArrowRight />}
            size="lg"
            variant="solid"
            className="bg-accent-light"
            onPress={() => router.push("/contact")}
          >
            Get Your Own Website Now
          </Button>
        </div>

        {/* RIGHT SIDE - SLIDER */}
        <div className="w-full">
          <List />
        </div>
      </div>
    </section>
  );
};

export default Solutions;
