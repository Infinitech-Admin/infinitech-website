import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import QuotationTemplate from "@/emails/quotation";

export async function POST(req: Request) {
  try {
    const { base64 } = await req.json();

     const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true, // use SSL
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });


    const buffer = Buffer.from(base64.split("base64,")[1], "base64");
    const html = await render(QuotationTemplate());

    await transporter.sendMail({
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
      html,
    });

    return NextResponse.json({ code: 200, message: "Email Sent Successfully" });
  } catch (err) {
    console.error("Send Quotation Error:", err);
    return NextResponse.json({ code: 500, message: "Something Went Wrong" });
  }
}
