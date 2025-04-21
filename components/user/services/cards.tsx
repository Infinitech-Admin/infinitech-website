"use client";

import React from "react";
import { Card, CardBody } from "@heroui/react";
import { services } from "@/data/services";

const Cards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-6">
      {services.map((service) => (
        <Card
          key={service.name}
          isBlurred
          className="bg-gray-100 shadow-none rounded-xl w-full p-4 flex flex-col items-center text-center"
        >
          <CardBody>
            <service.icon className="h-10 w-10 text-accent-light mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 uppercase">
              {service.name}
            </h3>
            <p className="text-gray-700">{service.description}</p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

export default Cards;
