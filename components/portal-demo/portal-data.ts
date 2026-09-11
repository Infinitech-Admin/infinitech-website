import { Portal } from "./types";

const DEFAULT_ROLES = (extra: string[] = []) => [
  {
    id: "owner",
    name: "Owner / Executive",
    blurb: "Full visibility across every workspace.",
  },
  {
    id: "admin",
    name: "Administrator",
    blurb: "Manages settings, access and integrations.",
    visibleNav: [
      "dashboard",
      "work",
      "people",
      "operations",
      "finance",
      "team",
      "resources",
      "reports",
      "admin",
    ],
  },
  {
    id: "operations",
    name: "Operations",
    blurb: "Runs the day-to-day workflow.",
  },
  {
    id: "pm",
    name: "Project Manager",
    blurb: "Owns delivery timelines and assignments.",
  },
  ...extra.map((name, i) => ({
    id: `role-${i}`,
    name,
    blurb: "Sees the workspace scoped to this role.",
  })),
  {
    id: "employee",
    name: "Employee",
    blurb: "Limited to assigned tasks and records.",
    visibleNav: ["dashboard", "work", "team", "resources"],
  },
];

export const PORTALS: Portal[] = [
  {
    id: "business-operations",
    index: "01",
    categoryLabel: "Business Operations",
    icon: "briefcase",
    accent: "from-sky-500 to-blue-600",
    title: "Business Operations Hub",
    description:
      "A flexible company workspace for customers, projects, departments, tasks, finance, people and management reporting.",
    bestSuitedFor:
      "Professional services, project teams and internal operations",
    coreOperatingAreas: [
      "Customers",
      "Projects",
      "Tasks",
      "People & Attendance",
      "Finance",
      "Reports",
    ],
    exampleWorkflow: [
      "Inquiry",
      "Project",
      "Assigned",
      "Production",
      "Review",
      "Completed",
      "Paid",
    ],
    roles: DEFAULT_ROLES([
      "Sales",
      "Finance",
      "HR",
      "Marketing",
      "Corporate Employee",
    ]),
    heroHeadline: "Your work, organized around what needs attention.",
    heroBody:
      "A flexible company workspace for customers, projects, departments, tasks, finance, people and management reporting.",
    focusItems: [
      {
        label: "Active projects",
        helper: "Live demo snapshot",
        value: "3 in progress",
      },
      { label: "Tasks due", helper: "Live demo snapshot", value: "2 open" },
      { label: "Receivables", helper: "Live demo snapshot", value: "$6,800" },
    ],
    stats: [
      {
        label: "Active projects",
        value: "3",
        helper: "Updates as you use the demo",
      },
      { label: "Tasks due", value: "2", helper: "Updates as you use the demo" },
      {
        label: "Receivables",
        value: "$6,800",
        helper: "Updates as you use the demo",
      },
      {
        label: "Revenue",
        value: "$26,300",
        helper: "Updates as you use the demo",
      },
    ],
    departmentSnapshots: [
      {
        label: "Ecommerce orders",
        value: "18 today",
        helper: "Online store",
        icon: "cart",
      },
      {
        label: "Field jobs",
        value: "5 scheduled",
        helper: "Service team",
        icon: "wrench",
      },
      {
        label: "New leads",
        value: "9 this week",
        helper: "Sales pipeline",
        icon: "chart",
      },
      {
        label: "Open headcount",
        value: "3 roles",
        helper: "HR",
        icon: "users",
      },
      {
        label: "Active campaigns",
        value: "2 running",
        helper: "Marketing",
        icon: "megaphone",
      },
    ],
    queue: [
      {
        name: "Website Production",
        subject: "Sample Company",
        status: "Production",
        statusTone: "default",
        progress: 62,
      },
      {
        name: "Client Portal Setup",
        subject: "Demo Group",
        status: "Review",
        statusTone: "warning",
        progress: 88,
      },
      {
        name: "Operations Rollout",
        subject: "Sample Partners",
        status: "Assigned",
        statusTone: "primary",
        progress: 25,
      },
    ],
    tasks: [
      { title: "Review priority item", meta: "Alex Rivera · Today · Open" },
      {
        title: "Confirm client follow-up",
        meta: "Jordan Blake · Today · In Progress",
      },
    ],
  },
  {
    id: "sales-operations",
    index: "02",
    categoryLabel: "Sales Operations",
    icon: "chart",
    accent: "from-violet-500 to-fuchsia-600",
    title: "Sales & Growth Hub",
    description:
      "A complete workspace for lead handling, calls, follow-ups, offers, payments and team performance.",
    bestSuitedFor: "Sales teams, contact centers and service businesses",
    coreOperatingAreas: [
      "CRM & Leads",
      "Call Operations",
      "Sales Pipeline",
      "Tasks & Attendance",
      "Payments",
    ],
    exampleWorkflow: [
      "Lead",
      "Call",
      "Interested",
      "Sample",
      "Follow-up",
      "Closed",
    ],
    roles: DEFAULT_ROLES(["Sales", "Team Lead"]),
    heroHeadline: "Every lead, call and follow-up in one queue.",
    heroBody:
      "A complete workspace for lead handling, calls, follow-ups, offers, payments and team performance.",
    focusItems: [
      { label: "Open leads", helper: "Live demo snapshot", value: "14 active" },
      { label: "Calls today", helper: "Live demo snapshot", value: "6 logged" },
      {
        label: "Pipeline value",
        helper: "Live demo snapshot",
        value: "$18,400",
      },
    ],
    stats: [
      {
        label: "Open leads",
        value: "14",
        helper: "Updates as you use the demo",
      },
      {
        label: "Calls today",
        value: "6",
        helper: "Updates as you use the demo",
      },
      {
        label: "Pipeline value",
        value: "$18,400",
        helper: "Updates as you use the demo",
      },
      {
        label: "Closed this month",
        value: "$9,120",
        helper: "Updates as you use the demo",
      },
    ],
    departmentSnapshots: [
      {
        label: "Ecommerce orders",
        value: "12 today",
        helper: "Cross-sell from CRM",
        icon: "cart",
      },
      {
        label: "Field visits",
        value: "2 booked",
        helper: "Service handoff",
        icon: "wrench",
      },
      { label: "Open headcount", value: "1 role", helper: "HR", icon: "users" },
      {
        label: "Active campaigns",
        value: "3 running",
        helper: "Marketing",
        icon: "megaphone",
      },
    ],
    queue: [
      {
        name: "Inbound Lead #204",
        subject: "Nova Retail",
        status: "Interested",
        statusTone: "primary",
        progress: 40,
      },
      {
        name: "Renewal Call",
        subject: "Harbor Co.",
        status: "Follow-up",
        statusTone: "warning",
        progress: 70,
      },
      {
        name: "Sample Request",
        subject: "Cedar Group",
        status: "Sample",
        statusTone: "default",
        progress: 55,
      },
    ],
    tasks: [
      { title: "Call back Nova Retail", meta: "You · Today · Open" },
      { title: "Send Harbor Co. quote", meta: "You · Today · In Progress" },
    ],
  },
  {
    id: "commerce-operations",
    index: "03",
    categoryLabel: "Commerce Operations",
    icon: "cart",
    accent: "from-emerald-500 to-teal-600",
    title: "Commerce & Fulfillment Hub",
    description:
      "A practical operating system for orders, fulfillment, inventory, support, returns, reseller partners and revenue visibility.",
    bestSuitedFor: "Online stores, retail teams and product businesses",
    coreOperatingAreas: [
      "Orders",
      "Inventory",
      "Fulfillment",
      "Customer Support",
      "Returns",
      "Reseller Network",
    ],
    exampleWorkflow: ["Order", "Packed", "Shipped", "Delivered", "Closed"],
    roles: [
      ...DEFAULT_ROLES(["Warehouse", "Support"]),
      {
        id: "reseller",
        name: "Reseller",
        blurb:
          "External partner placing wholesale orders and tracking their own shipments.",
        visibleNav: ["dashboard", "work", "people", "finance", "resources"],
      },
    ],
    heroHeadline: "Orders and stock, always in sync.",
    heroBody:
      "A practical operating system for orders, fulfillment, inventory, support, returns, reseller partners and revenue visibility.",
    focusItems: [
      {
        label: "Orders today",
        helper: "Live demo snapshot",
        value: "27 placed",
      },
      {
        label: "Low stock SKUs",
        helper: "Live demo snapshot",
        value: "4 items",
      },
      { label: "Open returns", helper: "Live demo snapshot", value: "3 cases" },
    ],
    stats: [
      {
        label: "Orders today",
        value: "27",
        helper: "Updates as you use the demo",
      },
      {
        label: "Low stock SKUs",
        value: "4",
        helper: "Updates as you use the demo",
      },
      {
        label: "Open returns",
        value: "3",
        helper: "Updates as you use the demo",
      },
      {
        label: "Revenue today",
        value: "$4,950",
        helper: "Updates as you use the demo",
      },
    ],
    departmentSnapshots: [
      {
        label: "New leads",
        value: "6 this week",
        helper: "Sales pipeline",
        icon: "chart",
      },
      {
        label: "Field jobs",
        value: "1 scheduled",
        helper: "Installation team",
        icon: "wrench",
      },
      {
        label: "Open headcount",
        value: "2 roles",
        helper: "HR",
        icon: "users",
      },
      {
        label: "Active campaigns",
        value: "4 running",
        helper: "Marketing",
        icon: "megaphone",
      },
      {
        label: "Reseller orders",
        value: "9 this week",
        helper: "Partner network",
        icon: "users",
      },
    ],
    queue: [
      {
        name: "Order #10432",
        subject: "J. Santos",
        status: "Packed",
        statusTone: "default",
        progress: 50,
      },
      {
        name: "Order #10429",
        subject: "M. Cruz",
        status: "Shipped",
        statusTone: "primary",
        progress: 80,
      },
      {
        name: "Return #221",
        subject: "R. Tan",
        status: "Review",
        statusTone: "warning",
        progress: 30,
      },
      {
        name: "Reseller Order #58",
        subject: "Northwind Resellers",
        status: "Processing",
        statusTone: "primary",
        progress: 45,
      },
    ],
    tasks: [
      { title: "Restock SKU-2291", meta: "Warehouse · Today · Open" },
      { title: "Approve return #221", meta: "Support · Today · Open" },
    ],
  },
  {
    id: "field-service",
    index: "04",
    categoryLabel: "Field Service",
    icon: "wrench",
    accent: "from-amber-500 to-orange-600",
    title: "Field Service Hub",
    description:
      "Coordinate requests, estimates, dispatch, technicians, materials, job completion and billing from one workspace.",
    bestSuitedFor: "Construction, repair, maintenance and field-service teams",
    coreOperatingAreas: [
      "Service Requests",
      "Dispatch",
      "Jobs & Technicians",
      "Estimates",
      "Billing",
    ],
    exampleWorkflow: [
      "Request",
      "Estimate",
      "Scheduled",
      "In Progress",
      "Completed",
      "Invoiced",
    ],
    roles: DEFAULT_ROLES(["Dispatcher", "Technician"]),
    heroHeadline: "Every job, from request to invoice.",
    heroBody:
      "Coordinate requests, estimates, dispatch, technicians, materials, job completion and billing from one workspace.",
    focusItems: [
      {
        label: "Jobs today",
        helper: "Live demo snapshot",
        value: "5 scheduled",
      },
      {
        label: "Pending estimates",
        helper: "Live demo snapshot",
        value: "2 open",
      },
      { label: "Unbilled jobs", helper: "Live demo snapshot", value: "$3,200" },
    ],
    stats: [
      {
        label: "Jobs today",
        value: "5",
        helper: "Updates as you use the demo",
      },
      {
        label: "Pending estimates",
        value: "2",
        helper: "Updates as you use the demo",
      },
      {
        label: "Unbilled jobs",
        value: "$3,200",
        helper: "Updates as you use the demo",
      },
      {
        label: "Revenue this month",
        value: "$21,150",
        helper: "Updates as you use the demo",
      },
    ],
    departmentSnapshots: [
      {
        label: "Ecommerce orders",
        value: "3 today",
        helper: "Parts store",
        icon: "cart",
      },
      {
        label: "New leads",
        value: "4 this week",
        helper: "Sales pipeline",
        icon: "chart",
      },
      {
        label: "Open headcount",
        value: "2 techs",
        helper: "HR",
        icon: "users",
      },
      {
        label: "Active campaigns",
        value: "1 running",
        helper: "Marketing",
        icon: "megaphone",
      },
    ],
    queue: [
      {
        name: "HVAC Repair",
        subject: "Unit 4B",
        status: "Scheduled",
        statusTone: "primary",
        progress: 20,
      },
      {
        name: "Roof Estimate",
        subject: "Dela Cruz Res.",
        status: "Estimate",
        statusTone: "default",
        progress: 10,
      },
      {
        name: "Plumbing Job #88",
        subject: "Green Tower",
        status: "In Progress",
        statusTone: "warning",
        progress: 65,
      },
    ],
    tasks: [
      {
        title: "Confirm technician for HVAC job",
        meta: "Dispatch · Today · Open",
      },
      { title: "Send roof estimate", meta: "You · Today · In Progress" },
    ],
  },
  {
    id: "client-services",
    index: "05",
    categoryLabel: "Client Services",
    icon: "calendar",
    accent: "from-rose-500 to-pink-600",
    title: "Client Experience Hub",
    description:
      "Manage appointments, front-desk activity, clients, memberships, renewals, staff coordination and payments.",
    bestSuitedFor: "Clinics, salons, hospitality and membership businesses",
    coreOperatingAreas: [
      "Bookings",
      "Clients",
      "Front Desk",
      "Memberships",
      "Payments",
    ],
    exampleWorkflow: [
      "Booked",
      "Checked-in",
      "In Service",
      "Completed",
      "Paid",
    ],
    roles: DEFAULT_ROLES(["Front Desk", "Practitioner"]),
    heroHeadline: "Every booking and member, at a glance.",
    heroBody:
      "Manage appointments, front-desk activity, clients, memberships, renewals, staff coordination and payments.",
    focusItems: [
      {
        label: "Bookings today",
        helper: "Live demo snapshot",
        value: "11 scheduled",
      },
      {
        label: "Renewals due",
        helper: "Live demo snapshot",
        value: "3 members",
      },
      { label: "Checked-in", helper: "Live demo snapshot", value: "4 clients" },
    ],
    stats: [
      {
        label: "Bookings today",
        value: "11",
        helper: "Updates as you use the demo",
      },
      {
        label: "Renewals due",
        value: "3",
        helper: "Updates as you use the demo",
      },
      {
        label: "Checked-in",
        value: "4",
        helper: "Updates as you use the demo",
      },
      {
        label: "Revenue today",
        value: "$1,860",
        helper: "Updates as you use the demo",
      },
    ],
    departmentSnapshots: [
      {
        label: "Ecommerce orders",
        value: "5 today",
        helper: "Gift cards & retail",
        icon: "cart",
      },
      {
        label: "New leads",
        value: "3 this week",
        helper: "Membership sales",
        icon: "chart",
      },
      { label: "Open headcount", value: "1 role", helper: "HR", icon: "users" },
      {
        label: "Active campaigns",
        value: "2 running",
        helper: "Marketing",
        icon: "megaphone",
      },
    ],
    queue: [
      {
        name: "Booking #310",
        subject: "A. Lopez",
        status: "Checked-in",
        statusTone: "primary",
        progress: 45,
      },
      {
        name: "Membership Renewal",
        subject: "K. Bautista",
        status: "Due",
        statusTone: "warning",
        progress: 90,
      },
      {
        name: "Booking #308",
        subject: "S. Reyes",
        status: "Completed",
        statusTone: "success",
        progress: 100,
      },
    ],
    tasks: [
      {
        title: "Call K. Bautista for renewal",
        meta: "Front Desk · Today · Open",
      },
      { title: "Confirm tomorrow's bookings", meta: "You · Today · Open" },
    ],
  },
];

export const getPortal = (id: string) => PORTALS.find((p) => p.id === id);
