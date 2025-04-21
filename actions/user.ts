"use server";

import nodemailer from "nodemailer";
import { Inquiry as Values } from "@/types/user";
import Inquiry from "@/emails/inquiry";
import { render } from "@react-email/render";
import Quotation from "@/emails/quotation";

export const sendInquiry = async (values: Values) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const html = await render(
    Inquiry({
      name: values.name,
      email: values.email,
      phone: values.phone,
      message: values.message,
    })
  );

  const options = {
    from: process.env.SMTP_USERNAME,
    to: process.env.SMTP_RECEIVER,
    subject: "Infinitech: New Inquiry",
    html: html,
  };

  try {
    await transporter.sendMail(options);
  } catch {
    return { code: 500, message: "Something Went Wrong" };
  }

  return { code: 200, message: "Inquiry Submitted Successfully" };
};

export const sendQuotation = async (base64: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const buffer = Buffer.from(base64.split("base64,")[1], "base64");
  const html = await render(Quotation());

  const options = {
    from: process.env.SMTP_USERNAME,
    to: process.env.SMTP_RECEIVER,
    subject: "Infinitech: New Quotation Request",
    attachments: [
      {
        filename: "quotation.pdf",
        content: buffer,
        encoding: "base64",
      },
    ],
    html: html,
  };

  try {
    await transporter.sendMail(options);
  } catch {
    return { code: 500, message: "Something Went Wrong" };
  }

  return { code: 200, message: "Email Sent Successfully" };
};
