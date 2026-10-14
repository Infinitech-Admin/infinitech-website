"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ADMIN_NAV_ITEMS,
  NAV_SECTIONS,
  getDirectoryKeyForHref,
  getAuthorizedNavSections,
  hasDirectoryAccess,
} from "@/lib/admin-navigation";

/* ============================================================================
 * SECTION: Sidebar
 * Pure presentational — takes the current path + open/close state and
 * renders the nav. No auth or routing logic lives here.
 * ========================================================================== */

function Sidebar({
  pathname,
  isOpen,
  collapsed,
  onClose,
  onToggleCollapsed,
  onLogout,
  permissionKeys,
  isSuperadmin,
}: {
  pathname: string;
  isOpen: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapsed: () => void;
  onLogout: () => void;
  permissionKeys: string[];
  isSuperadmin: boolean;
}) {
  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);
  const sections = getAuthorizedNavSections(permissionKeys, isSuperadmin);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        id="admin-sidebar"
        data-admin-sidebar
        data-sidebar-collapsed={collapsed}
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-64 flex-col overflow-hidden bg-gradient-to-b from-cyan-900 to-blue-900 text-white shadow-lg transition-[transform,width,visibility] duration-300 ease-in-out dark:from-cyan-950 dark:to-blue-950 ${
          isOpen
            ? "visible translate-x-0 pointer-events-auto"
            : "invisible -translate-x-full pointer-events-none lg:!visible lg:!translate-x-0 lg:!pointer-events-auto"
        } ${collapsed ? "lg:w-[4.5rem]" : "lg:w-64"}`}
      >
        <div
          className={`flex items-center border-b border-cyan-700/50 p-4 ${
            collapsed ? "justify-between lg:justify-center" : "justify-between"
          }`}
        >
          <h1
            className={`text-lg font-bold text-cyan-300 ${
              collapsed ? "lg:hidden" : ""
            }`}
          >
            Admin
          </h1>

          <button
            type="button"
            aria-label="Close sidebar"
            aria-expanded={isOpen}
            aria-controls="admin-sidebar"
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-cyan-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 lg:hidden"
          >
            <X size={20} />
          </button>

          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            aria-controls="admin-sidebar"
            onClick={onToggleCollapsed}
            className="hidden rounded-lg p-1 hover:bg-cyan-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 lg:inline-flex"
          >
            {collapsed ? (
              <PanelLeftOpen size={20} />
            ) : (
              <PanelLeftClose size={20} />
            )}
          </button>
        </div>

        <nav
          aria-label="Admin navigation"
          className={`min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-4 ${
            collapsed ? "lg:px-0" : ""
          }`}
        >
          {sections.map((section) => (
            <div key={section.title}>
              <p
                className={`mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-cyan-400/70 ${
                  collapsed ? "lg:hidden" : ""
                }`}
              >
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    title={collapsed ? label : undefined}
                    onClick={onClose}
                    className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm leading-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
                      isActive(href)
                        ? "bg-cyan-600 text-white"
                        : "hover:bg-cyan-800/50 text-cyan-100"
                    } ${collapsed ? "lg:justify-center lg:px-0" : ""}`}
                  >
                    <Icon size={16} className="shrink-0" />
                    <span className={collapsed ? "lg:hidden" : ""}>
                      {label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="space-y-2 border-t border-cyan-700/50 px-3 py-3">
          <Link
            href="/"
            title={collapsed ? "Back to Site" : undefined}
            aria-label={collapsed ? "Back to Site" : undefined}
            onClick={onClose}
            className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm text-cyan-100 hover:bg-cyan-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
              collapsed ? "lg:px-0" : ""
            }`}
          >
            <ArrowLeft size={16} className="shrink-0" />
            <span className={collapsed ? "lg:hidden" : ""}>Back to Site</span>
          </Link>
          <Button
            onClick={onLogout}
            aria-label={collapsed ? "Logout" : undefined}
            title={collapsed ? "Logout" : undefined}
            className={`flex h-9 w-full items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 ${
              collapsed ? "lg:px-0" : ""
            }`}
          >
            <LogOut size={16} />
            <span className={collapsed ? "lg:hidden" : ""}>Logout</span>
          </Button>
        </div>
      </aside>
    </>
  );
}

/* ============================================================================
 * SECTION: Top bar
 * ========================================================================== */

function TopBar({
  sidebarOpen,
  onOpenSidebar,
  pathname,
}: {
  sidebarOpen: boolean;
  onOpenSidebar: () => void;
  pathname: string;
}) {
  const pageItems = getAuthorizedNavSections([], true)
    .flatMap((section) => section.items)
    .sort((left, right) => right.href.length - left.href.length);
  const pageTitle =
    pageItems.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    )?.label ?? "Admin";

  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 py-4 flex items-center justify-between">
      <button
        type="button"
        aria-label="Open sidebar"
        aria-expanded={sidebarOpen}
        aria-controls="admin-sidebar"
        onClick={onOpenSidebar}
        className="rounded-lg p-2 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:hover:bg-slate-800 lg:hidden"
      >
        <Menu size={20} />
      </button>

      <div className="text-sm text-slate-500 dark:text-slate-400">
        {pageTitle}
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
  const [collapsed, setCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [permissionKeys, setPermissionKeys] = useState<string[]>([]);
  const [isSuperadmin, setIsSuperadmin] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("admin_sidebar_collapsed") === "1");
      localStorage.removeItem("adminToken");
    } catch (error) {
      console.warn("Unable to restore the admin sidebar preference.", error);
    }
  }, []);

  const handleToggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem("admin_sidebar_collapsed", next ? "1" : "0");
      } catch (error) {
        console.warn("Unable to save the admin sidebar preference.", error);
      }
      return next;
    });
  };

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [sidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen) return;

    const body = document.body;
    const originalOverflow = body.style.overflow;
    const desktopBreakpoint = window.matchMedia("(min-width: 1024px)");
    const syncScrollLock = () => {
      body.style.overflow = desktopBreakpoint.matches
        ? originalOverflow
        : "hidden";
    };

    syncScrollLock();
    desktopBreakpoint.addEventListener("change", syncScrollLock);

    return () => {
      desktopBreakpoint.removeEventListener("change", syncScrollLock);
      body.style.overflow = originalOverflow;
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setIsChecking(false);
      return;
    }

    let active = true;
    const checkSession = async () => {
      try {
        const response = await fetch("/api/admin/session", {
          cache: "no-store",
        });
        if (!response.ok) {
          if (active) {
            localStorage.removeItem("adminSessionActive");
            router.replace("/admin/login");
          }
          return;
        }
        const session = await response.json();
        if (!active) return;

        const keys = (session.permissions || []).map(
          (permission: { key: string }) => permission.key,
        );
        setPermissionKeys(keys);
        setIsSuperadmin(session.is_superadmin === true);
        localStorage.setItem("adminSessionActive", "1");
        setIsAuthenticated(true);
        setIsChecking(false);

        if (pathname === "/admin/dashboard" && !session.is_superadmin) {
          const firstAuthorizedPath =
            NAV_SECTIONS.flatMap((section) => section.items).find((item) => {
              const directory = getDirectoryKeyForHref(item.href);
              return directory ? hasDirectoryAccess(keys, directory) : false;
            })?.href ||
            (hasDirectoryAccess(keys, "user_access_management")
              ? "/admin/access-management"
              : hasDirectoryAccess(keys, "system_audit_logs")
                ? "/admin/audit-logs"
                : undefined);
          router.replace(firstAuthorizedPath || "/admin/login");
        }

        const currentPath = NAV_SECTIONS.flatMap((section) => section.items)
          .map((item) => item.href)
          .concat(ADMIN_NAV_ITEMS.map((item) => item.href))
          .sort((left, right) => right.length - left.length)
          .find((href) => pathname === href || pathname.startsWith(`${href}/`));
        const currentDirectory = currentPath
          ? getDirectoryKeyForHref(currentPath)
          : undefined;
        if (
          currentDirectory &&
          !session.is_superadmin &&
          !hasDirectoryAccess(keys, currentDirectory)
        ) {
          router.replace("/admin/dashboard");
        }
      } catch {
        if (active) {
          localStorage.removeItem("adminSessionActive");
          router.replace("/admin/login");
        }
      }
    };

    void checkSession();
    const refreshTimer = window.setInterval(checkSession, 30000);
    window.addEventListener("focus", checkSession);

    return () => {
      active = false;
      window.clearInterval(refreshTimer);
      window.removeEventListener("focus", checkSession);
    };
  }, [pathname, router]);

  const handleLogout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    localStorage.removeItem("adminSessionActive");
    setIsAuthenticated(false);
    router.replace("/admin/login");
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
    <div className="fixed inset-x-0 top-0 flex h-dvh overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar
        pathname={pathname}
        isOpen={sidebarOpen}
        collapsed={collapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapsed={handleToggleCollapsed}
        onLogout={handleLogout}
        permissionKeys={permissionKeys}
        isSuperadmin={isSuperadmin}
      />

      <main
        data-admin-main
        data-sidebar-collapsed={collapsed}
        className={`h-full min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain transition-[padding] duration-300 ease-in-out ${
          collapsed ? "lg:pl-[4.5rem]" : "lg:pl-64"
        }`}
      >
        <TopBar
          sidebarOpen={sidebarOpen}
          onOpenSidebar={() => setSidebarOpen(true)}
          pathname={pathname}
        />
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
