import { Suspense } from "react"
import AdminVideoSurveyPageContent from "./admin-video-survey-content"

export default function AdminVideoSurveyPage() {
  return (
    <Suspense fallback={null}>
      <AdminVideoSurveyPageContent />
    </Suspense>
  )
}
