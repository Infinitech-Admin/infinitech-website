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
      <div className="grid grid-cols-1 md:grid-cols-2 items-center">
        <div className="flex justify-center items-center max-w-xl mx-auto px-4">
          <div className="space-y-3">
            <span className="text-gray-400 text-4xl font-bold">OUR SOLUTIONS</span>
            <h1 className={`text-4xl text-accent ${poetsen_one.className}`}>
              We design & build your custom website
            </h1>
            <div className="space-y-4">
              <p className="text-lg text-gray-100 mt-8">
                Explore some of our latest projects showcasing innovative
                designs, cutting-edge technology, and tailored solutions that
                meet our clients' needs.
              </p>
              <p className="text-lg text-gray-100">
                Each project highlights our commitment to delivering
                high-quality results.
              </p>
            </div>

            <div className="py-6">
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
          </div>
        </div>
        <div>
          <List />
        </div>
      </div>
    </section>
  );
};

export default Solutions;
