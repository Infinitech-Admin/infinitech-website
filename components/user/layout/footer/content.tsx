"use client";

import React from "react";
import { Link } from "@heroui/react";
import { FaEnvelope, FaFacebook } from "react-icons/fa6";

const Content = () => {
  return (
    <div className="w-full flex flex-col lg:flex-row justify-between xl:justify-center py-4 md:py-8 gap-8 xl:gap-32">
      <div className="flex flex-col">
        <div className="text-center lg:text-start">
          <h1 className="font-bold text-xl">
            <span className="text-white">
              INFINITECH ADVERTISING CORPORATION
            </span>
          </h1>
        </div>

        <p className="text-md text-gray-300 mt-2 w-full lg:max-w-md text-justify lg:text-start">
          Infinitech Advertising Corporation specializes in providing customized
          IT solutions that enhance online visibility and streamline business
          processes. We are committed to empowering businesses with innovative
          web development and system development services tailored to their
          unique needs.
        </p>
      </div>

      <div className="flex flex-col">
        <div className="flex justify-center lg:justify-start">
          <h1 className="font-normal text-lg">QUICK LINKS</h1>
        </div>

        <div className="flex justify-center lg:justify-between gap-16">
          <div className="flex flex-col pt-4 space-y-2">
            <Link href="/" className="text-default-200">
              Home
            </Link>
            <Link href="/about" className="text-default-200">
              About Us
            </Link>
            <Link href="/services" className="text-default-200">
              Services
            </Link>
          </div>

          <div className="flex flex-col pt-4 space-y-2">
            <Link href="/solutions" className="text-default-200">
              Solutions
            </Link>
            <Link href="/testimonials" className="text-default-200">
              Testimonials
            </Link>
            <Link href="/contact" className="text-default-200">
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-center lg:justify-start">
          <h1 className="font-normal text-lg">CONNECT WITH US</h1>
        </div>

        <div className="flex justify-center lg:justify-start items-center gap-4 pt-4">
          <FaEnvelope
            size={24}
            className="cursor-pointer"
            onClick={() =>
              (location.href = "mailto:infinitechadvertisingcorp@gmail.com")
            }
          />
          <FaFacebook
            size={24}
            className="cursor-pointer"
            onClick={() =>
              open(
                "https://www.facebook.com/profile.php?id=100080647808810"
              )
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Content;
