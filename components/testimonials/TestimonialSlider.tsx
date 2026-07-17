"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Testimonial } from "./types";
import TestimonialCard from "./TestimonialCard";

const AUTO_DELAY = 3500;

export default function TestimonialSlider({
  testimonials,
  onCardClick,
}: {
  testimonials: Testimonial[];
  onCardClick: (testimonial: Testimonial) => void;
}) {
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = testimonials.length;

  const goTo = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(idx, total - 1));
      setCurrent(clamped);
      const card = cardRefs.current[clamped];
      if (card && trackRef.current) {
        const trackLeft = trackRef.current.getBoundingClientRect().left;
        const cardLeft = card.getBoundingClientRect().left;
        const offset = trackRef.current.scrollLeft + (cardLeft - trackLeft);
        trackRef.current.scrollTo({ left: offset, behavior: "smooth" });
      }
    },
    [total],
  );

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setCurrent((prev) => {
        const next = prev >= total - 1 ? 0 : prev + 1;
        const card = cardRefs.current[next];
        if (card && trackRef.current) {
          const trackLeft = trackRef.current.getBoundingClientRect().left;
          const cardLeft = card.getBoundingClientRect().left;
          const offset = trackRef.current.scrollLeft + (cardLeft - trackLeft);
          trackRef.current.scrollTo({ left: offset, behavior: "smooth" });
        }
        return next;
      });
    }, AUTO_DELAY);
  }, [total]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    startTimer();
  }, [startTimer]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let scrollTimer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        let closest = 0;
        let minDist = Infinity;
        cardRefs.current.forEach((card, i) => {
          if (!card) return;
          const dist = Math.abs(
            card.getBoundingClientRect().left -
              track.getBoundingClientRect().left,
          );
          if (dist < minDist) {
            minDist = dist;
            closest = i;
          }
        });
        setCurrent(closest);
      }, 80);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      clearTimeout(scrollTimer);
    };
  }, [total]);

  return (
    <div className="mt-8">
      <div
        ref={trackRef}
        className="flex items-stretch gap-4 overflow-x-auto pb-2 touch-pan-x"
        style={
          {
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          } as React.CSSProperties
        }
      >
        <style>{`.testimonial-track::-webkit-scrollbar{display:none}`}</style>
        {testimonials.map((t, i) => (
          <div
            key={t.id}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="flex-shrink-0 flex"
          >
            <TestimonialCard testimonial={t} onClick={onCardClick} />
          </div>
        ))}
        <div className="flex-shrink-0 w-4" aria-hidden />
      </div>

      <div className="flex items-center gap-3 mt-5">
        <button
          onClick={() => {
            goTo(current - 1);
            resetTimer();
          }}
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors flex-shrink-0"
          aria-label="Previous"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          onClick={() => {
            goTo(current + 1);
            resetTimer();
          }}
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors flex-shrink-0"
          aria-label="Next"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        <div className="flex gap-1.5 ml-1 flex-wrap">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                goTo(i);
                resetTimer();
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-5 bg-primary" : "w-1.5 bg-gray-200"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <span className="ml-auto text-xs text-gray-400 flex-shrink-0">
          {current + 1} / {total}
        </span>
      </div>
    </div>
  );
}
