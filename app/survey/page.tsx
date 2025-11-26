import SurveyForm from "@/components/survey-form"

export default function SurveyPage() {
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-3">
              Client Discovery Survey
            </h2>
            <p className="text-blue-200 text-lg">
              Help us understand your needs so we can deliver the perfect solution
            </p>
          </div>

          <SurveyForm />
        </div>
      </main>
    </div>
  )
}
