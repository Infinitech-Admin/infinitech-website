"use client";

import React from "react";
import { LuArrowRight } from "react-icons/lu";
import { Image, Button } from "@heroui/react";

const Cards = () => {
  const solutions = [
    {
      name: "DMCI",
      description: `DMCI Homes, Inc. is the real estate arm of DMCI Holdings through its wholly owned subsidiary DMCI Project Developers, Inc. (PDI).`,
      href: "https://dmci-agent.vercel.app",
      image: "dmci.png",
    },
    {
      name: "ABIC Manpower",
      description: `ABIC Manpower Service Corp. specializes in providing staffing and recruitment solutions across the Philippines. We connect employers with qualified job applicants seeking opportunities in various industries.`,
      href: "https://abicmanpower.com",
      image: "manpower.png",
    },
    {
      name: "S5 Logistics",
      description: `S5 Logistics, Inc offers seamless and reliable logistics services worldwide, specializing in fast and secure delivery.`,
      href: "https://s5-logistics.vercel.app",
      image: "s5.png",
    },
    {
      name: "Le Luxe Clinic",
      description: `Le Luxe Clinic is a new modern type beauty clinic that will offer you the best beaty services such as nails, waxing, threading, warts removal, facial, RF, slimming, etc.`,
      href: "https://leluxeclinic.vercel.app",
      image: "leluxe.png",
    },
  ];

  return (
    <section>
      <div className="container mx-auto px-4 py-24">
        <div className="flex flex-col justify-center items-center md:space-y-24">
          {solutions.map((solution, index) => (
            <div
              key={solution.name}
              className="grid grid-cols-1 md:grid-cols-2 items-center gap-28"
            >
              <div className={`order-${index % 2 == 0 ? 2 : 1}`}>
                <Image
                  className="w-[30rem] h-[17rem]"
                  alt="Website Development"
                  src={`/images/solutions/${solution.image}`}
                />
              </div>

              <div
                className={`flex justify-center items-center order-${index % 2 == 0 ? 1 : 2}`}
              >
                <div className="max-w-lg">
                  <h1 className="text-4xl text-accent font-bold">
                    {solution.name}
                  </h1>
                  <p className="text-lg text-gray-600 mt-4">
                    {solution.description}
                  </p>

                  <div className="mt-6">
                    <Button
                      size="lg"
                      endContent={<LuArrowRight />}
                      className="bg-primary text-gray-100"
                      onPress={() => window.open(solution.href)}
                    >
                      VISIT WEBSITE
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Cards;
