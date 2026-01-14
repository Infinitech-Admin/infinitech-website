"use client"
import React, { useEffect, useState } from "react"
import { poetsen_one } from "@/config/fonts"
import SolutionsCard from "@/components/user/home/solutions/solutionscard"
import SurveyForm from "@/components/survey-form"
import { Button } from "@/components/ui/button"
import { FaArrowDown } from "react-icons/fa6"
import TestimonialSlider from "@/components/testimonials-slider"
import { solutionsTestimonials } from "@/data/testimonials-solutions"

const Solutions = () => {
  const scrollToSurvey = () => {
    const el = document.getElementById("survey-form")
    if (!el) return

    const yOffset = -80
    const y = el.getBoundingClientRect().top + window.scrollY + yOffset

    window.scrollTo({ top: y, behavior: "smooth" })
  }
  return (
    <div>
      {/* Solutions Section */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col justify-center items-center">
          <div className="text-center w-full mb-5">
            <h2 className="text-2xl font-bold text-accent mb-2 uppercase">Your Experience Shapes Our Solution</h2>
            <p className="text-md text-gray-300 max-w-xl mx-auto leading-relaxed">
              Every project we deliver is built around your needs. By sharing your thoughts, you help us refine our process and create solutions that
              truly resonate with you.
            </p>
          </div>

          <div className="flex justify-center items-center w-full mb-10">
            <Button
              onClick={scrollToSurvey}
              className="relative z-20 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-semibold rounded-full shadow-lg hover:scale-105 transition-transform duration-300"
            >
              <FaArrowDown className="mr-2 animate-bounce" /> Take the Survey
            </Button>
          </div>

          <div className="w-full">
            <SolutionsCard />
          </div>
        </div>
      </section>

      {/* Survey Section */}
      <section id="survey-form" className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-3">
              Client Discovery Survey
            </h2>
            <p className="text-blue-200 text-lg">
              To help us better understand your operational needs and how technology can support your business, please take a moment to complete this
              survey.
            </p>
          </div>

          <SurveyForm />
        </div>
      </section>
    </div>
  )
}

export default Solutions
