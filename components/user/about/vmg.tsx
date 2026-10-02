"use client";

import React from "react";
import { FaBullseye, FaRocket, FaLightbulb } from "react-icons/fa";

const VMG = () => {
  const sections = [
    {
      name: "Mission",
      description:
        "We are committed to helping our clients achieve operational excellence and sustainable growth through specialized, technology-driven strategies that solve difficult problems.",
      icon: FaLightbulb,
    },
    {
      name: "Vision",
      description:
        "Infinitech aims to be a top choice for businesses looking to enhance their digital presence. By using the latest technology and creative ideas, we strive to lead the industry and help clients grow and succeed.",
      icon: FaRocket,
    },
    {
      name: "Goal",
      description:
        "To successfully adapt the latest technological advancements and continuously innovate in digital advertising strategies, ensuring the delivery of unique and measurable results for clients.",
      icon: FaBullseye,
    },
  ];

  return (
    <div className="py-12">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <span className="inline-block rounded-full border border-[#38bdf8]/30 bg-[#38bdf8]/10 px-3 py-1 font-mono text-xs text-[#38bdf8]">
          WHAT DRIVES US
        </span>
        <h2 className="mt-4 font-['Poetsen_One'] text-3xl font-bold text-white sm:text-4xl">
          Mission, vision and goal
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {sections.map((s, i) => (
          <div
            key={s.name}
            className="group relative rounded-2xl border border-[#38bdf8]/40 bg-gradient-to-b from-[#1c2d63] to-[#111e45] p-7 shadow-[0_0_35px_rgba(56,189,248,0.25)] transition duration-300 hover:-translate-y-1 hover:border-[#38bdf8] hover:shadow-[0_0_60px_rgba(56,189,248,0.5)]"
          >
            <span
              aria-hidden
              className="absolute -top-px left-8 h-[2px] w-32 rounded-full bg-gradient-to-r from-transparent via-[#38bdf8] to-transparent opacity-100 shadow-[0_0_18px_rgba(56,189,248,1)]"
            />
            <div className="flex items-center justify-between">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#38bdf8]/10 text-[#38bdf8] shadow-[0_0_24px_rgba(56,189,248,0.25)] transition group-hover:bg-[#f5a623]/15 group-hover:text-[#f5a623] group-hover:shadow-[0_0_24px_rgba(245,166,35,0.35)]">
                <s.icon size={22} />
              </span>
              <span className="font-mono text-xs text-[#5d6a92]">0{i + 1}</span>
            </div>
            <h3 className="mt-5 font-['Poetsen_One'] text-2xl text-white">
              {s.name}
            </h3>
            <p className="mt-3 leading-relaxed text-[#b8c3e6]">
              {s.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VMG;
