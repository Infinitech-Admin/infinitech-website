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
    <section className="flex justify-center px-4 sm:px-8 md:px-12 lg:px-24 xl:px-64 2xl:px-[20rem] my-12 mt-64">
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
                  <div className="text-center sm:text-left uppercase">
                    <h3 className="text-2xl font-semibold text-accent">
                      {member.name}
                    </h3>
                    <h3 className="text-xl font-semibold text-primary">
                      {member.position}
                    </h3>
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
                      Unit 311, Campos Rueda Building, 101 Urban Ave, Makati,
                      Metro Manila
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
