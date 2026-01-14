"use client"

import "keen-slider/keen-slider.min.css"
import React, { useMemo, useState, useEffect } from "react"
import { Card, CardBody, CardFooter, Divider } from "@heroui/react"
import { useKeenSlider } from "keen-slider/react"
import Marquee from "react-fast-marquee"

export interface Testimonial {
  id?: number
  name: string
  position: string
  category: string
  message: string
}

interface TestimonialsSliderProps {
  testimonials: Testimonial[]
}

const TestimonialSlider: React.FC<TestimonialsSliderProps> = ({ testimonials }) => {
  const [isMobile, setIsMobile] = useState(false)

  // detect mobile
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)")
    setIsMobile(mediaQuery.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  const realSlidesCount = testimonials.length
  const loop = isMobile ? realSlidesCount > 1 : realSlidesCount > 3

  // If loop is false, render static flex grid
  if (!loop) {
    return (
      <div className="mt-12 my-2 flex gap-6 justify-start">
        {testimonials.map((t) => (
          <TestimonialCard key={t.id || t.name} testimonial={t} />
        ))}
      </div>
    )
  }

  // loop true, render slider
  return (
    <Marquee pauseOnHover pauseOnClick speed={50}>
      <div className="mt-5">
        <div className="keen-slider">
          {testimonials.map((t) => (
            <div key={t.id || t.name} className="keen-slider__slide flex justify-center mx-3">
              <TestimonialCard testimonial={t} />
            </div>
          ))}
        </div>
      </div>
    </Marquee>
  )
}

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => (
  <Card className="m-4 bg-white shadow-lg flex flex-col justify-between max-w-sm w-full border-amber-500 border-1 transform transition-transform duration-300 hover:scale-105">
    <CardBody className="px-6 py-4">
      <p className="text-lg leading-relaxed bg-gradient-to-r from-accent to-orange-700 bg-clip-text text-transparent text-justify">
        {testimonial.message}
      </p>
    </CardBody>

    <CardFooter className="px-6 pb-4">
      <div className="w-full">
        <Divider className="my-4 bg-accent" />
        <h4 className="font-semibold uppercase text-2xl">{testimonial.name}</h4>
        <span className="text-sm text-gray-500">{testimonial.position}</span>
      </div>
    </CardFooter>
  </Card>
)

export default TestimonialSlider
