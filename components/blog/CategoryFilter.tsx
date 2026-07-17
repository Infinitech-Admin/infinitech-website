"use client";

import { useRef, useState, useEffect } from "react";

interface CategoryFilterProps {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
}

export default function CategoryFilter({
  categories,
  active,
  onChange,
}: CategoryFilterProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const all = ["All", ...categories];

  const updateFades = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setShowLeftFade(el.scrollLeft > 4);
    setShowRightFade(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateFades();
    window.addEventListener("resize", updateFades);
    return () => window.removeEventListener("resize", updateFades);
  }, [categories]);

  return (
    <div className="relative max-w-full mt-8">
      {showLeftFade && (
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-r from-white to-transparent" />
      )}
      {showRightFade && (
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-l from-white to-transparent" />
      )}

      <div
        ref={scrollerRef}
        onScroll={updateFades}
        className="flex items-center gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden justify-center"
      >
        {all.map((cat) => {
          const isActive = cat === active;
          return (
            <button
              key={cat}
              onClick={() => onChange(cat)}
              className={`relative snap-start shrink-0 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 border ${
                isActive
                  ? "bg-accent text-white border-accent shadow-sm shadow-accent/30"
                  : "bg-white text-gray-500 border-gray-200 hover:border-accent/40 hover:text-accent"
              }`}
            >
              {cat}
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
