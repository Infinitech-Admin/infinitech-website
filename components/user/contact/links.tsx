"use client";

import React from "react";
import { removeSpaces } from "@/utils/formatters";
import { LuMail, LuPhone, LuSmartphone } from "react-icons/lu";

const Links = () => {
  const links = [
    "(02) 7001-6157",
    "0962 253 0149",
    "infinitechadvertisingcorp@gmail.com",
  ];

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="px-2 py-2 rounded-lg items-center bg-blue-100 text-blue-900 ">
          <LuPhone size={18} />
        </div>
        <h3
          className="text-primary-light font-bold cursor-pointer"
          onClick={() => (location.href = `tel:${removeSpaces(links[0])}`)}
        >
          {links[0]}
        </h3>
      </div>

      <div className="flex items-center gap-2">
        <div className="px-2 py-2 rounded-lg items-center bg-blue-100 text-blue-900">
          <LuSmartphone size={18} />
        </div>
        <h3
          className="text-primary-light font-bold cursor-pointer"
          onClick={() => (location.href = `tel:${removeSpaces(links[1])}`)}
        >
          {links[1]}
        </h3>
      </div>

      <div className="flex items-center gap-2">
        <div className="px-2 py-2 rounded-lg items-center bg-blue-100 text-blue-900">
          <LuMail size={18} />
        </div>
        <h3
          className="text-primary-light font-bold cursor-pointer"
          onClick={() => (location.href = `mailto:${links[2]}`)}
        >
          {links[2]}
        </h3>
      </div>
    </>
  );
};

export default Links;
