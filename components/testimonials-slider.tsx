"use client"

import "keen-slider/keen-slider.min.css"
import React, { useEffect, useMemo } from "react"
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
type SlideItem = Testimonial | null

const TestimonialSlider: React.FC<TestimonialsSliderProps> = ({ testimonials }) => {
  const slides = useMemo<SlideItem[]>(() => {
    const padded: SlideItem[] = [...testimonials]

    while (padded.length < 3) {
      padded.push(null)
    }

    return padded
  }, [testimonials])

  const realSlidesCount = slides.length

  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    loop: slides.filter(Boolean).length > 1,
    slides: { perView: 3, spacing: 15 },
    breakpoints: {
      "(max-width: 768px)": {
        slides: { perView: 1, spacing: 10 },
      },
    },

    created(slider) {
      if (realSlidesCount <= 3) return
      if (slides.filter(Boolean).length <= 1) return

      let timeout: ReturnType<typeof setTimeout>
      let mouseOver = false

      const clearNextTimeout = () => clearTimeout(timeout)

      const nextTimeout = () => {
        clearTimeout(timeout)
        if (mouseOver || !slider.track?.details) return
        timeout = setTimeout(() => {
          slider.next()
        }, 3000)
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

  return (
    <div className="mt-12 my-4">
      <div ref={sliderRef} className="keen-slider" key={testimonials.length}>
        {slides.map((testimonial, index) => (
          <div key={index} className="keen-slider__slide flex justify-center">
            {testimonial ? (
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
            ) : (
              <div className="w-full max-w-sm" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TestimonialSlider
