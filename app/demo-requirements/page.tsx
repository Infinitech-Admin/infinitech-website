import DemoRequirementsForm from "@/components/demo-requirements-form"

export const metadata = {
  title: "Website Demo Requirements Form",
  description: "Submit your website demo requirements and let us create a perfect website for your business",
}

export default function DemoRequirementsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-blue-900/10 dark:to-purple-950/10 py-8">
      <div className="max-w-4xl mx-auto px-4 mt-12">
        

        <DemoRequirementsForm />
      </div>
    </div>
  )
}
