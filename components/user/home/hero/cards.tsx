"use client";

import React from "react";
import { Card, CardBody, Link } from "@heroui/react";
import { services } from "@/data/services";

const Cards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-6">
      {services.map((service) => (
        <Card
          className="border border-white/20 bg-white/30
                        backdrop-blur-xs shadow-lg rounded-xl w-full p-4 flex flex-col items-center text-center"
          key={service.name}
          isBlurred
          as={Link}
          href="/services"
        >
          <CardBody>
            <service.icon className="h-10 w-10 text-accent-light mb-3" />
            <h3 className="text-lg font-semibold text-gray-100 mb-2">
              {service.name}
            </h3>
            <h3 className="text-gray-400  text-sm">{service.description}</h3>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

export default Cards;
