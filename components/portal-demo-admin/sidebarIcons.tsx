// 📁 Place this file at: components/portal-demo-admin/sidebarIcons.tsx
import {
  LayoutGrid,
  ClipboardList,
  Users,
  DollarSign,
  Building2,
  Briefcase,
  BarChart3,
  Folder,
  Settings,
  Bell,
  ShoppingCart,
  Wrench,
  Megaphone,
  UserCircle,
} from "lucide-react";

export const SIDEBAR_ICON_REGISTRY: Record<string, any> = {
  LayoutGrid,
  ClipboardList,
  Users,
  DollarSign,
  Building2,
  Briefcase,
  BarChart3,
  Folder,
  Settings,
  Bell,
  ShoppingCart,
  Wrench,
  Megaphone,
  UserCircle,
};

export const SIDEBAR_ICON_OPTIONS: { value: string; label: string }[] = [
  { value: "LayoutGrid", label: "Dashboard" },
  { value: "ClipboardList", label: "Current Work / Tasks" },
  { value: "Users", label: "Employees / Team" },
  { value: "DollarSign", label: "Payroll / Finance" },
  { value: "Building2", label: "Customers / Company" },
  { value: "Briefcase", label: "Operations" },
  { value: "BarChart3", label: "Reports" },
  { value: "Folder", label: "Resources" },
  { value: "Settings", label: "Administration" },
  { value: "Bell", label: "Notifications" },
  { value: "ShoppingCart", label: "Orders / Sales" },
  { value: "Wrench", label: "Field Jobs / Service" },
  { value: "Megaphone", label: "Marketing" },
  { value: "UserCircle", label: "Profile" },
];

export function SidebarIconPreview({
  name,
  className,
}: {
  name?: string;
  className?: string;
}) {
  const Comp = (name && SIDEBAR_ICON_REGISTRY[name]) || LayoutGrid;
  return <Comp className={className || "h-4 w-4"} />;
}
