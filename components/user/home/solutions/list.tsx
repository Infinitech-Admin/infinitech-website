"use client";

import "keen-slider/keen-slider.min.css";
import React, { useEffect, useRef, useState } from "react";
import { Image } from "@heroui/react";
import KeenSlider, { KeenSliderInstance } from "keen-slider";

// Autoplay plugin (continuous loop)
function Autoplay(slider: KeenSliderInstance) {
  let timeout: any;
  let mouseOver = false;

  function clearNextTimeout() {
    clearTimeout(timeout);
  }
  function nextTimeout() {
    clearTimeout(timeout);
    if (mouseOver) return;
    timeout = setTimeout(() => {
      slider.next();
    }, 2500); // interval
  }

  slider.on("created", () => {
    slider.container.addEventListener("mouseover", () => {
      mouseOver = true;
      clearNextTimeout();
    });
    slider.container.addEventListener("mouseout", () => {
      mouseOver = false;
      nextTimeout();
    });
    nextTimeout();
  });
  slider.on("dragStarted", clearNextTimeout);
  slider.on("animationEnded", nextTimeout);
  slider.on("updated", nextTimeout);
}

const List = () => {
  const projects = [
    { name: "Juantap", image: "juantap.png", link: "" },
    { name: "Consultancy", image: "consultancy.png", link: "https://abicconsultancy.vercel.app" },
    { name: "Yama", image: "yama.png", link: "https://yamaaraw-ecom-shopph.vercel.app" },
    { name: "Abic", image: "abic.png", link: "https://abicrealtyph.com/" },
    { name: "DMCI", image: "dmci.png", link: "https://dmci-agent-website.vercel.app/" },
    { name: "Manpower", image: "manpower.png", link: "https://abicmanpower.com/" },
    { name: "Leluxe", image: "leluxe.png", link: "https://leluxe-clinic.vercel.app/" },
  ];

  const sliderRef = useRef<HTMLDivElement | null>(null);
  const sliderInstance = useRef<KeenSliderInstance | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!sliderRef.current) return;

    sliderInstance.current = new KeenSlider(sliderRef.current, {
      loop: true,
      renderMode: "performance",
      slides: { perView: 1, spacing: 15 },
      slideChanged(slider) {
        setCurrentSlide(slider.track.details.rel);
      },
    }, [Autoplay]);

    return () => sliderInstance.current?.destroy();
  }, []);

  return (
    <div className="relative perspective-[1200px]">
      <div ref={sliderRef} className="keen-slider">
        {projects.map((project, idx) => (
          <div
            key={project.name}
            className="keen-slider__slide flex justify-center transition-all duration-700"
          >
            <a href={project.link} target="_blank" rel="noopener noreferrer">
              <Image
                alt={project.name}
                src={`/images/projects/${project.image}`}
                className={`w-[400px] h-[500px] rounded-md shadow-md object-cover bg-white transform transition-transform duration-700 ease-in-out ${
                  currentSlide === idx
                    ? "scale-105 rotate-x-6"
                    : "scale-90 opacity-70"
                }`}
              />
            </a>
          </div>
        ))}
      </div>

      {/* Arrows (still working) */}
      <button
        onClick={() => sliderInstance.current?.prev()}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full shadow p-2"
      >
        ‹
      </button>
      <button
        onClick={() => sliderInstance.current?.next()}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full shadow p-2"
      >
        ›
      </button>

      {/* Dots */}
      <div className="flex justify-center mt-4 space-x-2">
        {projects.map((_, idx) => (
          <button
            key={idx}
            onClick={() => sliderInstance.current?.moveToIdx(idx)}
            className={`w-3 h-3 rounded-full transition-all ${
              currentSlide === idx ? "bg-accent scale-125" : "bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default List;
