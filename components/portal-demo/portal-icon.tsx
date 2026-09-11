// components/portal-demo/portal-icon.tsx
import {
  Briefcase,
  BarChart3,
  ShoppingCart,
  Wrench,
  Calendar,
  Users,
  Megaphone,
  LucideIcon,
} from "lucide-react";
import { PortalIconKey } from "./types";

const ICONS: Record<PortalIconKey, LucideIcon> = {
  briefcase: Briefcase,
  chart: BarChart3,
  cart: ShoppingCart,
  wrench: Wrench,
  calendar: Calendar,
  users: Users,
  megaphone: Megaphone,
};

export const PortalIcon = ({
  icon,
  className,
}: {
  icon: PortalIconKey;
  className?: string;
}) => {
  const Icon = ICONS[icon];
  return <Icon className={className} strokeWidth={1.75} />;
};
