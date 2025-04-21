"use client";

import "keen-slider/keen-slider.min.css";
import React from "react";
import { Image } from "@heroui/react";
import { useKeenSlider } from "keen-slider/react";

const List = () => {
  const projects = [
    { name: "ABIC Realty", image: "abic.png" },
    { name: "DMCI Homes", image: "dmci.png" },
    { name: "Juantap", image: "juantap.png" },
  ];

  const [ref] = useKeenSlider<HTMLDivElement>({
    slides: {
      perView: 1,
    },
    breakpoints: {
      "(min-width: 1536px)": {
        slides: { perView: 2, spacing: 15 },
      },
    },
  });

  return (
    <div ref={ref} className="keen-slider">
      {projects.map((project) => (
        <div
          key={project.name}
          className="keen-slider__slide px-4 md:px-0 cursor-pointer flex justify-center"
        >
          <Image
            alt="Project"
            src={`/images/projects/${project.image}`}
            className="border border-gray-400 h-[40rem]"
          />
        </div>
      ))}
    </div>
  );
};

export default List;
