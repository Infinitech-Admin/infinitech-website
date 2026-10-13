"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Download,
  Loader,
  Printer,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import NextImage from "next/image";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
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
import { EmployeePrivateImage } from "@/components/admin/employee-media";
import { getFullName, type Employee } from "@/components/admin/employee-types";
import { apiFetch } from "@/lib/api-client";

type IssuanceStatus = "Issued" | "Reprinted" | "Replaced" | "Revoked";
type IssuanceAction = "issue" | "reprint" | "replace" | "revoke";

interface EmployeeIdIssuance {
  id: number;
  employee_number: string;
  employee_name: string;
  issued_by: string;
  status: IssuanceStatus;
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

const companyAddress = "Unit 311, Campos Rueda Bldg., Urban Ave., Makati City";
const companyPhone = "(02) 7001-6157";
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
  .employee-id-artwork .emp-signature { position: absolute; left: calc(134 * var(--u)); top: calc(1000 * var(--u)); width: calc(636 * var(--u)); height: calc(220 * var(--u)); object-fit: contain; }
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

async function fetchBrandLogo(): Promise<string> {
  const response = await fetch("/infinitech-logo.png", {
    cache: "force-cache",
  });

  if (!response.ok) throw new Error("Unable to load the company logo.");

  const objectUrl = URL.createObjectURL(await response.blob());

  try {
    const image = new Image();

    image.src = objectUrl;
    await image.decode();

    const source = document.createElement("canvas");

    source.width = image.naturalWidth;
    source.height = image.naturalHeight;
    const sourceContext = source.getContext("2d", { willReadFrequently: true });

    if (!sourceContext) throw new Error("Unable to prepare the company logo.");
    sourceContext.drawImage(image, 0, 0);

    const { data, width, height } = sourceContext.getImageData(
      0,
      0,
      source.width,
      source.height,
    );
    let left = width;
    let top = height;
    let right = 0;
    let bottom = 0;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (data[(y * width + x) * 4 + 3] > 8) {
          left = Math.min(left, x);
          top = Math.min(top, y);
          right = Math.max(right, x);
          bottom = Math.max(bottom, y);
        }
      }
    }
    if (right < left || bottom < top) {
      throw new Error("The company logo is empty.");
    }

    const cropped = document.createElement("canvas");

    cropped.width = right - left + 1;
    cropped.height = bottom - top + 1;
    const croppedContext = cropped.getContext("2d");

    if (!croppedContext) throw new Error("Unable to prepare the company logo.");
    croppedContext.drawImage(
      source,
      left,
      top,
      cropped.width,
      cropped.height,
      0,
      0,
      cropped.width,
      cropped.height,
    );

