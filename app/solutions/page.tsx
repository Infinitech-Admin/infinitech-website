"use client"
import React from "react"
import { poetsen_one } from "@/config/fonts"
import SolutionsCard from "@/components/user/home/solutions/solutionscard"
import SurveyForm from "@/components/survey-form"
import { Button } from "@/components/ui/button"
import { FaArrowDown } from "react-icons/fa6"

const Page = () => {
  const scrollToSurvey = () => {
    const el = document.getElementById("survey-form")
    if (!el) return

    const yOffset = -80
    const y = el.getBoundingClientRect().top + window.scrollY + yOffset

    window.scrollTo({ top: y, behavior: "smooth" })
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-sm border-b border-blue-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">∞</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">INFINITECH</h1>
                <p className="text-blue-300 text-xs">ADVERTISING CORPORATION</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Solutions Section */}
      <section className="container mx-auto py-12 px-4">
        <div className="flex flex-col justify-center items-center">
          <div className="flex justify-between">
            <div className="max-w-2xl text-center">
              <h1 className="font-bold text-accent text-4xl font-bold">SOLUTIONS</h1>
              <h1 className={`text-3xl text-white ${poetsen_one.className} mt-2`}>We design & build your custom website helping clients achieve business growth & digital transformation</h1>
            </div>
          </div>
          <div className="flex justify-end items-center w-full mb-5">
            <Button
              onClick={scrollToSurvey}
              className="relative z-20 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-semibold rounded-full shadow-lg hover:scale-105 transition-transform duration-300"
            >
              <FaArrowDown className="mr-2" /> Take the Survey
            </Button>
          </div>

          <div>
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

export default Page
