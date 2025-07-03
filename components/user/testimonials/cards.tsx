"use client";

import "keen-slider/keen-slider.min.css";
import React from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { poetsen_one } from "@/config/fonts";
import { Card, CardBody, CardFooter, Divider, Button } from "@heroui/react";
import { useKeenSlider } from "keen-slider/react";
import { testimonials } from "@/data/testimonials";

const Cards = () => {
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    slides: {
      perView: 3,
      spacing: 15,
    },
    breakpoints: {
      "(max-width: 768px)": {
        slides: {
          perView: 1,
          spacing: 10,
        },
      },
    },
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between gap-4">
       <div className="max-w-2xl mt-12 mx-auto text-center">
  <h1 className={`text-5xl text-accent ${poetsen_one.className}`}>
    TESTIMONIALS
  </h1>

  <h1 className={`text-4xl text-primary ${poetsen_one.className}`}>
    We help to achieve customers business goals
  </h1>
</div>

        <div className="flex gap-2">
          <Button
            size="lg"
            variant="bordered"
            className="rounded-full border-2 border-gray-400"
            isIconOnly
            onPress={() => instanceRef.current?.prev()}
          >
            <LuChevronLeft size={18} />
          </Button>
          <Button
            size="lg"
            variant="bordered"
            className="rounded-full border-2 border-gray-400"
            isIconOnly
            onPress={() => instanceRef.current?.next()}
          >
            <LuChevronRight size={18} />
          </Button>
        </div>
      </div>

      <div ref={sliderRef} className="keen-slider mt-12">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.name}
            className="keen-slider__slide flex justify-center cursor-pointer"
          >
            <Card className="bg-gray-100 shadow-none  flex flex-col justify-between py-4">
              <CardBody className="flex-1 px-6 py-4">
                <p className="text-lg leading-relaxed">
                  "{testimonial.message}"
                </p>
              </CardBody>

              <CardFooter className="px-6 pb-4">
                <div className="w-full">
                  <Divider className="my-4" />
                  <h4 className="font-semibold text-gray-900 uppercase text-2xl">
                    {testimonial.name}
                  </h4>
                  <span className="text-sm text-gray-500">
                    {testimonial.position}
                  </span>
                </div>
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cards;
