import React from "react"
import { Divider } from "@heroui/react"

const FilledStar = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 .587l3.668 7.431L23.4 9.75l-5.4 5.262L19.836 23 12 19.771 4.164 23l1.836-7.988L0.6 9.75l7.732-1.732L12 .587z" />
  </svg>
)

const OutlineStar = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 .587l3.668 7.431L23.4 9.75l-5.4 5.262L19.836 23 12 19.771 4.164 23l1.836-7.988L0.6 9.75l7.732-1.732L12 .587z" />
  </svg>
)

const Reviews = () => {
  return (
    <div className="flex flex-col lg:flex-row justify-center items-center text-center lg:text-left lg:space-x-24 space-y-12 lg:space-y-0 mt-12">
      <div className="space-y-2 lg:space-y-4">
        <h1 className="text-4xl font-semibold text-primary">50+</h1>
        <p className="text-lg text-gray-700 max-w-xs mx-auto lg:mx-0">Ongoing Projects for Various Industries</p>
      </div>

      <Divider orientation="vertical" className="h-24 hidden lg:flex border-gray-300" />

      <div className="space-y-2 lg:space-y-4">
        <div className="flex justify-center lg:justify-start items-center gap-1 text-3xl">
          {(() => {
            const rating = 4.8
            return Array.from({ length: 5 }).map((_, index) => {
              const fillPercent = Math.max(0, Math.min(100, (rating - index) * 100))

              return (
                <span key={index} className="relative inline-block w-6 h-6">
                  <span className="absolute left-0 top-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
                    <FilledStar className="text-yellow-500 w-6 h-6" />
                  </span>
                  <OutlineStar className="text-yellow-300 w-6 h-6" />
                </span>
              )
            })
          })()}
        </div>
        <p className="text-lg text-gray-700 max-w-xs mx-auto lg:mx-0">4.8+ Overall Rating from Satisfied Clients Across Multiple Platforms</p>
      </div>

      <Divider orientation="vertical" className="h-24 hidden lg:flex border-gray-300" />

      <div className="space-y-2 lg:space-y-4">
        <h1 className="text-4xl font-semibold text-primary">100%</h1>
        <p className="text-lg text-gray-700 max-w-xs mx-auto lg:mx-0">Tailor-Made Web and System Solutions for Seamless Business Operations</p>
      </div>
    </div>
  )
}

export default Reviews
