"use client";

import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Loader,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import NextImage from "next/image";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmployeePrivateImage } from "@/components/admin/employee-media";
import { getFullName, type Employee } from "@/components/admin/employee-types";
import { apiFetch } from "@/lib/api-client";

type IssuanceStatus = "Issued" | "Reprinted" | "Replaced" | "Revoked";
type IssuanceAction = "issue" | "reprint" | "replace" | "revoke";
type EmployeeIdTemplate = "infinitech" | "glimit";

interface EmployeeIdIssuance {
  id: number;
  employee_number: string;
  employee_name: string;
  issued_by: string;
  status: IssuanceStatus;
  id_template: EmployeeIdTemplate;
  version: number;
  related_issuance_id: number | null;
  remarks: string | null;
  created_at: string;
}

interface EmployeeIdDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditEmployee: (employee: Employee) => void;
}

const notice =
  "This is issued by this company form properly identification of the employee hereon. This card remains the property of the company and must be surrendered upon registration or termination of service.";
const activeStatuses: IssuanceStatus[] = ["Issued", "Reprinted"];

const employeeIdTemplateStyles = `
  @import url("https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@600;700&family=Poppins:wght@600;700&display=swap");

  .employee-id-artwork {
    container-type: inline-size;
    width: min(448px, 100%);
    aspect-ratio: 896 / 1358;
    background: #fff;
    position: relative;
    overflow: hidden;
    box-shadow: 0 6px 24px rgba(11, 35, 71, .18);
    color: #000;
    font-family: Montserrat, "Segoe UI", Arial, sans-serif;
  }

  .employee-id-artwork[data-export="true"] {
    width: 896px;
    height: 1358px;
    aspect-ratio: auto;
    box-shadow: none;
    container-type: normal;
    flex: none;
  }

  .employee-id-artwork[data-export="true"] .face {
    --u: 1px;
  }
  .employee-id-artwork .face { --u: calc(100cqw / 896); position: absolute; inset: 0; }
  .employee-id-artwork .face svg.bg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .employee-id-artwork .abs { position: absolute; left: 0; width: 100%; text-align: center; transform: translateY(-50%); line-height: 1; white-space: nowrap; }
  .employee-id-artwork .brand-logo {
    position: absolute;
    left: 50%;
    top: calc(6 * var(--u));
    width: calc(300 * var(--u));
    height: calc(300 * var(--u));
    object-fit: contain;
    display: block;
    transform: translateX(-50%);
  }  
  .employee-id-artwork .brand-name { top: calc(235 * var(--u)); font: 700 calc(27 * var(--u)) Poppins, Montserrat, Arial, sans-serif; letter-spacing: calc(13 * var(--u)); padding-left: calc(13 * var(--u)); color: #1b2a41; }
  .employee-id-artwork .brand-sub { top: calc(260 * var(--u)); font: 700 calc(12.5 * var(--u)) Montserrat, "Segoe UI", Arial, sans-serif; letter-spacing: calc(3 * var(--u)); color: #1b2a41; }
  .employee-id-artwork .photo { position: absolute; left: calc(258 * var(--u)); top: calc(306 * var(--u)); width: calc(380 * var(--u)); height: calc(400 * var(--u)); border: calc(8 * var(--u)) solid #000; background: linear-gradient(#c3e8fc, #f0f9fe 62%, #fff 100%); overflow: hidden; }
  .employee-id-artwork .photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .employee-id-artwork .photo .placeholder { position: absolute; inset: 0; }
  .employee-id-artwork .emp-name { top: calc(730 * var(--u)); font: 700 calc(50 * var(--u)) Poppins, Montserrat, Arial, sans-serif; color: #1b2a41; white-space: nowrap; text-transform: uppercase; }
  .employee-id-artwork .emp-position { top: calc(770 * var(--u)); font: 700 calc(28 * var(--u)) Montserrat, "Segoe UI", Arial, sans-serif; color: #000; }
  .employee-id-artwork .emp-id { top: calc(897 * var(--u)); font: 400 calc(58 * var(--u)) "Bebas Neue", Impact, "Arial Narrow", sans-serif; letter-spacing: calc(12 * var(--u)); padding-left: calc(12 * var(--u)); color: #1b2a41; font-weight: bold; }
  .employee-id-artwork .emp-signature { position: absolute; left: calc(300 * var(--u)); top: calc(1030 * var(--u)); width: calc(300 * var(--u)); height: calc(170 * var(--u)); object-fit: contain; }
  .employee-id-artwork .signature-placeholder { position: absolute; left: calc(134 * var(--u)); top: calc(1070 * var(--u)); width: calc(636 * var(--u)); height: calc(80 * var(--u)); display: grid; place-items: center; color: #b91c1c; font-size: calc(18 * var(--u)); font-weight: 700; }
  .employee-id-artwork .sig-line { position: absolute; left: calc(134 * var(--u)); top: calc(1153 * var(--u)); width: calc(636 * var(--u)); height: calc(6 * var(--u)); background: #000; }
  .employee-id-artwork .sig-label { top: calc(1193 * var(--u)); font: 700 calc(26 * var(--u)) Montserrat, "Segoe UI", Arial, sans-serif; }
  
  .employee-id-artwork .back-left { position: absolute; left: calc(42 * var(--u)); font: 700 calc(24 * var(--u)) Montserrat, "Segoe UI", Arial, sans-serif; line-height: calc(34 * var(--u)); padding-right: calc(50 * var(--u)); text-align: justify; text-align-last: left; }
  .employee-id-artwork .gov { display: grid; grid-template-columns: calc(226 * var(--u)) 1fr; font: 700 calc(24 * var(--u)) Montserrat, "Segoe UI", Arial, sans-serif; line-height: calc(38 * var(--u)); }
  .employee-id-artwork .gov dt, .employee-id-artwork .gov dd { margin: 0; }
  .employee-id-artwork .gov dd::before { content: ": "; }
  .employee-id-artwork .emergency { font: 700 calc(26 * var(--u)) Montserrat, "Segoe UI", Arial, sans-serif; }
  
  .employee-id-artwork .terms { position: absolute; left: calc(42 * var(--u)); width: calc(813 * var(--u)); top: calc(622 * var(--u)); font: 700 calc(26 * var(--u)) Montserrat, "Segoe UI", Arial, sans-serif; line-height: calc(38.5 * var(--u)); text-align: justify; text-align-last: left; }
  
  .employee-id-artwork .ceo-sig { position: absolute; left: calc(300 * var(--u)); top: calc(890 * var(--u)); width: calc(300 * var(--u)); height: calc(170 * var(--u)); object-fit: contain; }
  .employee-id-artwork .ceo-name { top: calc(1022 * var(--u)); font: 700 calc(40 * var(--u)) Poppins, Montserrat, Arial, sans-serif; color: #1b2a41; }
  .employee-id-artwork .ceo-line { position: absolute; left: calc(130 * var(--u)); top: calc(1053 * var(--u)); width: calc(636 * var(--u)); height: calc(6 * var(--u)); background: #000; }
  .employee-id-artwork .ceo-title { top: calc(1085 * var(--u)); font: 700 calc(34 * var(--u)) Montserrat, "Segoe UI", Arial, sans-serif; }
  .employee-id-artwork .co-name { top: calc(1165 * var(--u)); font: 700 calc(32 * var(--u)) Poppins, Montserrat, Arial, sans-serif; color: #1b2a41; }
  
  .employee-id-artwork .co-addr { top: calc(1198 * var(--u)); font: 700 calc(24 * var(--u)) Montserrat, "Segoe UI", Arial, sans-serif; }
  .employee-id-artwork .co-tel { top: calc(1235 * var(--u)); font: 700 calc(24 * var(--u)) Montserrat, "Segoe UI", Arial, sans-serif; }
  .employee-id-artwork .missing { color: #b91c1c !important; font-weight: 700 !important; }
  .employee-id-artwork .photo-placeholder { position: absolute; inset: 0; display: grid; place-items: center; background: #fef2f2; color: #b91c1c; font-size: calc(24 * var(--u)); font-weight: 700; text-align: center; }
  
  .employee-id-artwork[data-template="glimit"] { font-family: Montserrat, "Segoe UI", Arial, sans-serif; }
  .employee-id-artwork[data-template="glimit"] .swoosh-left,
  .employee-id-artwork[data-template="glimit"] .swoosh-right { fill: #bbb; }
  .employee-id-artwork[data-template="glimit"] .swoosh-g1,
  .employee-id-artwork[data-template="glimit"] .swoosh-g2 { fill: #e4b848; }
  .employee-id-artwork[data-template="glimit"] .swoosh-blue-accent { fill: transparent; }
  /* Logo is a CSS background so html2canvas honors "contain" (it ignores object-fit on <img>). */
  .employee-id-artwork[data-template="glimit"] .glimit-logo {
    position: absolute;
    left: 50%;
    width: calc(400 * var(--u));
    height: calc(400 * var(--u));
    object-fit: contain;
    display: block;
    transform: translateX(-50%);
    background: url("/images/glimit-logo.png") center / contain no-repeat;
  }
  .employee-id-artwork[data-template="glimit"] .photo { position: absolute; left: calc(258 * var(--u)); top: calc(306 * var(--u)); width: calc(380 * var(--u)); height: calc(400 * var(--u)); border: calc(8 * var(--u)) solid #000; background: linear-gradient(#c3e8fc, #f0f9fe 62%, #fff 100%); overflow: hidden; }
  .employee-id-artwork[data-template="glimit"] .photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .employee-id-artwork[data-template="glimit"] .photo .placeholder { position: absolute; inset: 0; }

  .employee-id-artwork[data-template="glimit"] .emp-name { top: calc(730 * var(--u)); font: 700 calc(50 * var(--u)) Poppins, Montserrat, Arial, sans-serif; color: #1b2a41; white-space: nowrap; text-transform: uppercase; }
  .employee-id-artwork[data-template="glimit"] .emp-position { top: calc(770 * var(--u)); font: 700 calc(28 * var(--u)) Montserrat, "Segoe UI", Arial, sans-serif; color: #000; }
  .employee-id-artwork[data-template="glimit"] .emp-id { top: calc(897 * var(--u)); font: 400 calc(58 * var(--u)) "Bebas Neue", Impact, "Arial Narrow", sans-serif; letter-spacing: calc(12 * var(--u)); padding-left: calc(12 * var(--u)); color: #1b2a41; font-weight: bold; }
  .employee-id-artwork[data-template="glimit"] .emp-signature { position: absolute; left: calc(300 * var(--u)); top: calc(1030 * var(--u)); width: calc(300 * var(--u)); height: calc(170 * var(--u)); object-fit: contain; }
  .employee-id-artwork[data-template="glimit"] .signature-placeholder { position: absolute; left: calc(134 * var(--u)); top: calc(1070 * var(--u)); width: calc(636 * var(--u)); height: calc(80 * var(--u)); display: grid; place-items: center; color: #b91c1c; font-size: calc(18 * var(--u)); font-weight: 700; }
  .employee-id-artwork[data-template="glimit"] .sig-line { position: absolute; left: calc(134 * var(--u)); top: calc(1153 * var(--u)); width: calc(636 * var(--u)); height: calc(6 * var(--u)); background: #000; }
  .employee-id-artwork[data-template="glimit"] .sig-label { top: calc(1193 * var(--u)); font: 700 calc(26 * var(--u)) Montserrat, "Segoe UI", Arial, sans-serif; }
  
  .employee-id-artwork[data-template="glimit"] .back-left { position: absolute; left: calc(42 * var(--u)); font: 700 calc(24 * var(--u)) Montserrat, "Segoe UI", Arial, sans-serif; line-height: calc(34 * var(--u)); padding-right: calc(50 * var(--u)); text-align: justify; text-align-last: left; }
  .employee-id-artwork[data-template="glimit"] .gov { display: grid; grid-template-columns: calc(226 * var(--u)) 1fr; font: 700 calc(24 * var(--u)) Montserrat, "Segoe UI", Arial, sans-serif; line-height: calc(38 * var(--u)); }
  .employee-id-artwork[data-template="glimit"] .gov dt, .employee-id-artwork[data-template="glimit"] .gov dd { margin: 0; }
  .employee-id-artwork[data-template="glimit"] .gov dd::before { content: ": "; }
  .employee-id-artwork[data-template="glimit"] .emergency { font: 700 calc(26 * var(--u)) Montserrat, "Segoe UI", Arial, sans-serif; }
  .employee-id-artwork[data-template="glimit"] .terms { position: absolute; left: calc(42 * var(--u)); width: calc(813 * var(--u)); top: calc(622 * var(--u)); font: 700 calc(26 * var(--u)) Montserrat, "Segoe UI", Arial, sans-serif; line-height: calc(38.5 * var(--u)); text-align: justify; text-align-last: left; }
  
  .employee-id-artwork[data-template="glimit"] .ceo-sig { position: absolute; left: calc(300 * var(--u)); top: calc(890 * var(--u)); width: calc(300 * var(--u)); height: calc(170 * var(--u)); object-fit: contain; }
  .employee-id-artwork[data-template="glimit"] .ceo-name { top: calc(1022 * var(--u)); font: 700 calc(40 * var(--u)) Poppins, Montserrat, Arial, sans-serif; color: #1b2a41; }
  .employee-id-artwork[data-template="glimit"] .ceo-line { position: absolute; left: calc(130 * var(--u)); top: calc(1053 * var(--u)); width: calc(636 * var(--u)); height: calc(6 * var(--u)); background: #000; }
  .employee-id-artwork[data-template="glimit"] .ceo-title { top: calc(1085 * var(--u)); font: 700 calc(34 * var(--u)) Montserrat, "Segoe UI", Arial, sans-serif; }
  .employee-id-artwork[data-template="glimit"] .co-name { top: calc(1165 * var(--u)); font: 700 calc(32 * var(--u)) Poppins, Montserrat, Arial, sans-serif; color: #1b2a41; }
  .employee-id-artwork[data-template="glimit"] .co-addr { top: calc(1198 * var(--u)); font: 700 calc(24 * var(--u)) Montserrat, "Segoe UI", Arial, sans-serif; }
  .employee-id-artwork[data-template="glimit"] .co-tel { top: calc(1235 * var(--u)); font: 700 calc(24 * var(--u)) Montserrat, "Segoe UI", Arial, sans-serif; }
  
  .employee-id-artwork[data-export="true"] { width: 896px; height: 1358px; aspect-ratio: auto; box-shadow: none; container-type: normal; flex: none; }
  .employee-id-artwork[data-export="true"] .face { --u: 1px; }
`;

