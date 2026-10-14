import {
  BarChart3,
  CalendarCheck,
  ClipboardCheck,
  ClipboardList,
  FileCheck,
  FileText,
  FolderOpen,
  IdCard,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Palette,
  Search,
  SearchCheck,
  Ticket,
  TrendingUp,
  UserCheck,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Lead Generation",
    items: [
      { href: "/admin/website-directory", label: "Website Directory", icon: FolderOpen },
      { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
      { href: "/admin/website-audit", label: "Website Audit", icon: Search },
      { href: "/admin/seo-audits", label: "SEO Audit", icon: SearchCheck },
      { href: "/admin/client-assessment", label: "Client Assessment", icon: UserCheck },
      { href: "/admin/demo-requirements", label: "Demo Website Requirements", icon: FileCheck },
    ],
  },
  {
    title: "Marketing Services",
    items: [
      { href: "/admin/graphic-design", label: "Graphic Design", icon: Palette },
      { href: "/admin/social-media-management", label: "Social Media Management", icon: Megaphone },
      { href: "/admin/paid-ads", label: "Paid Ads", icon: TrendingUp },
      { href: "/admin/market-research", label: "Market Research", icon: BarChart3 },
      { href: "/admin/blog", label: "Blog", icon: FileText },
      { href: "/admin/portal-demo", label: "Portal Demo", icon: FolderOpen },
      { href: "/admin/tiktok-shop-opening", label: "TikTok Shop Opening", icon: TrendingUp },
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
      { href: "/admin/support-tickets", label: "Support Tickets", icon: Ticket },
    ],
  },
  {
    title: "Human Resources",
    items: [
      { href: "/admin/masterfile", label: "Employee Masterfile", icon: Users },
      { href: "/admin/employee-clearance-form", label: "Clearance Form", icon: ClipboardCheck },
      { href: "/admin/leave-request", label: "Leave Requests", icon: FileText },
      { href: "/admin/attendance", label: "OJT Attendance", icon: CalendarCheck },
    ],
  },
];

export const NAV_DIRECTORY_BY_HREF: Record<string, string> = {
  "/admin/masterfile": "employee_masterfile",
  "/admin/website-directory": "website_directory",
  "/admin/inquiries": "inquiries",
  "/admin/website-audit": "website_audit",
  "/admin/seo-audits": "seo_audit",
  "/admin/client-assessment": "client_assessment",
  "/admin/demo-requirements": "demo_requirements",
  "/admin/graphic-design": "graphic_design",
  "/admin/social-media-management": "social_media_management",
  "/admin/paid-ads": "paid_ads",
  "/admin/market-research": "market_research",
  "/admin/blog": "blog",
  "/admin/survey": "survey",
  "/admin/juantap-survey": "juantap_survey",
  "/admin/video-survey": "video_survey",
  "/admin/support-tickets": "support_tickets",
  "/admin/employee-clearance-form": "clearance_form",
  "/admin/leave-request": "leave_requests",
  "/admin/attendance": "ojt_attendance",
  "/admin/portal-demo": "portal_demo",
  "/admin/tiktok-shop-opening": "tiktok_shop",
  "/admin/access-management": "user_access_management",
};

export const hasDirectoryAccess = (keys: string[], directory: string) =>
  keys.includes(directory) || keys.includes("all_directory");

export function getAuthorizedNavSections(
  permissionKeys: string[],
  isSuperadmin: boolean,
): NavSection[] {
  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (isSuperadmin && item.href === "/admin/dashboard") return false;
      const directory = NAV_DIRECTORY_BY_HREF[item.href];
      return !directory || isSuperadmin || hasDirectoryAccess(permissionKeys, directory);
    }),
  })).filter((section) => section.items.length > 0);

  const canManageAccess =
    isSuperadmin || hasDirectoryAccess(permissionKeys, "user_access_management");
  const canViewSystemAudit =
    isSuperadmin || hasDirectoryAccess(permissionKeys, "system_audit_logs");

  if (isSuperadmin || canManageAccess || canViewSystemAudit) {
    sections.unshift({
      title: isSuperadmin ? "Overview" : "Overview",
      items: [
        ...(isSuperadmin
          ? [{ href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard }]
          : []),
        ...(canManageAccess
          ? [{ href: "/admin/access-management", label: "User Access Management", icon: Users }]
          : []),
      ],
    });
  }

  return sections;
}
