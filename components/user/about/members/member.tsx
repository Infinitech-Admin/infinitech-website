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
} from "react-icons/lu";
import { FaViber } from "react-icons/fa";
import { RiTelegram2Line } from "react-icons/ri";

const Member = ({ id }: { id: number }) => {
  const member = members[id];

  return (
    <section>
      <div className="flex flex-col justify-center  lg:px-12 xl:px-64 2xl:px-[30rem] py-24">
        {member ? (
          <Card className="p-4">
            <CardBody>
              <div className="flex justify gap-8">
                <div className="flex items-center">
                  <Image
                    src={`/images/members/${member.image}`}
                    className="w-full h-[20rem]"
                  />
                </div>

                <div className="flex flex-col justify-start gap-4">
                  <div className="uppercase">
                    <h3 className="text-4xl font-semibold text-accent">
                      {member.name}
                    </h3>
                    <h3 className="text-xl font-semibold text-primary">
                      {member.position}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-2 rounded-lg items-center bg-blue-100 text-blue-900 ">
                        <LuBriefcaseBusiness size={20} />
                      </div>

                      <h3 className="text-sm">
                        Unit 311, Campos Rueda Building, 101 Urban Ave, Makati,
                        Metro Manila
                      </h3>
                    </div>

                    <div
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => (location.href = `mailto:${member.email}`)}
                    >
                      <div className="px-2 py-2 rounded-lg items-center bg-blue-100 text-blue-900 ">
                        <LuMail size={20} />
                      </div>
                      <h3 className="text-sm">{member.email}</h3>
                    </div>

                    <div
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() =>
                        (location.href = `tel:${removeSpaces(member.phone)}`)
                      }
                    >
                      <div className="px-2 py-2 rounded-lg items-center bg-blue-100 text-blue-900 ">
                        <LuPhone size={20} />
                      </div>
                      <h3 className="text-sm">{member.phone}</h3>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => open("https://web.telegram.org")}
                    >
                      <div className="px-2 py-2 rounded-lg items-center bg-blue-100 text-blue-900 ">
                        <RiTelegram2Line size={20} />
                      </div>
                      <h3 className="text-sm">{member.telegram}</h3>
                    </div>

                    <div
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => open("https://www.viber.com")}
                    >
                      <div className="px-2 py-2 rounded-lg items-center bg-blue-100 text-blue-900 ">
                        <FaViber size={20} />
                      </div>
                      <h3 className="text-sm">{member.viber}</h3>
                    </div>

                    <div
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => open(member.facebook)}
                    >
                      <div className="px-2 py-2 rounded-lg items-center bg-blue-100 text-blue-900 ">
                        <LuFacebook size={20} />
                      </div>
                      <h3 className="text-sm">{member.name}</h3>
                    </div>
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