function employeeAddress(employee: Employee): string {
  return [
    employee.house_number,
    employee.street,
    employee.village,
    employee.subdivision,
    employee.barangay,
    employee.city_municipality,
    employee.province,
    employee.region,
    employee.zip_code,
  ]
    .filter(Boolean)
    .join(", ");
}

function employeeIdName(employee: Employee): string {
  const middleInitial = employee.middle_name?.trim().charAt(0);

  return [
    employee.first_name,
    middleInitial ? `${middleInitial}.` : null,
    employee.last_name,
    employee.suffix,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

const fullNameLength = (employee: Employee) => employeeIdName(employee).length;

function missingEmployeeFields(employee: Employee): string[] {
  const missing: string[] = [];

  if (!getFullName(employee).trim()) missing.push("Employee name");
  if (!employee.position?.trim()) missing.push("Position");
  if (!employee.id_number?.trim()) missing.push("Employee ID number");
  if (!employeeAddress(employee)) missing.push("Residential address");
  if (!employee.sss_number?.trim()) missing.push("SSS number");
  if (!employee.philhealth_number?.trim()) missing.push("PhilHealth number");
  if (!employee.pagibig_number?.trim()) missing.push("Pag-IBIG number");
  if (!employee.tin_number?.trim()) missing.push("TIN");
  if (!employee.profile_image_path) missing.push("Profile photo");
  if (!employee.signature_path) missing.push("Employee signature");
  if (!employee.emergency_contact_name?.trim()) {
    missing.push("Emergency contact name");
  }
  if (!employee.emergency_contact_mobile_number?.trim()) {
    missing.push("Emergency contact mobile number");
  }

  return missing;
}

// Rendered as an SVG <g> inside the card's background <svg> so html2canvas
// exports it (standalone inline <svg> elements sized with calc() get dropped).
function GlimitHexDecoration({ transform }: { transform: string }) {
  return (
    <g transform={transform}>
      <g fill="none" stroke="#b9851a" strokeWidth="3">
        <polygon points="30,10 50,10 60,28 50,46 30,46 20,28" />
        <polygon points="62,40 82,40 92,58 82,76 62,76 52,58" />
        <polygon points="20,60 40,60 50,78 40,96 20,96 10,78" />
        <polygon points="62,84 82,84 92,102 82,120 62,120 52,102" />
        <line x1="82" y1="58" x2="112" y2="58" stroke="#f1d521" />
        <line x1="40" y1="78" x2="40" y2="140" />
      </g>
      <g fill="#c9921d">
        <circle cx="112" cy="58" r="4" />
        <circle cx="40" cy="140" r="4" />
        <polygon points="102,20 108,20 111,26 108,32 102,32 99,26" />
      </g>
      <g fill="none" stroke="#bbb" strokeWidth="1.5">
        <polygon points="86,4 94,4 98,11 94,18 86,18 82,11" />
        <polygon points="96,118 106,118 111,127 106,136 96,136 91,127" />
      </g>
    </g>
  );
}

function EmployeeIdCard({
  employee,
  side,
  template,
  exportMode = false,
  setCardElement,
}: {
  employee: Employee;
  side: "front" | "back";
  template: EmployeeIdTemplate;
  exportMode?: boolean;
  setCardElement?: (element: HTMLDivElement | null) => void;
}) {
  const uid = `${template}-${side}${exportMode ? "-export" : ""}`;
  const nameSize =
    fullNameLength(employee) > 30
      ? 30
      : fullNameLength(employee) > 24
        ? 36
        : fullNameLength(employee) > 18
          ? 42
          : 46;
  const address = employeeAddress(employee);
  const fullName = employeeIdName(employee);
  const idValue = employee.id_number?.trim()
    ? `ID NO. ${employee.id_number}`
    : "ID NO. Not provided";
  const personalFields = [
    ["SSS No.", employee.sss_number],
    ["Philhealth No.", employee.philhealth_number],
    ["Pag-ibig No.", employee.pagibig_number],
    ["Tin No.", employee.tin_number],
  ] as const;

  return (
    <div
      ref={setCardElement}
      data-export={exportMode ? "true" : undefined}
      data-template={template}
      aria-label={`Employee ID card ${side}`}
      className="employee-id-artwork"
    >
      <div className="face">
        <svg
          aria-hidden="true"
          className="bg"
          viewBox="0 0 896 1358"
          preserveAspectRatio="none"
        >
          <defs>
            <g id={`swoosh-${uid}`}>
              <polygon className="swoosh-left" points="0,1215 540,1358 0,1358" fill="#1456ac" />
              <polygon className="swoosh-g1" points="0,1262 520,1358 0,1358" fill="#fff" />
              <polygon className="swoosh-blue-accent" points="0,1276 500,1358 0,1358" fill="#14376b" />
              <polygon className="swoosh-g2" points="430,1358 896,1180 896,1358" fill="transparent" />
              <polygon className="swoosh-right" points="600,1358 896,1230 896,1358" fill="#0b2347" />
            </g>
            <g id={`hexes-${uid}`} fill="none" strokeWidth="3">
              <polygon
                points="38,-30 76,-8 76,34 38,56 0,34 0,-8"
                stroke="#2f7f9d"
              />
              <polygon
                points="38,-30 76,-8 76,34 38,56 0,34 0,-8"
                stroke="#6ccfea"
                transform="translate(-40 -50) scale(.8)"
              />
              <polygon
                points="38,-30 76,-8 76,34 38,56 0,34 0,-8"
                stroke="#2f7f9d"
                transform="translate(-4 70) scale(.9)"
              />
              <polygon
                points="38,-30 76,-8 76,34 38,56 0,34 0,-8"
                stroke="#6ccfea"
                transform="translate(50 -2) scale(.7)"
              />
              <polygon
                points="0,0 14,8 14,24 0,32 -14,24 -14,8"
                fill="#2f7f9d"
                stroke="none"
                transform="translate(60 140)"
              />
              <polygon
                points="0,0 12,7 12,21 0,28 -12,21 -12,7"
                fill="#6ccfea"
                stroke="none"
                transform="translate(95 40)"
              />
              <path d="M40 30 H150" stroke="#2f7f9d" />
              <circle cx="154" cy="30" r="6" fill="#2f7f9d" stroke="none" />
              <path d="M70 110 H150" stroke="#6ccfea" />
              <circle cx="154" cy="110" r="6" fill="#6ccfea" stroke="none" />
              <path d="M72 76 V270" stroke="#2f7f9d" />
              <circle cx="72" cy="274" r="6" fill="#2f7f9d" stroke="none" />
            </g>
          </defs>
          {template === "infinitech" && side === "front" && (
            <use href={`#hexes-${uid}`} transform="translate(-45 255)" />
          )}
          {template === "infinitech" && side === "front" && (
            <use
              href={`#hexes-${uid}`}
              transform="translate(940 1030) scale(-1 1) rotate(180 75 130)"
            />
          )}
          <use href={`#swoosh-${uid}`} />
          {template === "glimit" && side === "front" && (
            <>
              <GlimitHexDecoration transform="translate(0 204) scale(1.2667)" />
              <GlimitHexDecoration transform="translate(896 788) scale(-1.2667 1.2667)" />
            </>
          )}
          {template === "glimit" && side === "back" && (
            <GlimitHexDecoration transform="translate(896 150) scale(-1.1 1.1)" />
          )}
        </svg>
        {side === "front" ? (
          <>
            {template === "glimit" ? (
              <div
                role="img"
                aria-label="G-LIMIT Studio logo"
                className="glimit-logo"
              />
            ) : (
              <>
                <NextImage
                  alt="Infinitech Advertising Corporation logo"
                  className="brand-logo"
                  height={1140}
                  priority
                  unoptimized={exportMode}
                  src="/images/logo-only.png"
                  width={1140}
                />
                <p className="abs brand-name">INFINITECH</p>
                <p className="abs brand-sub">ADVERTISING CORPORATION</p>
              </>
            )}
            <div className="photo">
              {employee.profile_image_path ? (
                <EmployeePrivateImage
                  alt={`${fullName || "Employee"} profile`}
                  className="h-full w-full object-cover"
                  employeeId={employee.id}
                  fileType="profile-image"
                  storagePath={employee.profile_image_path}
                  fallback={
                    <div className="photo-placeholder">PHOTO NOT PROVIDED</div>
                  }
                />
              ) : (
                <div className="photo-placeholder">PHOTO NOT PROVIDED</div>
              )}
            </div>
            <p
              className={`abs emp-name${fullName ? "" : " missing"}`}
              style={{ fontSize: `calc(${nameSize} * var(--u))` }}
            >
              {fullName || "EMPLOYEE NAME NOT PROVIDED"}
            </p>
            <p
              className={`abs emp-position${employee.position?.trim() ? "" : " missing"}`}
            >
              {employee.position?.trim() || "POSITION NOT PROVIDED"}
            </p>
            <p
              className={`abs emp-id${employee.id_number?.trim() ? "" : " missing"}`}
            >
              {idValue}
            </p>
            <div className="sig-line" />
            {employee.signature_path ? (
              <EmployeePrivateImage
                alt={`${fullName || "Employee"} signature`}
                className="emp-signature"
                employeeId={employee.id}
                fileType="signature"
                storagePath={employee.signature_path}
                fallback={
                  <span className="signature-placeholder">
                    SIGNATURE NOT PROVIDED
                  </span>
                }
              />
            ) : (
              <span className="signature-placeholder">
                SIGNATURE NOT PROVIDED
              </span>
            )}
            <p className="abs sig-label">Employee’s Signature</p>
          </>
        ) : (
          <>
            <div className="back-left" style={{ top: "calc(26 * var(--u))" }}>
              <p>Personal Details</p>
              <p>Residential Address:</p>
              <p
                className={address ? "" : "missing"}
                style={{ fontWeight: 600 }}
              >
                {address || "Not provided"}
              </p>
            </div>
            <dl
              className="back-left gov"
              style={{ top: "calc(198 * var(--u))" }}
            >
              {personalFields.map(([label, value]) => (
                <Fragment key={label}>
                  <dt>{label}</dt>
                  <dd className={value?.trim() ? "" : "missing"}>
                    {value?.trim() || "Not provided"}
                  </dd>
                </Fragment>
              ))}
            </dl>
            <p
              className="abs emergency emergency-heading"
              style={{ top: "calc(417 * var(--u))" }}
            >
              Contact Person in case of Emergency
            </p>
            <p
              className={`abs emergency${employee.emergency_contact_name?.trim() ? "" : " missing"}`}
              style={{ top: "calc(473 * var(--u))" }}
            >
              {employee.emergency_contact_name?.trim() || "Contact Person Name"}
            </p>
            <p
              className={`abs emergency${employee.emergency_contact_mobile_number?.trim() ? "" : " missing"}`}
              style={{ top: "calc(528 * var(--u))" }}
            >
              {employee.emergency_contact_mobile_number?.trim() ||
                "Contact Person Mobile Number"}
            </p>
            <p className="terms">{notice}</p>
            <NextImage
              alt="Angelle S. Sarmiento signature"
              className="ceo-sig"
              height={193}
              unoptimized={exportMode}
              loading={exportMode ? "eager" : undefined}
              src={
                template === "glimit"
                  ? "/images/glimit-signature.png"
                  : "/ANGELLE.png"
              }
              width={215}
            />
            <p className="abs ceo-name">ANGELLE S. SARMIENTO</p>
            <div className="ceo-line" />
            <p className="abs ceo-title">Chief Executive Officer</p>
            <p className="abs co-name">
              {template === "glimit"
                ? "G-LIMIT STUDIO"
                : "INFINITECH ADVERTISING CORPORATION"}
            </p>
            <p className="abs co-addr">
              Unit 311, Campos Rueda Bldg., Urban Ave., Makati City
            </p>
            <p className="abs co-tel">(02) 7001-6157</p>
          </>
        )}
      </div>
    </div>
  );
}

export function EmployeeIdDialog({
  employee,
  open,
  onOpenChange,
  onEditEmployee,
}: EmployeeIdDialogProps) {
  const [history, setHistory] = useState<EmployeeIdIssuance[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmployeeIdTemplate>("infinitech");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [busy, setBusy] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [reissuanceDetails, setReissuanceDetails] = useState("");
  const [confirmAction, setConfirmAction] = useState<IssuanceAction | null>(
    null,
  );
  const [confirmTarget, setConfirmTarget] = useState<EmployeeIdIssuance | null>(
    null,
  );
  const exportFrontRef = useRef<HTMLDivElement | null>(null);
  const exportBackRef = useRef<HTMLDivElement | null>(null);

  const missingFields = useMemo(
    () => (employee ? missingEmployeeFields(employee) : []),
    [employee],
  );
  const requiredFieldsMissing = useMemo(
    () =>
      employee
        ? !getFullName(employee).trim() ||
        !employee.position?.trim() ||
        !employee.id_number?.trim()
        : true,
    [employee],
  );
  const latest = history[0] ?? null;
  const hasActiveId = latest ? activeStatuses.includes(latest.status) : false;

  useEffect(() => {
    if (!open || !employee) return;

    let cancelled = false;

    setLoadingHistory(true);
    setHistory([]);
    setRemarks("");
    setReissuanceDetails("");
    setConfirmAction(null);
    setConfirmTarget(null);
    apiFetch(`/api/employee-masterfile/${employee.id}/id-issuances`, {
      cache: "no-store",
    })
      .then(async (response) => {
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Unable to load issuance history.");
        }
        if (!cancelled) {
          const records = result.data as EmployeeIdIssuance[];
          setHistory(records);
          setSelectedTemplate(
            records[0]?.id_template === "glimit" ? "glimit" : "infinitech",
          );
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Unable to load issuance history.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });

    return () => {
      cancelled = true;
    };
  }, [employee, open]);

  async function refreshHistory() {
    if (!employee) return;
    const response = await apiFetch(
      `/api/employee-masterfile/${employee.id}/id-issuances`,
      { cache: "no-store" },
    );
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to refresh issuance history.");
    }
    const records = result.data as EmployeeIdIssuance[];
    setHistory(records);
    if (records[0]) {
      setSelectedTemplate(
        records[0].id_template === "glimit" ? "glimit" : "infinitech",
      );
    }
  }

  async function createIssuance() {
    if (!employee) return;

    setBusy(true);
    try {
      const response = await apiFetch(
        `/api/employee-masterfile/${employee.id}/id-issuances`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_template: selectedTemplate,
            remarks:
              reissuanceDetails.trim() ||
              remarks.trim() ||
              null,
          }),
        },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to issue employee ID.");
      }
      const issuance = result.data as EmployeeIdIssuance;
      const followUpErrors: string[] = [];
      try {
        await refreshHistory();
      } catch (error) {
        console.error("Employee ID issuance history refresh failed:", error);
        followUpErrors.push("history could not be refreshed");
      }
      setRemarks("");
      setReissuanceDetails("");
      try {
        const pngs = await getPngs();
        await Promise.all([
          downloadPng(
            pngs.front,
            `employee-id-${employee.id}-v${issuance.version}-front.png`,
          ),
          downloadPng(
            pngs.back,
            `employee-id-${employee.id}-v${issuance.version}-back.png`,
          ),
        ]);
      } catch (error) {
        console.error("Employee ID PNG export failed:", error);
        followUpErrors.push("PNG export failed");
      }
      if (followUpErrors.length) {
        toast.error(
          `Employee ID issued and recorded, but ${followUpErrors.join(" and ")}. Use the reprint action to export the ID again.`,
        );
      } else {
        toast.success("Employee ID issued, recorded, and exported as PNG.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to issue employee ID.",
      );
    } finally {
      setBusy(false);
      setConfirmAction(null);
    }
  }

  async function performAction(action: Exclude<IssuanceAction, "issue">) {
    if (!employee || !latest) return;

    setBusy(true);
    try {
      const response = await apiFetch(
        `/api/employee-masterfile/${employee.id}/id-issuances/${latest.id}/actions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            id_template: selectedTemplate,
            remarks:
              action === "reprint" || action === "replace"
                ? reissuanceDetails.trim()
                : remarks.trim() || null,
          }),
        },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to update employee ID.");
      }
      const issuance = result.data as EmployeeIdIssuance;
      const followUpErrors: string[] = [];
      try {
        await refreshHistory();
      } catch (error) {
        console.error("Employee ID issuance history refresh failed:", error);
        followUpErrors.push("history could not be refreshed");
      }
      setRemarks("");
      setReissuanceDetails("");
      if (action === "reprint" || action === "replace") {
        try {
          const pngs = await getPngs();
          await Promise.all([
            downloadPng(
              pngs.front,
              `employee-id-${employee.id}-v${issuance.version}-front.png`,
            ),
            downloadPng(
              pngs.back,
              `employee-id-${employee.id}-v${issuance.version}-back.png`,
            ),
          ]);
        } catch (error) {
          console.error("Employee ID PNG export failed:", error);
          followUpErrors.push("PNG export failed");
        }
      }
      const successMessage =
        action === "reprint"
          ? "ID reprint recorded and exported as PNG."
          : action === "replace"
            ? "ID reissued, recorded, and exported as PNG."
            : "Employee ID revoked and recorded in history.";
      if (followUpErrors.length) {
        toast.error(
          `${successMessage} However, ${followUpErrors.join(" and ")}.`,
        );
      } else {
        toast.success(successMessage);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update employee ID.",
      );
    } finally {
      setBusy(false);
      setConfirmAction(null);
      setConfirmTarget(null);
    }
  }

  async function getPngs() {
    if (!employee) throw new Error("Select an employee first.");
    const front = exportFrontRef.current;
    const back = exportBackRef.current;

    if (!front || !back) {
      throw new Error("The employee ID preview is not ready.");
    }

    const cards = [front, back];

    await Promise.all([
      document.fonts.load("700 40px Poppins"),
      document.fonts.load("700 26px Montserrat"),
      document.fonts.load('400 58px "Bebas Neue"'),
    ]);
    await document.fonts.ready;

    // The G-LIMIT logo is a CSS background, so preload it explicitly to make
    // sure it is decoded before html2canvas captures the card.
    if (selectedTemplate === "glimit") {
      await new Promise<void>((resolve) => {
        const logo = new Image();
        logo.onload = () => resolve();
        logo.onerror = () => resolve();
        logo.src = "/images/glimit-logo.png";
        setTimeout(resolve, 8000);
      });
    }

    const expectedFrontImages =
      (selectedTemplate === "glimit" ? 0 : 1) +
      (employee.profile_image_path ? 1 : 0) +
      (employee.signature_path ? 1 : 0);
    const deadline = Date.now() + 8000;

    while (
      Date.now() < deadline &&
      front.querySelectorAll("img").length < expectedFrontImages
    ) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    await Promise.all(
      cards.flatMap((card) =>
        Array.from(card.querySelectorAll("img")).map((image) =>
          image.complete && image.naturalWidth > 0
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
              image.addEventListener("load", () => resolve(), {
                once: true,
              });
              image.addEventListener("error", () => resolve(), {
                once: true,
              });
              setTimeout(resolve, 8000);
            }),
        ),
      ),
    );

    const cardCanvases = await Promise.all(
      cards.map((card) =>
        html2canvas(card, {
          backgroundColor: "#ffffff",
          scale: 2,
          width: 896,
          height: 1358,
          windowWidth: 896,
          useCORS: true,
          logging: false,
          onclone: (clonedDocument) => {
            const holder = clonedDocument.querySelector<HTMLElement>(
              "[data-employee-id-export]",
            );

            if (holder) {
              holder.style.left = "0px";
              holder.style.top = "0px";
            }
          },
        }),
      ),
    );
    return {
      front: cardCanvases[0],
      back: cardCanvases[1],
    };
  }

  async function downloadPng(canvas: HTMLCanvasElement, filename: string) {
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) =>
          result
            ? resolve(result)
            : reject(new Error("Unable to create the employee ID PNG.")),
        "image/png",
      );
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  function requestAction(action: IssuanceAction) {
    setConfirmTarget(null);
    setReissuanceDetails("");
    setConfirmAction(action);
  }

  function requestRecordAction(action: IssuanceAction) {
    setConfirmTarget(latest);
    setReissuanceDetails("");
    setConfirmAction(action);
  }

  async function confirm() {
    if (!confirmAction) return;
    const requiresReissuanceDetails =
      confirmAction === "replace" ||
      confirmAction === "reprint" ||
      (confirmAction === "issue" && latest !== null);
    if (requiresReissuanceDetails && !reissuanceDetails.trim()) {
      toast.error("Enter the reason and details for reissuing this employee ID.");
      return;
    }
    if (confirmAction === "issue") {
      await createIssuance();

      return;
    }
    if (confirmTarget?.id !== latest?.id) {
      setConfirmAction(null);
      setConfirmTarget(null);
      toast.error("The current issuance changed. Refresh and try again.");

      return;
    }
    await performAction(confirmAction);
  }

  if (!employee) return null;

  const actionLabel: Record<IssuanceAction, string> = {
    issue: "Issue ID",
    reprint: "Record reprint",
    replace: "Reissue ID",
    revoke: "Revoke ID",
  };
  const requiresReissuanceDetails =
    confirmAction === "replace" ||
    confirmAction === "reprint" ||
    (confirmAction === "issue" && latest !== null);
  const selectedTemplateLabel =
    selectedTemplate === "glimit" ? "G-LIMIT Studio" : "Infinitech";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90dvh] w-[calc(100%-1rem)] max-w-4xl overflow-y-auto border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
          <style>{employeeIdTemplateStyles}</style>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Employee ID:
            </DialogTitle>
            <DialogDescription>
              {getFullName(employee)} · Employee ID {employee.id_number}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div>
              <fieldset className="mb-4">
                <legend className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  ID template to issue
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    ["infinitech", "Infinitech"],
                    ["glimit", "G-LIMIT Studio"],
                  ] as const).map(([template, label]) => (
                    <Button
                      key={template}
                      type="button"
                      variant="outline"
                      aria-pressed={selectedTemplate === template}
                      disabled={busy || loadingHistory}
                      onClick={() => setSelectedTemplate(template)}
                      className={
                        selectedTemplate === template
                          ? "border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600 dark:bg-blue-950 dark:text-blue-100"
                          : ""
                      }
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </fieldset>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <EmployeeIdCard
                    employee={employee}
                    side="front"
                    template={selectedTemplate}
                  />
                  <p className="mt-2 text-center text-xs font-semibold text-slate-500">
                    FRONT
                  </p>
                </div>
                <div>
                  <EmployeeIdCard
                    employee={employee}
                    side="back"
                    template={selectedTemplate}
                  />
                  <p className="mt-2 text-center text-xs font-semibold text-slate-500">
                    BACK
                  </p>
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <section
                aria-live="polite"
                className={`rounded-lg border p-3 ${missingFields.length
                  ? "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
                  : "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
                  }`}
              >
                <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                  {missingFields.length ? (
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  )}
                  {missingFields.length ? "Incomplete information" : "Ready"}
                </h3>
                {missingFields.length ? (
                  <>
                    <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
                      Missing values are displayed as “Not provided.” Complete the
                      employee record through Edit before issuing when the
                      information is available.
                    </p>
                    <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs text-slate-700 dark:text-slate-300">
                      {missingFields.map((field) => (
                        <li key={field}>{field}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
                    All mapped employee fields are available.
                  </p>
                )}
                {requiredFieldsMissing && (
                  <p className="mt-2 text-xs font-semibold text-red-700 dark:text-red-300">
                    Name, position, and employee ID are required to issue.
                  </p>
                )}
                {missingFields.length > 0 && (
                  <Button
                    className="mt-3 w-full"
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() => {
                      onOpenChange(false);
                      onEditEmployee(employee);
                    }}
                  >
                    Edit employee record
                  </Button>
                )}
              </section>

              {(latest === null || hasActiveId) && (
                <div>
                  <label
                    className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300"
                    htmlFor="employee-id-remarks"
                  >
                    {hasActiveId
                      ? "Revocation note (optional)"
                      : "Issuance note (optional)"}
                  </label>
                  <Input
                    id="employee-id-remarks"
                    maxLength={1000}
                    placeholder={
                      hasActiveId ? "Revocation note" : "Issuance note"
                    }
                    value={remarks}
                    onChange={(event) => setRemarks(event.target.value)}
                  />
                </div>
              )}

              {hasActiveId ? (
                <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30">
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                    Active ID · Version {latest.version} · {latest.status}
                  </p>
                  <Button
                    className="w-full"
                    disabled={busy}
                    type="button"
                    variant="outline"
                    onClick={() => requestRecordAction("reprint")}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reprint ID
                  </Button>
                  <Button
                    className="w-full"
                    disabled={busy}
                    type="button"
                    variant="outline"
                    onClick={() => requestRecordAction("replace")}
                  >
                    Reissue ID
                  </Button>
                  <Button
                    className="w-full text-red-700 hover:text-red-800"
                    disabled={busy}
                    type="button"
                    variant="outline"
                    onClick={() => requestRecordAction("revoke")}
                  >
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    Revoke ID
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                  disabled={busy || loadingHistory || requiredFieldsMissing}
                  type="button"
                  onClick={() => requestAction("issue")}
                >
                  Issue {selectedTemplateLabel} ID
                </Button>
              )}
            </aside>
          </div>

          <section className="border-t border-slate-200 pt-4 dark:border-slate-800">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                ID issuance history
              </h3>
              {loadingHistory && (
                <Loader className="h-4 w-4 animate-spin text-slate-500" />
              )}
            </div>
            {history.length ? (
              <div className="max-h-48 overflow-auto rounded-md border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50 text-slate-500 dark:bg-slate-900">
                    <tr>
                      <th className="px-2 py-2 font-medium">Date</th>
                      <th className="px-2 py-2 font-medium">Issued by</th>
                      <th className="px-2 py-2 font-medium">Status</th>
                      <th className="px-2 py-2 font-medium">Template</th>
                      <th className="px-2 py-2 font-medium">Version</th>
                      <th className="px-2 py-2 font-medium">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-t border-slate-200 dark:border-slate-800"
                      >
                        <td className="whitespace-nowrap px-2 py-2">
                          {new Date(entry.created_at).toLocaleString()}
                        </td>
                        <td className="px-2 py-2">{entry.issued_by}</td>
                        <td className="px-2 py-2">{entry.status}</td>
                        <td className="px-2 py-2">
                          {entry.id_template === "glimit"
                            ? "G-LIMIT Studio"
                            : "Infinitech"}
                        </td>
                        <td className="px-2 py-2">{entry.version}</td>
                        <td
                          className="max-w-[140px] truncate px-2 py-2"
                          title={entry.remarks || ""}
                        >
                          {entry.remarks || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                {loadingHistory
                  ? "Loading history…"
                  : "No IDs have been issued for this employee."}
              </p>
            )}
          </section>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmAction !== null}
        onOpenChange={(confirmOpen) => {
          if (!confirmOpen && !busy) {
            setConfirmAction(null);
            setConfirmTarget(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "reprint"
                ? `Reprint employee ID · Version ${latest?.version ?? 1}`
                : requiresReissuanceDetails
                  ? `Reissue employee ID · Version ${latest ? latest.version + 1 : 1}`
                  : `Confirm ${confirmAction ? actionLabel[confirmAction] : "action"}`}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "issue"
                ? `Issue version ${latest ? latest.version + 1 : 1} of the employee ID for ${getFullName(employee)}? The issuance will be added to the history and exported as separate front and back PNG files.`
                : confirmAction === "replace"
                  ? `Reissue the active employee ID for ${getFullName(employee)}? The previous version will remain in the issuance history.`
                  : confirmAction === "revoke"
                    ? `Revoke the active employee ID for ${getFullName(employee)}? This action will be recorded in the issuance history.`
                    : `Record a reprint of the active employee ID for ${getFullName(employee)}? The front and back will be exported as separate PNG files.`}
            </DialogDescription>
          </DialogHeader>
          {requiresReissuanceDetails && (
            <div className="space-y-2">
              <label
                htmlFor="employee-id-reissuance-details"
                className="text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Reason and details
              </label>
              <Textarea
                id="employee-id-reissuance-details"
                autoFocus
                maxLength={1000}
                placeholder="For example: lost card, damaged card, or updated employee details"
                value={reissuanceDetails}
                onChange={(event) => setReissuanceDetails(event.target.value)}
                disabled={busy}
                required
                className="min-h-24 bg-white dark:bg-slate-900"
              />
              <p className="text-xs text-slate-500">
                This explanation will be saved in the ID issuance history.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              disabled={busy}
              type="button"
              variant="outline"
              onClick={() => {
                setConfirmAction(null);
                setConfirmTarget(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className={
                confirmAction === "revoke"
                  ? "bg-red-600 hover:bg-red-700"
                  : undefined
              }
              disabled={busy}
              type="button"
              onClick={confirm}
            >
              {busy && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Confirm {confirmAction ? actionLabel[confirmAction] : "action"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            aria-hidden="true"
            data-employee-id-export=""
            style={{
              position: "absolute",
              left: -10000,
              top: 0,
              pointerEvents: "none",
            }}
          >
            <EmployeeIdCard
              exportMode
              employee={employee}
              template={selectedTemplate}
              setCardElement={(element) => {
                exportFrontRef.current = element;
              }}
              side="front"
            />
            <EmployeeIdCard
              exportMode
              employee={employee}
              template={selectedTemplate}
              setCardElement={(element) => {
                exportBackRef.current = element;
              }}
              side="back"
            />
          </div>,
          document.body,
        )}
    </>
  );
}