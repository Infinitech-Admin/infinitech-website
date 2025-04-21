"use client";

import React from "react";
import { Card, CardBody } from "@heroui/react";
import { poetsen_one } from "@/config/fonts";
import { FaBullseye, FaRocket, FaLightbulb } from "react-icons/fa";

const VMG = () => {
  const sections = [
    {
      name: "Mission",
      description:
        "We are committed to helping our clients achieve operational excellence and sustainable growth through specialized, technology-driven strategies that solve difficult problems.",
      icon: <FaLightbulb size={28} />,
    },
    {
      name: "Vision",
      description:
        "Infinitech aims to be a top choice for businesses looking to enhance their digital presence. By using the latest technology and creative ideas, we strive to lead the industry and help clients grow and succeed.",
      icon: <FaRocket size={28} />,
    },
    {
      name: "Goal",
      description:
        "To successfully adapt the latest technological advancements and continuously innovate in digital advertising strategies, ensuring the delivery of unique and measurable results for clients.",
      icon: <FaBullseye size={28} />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 2xl:py-12 px-4">
      {sections.map((section) => (
        <Card key={section.name} className="bg-gray-100 shadow-none">
          <CardBody>
            <div className="py-6 px-4 space-y-4 text-center">
              <div className="flex justify-center">
                <div className="bg-blue-200 text-blue-900 p-3 rounded-full">
                  {section.icon}
                </div>
              </div>

              <h1 className={`text-3xl text-primary ${poetsen_one.className}`}>
                {section.name}
              </h1>

              <p className="text-gray-700 text-lg">{section.description}</p>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

export default VMG;
