"use client";

import React from "react";
import { poetsen_one } from "@/config/fonts";
import { LuArrowRight } from "react-icons/lu";
import { Image, Button } from "@heroui/react";
import { useRouter } from "next/navigation";

const About = () => {
  const router = useRouter();

  return (
    <section>
      <div className="container mx-auto px-4 pt-12 2xl:py-12">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-center">
          <div className="px-0 md:px-4 flex justify-center">
            <Image
              alt="About"
              src="/images/about.jpeg"
              className="h-[31.25rem] object-cover overflow-hidden rounded-tr-[150px] rounded-bl-[150px] border-b-8 border-b-primary border-l-8 border-l-accent border-t-8 border-t-primary border-r-8 border-r-accent shadow-lg"
            />
          </div>

          <div className="space-y-6">
            <h1
              className={`text-4xl sm:text-6xl text-primary ${poetsen_one.className}`}
            >
              Who is Infinitech Advertising Corporation?
            </h1>
            <div className="space-y-4">
              <p className="text-base md:text-lg">
                At <strong>Infinitech Advertising Company</strong>, our mission
                is to help businesses thrive by providing top-notch digital
                solutions that boost growth, streamline operations, and enhance
                user satisfaction.
              </p>
              <p className="text-base md:text-lg">
                We are committed to customer satisfaction, offering a guarantee
                of unique web design and high-quality work. Our expertise spans
                Website Design and Development, Mobile App Development,
                Ecommerce Solutions, and IT Outsourcing.
              </p>
              <p className="text-base md:text-lg">
                Through our innovative solutions, we ensure our clients achieve
                their goals and experience exceptional service.
              </p>
            </div>

            <div>
              <Button
                endContent={<LuArrowRight />}
                size="lg"
                className="bg-primary text-gray-100"
                onPress={() => router.push("/about")}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
