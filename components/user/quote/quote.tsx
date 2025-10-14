"use client";

import React, { useState, useEffect, useRef } from "react";
import { poetsen_one } from "@/config/fonts";
import {
  Card,
  CardBody,
  Checkbox,
  Button,
  Link,
  Input,
} from "@heroui/react";
import { capitalize, formatNumber } from "@/utils/formatters";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { sendQuotation } from "@/actions/user";
import { plans } from "@/data/plans";
import { Service } from "@/types/user";
 import {
     LuGlobe,
     LuSmartphone,
     LuCreditCard,
     LuCamera,
     LuVideo,
     LuUsers, // Add this for social media management
   } from "react-icons/lu";

type ServiceCategory = {
  category: string;
  services: Service[];
};

const Quote = () => {
  const quotationRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null); // New ref for PDF content

  const [isExporting, setIsExporting] = useState(false);
  const [plan, setPlan] = useState("website");
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [logo, setLogo] = useState("");
  
  // Client information state
  const [clientInfo, setClientInfo] = useState({
    name: "",
    address: "",
    phone: "",
    email: ""
  });

  // Get only selected services
  const getSelectedServices = () => {
    return services.map(category => ({
      ...category,
      services: category.services.filter(service => service.isSelected)
    })).filter(category => category.services.length > 0);
  };

