import React from "react";
import { Divider } from "@heroui/react";
import { LuStar } from "react-icons/lu";

const Reviews = () => {
  return (
    <div className="flex flex-col lg:flex-row justify-center items-center text-center lg:text-left lg:space-x-24 space-y-12 lg:space-y-0 mt-12">
      <div className="space-y-2 lg:space-y-4">
        <h1 className="text-4xl font-semibold text-primary">50+</h1>
        <p className="text-lg text-gray-700 max-w-xs mx-auto lg:mx-0">
          Ongoing Projects for Various Industries
        </p>
      </div>

      <Divider
        orientation="vertical"
        className="h-24 hidden lg:flex border-gray-300"
      />

      <div className="space-y-2 lg:space-y-4">
        <div className="flex justify-center lg:justify-start items-center gap-1 text-3xl text-yellow-500">
          {Array.from({ length: 5 }).map((_, index) => (
            <LuStar key={index} />
          ))}
        </div>
        <p className="text-lg text-gray-700 max-w-xs mx-auto lg:mx-0">
          4.8+ Overall Rating from Satisfied Clients Across Multiple Platforms
        </p>
      </div>

      <Divider
        orientation="vertical"
        className="h-24 hidden lg:flex border-gray-300"
      />

      <div className="space-y-2 lg:space-y-4">
        <h1 className="text-4xl font-semibold text-primary">100%</h1>
        <p className="text-lg text-gray-700 max-w-xs mx-auto lg:mx-0">
          Tailor-Made Web and System Solutions for Seamless Business Operations
        </p>
      </div>
    </div>
  );
};

export default Reviews;
