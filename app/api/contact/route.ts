import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { name, email, phone, message, receiver } = await req.json();

  console.log("📩 New Inquiry Received:", { name, email, phone, message, receiver });

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true, // 465 requires SSL
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"${name}" <${process.env.SMTP_USERNAME}>`,
      // ✅ If "receiver" is passed from frontend → use it
      // otherwise fallback to default list from .env
      to: receiver || process.env.SMTP_RECEIVER,
      subject: "📩 New Inquiry",
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
    });

    console.log("✅ Email sent successfully!");
    return new Response(
      JSON.stringify({ code: 200, message: "Inquiry Sent Successfully!" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Send Inquiry Error:", error);
    return new Response(
      JSON.stringify({ code: 500, message: "Something Went Wrong" }),
      { status: 500 }
    );
  }
}
