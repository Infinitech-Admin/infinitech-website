"use client"

import "keen-slider/keen-slider.min.css"
import React, { useMemo, useState, useEffect } from "react"
import { Card, CardBody, CardFooter, Divider } from "@heroui/react"
import { useKeenSlider } from "keen-slider/react"

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

  // only use slider if looping
  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    loop,
    slides: { perView: 3, spacing: 15 },
    breakpoints: {
      "(max-width: 1024px)": { slides: { perView: 2, spacing: 12 } },
      "(max-width: 640px)": { slides: { perView: 1, spacing: 10 } },
    },
    created(slider) {
      if (!loop) return

      let timeout: ReturnType<typeof setTimeout>
      let mouseOver = false

      const clearNextTimeout = () => clearTimeout(timeout)
      const nextTimeout = () => {
        clearTimeout(timeout)
        if (mouseOver || !slider.track?.details) return
        timeout = setTimeout(() => slider.next(), 3000)
      }

      slider.container.addEventListener("mouseenter", () => {
        mouseOver = true
        clearNextTimeout()
      })

      slider.container.addEventListener("mouseleave", () => {
        mouseOver = false
        nextTimeout()
      })

      slider.on("dragStarted", clearNextTimeout)
      slider.on("animationEnded", nextTimeout)
      slider.on("updated", nextTimeout)

      nextTimeout()
    },
  })

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
    <div className="mt-12 my-2">
      <div ref={sliderRef} className="keen-slider">
        {testimonials.map((t) => (
          <div key={t.id || t.name} className="keen-slider__slide flex justify-center">
            <TestimonialCard testimonial={t} />
          </div>
        ))}
      </div>
    </div>
  )
}

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => (
  <Card className="bg-gray-100 shadow-none flex flex-col justify-between max-w-sm w-full">
    <CardBody className="px-6 py-4">
      <p className="text-lg leading-relaxed">"{testimonial.message}"</p>
    </CardBody>

    <CardFooter className="px-6 pb-4">
      <div className="w-full">
        <Divider className="my-4" />
        <h4 className="font-semibold uppercase text-2xl">{testimonial.name}</h4>
        <span className="text-sm text-gray-500">{testimonial.position}</span>
      </div>
    </CardFooter>
  </Card>
)

export default TestimonialSlider
