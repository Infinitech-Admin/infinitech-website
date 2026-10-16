// middleware.ts  (project root, or src/middleware.ts if you use a src folder)
import { NextRequest, NextResponse } from "next/server";

const laravelUrl = process.env.LARAVEL_API_URL || "http://localhost:8000";

type AccessPolicy = {
  directory?: string;
  action: string;
  deny?: boolean;
};

// ADDED: role dashboards live at /admin/<role>/dashboard.
const DASHBOARD_ROLES = new Set(["hr", "accounting", "admin", "superadmin"]);

const pageDirectories: Record<string, string> = {
  attendance: "ojt_attendance",
  "audit-logs": "system_audit_logs",
  blog: "blog",
  contracts: "contracts",
  "employee-clearance-form": "clearance_form",
  "graphic-design": "graphic_design",
  inquiries: "inquiries",
  "juantap-survey": "juantap_survey",
  "leave-request": "leave_requests",
  "market-research": "market_research",
  masterfile: "employee_masterfile",
  "paid-ads": "paid_ads",
  "portal-demo": "portal_demo",
  "seo-audits": "seo_audit",
  "social-media-management": "social_media_management",
  "support-tickets": "support_tickets",
  survey: "survey",
  "tiktok-shop-opening": "tiktok_shop",
  "video-survey": "video_survey",
  "website-audit": "website_audit",
  "website-directory": "website_directory",
  "client-assessment": "client_assessment",
  "demo-requirements": "demo_requirements",
};

const adminApiDirectories: Record<string, string> = {
  analytics: "system_audit_logs",
  attendance: "ojt_attendance",
  "blog-posts": "blog",
  clearance: "clearance_form",
  "clearance-template": "clearance_form",
  coe: "clearance_form",
  contracts: "contracts",
  // Installment "Record" and commission "Release" actions on a contract.
  "contract-installments": "contracts",
  "contract-commissions": "contracts",
  "employee-clearance": "clearance_form",
  employees: "employee_masterfile",
  blog: "blog",
  "leave-requests": "leave_requests",
  "leave-types": "leave_requests",
  "portal-demos": "portal_demo",
  "support-tickets": "support_tickets",
  surveys: "survey",
  trainees: "ojt_attendance",
  websites: "website_directory",
};

const directApiDirectories: Record<string, string> = {
  "client-assessment": "client_assessment",
  attendance: "ojt_attendance",
  "blog-posts": "blog",
  contracts: "contracts",
  "employee-masterfile": "employee_masterfile",
  "graphic-design-requests": "graphic_design",
  inquiries: "inquiries",
  "juantap-surveys": "juantap_survey",
  leads: "client_assessment",
  "market-research-requests": "market_research",
  "paid-ads-requests": "paid_ads",
  "seo-audit": "seo_audit",
  "seo-audits": "seo_audit",
  "social-media-requests": "social_media_management",
  "support-tickets": "support_tickets",
  "tiktok-shop-requests": "tiktok_shop",
  trainees: "ojt_attendance",
  surveys: "survey",
  videosurvey: "video_survey",
  "video-surveys": "video_survey",
  "website-inquiries": "website_audit",
  "website-inquiry": "website_audit",
  "send-graphic-design-email": "graphic_design",
  "send-inquiry-email": "website_audit",
  "send-juantap-email": "juantap_survey",
  "send-market-research-email": "market_research",
  "send-social-media-email": "social_media_management",
  "send-survey-email": "survey",
  "send-tiktok-shop-email": "tiktok_shop",
  "summary-send-email": "system_audit_logs",
  demoRequirements: "demo_requirements",
  "demo-requirements": "demo_requirements",
};

function protectedApi(path: string, method: string): AccessPolicy | null {
  const parts = path.split("/").filter(Boolean);
  if (parts[0] !== "api") return null;

  if (
    parts[1] === "attendance" &&
    ((parts.length === 2 && ["POST", "PUT"].includes(method)) ||
      (parts.length === 3 &&
        ["lookup", "history", "total"].includes(parts[2]) &&
        method === "GET"))
  ) {
    return null;
  }

  if (parts[1] === "admin") {
    const area = parts[2];
    if (area === "login" && method === "POST") return null;
    if (area === "session" && ["GET", "DELETE"].includes(method)) return null;
    // ADDED: /api/admin/dashboard/<role> only needs a signed-in admin.
    // Laravel (AdminDashboardController) checks that the role matches.
    if (area === "dashboard" && method === "GET") {
      return { action: "view" };
    }
    if (area === "access-management") {
      if (
        parts[3] === "audit" ||
        (parts[3] === "accounts" && parts[5] === "audit")
      ) {
        return { directory: "system_audit_logs", action: "view" };
      }
      const isCreate =
        parts[3] === "employees" ||
        (parts[3] === "accounts" && parts.length === 4 && method === "POST");
      const isEdit =
        parts[3] === "accounts" &&
        parts.length >= 6 &&
        ["permissions", "status", "rotate-credentials"].includes(parts[5]);
      return {
        directory: "user_access_management",
        action: isCreate ? "create" : isEdit ? "edit" : actionFor(method, path),
      };
    }
    const directory = area ? adminApiDirectories[area] : undefined;
    return directory
      ? { directory, action: actionFor(method, path) }
      : { deny: true, action: "view" };
  }

  if (
    (parts[1] === "portal-demos" || parts[1] === "testimonials") &&
    (method === "GET" || (parts[1] === "testimonials" && method === "POST"))
  ) {
    return null;
  }
  if (
    (parts[1] === "contact" ||
      parts[1] === "chat" ||
      parts[1] === "quotation") &&
    method === "POST" &&
    parts.length === 2
  ) {
    return null;
  }
  if (parts[1] === "video-proxy" && method === "GET") return null;

  if (parts[1] === "employee-masterfile") {
    return {
      directory: "employee_masterfile",
      action: actionFor(method, path),
    };
  }
  const directory = parts[1] ? directApiDirectories[parts[1]] : undefined;
  if (!directory) return { deny: true, action: "view" };

  const publicSubmission =
    method === "POST" &&
    parts.length === 2 &&
    [
      "client-assessment",
      "graphic-design-requests",
      "inquiries",
      "juantap-surveys",
      "leads",
      "market-research-requests",
      "paid-ads-requests",
      "seo-audit",
      "seo-audits",
      "social-media-requests",
      "surveys",
      "tiktok-shop-requests",
      "video-surveys",
      "demoRequirements",
      "demo-requirements",
      "website-inquiries",
      "website-inquiry",
      "support-tickets",
    ].includes(parts[1]);
  if (publicSubmission) return null;

  return { directory, action: actionFor(method, path) };
}

