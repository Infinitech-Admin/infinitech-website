"use client";

import React from "react";
import { Card, CardBody, Image, Button } from "@heroui/react";
import { members } from "@/data/members";
import { removeSpaces } from "@/utils/formatters";
import {
  LuBriefcaseBusiness,
  LuFacebook,
  LuMail,
  LuPhone,
  LuGlobe,
} from "react-icons/lu";
import { FaViber } from "react-icons/fa";
import { RiTelegram2Line } from "react-icons/ri";
import { toast } from "sonner";

const Member = ({ id }: { id: number }) => {
  const member = members[id];

  const handleSaveContact = () => {
    if (!member) return;

    // Basic vCard fields
    let vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${member.name || ""}
EMAIL;TYPE=INTERNET:${member.email || ""}
TEL;TYPE=CELL:${member.phone || ""}
URL:${member.company?.includes("abicrealtyph.com") ? "https://abicrealtyph.com" : ""}
ADR;TYPE=WORK:;;Unit 311, Campos Rueda Building, 101 Urban Ave, Makati, Metro Manila;;;
`;

    // Add Facebook or socials
    if (member.facebookname)
      vcard += `X-SOCIALPROFILE;TYPE=facebook:${member.href || ""}\n`;
    if (member.facebooknames)
      vcard += `X-SOCIALPROFILE;TYPE=facebook:${member.hrefs || ""}\n`;
    if (member.telegram)
      vcard += `X-SOCIALPROFILE;TYPE=telegram:${
        typeof member.telegram === "string"
          ? member.telegram
          : member.telegram.href
      }\n`;
    if (member.viber)
      vcard += `X-SOCIALPROFILE;TYPE=viber:${member.viber.href}\n`;

    vcard += "END:VCARD";

    // Download the vCard
    const blob = new Blob([vcard.trim()], { type: "text/vcard" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${member.name?.replace(/\s+/g, "_") || "contact"}.vcf`;
    link.click();
    URL.revokeObjectURL(link.href);

    toast.success(`${member.name} saved to your contacts!`);
  };

  return (
    <section className="flex justify-center px-4 sm:px-8 md:px-12 lg:px-24 xl:px-64 2xl:px-[20rem] mt-24 mb-12">
      <div className="w-full max-w-6xl">
        {member ? (
          <Card className="p-4">
            <CardBody>
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                {/* Image Section */}
                <div className="flex justify-center sm:justify-start items-center sm:w-[40%]">
                  <Image
                    src={`/images/members/${member.image}`}
                    alt={member.name}
                    className="w-full h-auto sm:h-[20rem] max-h-[24rem] object-cover rounded-lg"
                  />
                </div>

                {/* Info Section */}
                <div className="flex flex-col justify-start gap-4 w-full sm:w-[60%]">
                  <div className="text-center sm:text-left uppercase mb-4">
                    <h3 className="text-2xl font-semibold text-accent">
                      {member.name}
                    </h3>
                    <h3 className="text-xl font-semibold text-primary">
                      {member.position}
                    </h3>

                    {/* Save Contact Button */}
                    
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-[40px_1fr] gap-y-3 gap-x-3 items-start text-sm text-blue-700">
                    {/* Websites */}
                    {(member.company?.includes("abicrealtyph.com") ||
                      member.company?.includes("Infinitech Advertising")) && (
                      <>
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center">
                          <LuGlobe size={20} />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {member.company.includes("abicrealtyph.com") && (
                            <a
                              href="https://abicrealtyph.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              www.abicrealtyph.com
                            </a>
                          )}
                          {member.company.includes("abicrealtyph.com") &&
                            member.company.includes("Infinitech Advertising") && (
                              <span className="text-gray-400">|</span>
                            )}
                          {member.company.includes("Infinitech Advertising") && (
                            <a
                              href="https://infinitechphil.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              www.infinitechphil.com
                            </a>
                          )}
                        </div>
                      </>
                    )}

                    {/* Address */}
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center">
                      <LuBriefcaseBusiness size={20} />
                    </div>
                    <div>
                      <a
                        href="https://www.google.com/maps?q=Unit+311,+Campos+Rueda+Building,+101+Urban+Ave,+Makati,+Metro+Manila"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        Unit 311, Campos Rueda Building, 101 Urban Ave, Makati,
                        Metro Manila
                      </a>
                    </div>

                    {/* Email */}
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center">
                      <LuMail size={20} />
                    </div>
                    <div>
                      <a
                        href={`mailto:${member.email}`}
                        className="hover:underline"
                      >
                        {member.email}
                      </a>
                    </div>

                    {/* Phone */}
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center">
                      <LuPhone size={20} />
                    </div>
                    <div>
                      <a
                        href={`tel:${removeSpaces(member.phone)}`}
                        className="hover:underline"
                      >
                        {member.phone}
                      </a>
                    </div>

                    {/* Telegram */}
                    {member.telegram && typeof member.telegram !== "string" ? (
                      <>
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center">
                          <RiTelegram2Line size={20} />
                        </div>
                        <div>
                          <a
                            href={member.telegram.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {member.telegram.title}
                          </a>
                        </div>
                      </>
                    ) : member.telegram ? (
                      <>
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center">
                          <RiTelegram2Line size={20} />
                        </div>
                        <div>
                          <a
                            href={`https://web.telegram.org/a/#${member.telegram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {member.telegram}
                          </a>
                        </div>
                      </>
                    ) : null}

                    {/* Viber */}
                    {member.viber && (
                      <>
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center">
                          <FaViber size={20} />
                        </div>
                        <div>
                          <a
                            href={member.viber.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {member.viber.title}
                          </a>
                        </div>
                      </>
                    )}

                    {/* Facebook */}
                    {member.facebookname && (
                      <>
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center">
                          <LuFacebook size={20} />
                        </div>
                        <div>
                          <a
                            href={member.href || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {member.facebookname}
                          </a>
                        </div>
                      </>
                    )}

                    {member.facebooknames && (
                      <>
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center">
                          <LuFacebook size={20} />
                        </div>
                        <div>
                          <a
                            href={member.hrefs || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {member.facebooknames}
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
             <div className="mt-4 flex justify-end sm:hidden">
  <Button
    color="primary"
    className="bg-[#1D2F7C] text-white hover:bg-[#9A3160] rounded-lg shadow-md transition"
    onPress={handleSaveContact}
  >
    Save Contact
  </Button>
</div>
          </Card>
          
        ) : (
          <div className="flex justify-center py-8">
            <h3 className="font-semibold">Member Not Found</h3>
          </div>
        )}
       
      </div>
    </section>
  );
};

export default Member;
