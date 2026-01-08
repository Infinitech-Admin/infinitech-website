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
TEL;TYPE=CELL:${member.phone || ""}
ADR;TYPE=WORK:;;Unit 311, Campos Rueda Building, 101 Urban Ave, Makati, Metro Manila;;;
`;

    // Handle websites (array or from company field)
    if (member.websites && Array.isArray(member.websites)) {
      member.websites.forEach((website) => {
        vcard += `URL:https://${website}\n`;
      });
    } else if (member.company?.includes("abicrealtyph.com")) {
      vcard += `URL:https://abicrealtyph.com\n`;
    }

    // Handle emails (single or array)
    if (member.emails && Array.isArray(member.emails)) {
      member.emails.forEach((email, index) => {
        vcard += `EMAIL;TYPE=INTERNET${index > 0 ? ",WORK" : ""}:${email}\n`;
      });
    } else if (member.email) {
      vcard += `EMAIL;TYPE=INTERNET:${member.email}\n`;
    }

    // Add Facebook or socials
    if (member.facebook && Array.isArray(member.facebook)) {
      member.facebook.forEach((fb) => {
        if (fb.href) vcard += `X-SOCIALPROFILE;TYPE=facebook:${fb.href}\n`;
      });
    } else {
      if (member.facebookname)
        vcard += `X-SOCIALPROFILE;TYPE=facebook:${member.href || ""}\n`;
      if (member.facebooknames)
        vcard += `X-SOCIALPROFILE;TYPE=facebook:${member.hrefs || ""}\n`;
    }
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
    <section className="flex justify-center px-4 sm:px-8 md:px-12 lg:px-24 xl:px-64 2xl:px-[20rem] mt-12 sm:mt-24 mb-12">
      <div className="w-full max-w-6xl">
        {member ? (
          <Card className="p-2 sm:p-4">
            <CardBody>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8">
                {/* Image Section */}
                <div className="flex justify-center sm:justify-start items-center sm:w-[40%]">
                  <Image
                    src={`/images/members/${member.image}`}
                    alt={member.name}
                    className="w-full h-auto max-h-[20rem] sm:h-[20rem] sm:max-h-[24rem] object-cover rounded-lg"
                  />
                </div>

                {/* Info Section */}
                <div className="flex flex-col justify-start gap-3 sm:gap-4 w-full sm:w-[60%]">
                  <div className="text-center sm:text-left uppercase mb-2 sm:mb-4">
                    <h3 className="text-xl sm:text-2xl font-semibold text-accent">
                      {member.name}
                    </h3>
                    <h3 className="text-lg sm:text-xl font-semibold text-primary">
                      {member.position}
                    </h3>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-[40px_1fr] gap-y-2 sm:gap-y-3 gap-x-2 sm:gap-x-3 items-start text-xs sm:text-sm text-blue-700">
                    {/* Websites */}
                    {member.websites && Array.isArray(member.websites) ? (
                      <>
                        <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center flex-shrink-0">
                          <LuGlobe size={18} className="sm:w-5 sm:h-5" />
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                          {member.websites.map((website, index) => (
                            <a
                              key={index}
                              href={`https://${website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline break-words"
                            >
                              www.{website}
                            </a>
                          ))}
                        </div>
                      </>
                    ) : (member.company?.includes("abicrealtyph.com") ||
                      member.company?.includes("Infinitech Advertising")) && (
                      <>
                        <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center flex-shrink-0">
                          <LuGlobe size={18} className="sm:w-5 sm:h-5" />
                        </div>
                        <div className="flex flex-wrap gap-2 min-w-0">
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
                    <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center flex-shrink-0">
                      <LuBriefcaseBusiness size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    <div className="break-words min-w-0">
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
                    <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center flex-shrink-0">
                      <LuMail size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex flex-col gap-1 break-words min-w-0">
                      {member.emails && Array.isArray(member.emails) ? (
                        member.emails.map((email, index) => (
                          <a
                            key={index}
                            href={`mailto:${email}`}
                            className="hover:underline"
                          >
                            {email}
                          </a>
                        ))
                      ) : (
                        <a
                          href={`mailto:${member.email}`}
                          className="hover:underline"
                        >
                          {member.email}
                        </a>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center flex-shrink-0">
                      <LuPhone size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
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
                        <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center flex-shrink-0">
                          <RiTelegram2Line size={18} className="sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0">
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
                        <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center flex-shrink-0">
                          <RiTelegram2Line size={18} className="sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0">
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
                        <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center flex-shrink-0">
                          <FaViber size={18} className="sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0">
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

                    {/* Facebook - New Array Structure (for Zoe Li) */}
                    {member.facebook && Array.isArray(member.facebook) ? (
                      member.facebook.map((fb, index) => (
                        <React.Fragment key={index}>
                          <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center flex-shrink-0">
                            <LuFacebook size={18} className="sm:w-5 sm:h-5" />
                          </div>
                          <div className="break-words min-w-0">
                            <a
                              href={fb.href || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {fb.name || "Facebook Profile"}
                            </a>
                          </div>
                        </React.Fragment>
                      ))
                    ) : (
                      <>
                        {/* Facebook - Old Structure (for other members) */}
                        {member.facebookname && (
                          <>
                            <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center flex-shrink-0">
                              <LuFacebook size={18} className="sm:w-5 sm:h-5" />
                            </div>
                            <div className="break-words min-w-0">
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
                            <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center flex-shrink-0">
                              <LuFacebook size={18} className="sm:w-5 sm:h-5" />
                            </div>
                            <div className="break-words min-w-0">
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
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
            <div className="mt-2 sm:mt-4 flex justify-center sm:justify-end px-2 sm:px-0">
              <Button
                color="primary"
                className="bg-[#1D2F7C] text-white hover:bg-[#9A3160] rounded-lg shadow-md transition w-full sm:w-auto"
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
