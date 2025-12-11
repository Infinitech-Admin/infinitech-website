import React from "react";
import { poetsen_one } from "@/config/fonts";
import SolutionsCard from "@/components/user/home/solutions/solutionscard";
import SurveyForm from "@/components/survey-form";

const Page = () => {
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
              <h1 className="text-4xl text-accent font-bold mt-12">SOLUTIONS</h1>
              <h1 className={`text-3xl text-primary ${poetsen_one.className}`}>
                We design & build your custom website
              </h1>
            </div>
          </div>

          <div>
            <SolutionsCard />
          </div>
        </div>
      </section>

      {/* Survey Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-3">
              Client Discovery Survey
            </h2>
            <p className="text-blue-200 text-lg">
              To help us better understand your operational needs and how technology can support your business, please take a moment to complete this survey.
            </p>
          </div>

          <SurveyForm />
        </div>
      </main>
    </div>
  );
};

export default Page;