function actionFor(method: string, path: string): string {
  if (method === "GET" && /\/(download|export|attachment)(\/|$)/i.test(path))
    return "export";
  if (
    method === "POST" &&
    /(?:\/reply(?:\/|$)|\/send-(?:[^/]+-)?email(?:\/|$)|\/summary-send-email(?:\/|$))/i.test(
      path,
    )
  ) {
    return "edit";
  }
  if (method === "GET" || method === "HEAD") return "view";
  if (method === "POST") return "create";
  if (method === "DELETE") return "delete";
  if (method === "PUT" || method === "PATCH") return "edit";
  return "view";
}

function protectedPage(path: string): AccessPolicy | null {
  if (
    !path.startsWith("/admin/") ||
    path === "/admin/login" ||
    path === "/admin/access-denied"
  )
    return null;
  const area = path.split("/")[2];
  if (area === "dashboard") return { action: "view" };
  // ADDED: /admin/<role>/dashboard (hr, accounting, admin, superadmin).
  // Any signed-in admin may load it; RoleGuard sends them to their own.
  const segments = path.split("/").filter(Boolean);
  if (
    segments.length === 3 &&
    DASHBOARD_ROLES.has(segments[1]) &&
    segments[2] === "dashboard"
  ) {
    return { action: "view" };
  }
  if (area === "access-management" || area === "audit-logs") {
    return {
      directory:
        area === "access-management"
          ? "user_access_management"
          : "system_audit_logs",
      action: "view",
    };
  }
  const directory = area ? pageDirectories[area] : undefined;
  return directory
    ? { directory, action: "view" }
    : { deny: true, action: "view" };
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isApi = pathname.startsWith("/api/");
  const policy = isApi
    ? protectedApi(pathname, request.method)
    : protectedPage(pathname);
  if (!policy) return NextResponse.next();

  if (policy.deny) {
    return isApi
      ? NextResponse.json({ message: "Forbidden" }, { status: 403 })
      : NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  const token = request.cookies.get("adminToken")?.value;
  if (!token)
    return isApi
      ? unauthorized()
      : NextResponse.redirect(new URL("/admin/login", request.url));

  const backendPath = policy.directory
    ? `/api/admin/authorize?${new URLSearchParams({ directory: policy.directory, action: policy.action })}`
    : "/api/admin/session";
  let response: Response;
  try {
    response = await fetch(`${laravelUrl}${backendPath}`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "Authentication service unavailable." },
      { status: 503 },
    );
  }

  if (response.status === 401) {
    return isApi
      ? unauthorized()
      : NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (response.status >= 500) {
    return NextResponse.json(
      { message: "Authorization service unavailable." },
      { status: 503 },
    );
  }

  let allowed = response.ok;
  if (!policy.directory && allowed) {
    const session = await response.json();
    allowed = session.is_superadmin === true || session.permissions?.length > 0;
  }
  if (!allowed) {
    return isApi
      ? NextResponse.json({ message: "Forbidden" }, { status: 403 })
      : NextResponse.redirect(
          new URL(
            pathname === "/admin/dashboard"
              ? "/admin/login"
              : "/admin/dashboard",
            request.url,
          ),
        );
  }

  if (!isApi) return NextResponse.next();

  const serviceToken = process.env.LARAVEL_SERVICE_TOKEN;
  if (!serviceToken) {
    return NextResponse.json(
      { message: "Admin API is not configured." },
      { status: 503 },
    );
  }

  const headers = new Headers(request.headers);
  headers.delete("x-admin-authorized");
  headers.set("x-admin-authorized", "true");
  headers.set("authorization", `Bearer ${serviceToken}`);
  const nextResponse = NextResponse.next({ request: { headers } });
  nextResponse.headers.set("Cache-Control", "private, no-store");
  return nextResponse;
}

function unauthorized() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
