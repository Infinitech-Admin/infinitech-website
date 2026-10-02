"use client";
import React, { useState } from "react";
import Link from "next/link";
import { members } from "@/data/members";

const Cards = () => {
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  // Parse positions if they contain multiple titles
  const parsePositions = (position: string) =>
    position.includes(" | ") ? position.split(" | ") : [position];

  const toggleExpand = (index: number) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {members.map((member, index) => {
        const positions = parsePositions(member.position);
        const hasMultiple = positions.length > 1;
        const isExpanded = expandedCards.has(index);

        return (
          <div
            key={member.name}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#38bdf8]/40 bg-gradient-to-b from-[#1c2d63] to-[#111e45] shadow-[0_0_35px_rgba(56,189,248,0.25)] transition duration-300 hover:-translate-y-1 hover:border-[#38bdf8] hover:shadow-[0_0_60px_rgba(56,189,248,0.5)]"
          >
            <span
              aria-hidden
              className="absolute -top-px left-6 z-10 h-[2px] w-28 rounded-full bg-gradient-to-r from-transparent via-[#38bdf8] to-transparent opacity-100 shadow-[0_0_18px_rgba(56,189,248,1)]"
            />

            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-24 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.25),transparent_70%)]"
            />

            <Link
              href={`/about/${index}`}
              className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#38bdf8]"
            >
              <div className="relative h-[280px] overflow-hidden sm:h-[320px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/images/members/${member.image}`}
                  alt={member.name}
                  className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                />
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-24"
                  style={{
                    backgroundImage:
                      "linear-gradient(to top, #111e45, transparent)",
                  }}
                />
              </div>
              <h3 className="px-4 pt-3 text-lg font-semibold uppercase leading-tight text-white">
                {member.name}
              </h3>
            </Link>

            <div className="flex-1 px-4 pb-4 pt-1">
              <div className="flex flex-col gap-0.5 font-mono text-xs leading-snug text-[#f5a623] sm:text-[13px]">
                <span>{positions[0].trim()}</span>
                {isExpanded &&
                  positions
                    .slice(1)
                    .map((pos, idx) => <span key={idx + 1}>{pos.trim()}</span>)}
              </div>
              {hasMultiple && (
                <button
                  onClick={() => toggleExpand(index)}
                  className="mt-2 text-xs font-medium text-[#38bdf8] transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#38bdf8]"
                >
                  {isExpanded
                    ? "View Less"
                    : `View More (${positions.length - 1} more)`}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Cards;
