"use client";
import React, { useState } from "react";
import { Card, CardBody, CardFooter, Image, Link } from "@heroui/react";
import { members } from "@/data/members";

const Cards = () => {
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  // Helper function to parse positions if they contain multiple titles
  const parsePositions = (position: string) => {
    if (position.includes(" | ")) {
      return position.split(" | ");
    }
    return [position];
  };

  const toggleExpand = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {members.map((member, index) => {
        const positions = parsePositions(member.position);
        const hasMultiplePositions = positions.length > 1;
        const isExpanded = expandedCards.has(index);
        
        return (
          <Card
            key={member.name}
            className="bg-gray-100 shadow-none"
            as={Link}
            href={`/about/${index}`}
          >
            <CardBody className="p-0">
              <div className="h-[280px] sm:h-[320px] overflow-hidden">
                <Image
                  src={`/images/members/${member.image}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </CardBody>
            <CardFooter className="pt-3 pb-3 px-3">
              <div className="w-full">
                <h1 className="uppercase font-semibold text-lg leading-tight mb-1">{member.name}</h1>
                {hasMultiplePositions ? (
                  <>
                    <div className="flex flex-col gap-0.5 text-xs sm:text-sm font-medium leading-tight">
                      <span>{positions[0].trim()}</span>
                      {isExpanded && positions.slice(1).map((pos, idx) => (
                        <span key={idx + 1}>{pos.trim()}</span>
                      ))}
                    </div>
                    <button
                      onClick={(e) => toggleExpand(index, e)}
                      className="text-xs text-blue-600 hover:text-blue-800 mt-1 font-medium"
                    >
                      {isExpanded ? "View Less" : `View More (${positions.length - 1} more)`}
                    </button>
                  </>
                ) : (
                  <span className="text-sm font-medium block">{member.position}</span>
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
