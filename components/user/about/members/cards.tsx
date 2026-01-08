"use client";
import React from "react";
import { Card, CardBody, CardFooter, Image, Link } from "@heroui/react";
import { members } from "@/data/members";

const Cards = () => {
  // Helper function to parse positions if they contain multiple titles
  const parsePositions = (position: string) => {
    if (position.includes(" | ")) {
      return position.split(" | ");
    }
    return [position];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {members.map((member, index) => {
        const positions = parsePositions(member.position);
        
        return (
          <Card
            key={member.name}
            className="bg-gray-100 shadow-none"
            as={Link}
            href={`/about/${index}`}
          >
            <CardBody className="p-0">
              <div>
                <Image
                  src={`/images/members/${member.image}`}
                  className="w-[63rem] min-h-[9rem] object-cover"
                />
              </div>
            </CardBody>
            <CardFooter className="pt-3 pb-4">
              <div className="w-full">
                <h1 className="uppercase font-semibold text-lg">{member.name}</h1>
                {positions.length > 1 ? (
                  <div className="flex flex-col gap-0.5 text-xs sm:text-sm font-medium leading-tight mt-1">
                    {positions.map((pos, idx) => (
                      <span key={idx}>{pos.trim()}</span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm font-medium block mt-1">{member.position}</span>
                )}
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default Cards;
