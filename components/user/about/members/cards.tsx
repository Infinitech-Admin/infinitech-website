"use client";

import React from "react";
import { Card, CardBody, CardFooter, Image, Link } from "@heroui/react";
import { members } from "@/data/members";

const Cards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {members.map((member, index) => (
        <Card
          key={member.name}
          className="bg-gray-100 shadow-none"
          as={Link}
          href={`/about/${index}`}
        >
          <CardBody>
            <div>
              <Image
                src={`/images/members/${member.image}`}
                className="w-[63rem] min-h-[9rem] object-cover"
              />
            </div>
          </CardBody>
          <CardFooter>
            <div>
              <h1 className="uppercase font-semibold text-lg">{member.name}</h1>
              <span className="text-sm font-medium">{member.position}</span>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default Cards;
