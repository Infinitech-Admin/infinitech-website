"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Inbox,
  ClipboardList,
  Video,
  IdCard,
  Ticket,
  FileCheck,
  UserCheck,
  SearchCheck,
  CalendarCheck,
  Search,
  Megaphone,
  Palette,
  TrendingUp,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ============================================================================
 * NAVIGATION CONFIG
 * One array, grouped into labeled sections. Add a new page by adding an
 * entry to the relevant section (or a new section) — the sidebar renders
 * itself from this list, nothing else to touch.
 * ========================================================================== */

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Lead Generation",
    items: [
      { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
      { href: "/admin/website-audit", label: "Website Audit", icon: Search },
      { href: "/admin/seo-audits", label: "SEO Audit", icon: SearchCheck },
      {
        href: "/admin/client-assessment",
        label: "Client Assessment",
        icon: UserCheck,
      },
      {
        href: "/admin/demo-requirements",
        label: "Demo Website Requirements",
        icon: FileCheck,
      },
    ],
  },
  {
    title: "Marketing Services",
    items: [
      { href: "/admin/graphic-design", label: "Graphic Design", icon: Palette },
      {
        href: "/admin/social-media-management",
        label: "Social Media Management",
        icon: Megaphone,
      },
      { href: "/admin/paid-ads", label: "Paid Ads", icon: TrendingUp },
      {
        href: "/admin/market-research",
        label: "Market Research",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Surveys",
    items: [
      { href: "/admin/survey", label: "Survey", icon: ClipboardList },
      { href: "/admin/juantap-survey", label: "Juantap Survey", icon: IdCard },
      { href: "/admin/video-survey", label: "Video Survey", icon: Video },
    ],
  },
  {
    title: "Customer Support",
    items: [
      {
        href: "/admin/support-tickets",
        label: "Support Tickets",
        icon: Ticket,
      },
    ],
  },
  {
    title: "Human Resources",
    items: [
      {
        href: "/admin/attendance",
        label: "OJT Attendance",
        icon: CalendarCheck,
      },
    ],
  },
];

/* ============================================================================
 * SECTION: Sidebar
 * Pure presentational — takes the current path + open/close state and
 * renders the nav. No auth or routing logic lives here.
 * ========================================================================== */

function Sidebar({
  pathname,
  isOpen,
  onClose,
  onLogout,
}: {
  pathname: string;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  const isActive = (path: string) => pathname === path;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-64 bg-gradient-to-b from-cyan-900 to-blue-900 dark:from-cyan-950 dark:to-blue-950 text-white transition-transform duration-300 flex flex-col fixed left-0 top-0 h-full shadow-lg z-50 lg:translate-x-0 lg:sticky`}
      >
        <div className="p-4 border-b border-cyan-700/50 flex items-center justify-between">
          <h1 className="text-lg font-bold text-cyan-300">Admin</h1>

          <button
            onClick={onClose}
            className="p-1 hover:bg-cyan-800 rounded-lg lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-400/70">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map(({ href, label, icon: Icon }) => (
                  <a
                    key={href}
                    href={href}
                    onClick={onClose}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm leading-tight ${
                      isActive(href)
                        ? "bg-cyan-600 text-white"
                        : "hover:bg-cyan-800/50 text-cyan-100"
                    }`}
                  >
                    <Icon size={16} className="shrink-0" />
                    {label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-cyan-700/50">
          <Button
            onClick={onLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 h-9"
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
}

/* ============================================================================
 * SECTION: Top bar
 * ========================================================================== */

function TopBar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 py-4 flex items-center justify-between">
      <button
        onClick={onOpenSidebar}
        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
      >
        <Menu size={20} />
      </button>

      <div className="text-sm text-slate-500 dark:text-slate-400">
        Admin Dashboard
      </div>
    </div>
  );
}

/* ============================================================================
 * MAIN LAYOUT
 * Handles auth gating + composes Sidebar / TopBar / page content.
 * ========================================================================== */

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/admin/login") {
      setIsChecking(false);
      return;
    }

    const token = localStorage.getItem("adminToken");

    if (!token) {
      router.push("/admin/login");
      return;
    }

    setIsAuthenticated(true);
    setIsChecking(false);
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (isChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 flex overflow-hidden">
      <Sidebar
        pathname={pathname}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col overflow-auto">
        <TopBar onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="flex-1 p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