    return cropped.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function drawPhotoPlaceholder(doc: jsPDF, x: number, y: number, size: number) {
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(148, 163, 184);
  doc.roundedRect(x, y, size, size, 1.2, 1.2, "FD");
  doc.setTextColor(185, 28, 28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(5);
  doc.text("PHOTO NOT PROVIDED", x + size / 2, y + size / 2 + 1, {
    align: "center",
  });
}

function fitImage(
  doc: jsPDF,
  image: string,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
) {
  const dimensions = doc.getImageProperties(image);
  const scale = Math.min(
    maxWidth / dimensions.width,
    maxHeight / dimensions.height,
  );
  const width = dimensions.width * scale;
  const height = dimensions.height * scale;

  doc.addImage(
    image,
    "PNG",
    x + (maxWidth - width) / 2,
    y + (maxHeight - height) / 2,
    width,
    height,
  );
}

function pdfValue(value?: string | null): string {
  return value?.trim() || "Not provided";
}

function createEmployeeIdPdf(
  employee: Employee,
  logo: string,
  photo: string | null,
  signature: string | null,
): jsPDF {
  const width = 95;
  const height = 130;
  const center = width / 2;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [width, height],
    compress: true,
  });

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, width, height, "F");
  doc.setFillColor(18, 74, 145);
  doc.rect(0, 0, width, 1.4, "F");
  doc.setFillColor(75, 191, 213);
  doc.rect(0, 1.4, width, 0.55, "F");
  fitImage(doc, logo, center - 12, 4.5, 24, 12);

  const photoSize = 25;
  const photoX = center - photoSize / 2;
  const photoY = 18.3;

  if (photo) {
    doc.setDrawColor(14, 46, 91);
    doc.setLineWidth(0.65);
    doc.rect(photoX - 0.5, photoY - 0.5, photoSize + 1, photoSize + 1);
    doc.addImage(photo, "PNG", photoX, photoY, photoSize, photoSize);
  } else {
    drawPhotoPlaceholder(doc, photoX, photoY, photoSize);
  }

  const hasName = Boolean(getFullName(employee).trim());
  const fullName = getFullName(employee).trim() || "NAME NOT PROVIDED";
  doc.setTextColor(hasName ? 14 : 185, hasName ? 46 : 28, hasName ? 91 : 28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(fullName.length > 25 ? 8 : fullName.length > 18 ? 9 : 10);
  const nameLines = doc.splitTextToSize(fullName.toUpperCase(), 48);

  doc.text(nameLines, center, 47, { align: "center", lineHeightFactor: 1.05 });

  const positionY = 47 + nameLines.length * 4.1;

  const hasPosition = Boolean(employee.position?.trim());
  doc.setTextColor(
    hasPosition ? 25 : 185,
    hasPosition ? 100 : 28,
    hasPosition ? 190 : 28,
  );
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(
    doc.splitTextToSize(pdfValue(employee.position).toUpperCase(), 46),
    center,
    positionY,
    { align: "center" },
  );

  const hasEmployeeNumber = Boolean(employee.id_number?.trim());
  doc.setTextColor(
    hasEmployeeNumber ? 14 : 185,
    hasEmployeeNumber ? 46 : 28,
    hasEmployeeNumber ? 91 : 28,
  );
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.2);
  doc.text(
    doc.splitTextToSize(`ID NO.  ${pdfValue(employee.id_number)}`, 46),
    center,
    62,
    { align: "center", lineHeightFactor: 1.05 },
  );

  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.2);
  doc.line(13, 69.5, 41, 69.5);
  if (signature) fitImage(doc, signature, 16, 64.5, 22, 4.7);
  else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(4);
    doc.setTextColor(185, 28, 28);
    doc.text("SIGNATURE NOT PROVIDED", center, 68.5, { align: "center" });
  }
  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(4.5);
  doc.text("EMPLOYEE SIGNATURE", center, 72, { align: "center" });

  doc.setFillColor(14, 46, 91);
  doc.rect(0, 76, width, 9.6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(4.2);
  doc.text("INFINITECH ADVERTISING CORPORATION", center, 79, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(3.65);
  doc.text(companyAddress, center, 81.4, { align: "center" });
  doc.text(companyPhone, center, 83.5, { align: "center" });

  doc.addPage([width, height], "portrait");
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, width, height, "F");
  doc.setFillColor(18, 74, 145);
  doc.rect(0, 0, width, 1.4, "F");
  doc.setTextColor(14, 46, 91);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("PERSONAL DETAILS", 5, 7);

  const address = employeeAddress(employee);
  const details: [string, string][] = [
    ["Residential Address", address || "Not provided"],
    ["SSS Number", pdfValue(employee.sss_number)],
    ["PhilHealth Number", pdfValue(employee.philhealth_number)],
    ["Pag-IBIG Number", pdfValue(employee.pagibig_number)],
    ["TIN", pdfValue(employee.tin_number)],
  ];
  let y = 11;

  for (const [label, value] of details) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(4.5);
    doc.setTextColor(71, 85, 105);
    doc.text(label.toUpperCase(), 5, y);
    const isMissing = value === "Not provided";
    doc.setFont("helvetica", isMissing ? "bold" : "normal");
    doc.setFontSize(label === "Residential Address" ? 4.4 : 5.2);
    doc.setTextColor(
      isMissing ? 185 : 15,
      isMissing ? 28 : 23,
      isMissing ? 28 : 42,
    );
    const lines = doc.splitTextToSize(value, 43);

    doc.text(lines.slice(0, 2), 5, y + 2.2, { lineHeightFactor: 0.5 });
    y += label === "Residential Address" ? 10 : 7.6;
  }

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.line(5, 49, 49, 49);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.3);
  doc.setTextColor(14, 46, 91);
  doc.text("EMERGENCY CONTACT", 5, 53);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(4.8);
  const contactName = pdfValue(employee.emergency_contact_name);
  const contactMobile = pdfValue(employee.emergency_contact_mobile_number);
  doc.setTextColor(51, 65, 85);
  doc.text("Contact Person:", 5, 57);
  doc.setTextColor(
    contactName === "Not provided" ? 185 : 51,
    contactName === "Not provided" ? 28 : 65,
    contactName === "Not provided" ? 28 : 85,
  );
  doc.text(doc.splitTextToSize(contactName, 43), 5, 59);
  doc.setTextColor(51, 65, 85);
  doc.text("Mobile Number:", 5, 63);
  doc.setTextColor(
    contactMobile === "Not provided" ? 185 : 51,
    contactMobile === "Not provided" ? 28 : 65,
    contactMobile === "Not provided" ? 28 : 85,
  );
  doc.text(doc.splitTextToSize(contactMobile, 43), 5, 65);

  doc.setFillColor(239, 246, 255);
  doc.roundedRect(4, 69, 45.98, 6.5, 1, 1, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(4.15);
  doc.setTextColor(30, 41, 59);
  doc.text(doc.splitTextToSize(notice, 42), center, 71, {
    align: "center",
    lineHeightFactor: 1.12,
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.5);
  doc.setTextColor(14, 46, 91);
  doc.text("ANGELLE S. SARMIENTO", center, 78, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(4.3);
  doc.text("Chief Executive Officer", center, 80.3, { align: "center" });
  doc.setDrawColor(18, 74, 145);
  doc.line(0, 82.3, width, 82.3);
  doc.setFontSize(3.8);
  doc.text("INFINITECH ADVERTISING CORPORATION", center, 84, {
    align: "center",
  });
  doc.setFontSize(3.1);
  doc.text(`${companyAddress}  |  ${companyPhone}`, center, 85.2, {
    align: "center",
  });

  return doc;
}

function EmployeeIdCard({
  employee,
  side,
  exportMode = false,
  setCardElement,
}: {
  employee: Employee;
  side: "front" | "back";
  exportMode?: boolean;
  setCardElement?: (element: HTMLDivElement | null) => void;
}) {
  const uid = `${side}${exportMode ? "-export" : ""}`;
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
              <polygon points="0,1215 540,1358 0,1358" fill="#1456ac" />
              <polygon points="0,1262 520,1358 0,1358" fill="#fff" />
              <polygon points="0,1276 500,1358 0,1358" fill="#14376b" />
              <polygon points="540,1358 896,1180 896,1358" fill="#0b2347" />
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
          {side === "front" && (
            <use href={`#hexes-${uid}`} transform="translate(-45 255)" />
          )}
          {side === "front" && (
            <use
              href={`#hexes-${uid}`}
              transform="translate(940 1030) scale(-1 1) rotate(180 75 130)"
            />
          )}
          <use href={`#swoosh-${uid}`} />
        </svg>
        {side === "front" ? (
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
              className="abs emergency"
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
              src="/ANGELLE.png"
              width={215}
            />
            <p className="abs ceo-name">ANGELLE S. SARMIENTO</p>
            <div className="ceo-line" />
            <p className="abs ceo-title">Chief Executive Officer</p>
            <p className="abs co-name">INFINITECH ADVERTISING CORPORATION</p>
            <p className="abs co-addr">
              Unit 311, Campos Rueda Bldg. Urban Ave., Makati City
            </p>
            <p className="abs co-tel">Tel: (02)7001-6157</p>
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
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [busy, setBusy] = useState(false);
  const [remarks, setRemarks] = useState("");
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
        if (!cancelled) setHistory(result.data as EmployeeIdIssuance[]);
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
    setHistory(result.data as EmployeeIdIssuance[]);
  }

  async function createIssuance() {
    if (!employee) return;

    setBusy(true);
    try {
      const pdf = await getPdf();
      const response = await apiFetch(
        `/api/employee-masterfile/${employee.id}/id-issuances`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ remarks: remarks.trim() || null }),
        },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to issue employee ID.");
      }
      pdf.save(`employee-id-${employee.id}.pdf`);
      await refreshHistory();
      setRemarks("");
      toast.success("Employee ID issued and PDF downloaded.");
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
      const pdf =
        action === "reprint" || action === "replace" ? await getPdf() : null;
      const response = await apiFetch(
        `/api/employee-masterfile/${employee.id}/id-issuances/${latest.id}/actions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            remarks: remarks.trim() || null,
          }),
        },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to update employee ID.");
      }
      if (pdf) pdf.save(`employee-id-${employee.id}.pdf`);
      await refreshHistory();
      setRemarks("");
      toast.success(
        action === "reprint"
          ? "Reprint recorded and PDF downloaded."
          : action === "replace"
            ? "Replacement ID issued and PDF downloaded."
            : "Employee ID revoked.",
      );
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

  async function getPdf() {
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

    const expectedFrontImages =
      1 +
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

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    for (let index = 0; index < cards.length; index += 1) {
      const canvas = await html2canvas(cards[index], {
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
      });

      if (index > 0) {
        pdf.addPage("a4", "portrait");
      }

      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        pageWidth,
        pageHeight,
        undefined,
        "FAST",
      );
    }

    return pdf;
  }

  async function downloadPdf() {
    if (!employee) return;

    setBusy(true);
    try {
      const pdf = await getPdf();

      pdf.save(`employee-id-${employee.id}.pdf`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to generate employee ID PDF.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function printPdf() {
    const printWindow = window.open("about:blank", "_blank");

    if (!printWindow) {
      toast.error("Allow pop-ups to print the employee ID.");

      return;
    }

    setBusy(true);
    try {
      const pdf = await getPdf();

      pdf.autoPrint();
      const url = URL.createObjectURL(pdf.output("blob"));

      printWindow.location.href = url;
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      printWindow.close();
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to prepare employee ID for printing.",
      );
    } finally {
      setBusy(false);
    }
  }

  function requestAction(action: IssuanceAction) {
    setConfirmTarget(null);
    setConfirmAction(action);
  }

  function requestRecordAction(action: IssuanceAction) {
    setConfirmTarget(latest);
    setConfirmAction(action);
  }

  async function confirm() {
    if (!confirmAction) return;
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
    replace: "Replace ID",
    revoke: "Revoke ID",
  };

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
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <EmployeeIdCard employee={employee} side="front" />
                  <p className="mt-2 text-center text-xs font-semibold text-slate-500">
                    FRONT
                  </p>
                </div>
                <div>
                  <EmployeeIdCard employee={employee} side="back" />
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
                      Missing values print as “Not provided.” Complete the
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

              <div>
                <label
                  className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300"
                  htmlFor="employee-id-remarks"
                >
                  Remarks (optional)
                </label>
                <Input
                  id="employee-id-remarks"
                  maxLength={1000}
                  placeholder="Issuance note"
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  disabled={busy}
                  type="button"
                  variant="outline"
                  onClick={downloadPdf}
                >
                  {busy ? (
                    <Loader className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-1.5 h-4 w-4" />
                  )}
                  Download PDF
                </Button>
                <Button
                  disabled={busy}
                  type="button"
                  variant="outline"
                  onClick={printPdf}
                >
                  <Printer className="mr-1.5 h-4 w-4" />
                  Print
                </Button>
              </div>

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
                    Replace ID
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
                  Issue Employee ID
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
              Confirm {confirmAction ? actionLabel[confirmAction] : "action"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "issue"
                ? `Issue version ${latest ? latest.version + 1 : 1} of the employee ID for ${getFullName(employee)}? Opening the preview or downloading the PDF does not issue an ID.`
                : confirmAction === "replace"
                  ? `Replace the active employee ID for ${getFullName(employee)}? The previous version will remain in the issuance history.`
                  : confirmAction === "revoke"
                    ? `Revoke the active employee ID for ${getFullName(employee)}? This action will be recorded in the issuance history.`
                    : `Record a reprint of the active employee ID for ${getFullName(employee)}?`}
            </DialogDescription>
          </DialogHeader>
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
              setCardElement={(element) => {
                exportFrontRef.current = element;
              }}
              side="front"
            />
            <EmployeeIdCard
              exportMode
              employee={employee}
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
