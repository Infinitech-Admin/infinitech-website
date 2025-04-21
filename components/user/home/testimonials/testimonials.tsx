"use client";

import React from "react";
import { BsStarFill, BsStarHalf } from "react-icons/bs";
import { Card, CardBody, Image } from "@heroui/react";
import Cards from "./cards";

const Testimonials = () => {
  const reviews = [
    {
      platform: "Trustpilot",
      logo: "/images/trust-pilot.png",
      rating: 4.5,
      reviews: 7584,
      stars: 5,
      color: "text-green-500",
    },
    {
      platform: "Clutch",
      logo: "/images/clutch.png",
      rating: 5,
      reviews: 1500,
      stars: 5,
      color: "text-red-500",
    },
  ];

  const renderStars = (stars: number, color: string) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(Math.floor(stars))].map((_, i) => (
          <BsStarFill key={i} className={`${color}`} />
        ))}
        {stars % 1 !== 0 && <BsStarHalf className={`${color}`} />}
      </div>
    );
  };

  return (
    <section className="container mx-auto py-12 lg:py-24 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
        <div>
          <Cards />
        </div>

        <div className="flex justify-center items-center">
          <Card className="bg-gray-100 shadow-none w-full max-w-xl">
            <CardBody>
              <div className="py-32">
                {reviews.map((review) => (
                  <div
                    key={review.platform}
                    className="flex items-center justify-around mb-12 last:mb-0"
                  >
                    <div className="flex items-center space-x-2">
                      <Image
                        src={review.logo}
                        alt={review.platform}
                        className="w-[1.5rem] h-[1.5rem]"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Review On</span>
                        <span className="text-lg font-semibold">
                          {review.platform}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      {renderStars(review.stars, review.color)}
                      <span className="text-sm text-gray-500">
                        {review.reviews}+ Reviews
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
