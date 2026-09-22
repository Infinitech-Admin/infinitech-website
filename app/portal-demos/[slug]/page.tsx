// 📁 Place this file at: app/portal-demos/[slug]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { RoleSelectModal } from "@/components/portal-demo-public/RoleSelectModal";
import { PortalShell } from "@/components/portal-demo-public/PortalShell";
import { DemoToastProvider } from "@/components/portal-demo-public/DemoToaster";
import {
  fetchPublicPortalDemoBySlug,
  type PublicPortalDemo,
} from "@/lib/portalDemoPublicApi";
import type { PortalDemoRoleRecord } from "@/lib/portalDemoApi";

export default function PortalDemoDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const [demo, setDemo] = useState<PublicPortalDemo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<PortalDemoRoleRecord | null>(
    null,
  );

  useEffect(() => {
    if (!params?.slug) return;
    fetchPublicPortalDemoBySlug(params.slug)
      .then((data) => {
        setDemo(data);
        setRoleModalOpen(true); // Step 4: role selection appears right away
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Demo not found."),
      )
      .finally(() => setLoading(false));
  }, [params?.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-2 text-muted-foreground">
        <Loader className="h-5 w-5 animate-spin" />
        Loading portal demo...
      </div>
    );
  }

  if (error || !demo) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error || "Demo not found."}
      </div>
    );
  }

  // Step 6-12: role picked → enter the interactive portal shell.
  if (selectedRole) {
    return (
      <DemoToastProvider>
        <PortalShell
          demo={demo}
          role={selectedRole}
          onSwitchRole={() => {
            setSelectedRole(null);
            setRoleModalOpen(true);
          }}
          onExit={() => router.push("/portal-demos")}
        />
      </DemoToastProvider>
    );
  }

  // Step 3-5: demo loaded, waiting for a role to be picked.
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {demo.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={demo.image_url}
            alt={demo.name}
            className="w-full h-40 object-cover rounded-xl mb-6"
          />
        )}
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {demo.name}
        </h1>
        <p className="text-muted-foreground mb-6">{demo.description}</p>
        <button
          onClick={() => setRoleModalOpen(true)}
          className="text-cyan-700 dark:text-cyan-400 text-sm font-medium underline"
        >
          Choose a role to enter the demo
        </button>
      </div>

      <RoleSelectModal
        open={roleModalOpen}
        demoName={demo.name}
        roles={demo.roles || []}
        onOpenChange={setRoleModalOpen}
        onSelect={(role) => {
          setSelectedRole(role);
          setRoleModalOpen(false);
        }}
      />
    </div>
  );
}