// Generate PDF with clean layout and proper alignment
const createPDF = async () => {
  if (!printRef.current) return;

  const pdf = new jsPDF("p", "pt", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  let y = 70;

  // === DATE (top right) ===
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text(currentDate, pageWidth - 50, 40, { align: "right" });

  // === LOGO ===
  if (logo) {
    const logoWidth = 120;
    const logoHeight = 55;
    const logoX = (pageWidth - logoWidth) / 2;
    pdf.addImage(logo, "PNG", logoX, y, logoWidth, logoHeight);
    y += logoHeight + 40;
  }

  // === CLIENT INFO ===
  pdf.setFillColor(52, 73, 94);
  pdf.rect(40, y, pageWidth - 80, 25, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);
  pdf.text("CLIENT INFORMATION", 50, y + 17);
  y += 35;

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  const clientDetails = [
    `CLIENT NAME : ${clientInfo.name || "N/A"}`,
    `ADDRESS : ${clientInfo.address || "N/A"}`,
    `PHONE : ${clientInfo.phone || "N/A"}`,
    `EMAIL : ${clientInfo.email || "N/A"}`,
  ];
  clientDetails.forEach((line) => {
    pdf.text(line, 50, y);
    y += 15;
  });
  y += 20;

  // === QUOTATION HEADER ===
  pdf.setFillColor(52, 73, 94);
  pdf.rect(40, y, pageWidth - 80, 25, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);
  pdf.text("SPECIAL QUOTATION SUMMARY", pageWidth / 2, y + 17, {
    align: "center",
  });
  y += 35;

  // === TABLE HEADERS ===
  const hasMonthlyPricing = ["website", "mobile", "social"].includes(plan);

  // ✅ Adjusted column widths to fit full text (no cut-off)
  const cols = hasMonthlyPricing
    ? ["Package", "Inclusions", "Total (1 year)", "Monthly (12 months)"]
    : ["Package", "Inclusions", "One-Time Price (P)"];

  const colWidths = hasMonthlyPricing
    ? [100, 220, 90, 110] // expanded last column
    : [130, 240, 120];

  const colX = [40];
  for (let i = 1; i < colWidths.length; i++) {
    colX.push(colX[i - 1] + colWidths[i - 1]);
  }

  pdf.setFillColor(52, 73, 94);
  pdf.rect(40, y, pageWidth - 80, 25, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);

  // ✅ Center column text inside column width
  cols.forEach((text, i) => {
    const colCenter = colX[i] + colWidths[i] / 2;
    pdf.text(text, colCenter, y + 17, { align: "center" });
  });

  y += 28;

  // === TABLE CONTENT ===
  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);
  const selectedServices = getSelectedServices();

  const addPageIfNeeded = (rowHeight = 0) => {
    if (y + rowHeight > pageHeight - 100) {
      pdf.addPage();
      y = 70;
    }
  };

  const allServices = selectedServices.flatMap((cat) =>
    cat.services.map((s) => ({ ...s, category: cat.category }))
  );

  allServices.forEach((service, idx) => {
    const descItems = Array.isArray(service.description)
      ? service.description.filter((d) => !d.includes("Everything in"))
      : [service.description];
    const wrappedDesc = descItems.flatMap((line) =>
      pdf.splitTextToSize(`• ${line}`, colWidths[1] - 12)
    );

    const rowHeight = Math.max(35 + wrappedDesc.length * 10, 45);
    addPageIfNeeded(rowHeight);

    if (idx % 2 === 0) pdf.setFillColor(250, 250, 250);
    else pdf.setFillColor(242, 245, 248);
    pdf.rect(40, y, pageWidth - 80, rowHeight, "F");

    // Service name
    pdf.setFontSize(10);
    pdf.text(service.name, colX[0] + 8, y + 14);

    // Description
    pdf.setFontSize(8);
    let descY = y + 26;
    wrappedDesc.forEach((line) => {
      pdf.text(line, colX[1] + 8, descY);
      descY += 10;
    });

    // Prices
    pdf.setFontSize(9);
    if (hasMonthlyPricing) {
      pdf.text(`P${formatNumber(service.price)}`, colX[2] + 20, y + 20);
      pdf.text(
        `P${formatNumber(service.monthly ?? Math.round(service.price / 12))}`,
        colX[3] + 20,
        y + 20
      );
    } else {
      pdf.text(`P${formatNumber(service.price)}`, colX[2] + 20, y + 20);
    }

    y += rowHeight;
  });

  // === TOTAL ROW ===
  pdf.setFillColor(52, 73, 94);
  pdf.rect(40, y, pageWidth - 80, 25, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(11);
  pdf.text("TOTAL", colX[0] + 10, y + 17);

  if (hasMonthlyPricing) {
    pdf.text(`P${formatNumber(total)}`, colX[2] + 20, y + 17);
    pdf.text(`P${formatNumber(Math.round(total / 12))}`, colX[3] + 20, y + 17);
  } else {
    pdf.text(`P${formatNumber(total)}`, colX[2] + 20, y + 17);
  }
  y += 50;

  // === FOOTER ===
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(9);
  pdf.text(
    "INFINITECH Advertising Corporation - 311 Campos Rueda Bldg, Urban Ave, Makati City",
    pageWidth / 2,
    pageHeight - 60,
    { align: "center" }
  );
  pdf.text(
    "Tel: (02) 7001-6157 | (+63) 962-253-0149 | Email: infinitechcorp.ph@gmail.com",
    pageWidth / 2,
    pageHeight - 45,
    { align: "center" }
  );

  return pdf;
};


  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const pdf = await createPDF();
      if (!pdf) return;
      pdf.save("quotation.pdf");
      const base64 = pdf.output("datauristring");
      await sendQuotation(base64);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // load logo
  useEffect(() => {
    const getLogo = async () => {
      const response = await fetch("/images/logo.png");
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(blob);
    };
    getLogo();
  }, []);

  // load services when plan changes
  useEffect(() => {
    if (plan && plans[plan]) {
      const categorizedServices: ServiceCategory[] = Object.entries(
        plans[plan]
      ).map(([category, serviceList]) => ({
        category,
        services: serviceList.map((s) => ({ ...s, isSelected: true })),
      }));
      setServices(categorizedServices);
    } else {
      setServices([]);
    }
  }, [plan]);

  // calculate total
  useEffect(() => {
    const result = services.reduce(
      (sum, category) =>
        sum +
        category.services.reduce(
          (catSum, s) => catSum + (s.isSelected ? s.price : 0),
          0
        ),
      0
    );
    setTotal(result);
  }, [services]);

  // Flatten services for website and mobile plans to display in rows
  const getAllServices = () => {
    const allServices: Array<Service & { categoryIndex: number; serviceIndex: number }> = [];
    services.forEach((category, catIdx) => {
      category.services.forEach((service, svcIdx) => {
        allServices.push({
          ...service,
          categoryIndex: catIdx,
          serviceIndex: svcIdx
        });
      });
    });
    return allServices;
  };

  // PDF-only component (hidden from view)
  const PDFContent = () => {
    const selectedServices = getSelectedServices();
    if (selectedServices.length === 0) return null;

    return (
      <div ref={printRef} className="absolute -left-[9999px] bg-white p-8 min-w-[600px]">
        <div className="mb-8">
          <h2 className="text-2xl font-bold capitalize mb-4 text-gray-800">
            {plan} Plan - Selected Services
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full mb-6"></div>
        </div>

        {/* Display selected services */}
        {(plan === "website" || plan === "mobile") ? (
          // Flat layout for website/mobile
          <div className="space-y-4 mb-8">
            {selectedServices.flatMap(category => category.services).map((service, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-gray-800 mb-2">{service.name}</h4>
                    <div className="text-gray-600 text-sm">
                      {Array.isArray(service.description) ? (
                        <ul className="space-y-1">
                          {service.description.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              {item.includes("Everything in") || item.includes(", plus:") ? (
                                <span className="font-medium">{item}</span>
                              ) : (
                                <>
                                  <span className="text-blue-600 mt-1">•</span>
                                  <span>{item}</span>
                                </>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>{service.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-blue-600">
                      P{formatNumber(service.price)}
                    </div>
                    {service.monthly && (
                      <div className="text-sm text-gray-500">
                        P{formatNumber(service.monthly)} / month
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Grouped by category for other plans
          <div className="space-y-8 mb-8">
            {selectedServices.map((categoryBlock, catIdx) => (
              <div key={catIdx}>
                <h3 className="text-xl font-semibold capitalize mb-4 text-gray-700 border-b border-gray-200 pb-2">
                  {categoryBlock.category}
                </h3>
                <div className="space-y-4">
                  {categoryBlock.services.map((service, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg text-gray-800 mb-2">{service.name}</h4>
                          <div className="text-gray-600 text-sm">
                            {Array.isArray(service.description) ? (
                              <ul className="space-y-1">
                                {service.description.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    {item.includes("Everything in") || item.includes(", plus:") ? (
                                      <span className="font-medium">{item}</span>
                                    ) : (
                                      <>
                                        <span className="text-blue-600 mt-1">•</span>
                                        <span>{item}</span>
                                      </>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p>{service.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-blue-600">
                            P{formatNumber(service.price)}
                          </div>
                          {service.monthly && (
                            <div className="text-sm text-gray-500">
                              P{formatNumber(service.monthly)} / month
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        <div className="border-t-2 border-gray-300 pt-4">
          <div className="flex justify-end items-center gap-4">
            <span className="text-2xl font-bold text-gray-700">Total:</span>
            <span className="text-3xl font-bold text-blue-600">P{formatNumber(total)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section>
      <div className="flex flex-col justify-center px-4 md:px-12 xl:px-32 2xl:px-48 py-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between gap-4 pb-16">
          <div className="max-w-4xl">
            <h1 className={`text-5xl text-accent ${poetsen_one.className}`}>
              GET A QUOTE
            </h1>
            <h1 className={`text-4xl text-primary ${poetsen_one.className}`}>
              We believe in delivering high-quality solutions to help you grow
              your business effectively.
            </h1>
          </div>
        </div>

        {/* Client Information Form */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Client Name"
              placeholder="Enter client name"
              value={clientInfo.name}
              onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
            />
            <Input
              label="Address"
              placeholder="Enter address"
              value={clientInfo.address}
              onChange={(e) => setClientInfo({...clientInfo, address: e.target.value})}
            />
            <Input
              label="Phone Number"
              placeholder="Enter phone number"
              value={clientInfo.phone}
              onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
            />
            <Input
              label="Email Address"
              placeholder="Enter email address"
              value={clientInfo.email}
              onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Plan selection */}
          <div className="flex justify-center">
            <div className="flex flex-wrap justify-center gap-4">
              {Object.keys(plans).map((name) => (
                <Link key={name} onPress={() => setPlan(name)}>
                  <Card
                    className={`py-4 px-12 border cursor-pointer transition-all duration-200 ${
                      plan === name
                        ? "border-blue-500 ring-2 ring-blue-300"
                        : "shadow-none"
                    }`}
                  >
                    <CardBody className="flex flex-col items-center justify-center gap-2">
                    <div className="text-gray-500">
                        {name === "website" && <LuGlobe className="w-5 h-5" />}
                        {name === "mobile" && (
                          <LuSmartphone className="w-5 h-5" />
                        )}
                        {name === "juantap" && (
                          <LuCreditCard className="w-5 h-5" />
                        )}
                        {name === "photography" && (
                          <LuCamera className="w-5 h-5" />
                        )}
                          {name === "multimedia" && (
                            <LuVideo className="w-5 h-5" />
                          )}
                          {name === "social" && (
                          <LuUsers className="w-5 h-5" />
                        )}
                      </div>
                      <div
                        className={`${
                          name === "vip" ? "uppercase" : "capitalize"
                        } font-semibold`}
                      >
                        {name}
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Services - Special layout for website and mobile */}
          {(plan === "website" || plan === "mobile") && (
            <div className="flex flex-col gap-8" ref={quotationRef}>
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold capitalize mb-2">
                    {plan} Plans
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent rounded-full"></div>
                </div>

                {/* Display all services in rows of 3 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {getAllServices().map((service, idx) => (
                    <Card
                      key={idx}
                      className="rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 border border-gray-200"
                    >
                      <CardBody className="flex flex-col justify-between items-center text-center p-8">
                        {/* Title with Checkbox */}
                        <Checkbox
                          className="font-semibold text-xl mb-4"
                          value={service.name}
                          isSelected={service.isSelected}
                          onChange={() => {
                            const updated = [...services];
                            updated[service.categoryIndex].services[service.serviceIndex].isSelected =
                              !updated[service.categoryIndex].services[service.serviceIndex].isSelected;
                            setServices(updated);
                          }}
                        >
                          {service.name}
                        </Checkbox>

                        {/* Price */}
                        <div className="mb-4">
                          <span className="text-4xl font-bold text-primary block">
                            P{formatNumber(service.price)}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {service.monthly
                              ? `P${formatNumber(
                                  service.monthly
                                )} / month`
                              : "One-time"}
                          </span>
                        </div>

                        {/* Description */}
                        <div className="text-gray-600 text-sm flex-1">
                          {Array.isArray(service.description) ? (
                            <div className="space-y-1 text-left">
                              {service.description.map((item, idx) => (
                                <div key={idx}>
                                  {item.includes("Everything in") ||
                                  item.includes(", plus:") ? (
                                    <p className="font-medium mb-1">
                                      {item}
                                    </p>
                                  ) : (
                                    <div className="flex items-start gap-2">
                                      <span className="text-primary mt-1.5">
                                        •
                                      </span>
                                      <span>{item}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p>{service.description}</p>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-end items-center gap-2 mt-8">
                <h1 className="text-lg font-bold">Total:</h1>
                <span className="text-lg font-semibold">
                  P{formatNumber(total)}
                </span>
              </div>
            </div>
          )}

          {/* Services grouped by category for other plans */}
          {(plan === "juantap" || plan === "photography" || plan === "multimedia" || plan === "social") && (
            <div className="flex flex-col gap-8" ref={quotationRef}>
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold capitalize mb-2">
                    {plan} Plans
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent rounded-full"></div>
                </div>

                {services.map((categoryBlock, catIdx) => (
                  <div key={catIdx} className="mb-10">
                    <h3 className="text-xl font-bold capitalize mb-4">
                      {categoryBlock.category}
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {categoryBlock.services.map((service, idx) => (
                        <Card
                          key={idx}
                          className="rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 border border-gray-200"
                        >
                          <CardBody className="flex flex-col justify-between items-center text-center p-8">
                            {/* Title with Checkbox */}
                            <Checkbox
                              className="font-semibold text-xl mb-4"
                              value={service.name}
                              isSelected={service.isSelected}
                              onChange={() => {
                                const updated = [...services];
                                updated[catIdx].services[idx].isSelected =
                                  !updated[catIdx].services[idx].isSelected;
                                setServices(updated);
                              }}
                            >
                              {service.name}
                            </Checkbox>

                            {/* Price */}
                            <div className="mb-4">
                              <span className="text-4xl font-bold text-primary block">
                                P{formatNumber(service.price)}
                              </span>
                              <span className="text-gray-500 text-sm">
                                {service.monthly
                                  ? `P${formatNumber(
                                      service.monthly
                                    )} / month`
                                  : "One-time"}
                              </span>
                            </div>

                            {/* Description */}
                            <div className="text-gray-600 text-sm flex-1">
                              {Array.isArray(service.description) ? (
                                <div className="space-y-1 text-left">
                                  {service.description.map((item, idx) => (
                                    <div key={idx}>
                                      {item.includes("Everything in") ||
                                      item.includes(", plus:") ? (
                                        <p className="font-medium mb-1">
                                          {item}
                                        </p>
                                      ) : (
                                        <div className="flex items-start gap-2">
                                          <span className="text-primary mt-1.5">
                                            •
                                          </span>
                                          <span>{item}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p>{service.description}</p>
                              )}
                            </div>

                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-end items-center gap-2 mt-8">
                <h1 className="text-lg font-bold">Total:</h1>
                <span className="text-lg font-semibold">
                  P{formatNumber(total)}
                </span>
              </div>
            </div>
          )}

          {/* Export Button */}
          <div className="flex justify-end">
            <Button
              color="primary"
              onPress={exportToPDF}
              isLoading={isExporting}
              disabled={total === 0}
            >
              Export to PDF
            </Button>
          </div>
        </div>

        {/* Hidden PDF Content */}
        <PDFContent />
      </div>
    </section>
  );
};

export default Quote;
