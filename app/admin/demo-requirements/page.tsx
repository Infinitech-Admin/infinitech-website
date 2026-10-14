import AdminDemoRequirementsPage from "@/components/admin-demo-requirements-page";

export const metadata = {
  title: "Admin - Website Demo Requirements",
  description: "Manage website demo requirements submissions",
};

export default function AdminDemoPage() {
  return (
    <>
      <div className="admin-demo-requirements-light min-h-full bg-slate-50 text-slate-900">
        <AdminDemoRequirementsPage />
      </div>
      <style>{`
        .admin-demo-requirements-light [class*="dark:bg-"] {
          background-color: #fff !important;
        }

        .admin-demo-requirements-light [class*="dark:hover:bg-"]:hover {
          background-color: #eff6ff !important;
        }

        .admin-demo-requirements-light [class*="dark:text-"] {
          color: #0f172a !important;
        }

        .admin-demo-requirements-light [class*="dark:hover:text-"]:hover {
          color: #1d4ed8 !important;
        }

        .admin-demo-requirements-light [class*="dark:border-"] {
          border-color: #e2e8f0 !important;
        }

        .admin-demo-requirements-light [class*="dark:hover:border-"]:hover {
          border-color: #bfdbfe !important;
        }

        .admin-demo-requirements-light [class*="dark:from-"],
        .admin-demo-requirements-light [class*="dark:via-"],
        .admin-demo-requirements-light [class*="dark:to-"] {
          --tw-gradient-from: #f8fafc var(--tw-gradient-from-position) !important;
          --tw-gradient-to: rgb(248 250 252 / 0) var(--tw-gradient-to-position) !important;
          --tw-gradient-stops:
            var(--tw-gradient-from), var(--tw-gradient-to) !important;
        }
      `}</style>
    </>
  );
}
