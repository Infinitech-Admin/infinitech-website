"use client"

import "keen-slider/keen-slider.min.css"
import React from "react"
import { poetsen_one } from "@/config/fonts"
import { solutionsTestimonials } from "@/data/testimonials-solutions"
import TestimonialSlider from "@/components/testimonials-slider"

const Cards = () => {
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="max-w-2xl mt-12 mx-auto text-center">
          <h1 className="font-bold text-accent text-4xl">TESTIMONIALS</h1>

          <h1 className={`text-4xl text-primary ${poetsen_one.className}`}>Our work brings to life the success stories of our partners</h1>
        </div>
      </div>

      <TestimonialSlider testimonials={solutionsTestimonials} />
    </div>
  )
}

export default Cards
