import { Suspense } from "react";
import AdminVideoSurveyPageContent from "./admin-video-survey-content";

export default function AdminVideoSurveyPage() {
  return (
    <div className="video-survey-light">
      <style>{`
        .video-survey-light > div {
          min-height: 100%;
          background: linear-gradient(
            135deg,
            #f8fafc,
            #eff6ff 55%,
            #f5f3ff
          ) !important;
          color: #0f172a;
        }
        .video-survey-light > div > div:first-child {
          background: linear-gradient(90deg, #2563eb, #7c3aed) !important;
        }
        .video-survey-light [class*="dark:bg-slate-"] {
          background-color: #fff !important;
        }
        .video-survey-light [class*="dark:hover:bg-"]:hover {
          background-color: #f8fafc !important;
        }
        .video-survey-light [class*="dark:text-white"],
        .video-survey-light [class*="dark:text-slate-"] {
          color: #0f172a !important;
        }
        .video-survey-light [class*="dark:border-"] {
          border-color: #e2e8f0 !important;
        }
        .video-survey-light [class*="dark:from-"] {
          --tw-gradient-from: #f8fafc var(--tw-gradient-from-position) !important;
        }
        .video-survey-light [class*="dark:to-"] {
          --tw-gradient-to: #eff6ff var(--tw-gradient-to-position) !important;
        }
      `}</style>
      <Suspense fallback={null}>
        <AdminVideoSurveyPageContent />
      </Suspense>
    </div>
  );
}
