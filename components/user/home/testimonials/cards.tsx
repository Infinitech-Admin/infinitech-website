"use client";

import "keen-slider/keen-slider.min.css";
import React, { useEffect, useRef, useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { Card, CardBody, CardFooter, Divider, Button } from "@heroui/react";
import { useKeenSlider } from "keen-slider/react";
import { testimonials } from "@/data/testimonials";

const Cards = () => {
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    slides: {
      perView: 1,
      spacing: 24,
    },
    breakpoints: {
      "(min-width: 768px)": {
        slides: { perView: 2, spacing: 24 },
      },
    },
  });

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [equalHeight, setEqualHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const recalc = () => {
      const heights = cardRefs.current
        .filter((el): el is HTMLDivElement => !!el)
        .map((el) => {
          el.style.height = "auto"; // reset before measuring
          return el.scrollHeight;
        });
      if (heights.length > 0) {
        setEqualHeight(Math.max(...heights));
      }
    };

    recalc();

    const ro = new ResizeObserver(recalc);
    cardRefs.current.forEach((el) => el && ro.observe(el));
    window.addEventListener("resize", recalc);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recalc);
    };
  }, []);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="max-w-lg">
          <h1 className="text-4xl text-primary font-bold">
            What Clients Say About Our Exceptional Service
          </h1>
        </div>
      </div>

      <div ref={sliderRef} className="keen-slider mt-8">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="keen-slider__slide">
            <Card
              ref={(el) => {
                cardRefs.current[index] = el as unknown as HTMLDivElement;
              }}
              className="bg-transparent shadow-none flex flex-col justify-between py-4 w-full"
              style={equalHeight ? { height: `${equalHeight}px` } : undefined}
            >
              <CardBody className="flex-1 py-4">
                <p className="text-lg leading-relaxed font-medium">
                  "{testimonial.message}"
                </p>
              </CardBody>

              <CardFooter className="mt-auto">
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

      <div className="flex gap-2 mt-6">
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
  );
};

export default Cards;
