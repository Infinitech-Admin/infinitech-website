import { Portal } from "./types";

export interface SectionColumn {
  key: string;
  label: string;
  type?: "text" | "email" | "tel";
}

export interface SectionRecord {
  id: string;
  [key: string]: string;
}

export interface SectionConfig {
  id: string;
  title: string;
  description: string;
  addLabel: string;
  columns: SectionColumn[];
  records: SectionRecord[];
}

let seq = 0;
const uid = (prefix: string) => `${prefix}-${seq++}`;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/(^\.|\.$)/g, "");

const fakeEmail = (name: string, domain = "example.com") =>
  `${slugify(name)}@${domain}`;

const fakePhone = (index: number) => {
  const block = String(1000 + ((index * 37) % 9000)).padStart(4, "0");
  return `+1 (555) 010-${block}`;
};

const DEMO_NAMES = [
  "Alex Rivera",
  "Jordan Blake",
  "Sam Chen",
  "Morgan Price",
  "Taylor Reyes",
  "Casey Nolan",
  "Riley Santos",
  "Drew Bennett",
];
const demoName = (i: number) => DEMO_NAMES[i % DEMO_NAMES.length];

export function buildSections(portal: Portal): Record<string, SectionConfig> {
  return {
    work: {
      id: "work",
      title: "Current work",
      description: "Everything in motion across this workspace right now.",
      addLabel: "Add work item",
      columns: [
        { key: "name", label: "Record" },
        { key: "subject", label: "Subject" },
        { key: "status", label: "Status" },
      ],
      records: portal.queue.map((q) => ({
        id: uid("work"),
        name: q.name,
        subject: q.subject,
        status: q.status,
      })),
    },
    people: {
      id: "people",
      title: "Customers",
      description: "People and companies this workspace serves.",
      addLabel: "Add customer",
      columns: [
        { key: "name", label: "Name" },
        { key: "email", label: "Email", type: "email" },
        { key: "phone", label: "Phone", type: "tel" },
        { key: "status", label: "Status" },
      ],
      records: portal.queue.map((q, i) => ({
        id: uid("cust"),
        name: q.subject,
        email: fakeEmail(q.subject),
        phone: fakePhone(i),
        status: "Active",
      })),
    },
    operations: {
      id: "operations",
      title: "Operating areas",
      description: "The functional areas this portal is built around.",
      addLabel: "Add area",
      columns: [
        { key: "name", label: "Area" },
        { key: "status", label: "Status" },
      ],
      records: portal.coreOperatingAreas.map((area) => ({
        id: uid("ops"),
        name: area,
        status: "Configured",
      })),
    },
    finance: {
      id: "finance",
      title: "Finance",
      description: "Receivables and revenue snapshots for this workspace.",
      addLabel: "Add line item",
      columns: [
        { key: "name", label: "Item" },
        { key: "value", label: "Amount" },
        { key: "status", label: "Note" },
      ],
      records: portal.stats.map((s) => ({
        id: uid("fin"),
        name: s.label,
        value: s.value,
        status: s.helper,
      })),
    },
    team: {
      id: "team",
      title: "Team & access",
      description: "The people on this workspace and what they can see.",
      addLabel: "Add team member",
      columns: [
        { key: "name", label: "Name" },
        { key: "email", label: "Email", type: "email" },
        { key: "role", label: "Role" },
        { key: "status", label: "Access" },
      ],
      records: portal.roles.map((r, i) => ({
        id: uid("team"),
        name: demoName(i),
        email: fakeEmail(demoName(i)),
        role: r.name,
        status: r.blurb,
      })),
    },
    resources: {
      id: "resources",
      title: "Resources",
      description: "Shared files and references for this workspace.",
      addLabel: "Add resource",
      columns: [
        { key: "name", label: "Resource" },
        { key: "status", label: "Type" },
      ],
      records: portal.departmentSnapshots.map((d) => ({
        id: uid("res"),
        name: d.label,
        status: d.helper,
      })),
    },
    reports: {
      id: "reports",
      title: "Reports",
      description: "Generated reports available to this role.",
      addLabel: "Add report",
      columns: [
        { key: "name", label: "Report" },
        { key: "value", label: "Latest figure" },
      ],
      records: portal.stats.map((s) => ({
        id: uid("rep"),
        name: `${s.label} report`,
        value: s.value,
      })),
    },
    admin: {
      id: "admin",
      title: "Administration",
      description:
        "Manage who has access to this workspace and what they can do.",
      addLabel: "Add user",
      columns: [
        { key: "name", label: "Name" },
        { key: "email", label: "Email", type: "email" },
        { key: "role", label: "Role" },
        { key: "status", label: "Permissions" },
      ],
      records: portal.roles.map((r, i) => ({
        id: uid("admin"),
        name: demoName(i + 3),
        email: fakeEmail(demoName(i + 3)),
        role: r.name,
        status: r.blurb,
      })),
    },
  };
}
