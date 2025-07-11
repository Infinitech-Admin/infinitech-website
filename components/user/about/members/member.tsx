"use client";

import React from "react";
import { Card, CardBody, Image } from "@heroui/react";
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

const Member = ({ id }: { id: number }) => {
  const member = members[id];

  return (
    <section>
      <div className="flex flex-col justify-center lg:px-12 xl:px-64 2xl:px-[30rem] py-24">
        {member ? (
          <Card className="p-4">
            <CardBody>
              <div className="flex flex-col sm:flex-row justify gap-8">
                {/* Image Section */}
                <div className="flex justify-center sm:justify-start items-center">
                  <Image
                    src={`/images/members/${member.image}`}
                    alt={member.name}
                    className="w-full sm:w-auto h-auto sm:h-[20rem] min-h-[16rem] object-cover rounded-lg"
                  />
                </div>

                {/* Info Section */}
                <div className="flex flex-col justify-start gap-4">
                  <div className="uppercase">
                    <h3 className="text-3xl font-semibold text-accent">
                      {member.name}
                    </h3>
                    <h3 className="text-xl font-semibold text-primary">
                      {member.position}
                    </h3>

                    {/* Websites under position - one icon, one line */}
                    {(member.company?.includes("abicrealtyph.com") ||
                      member.company?.includes("Infinitech Advertising")) && (
                      <div className="flex items-center gap-2 text-blue-700 normal-case">
                        <div className="px-2 py-2 rounded-lg bg-blue-100 text-blue-900">
                          <LuGlobe size={20} />
                        </div>
                        <div className="flex gap-2 text-sm flex-wrap">
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
                      </div>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="flex flex-col gap-1">
                    <a
                      href="https://www.google.com/maps?q=Unit+311,+Campos+Rueda+Building,+101+Urban+Ave,+Makati,+Metro+Manila"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-700 hover:underline"
                    >
                      <div className="px-2 py-2 rounded-lg items-center bg-blue-100 text-blue-900">
                        <LuBriefcaseBusiness size={20} />
                      </div>
                      <h3 className="text-sm">
                        Unit 311, Campos Rueda Building, 101 Urban Ave, Makati,
                        Metro Manila
                      </h3>
                    </a>

                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center gap-2 text-blue-700 hover:underline"
                    >
                      <div className="px-2 py-2 rounded-lg bg-blue-100 text-blue-900">
                        <LuMail size={20} />
                      </div>
                      <h3 className="text-sm">{member.email}</h3>
                    </a>

                    <a
                      href={`tel:${removeSpaces(member.phone)}`}
                      className="flex items-center gap-2 text-blue-700 hover:underline"
                    >
                      <div className="px-2 py-2 rounded-lg bg-blue-100 text-blue-900">
                        <LuPhone size={20} />
                      </div>
                      <h3 className="text-sm">{member.phone}</h3>
                    </a>
                  </div>

                  {/* Social Links */}
                  <div className="flex flex-col gap-1">
                    <a
                      href={member.telegram || "https://web.telegram.org"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-700 hover:underline"
                    >
                      <div className="px-2 py-2 rounded-lg bg-blue-100 text-blue-900">
                        <RiTelegram2Line size={20} />
                      </div>
                      <h3 className="text-sm">{member.telegram}</h3>
                    </a>

                    <a
                      href={member.viber || "https://www.viber.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-700 hover:underline"
                    >
                      <div className="px-2 py-2 rounded-lg bg-blue-100 text-blue-900">
                        <FaViber size={20} />
                      </div>
                      <h3 className="text-sm">{member.viber}</h3>
                    </a>

                    {/* Facebook - Styled like website section */}
                    {(member.facebookname || member.facebooknames) && (
                      <div className="flex items-center gap-2 text-blue-700 normal-case">
                        <div className="px-2 py-2 rounded-lg bg-blue-100 text-blue-900">
                          <LuFacebook size={20} />
                        </div>
                        <div className="flex gap-2 text-sm flex-wrap">
                          {member.facebookname && (
                            <a
                              href={member.href || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {member.facebookname}
                            </a>
                          )}
                          {member.facebookname && member.facebooknames && (
                            <span className="text-gray-400">|</span>
                          )}
                          {member.facebooknames && (
                            <a
                              href={member.hrefs || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {member.facebooknames}
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="flex justify-center">
            <h3 className="font-semibold">Member Not Found</h3>
          </div>
        )}
      </div>
    </section>
  );
};

export default Member;
