"use client";

import React from "react";
import { Card, CardBody, Link, Button } from "@heroui/react";
import { LuArrowRight } from "react-icons/lu";
import { services } from "@/data/services";

const Cards = () => {
  return (
    <div className="py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((service) => (
          <Card
            className="border border-white/20 bg-white/30
                        backdrop-blur-xs shadow-lg rounded-xl w-full p-4 flex flex-col items-center text-center
                        hover:scale-[1.02] transition-transform"
            key={service.name}
            isBlurred
            as={Link}
            href="/services"
          >
            <CardBody className="items-center">
              <service.icon className="h-10 w-10 text-accent-light mb-3" />
              <h3 className="text-lg font-semibold text-gray-100 mb-1">
                {service.name}
              </h3>
              <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                {service.description}
              </p>
              <span className="flex items-center gap-1 text-xs text-accent-light font-medium">
                Learn More <LuArrowRight size={14} />
              </span>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="flex justify-center pt-8">
        <Button
          as={Link}
          href="/services"
          size="lg"
          variant="bordered"
          className="border-accent text-accent-light font-medium"
          endContent={<LuArrowRight size={18} />}
        >
          Explore All Services
        </Button>
      </div>
    </div>
  );
};

export default Cards;
