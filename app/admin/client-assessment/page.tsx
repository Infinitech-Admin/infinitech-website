import AdminClientAssessmentPage from "@/components/client-admin-assessment-page";

export const metadata = {
  title: "Admin - Website Demo Requirements",
  description: "Manage website demo requirements submissions",
};

export default function AdminDemoPage() {
  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <AdminClientAssessmentPage />
    </div>
  );
}
