"use client";

import React from "react";
import { poetsen_one } from "@/config/fonts";
import { Divider, Image } from "@heroui/react";
import { LuBriefcaseBusiness } from "react-icons/lu";

const Hero = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 items-center py-12 gap-8">
      <div className="max-w-3xl">
        <span className="font-bold text-accent text-4xl">
          ABOUT US
        </span>
        <div className="space-y-6">
          <h1
            className={`text-3xl text-primary ${poetsen_one.className}`}
          >
            We believe in delivering high-quality solutions to help you grow
            your business effectively.
          </h1>
          <p className="text-lg text-gray-700">
            At Infinitech Advertising Corporation, we deliver high-quality,
            innovative solutions that enhance your brand while staying within
            your budget. From web development to system solutions, we help your
            business stand out.
          </p>
        </div>
        <div className="flex justify-evenly items-center mt-8">
          <div className="flex flex-col items-start space-y-2">
            <div className="inline-flex items-center justify-center bg-blue-200 text-blue-900 p-4 rounded-full">
              <LuBriefcaseBusiness size={32} />
            </div>

            <h1 className="text-3xl font-bold text-blue-900">2 years</h1>
            <p className="text-gray-700 text-lg">Driving growth</p>
          </div>

          <Divider orientation="vertical" className="h-48"/>

          <div className="flex flex-col items-start space-y-2">
            <div className="inline-flex items-center justify-center bg-blue-200 text-blue-900 p-4 rounded-full">
              <LuBriefcaseBusiness size={32} />
            </div>

            <h1 className="text-3xl font-bold text-blue-900">20+</h1>
            <p className="text-gray-700 text-lg">Projects completed</p>
          </div>
        </div>
      </div>
      <div>
        <Image
          src="/images/about.jpeg"
          className="w-[62.5rem] h-[31.25rem] object-cover overflow-hidden rounded-tr-[150px] rounded-bl-[150px] border-b-8 border-b-primary border-l-8 border-l-accent border-t-8 border-t-primary border-r-8 border-r-accent"
        />
      </div>
    </div>
  );
};

export default Hero;
